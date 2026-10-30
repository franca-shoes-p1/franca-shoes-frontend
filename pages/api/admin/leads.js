// Fábricas para abordar: lista, fila de hoje, cadastro em lote e andamento.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { soDigitos } from '../../../lib/leadsFornecedores';

const STATUS = ['novo', 'abordado', 'respondeu', 'interessado', 'cadastrado', 'frio', 'descartado'];
const hoje = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const maisDias = (d) => new Date(Date.now() + d * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

async function carregar() {
  let leads;
  try { leads = await sb('forn_leads?select=*&order=nota.desc,criado_em.desc&limit=500'); }
  catch (e) { return { semSql: true, leads: [], fila: [] }; }
  const h = hoje();
  const fila = leads
    .filter((l) => l.whatsapp && ((l.status === 'novo') || (['abordado'].includes(l.status) && l.proximo_contato && l.proximo_contato <= h)))
    .slice(0, 15);
  return { leads, fila };
}

// Uma linha por fábrica: "Nome; WhatsApp; Instagram; E-mail" (só o nome é obrigatório).
function lerLinhas(texto) {
  return String(texto || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 100).map((l) => {
    const [nome, tel, insta, email] = l.split(/[;\t]/).map((s) => s.trim());
    const w = soDigitos(tel);
    return { nome: txt(nome, 100), whatsapp: w.length >= 10 && w.length <= 13 ? (w.length <= 11 ? '55' + w : w) : null, instagram: txt(insta, 60) || null, email: /@/.test(email || '') ? txt(email, 120).toLowerCase() : null, origem: 'manual' };
  }).filter((l) => l.nome.length >= 3);
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.json(await carregar());
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const b = req.body || {};
    const id = String(b.id || '');
    if (b.acao === 'lote') {
      const linhas = lerLinhas(b.texto);
      if (!linhas.length) return res.status(400).json({ erro: 'Nenhuma linha válida. Use: Nome; WhatsApp; Instagram; E-mail.' });
      const ja = new Set((await sb('forn_leads?select=nome&limit=5000')).map((l) => l.nome.toLowerCase()));
      const novas = linhas.filter((l, i) => !ja.has(l.nome.toLowerCase()) && linhas.findIndex((x) => x.nome.toLowerCase() === l.nome.toLowerCase()) === i)
        .map((l) => ({ ...l, nota: 5 + (l.whatsapp ? 3 : 0) + (l.instagram ? 1 : 0) + (l.email ? 1 : 0) }));
      if (novas.length) await sb('forn_leads', { method: 'POST', body: JSON.stringify(novas) });
    } else if (b.acao === 'abordei') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      const [l] = await sb(`forn_leads?id=eq.${id}&select=abordagens`);
      if (!l) return res.status(404).json({ erro: 'Não encontrada.' });
      const n = l.abordagens + 1;
      await sb(`forn_leads?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ abordagens: n, ultima_abordagem: new Date().toISOString(), status: n >= 3 ? 'frio' : 'abordado', proximo_contato: n >= 3 ? null : maisDias(3) }) });
    } else if (b.acao === 'estado') {
      if (!UUID.test(id) || !STATUS.includes(b.estado)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`forn_leads?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: b.estado, ...(b.estado === 'frio' || b.estado === 'descartado' ? { proximo_contato: null } : {}) }) });
    } else if (b.acao === 'nota') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`forn_leads?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ obs: txt(b.texto, 500) || null }) });
    } else if (b.acao === 'mapa') {
      const { buscarFabricasMapa } = await import('../../../lib/leadsMapa');
      const r = await buscarFabricasMapa();
      return res.json({ ...(await carregar()), mapa: r });
    } else return res.status(400).json({ erro: 'Ação desconhecida.' });
    return res.json(await carregar());
  } catch (e) {
    console.error('admin/leads', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 160) });
  }
}
