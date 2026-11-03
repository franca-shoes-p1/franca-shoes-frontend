// Painel do dono do Parceiros da Praia. GET traz tudo; POST executa uma ação por vez, validada aqui no servidor.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID, txt } from '../../../../lib/varejoServer';
import { novoCodigo, hashCodigo, configurado } from '../../../../lib/praiaAuth';
import { calcularVagas } from '../../../../lib/praiaAuth';

const bad = (res, m) => res.status(400).json({ erro: m });
const num = (v) => { let s = String(v ?? '').replace(/[^\d,.-]/g, ''); if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); const n = parseFloat(s); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
const STATUS = ['novo', 'conversando', 'aprovado', 'recusado', 'lista_espera'];
const FLAGS = ['cadastro_ambulante', 'curso_manipulacao', 'contrato_assinado', 'ativo'];

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const seguro = (p) => sb(p).catch(() => null);
      const [candidatos, parceiros, produtos, avisos, etapas, dias, vagas] = await Promise.all([
        seguro('praia_candidatos?select=*&order=criado_em.desc&limit=100'),
        seguro('praia_parceiros?select=id,nome,telefone,cidade,kit,cadastro_ambulante,curso_manipulacao,contrato_assinado,ativo,criado_em&order=criado_em.desc'),
        seguro('praia_produtos?select=*&order=nome'),
        seguro('praia_avisos?select=*&order=criado_em.desc&limit=30'),
        seguro('praia_etapas?select=chave,feito'),
        seguro('praia_vw_lucro_dia?select=*&order=data.desc&limit=60'),
        calcularVagas().catch(() => null),
      ]);
      if (candidatos === null || parceiros === null) return res.json({ pronto: false, motivo: 'As tabelas praia_ ainda não existem no Supabase. Rode o SQL do projeto.' });
      const nomes = Object.fromEntries((parceiros || []).map((p) => [p.id, p.nome]));
      const fechamentos = (dias || []).map((d) => {
        const esp = Number(d.vendas_esperadas || 0), inf = Number(d.valor_informado || 0);
        return { ...d, nome: nomes[d.parceiro_id] || '—', divergencia: esp > 0 ? Math.round(((esp - inf) / esp) * 1000) / 10 : 0, fechado: inf > 0 };
      });
      return res.json({ pronto: true, extra: produtos !== null && avisos !== null && etapas !== null, candidatos, parceiros, produtos: produtos || [], avisos: avisos || [], etapas: etapas || [], fechamentos, vagas });
    }
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    const id = String(c.id || '');
    switch (c.acao) {
      case 'vaga_salvar': {
        const cidade = txt(c.cidade, 80); const total = parseInt(c.total, 10);
        if (cidade.length < 2 || !(total >= 0) || total > 500) return bad(res, 'Informe a cidade e o número de vagas.');
        await sb('praia_vagas?on_conflict=cidade', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ cidade, total, ativo: c.ativo !== false }) });
        return res.json({ ok: true });
      }
      case 'candidato_status': {
        if (!UUID.test(id) || !STATUS.includes(c.status)) return bad(res, 'Dados inválidos.');
        await sb(`praia_candidatos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: c.status }) });
        return res.json({ ok: true });
      }
      case 'candidato_aprovar': {
        if (!UUID.test(id)) return bad(res, 'Candidato inválido.');
        if (!configurado()) return bad(res, 'Falta ADMIN_SESSION_SECRET na Vercel.');
        const [cand] = await sb(`praia_candidatos?id=eq.${id}&select=*`);
        if (!cand) return res.status(404).json({ erro: 'Candidato não encontrado.' });
        const ja = await sb(`praia_parceiros?candidato_id=eq.${id}&select=id`);
        if (ja.length) return bad(res, 'Este candidato já virou sócio.');
        const codigo = novoCodigo();
        await sb('praia_parceiros', { method: 'POST', body: JSON.stringify({ candidato_id: id, nome: cand.nome, telefone: cand.telefone, cidade: cand.cidade, kit: 'caminhante', codigo_hash: hashCodigo(codigo) }) });
        await sb(`praia_candidatos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'aprovado' }) });
        return res.json({ ok: true, codigo }); // o código só aparece agora; guarde e envie ao sócio
      }
      case 'parceiro_flag': {
        if (!UUID.test(id) || !FLAGS.includes(c.campo)) return bad(res, 'Dados inválidos.');
        await sb(`praia_parceiros?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ [c.campo]: c.valor === true }) });
        return res.json({ ok: true });
      }
      case 'parceiro_kit': {
        if (!UUID.test(id) || !['caminhante', 'carrinho'].includes(c.kit)) return bad(res, 'Dados inválidos.');
        await sb(`praia_parceiros?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ kit: c.kit }) });
        return res.json({ ok: true });
      }
      case 'parceiro_novo_codigo': {
        if (!UUID.test(id)) return bad(res, 'Sócio inválido.');
        if (!configurado()) return bad(res, 'Falta ADMIN_SESSION_SECRET na Vercel.');
        const codigo = novoCodigo();
        await sb(`praia_parceiros?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ codigo_hash: hashCodigo(codigo) }) });
        return res.json({ ok: true, codigo });
      }
      case 'produto_salvar': {
        const nome = txt(c.nome, 80); const custo = num(c.custo); const preco = num(c.preco);
        if (nome.length < 2 || custo === null || preco === null) return bad(res, 'Informe nome, custo e preço.');
        const corpo = JSON.stringify({ nome, custo, preco, ativo: c.ativo !== false });
        if (/^\d+$/.test(id)) await sb(`praia_produtos?id=eq.${id}`, { method: 'PATCH', body: corpo });
        else await sb('praia_produtos', { method: 'POST', body: corpo });
        return res.json({ ok: true });
      }
      case 'aviso_novo': {
        const titulo = txt(c.titulo, 120); const texto = txt(c.texto, 1000);
        if (titulo.length < 2) return bad(res, 'Escreva o título do aviso.');
        await sb('praia_avisos', { method: 'POST', body: JSON.stringify({ titulo, texto }) });
        return res.json({ ok: true });
      }
      case 'aviso_ativo': {
        if (!/^\d+$/.test(id)) return bad(res, 'Aviso inválido.');
        await sb(`praia_avisos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ativo: c.ativo === true }) });
        return res.json({ ok: true });
      }
      case 'etapa': {
        const chave = txt(c.chave, 60);
        if (!chave) return bad(res, 'Etapa inválida.');
        await sb('praia_etapas?on_conflict=chave', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ chave, feito: c.feito === true, feito_em: c.feito === true ? new Date().toISOString() : null }) });
        return res.json({ ok: true });
      }
      default: return bad(res, 'Ação inválida.');
    }
  } catch (e) {
    console.error('admin/praia', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir. ' + String(e.message).slice(0, 120) });
  }
}
