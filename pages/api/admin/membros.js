// Painel de membros: lista os cadastros, muda o status e guarda anotação interna.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb } from '../../../lib/varejoServer';

const STATUS = ['novo', 'acolhido', 'em_grupo', 'inativo'];

async function listar() {
  const r = await sb('igreja_membros?select=*&order=criado_em.desc&limit=300').catch(() => null);
  return r === null ? { semSql: true } : { membros: r };
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.json(await listar());
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const b = req.body || {};
    const campos = {};
    if (b.status !== undefined) {
      if (!STATUS.includes(b.status)) return res.status(400).json({ erro: 'Status inválido.' });
      campos.status = b.status;
      if (b.status === 'acolhido') campos.acolhido_em = new Date().toISOString();
    }
    if (b.nota_interna !== undefined) campos.nota_interna = String(b.nota_interna).trim().slice(0, 500);
    if (!Object.keys(campos).length) return res.status(400).json({ erro: 'Nada para alterar.' });
    await sb(`igreja_membros?id=eq.${encodeURIComponent(b.id)}`, { method: 'PATCH', body: JSON.stringify(campos) });
    return res.json(await listar());
  } catch (e) {
    console.error('admin/membros', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 160) });
  }
}
