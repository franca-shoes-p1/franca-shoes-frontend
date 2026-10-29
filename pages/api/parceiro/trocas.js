// Divulgação digital semanal e troca entre parceiros. Acesso pelo link secreto do parceiro (token).
import { sb, UUID } from '../../../lib/varejoServer';
import { CANAIS, semanaDe, linkValido } from '../../../lib/trocas';
import { avisar } from '../../../lib/avisar';

const corta = (v, n) => String(v == null ? '' : v).replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const EU = 'id,codigo,nome,cidade,uf,status,perfil_status,troca_aberta,ramo';
const OUTRO = 'id,codigo,nome,ramo,perfil_slogan,perfil_logo,perfil_whatsapp,perfil_instagram';

async function achar(token) {
  if (!/^[0-9a-f]{24}$/.test(String(token || ''))) return null;
  const [p] = await sb(`rf_pontos?token_convite=eq.${token}&select=${EU}`);
  return p || null;
}

async function resumo(p) {
  const [divs, aprov, enviadas, recebidas] = await Promise.all([
    sb(`rf_divulgacoes?ponto_id=eq.${p.id}&select=id,semana,canal,link,obs,status,criado_em&order=criado_em.desc&limit=12`),
    sb(`rf_divulgacoes?ponto_id=eq.${p.id}&status=eq.aprovado&select=id`),
    sb(`rf_trocas?de_id=eq.${p.id}&select=id,para_id,status`),
    sb(`rf_trocas?para_id=eq.${p.id}&select=id,de_id,status`),
  ]);
  const idsOutros = [...enviadas.map((t) => t.para_id), ...recebidas.map((t) => t.de_id)];
  let outros = [];
  if (idsOutros.length) outros = await sb(`rf_pontos?id=in.(${idsOutros.join(',')})&select=${OUTRO},perfil_status`);
  const achaOutro = (id) => {
    const o = outros.find((x) => x.id === id);
    return o ? { id: o.id, codigo: o.codigo, nome: o.nome, ramo: o.ramo || '' } : null;
  };
  const contatos = (id, st) => {
    const o = outros.find((x) => x.id === id);
    if (!o || st !== 'aceita') return null;
    return { whatsapp: o.perfil_whatsapp, instagram: o.perfil_instagram };
  };
  const trocas = [
    ...enviadas.map((t) => ({ id: t.id, quem: 'eu', status: t.status, outro: achaOutro(t.para_id), contato: contatos(t.para_id, t.status) })),
    ...recebidas.map((t) => ({ id: t.id, quem: 'ele', status: t.status, outro: achaOutro(t.de_id), contato: contatos(t.de_id, t.status) })),
  ].filter((t) => t.outro);
  let sugestoes = [];
  if (p.troca_aberta) {
    const ja = new Set(idsOutros);
    const lista = await sb(`rf_pontos?cidade=eq.${encodeURIComponent(p.cidade)}&troca_aberta=eq.true&perfil_status=eq.aprovado&status=in.(autorizado,ativo)&id=neq.${p.id}&select=id,nome,ramo,perfil_slogan,perfil_logo&limit=30`);
    sugestoes = lista.filter((x) => !ja.has(x.id));
  }
  return { ponto: { codigo: p.codigo, nome: p.nome, cidade: p.cidade, troca_aberta: !!p.troca_aberta, ramo: p.ramo || '', perfil_status: p.perfil_status }, semana: semanaDe().chave, divulgacoes: divs, aprovadas: aprov.length, trocas, sugestoes };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const b = req.method === 'POST' ? req.body || {} : {};
    const p = await achar(req.method === 'GET' ? req.query.token : b.token);
    if (!p) return res.status(404).json({ erro: 'Link inválido.' });
    if (!['autorizado', 'ativo'].includes(p.status)) return res.status(403).json({ erro: 'O painel abre depois que você autoriza o cartaz.' });

    if (req.method === 'GET') return res.json(await resumo(p));
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }

    if (b.acao === 'comprovar') {
      if (!CANAIS[b.canal]) return res.status(400).json({ erro: 'Escolha onde você publicou.' });
      const link = String(b.link || '').trim();
      const obs = corta(b.obs, 200);
      if (!link && !obs) return res.status(400).json({ erro: 'Cole o link da publicação ou escreva uma observação.' });
      if (link && !linkValido(link)) return res.status(400).json({ erro: 'O link precisa começar com https://' });
      const semana = semanaDe().chave;
      const dados = { ponto_id: p.id, semana, canal: b.canal, link: link || null, obs: obs || null, status: 'pendente', criado_em: new Date().toISOString() };
      await sb('rf_divulgacoes?on_conflict=ponto_id,semana,canal', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(dados) });
      await avisar(`📣 ${p.nome} (${p.cidade}) comprovou uma divulgação (${CANAIS[b.canal]}). Confira no passo 6 do Painel do dia.`);
    } else if (b.acao === 'config') {
      await sb(`rf_pontos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ troca_aberta: !!b.aberta, ramo: corta(b.ramo, 60) || null }) });
      p.troca_aberta = !!b.aberta; p.ramo = corta(b.ramo, 60) || null;
    } else if (b.acao === 'propor') {
      if (!UUID.test(String(b.para || '')) || b.para === p.id) return res.status(400).json({ erro: 'Parceiro inválido.' });
      if (!p.troca_aberta) return res.status(400).json({ erro: 'Ative "Quero trocar divulgação" antes.' });
      const [o] = await sb(`rf_pontos?id=eq.${b.para}&cidade=eq.${encodeURIComponent(p.cidade)}&troca_aberta=eq.true&perfil_status=eq.aprovado&status=in.(autorizado,ativo)&select=id`);
      if (!o) return res.status(400).json({ erro: 'Esse parceiro não está disponível para troca.' });
      const ja = [...await sb(`rf_trocas?de_id=eq.${p.id}&para_id=eq.${o.id}&select=id`), ...await sb(`rf_trocas?de_id=eq.${o.id}&para_id=eq.${p.id}&select=id`)];
      if (ja.length) return res.status(400).json({ erro: 'Já existe uma proposta entre vocês.' });
      await sb('rf_trocas', { method: 'POST', body: JSON.stringify({ de_id: p.id, para_id: o.id }) });
    } else if (b.acao === 'responder') {
      if (!UUID.test(String(b.id || ''))) return res.status(400).json({ erro: 'Proposta inválida.' });
      const r = await sb(`rf_trocas?id=eq.${b.id}&para_id=eq.${p.id}&status=eq.proposta`, { method: 'PATCH', body: JSON.stringify({ status: b.aceitar ? 'aceita' : 'recusada' }) });
      if (!r.length) return res.status(400).json({ erro: 'Proposta não encontrada.' });
      if (b.aceitar) await avisar(`🤝 Troca de divulgação combinada em ${p.cidade}: ${p.nome} aceitou uma proposta.`);
    } else {
      return res.status(400).json({ erro: 'Ação inválida.' });
    }
    return res.json(await resumo(p));
  } catch (e) {
    console.error('parceiro/trocas', e.message);
    const falta = /rf_divulgacoes|rf_trocas|troca_aberta|ramo|relation|column/i.test(e.message || '');
    return res.status(500).json({ erro: falta ? 'A área de divulgação ainda está sendo preparada. Tente mais tarde.' : 'Não foi possível concluir.' });
  }
}
