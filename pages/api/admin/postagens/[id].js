// Edita ou apaga UMA postagem (só o dono): reagendar, ajustar texto, cancelar, reabrir ou excluir.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID, txt } from '../../../../lib/varejoServer';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Postagem inválida.' });
  try {
    if (req.method === 'DELETE') {
      await sb(`op_postagens?id=eq.${id}`, { method: 'DELETE' });
      return res.json({ ok: true });
    }
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH, DELETE');
      return res.status(405).json({ erro: 'Método não permitido.' });
    }
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    const d = {};
    if (c.titulo !== undefined) d.titulo = txt(c.titulo, 140);
    if (c.texto !== undefined) d.texto = String(c.texto).trim().slice(0, 6000);
    if (c.agendada_para !== undefined) {
      const q = new Date(c.agendada_para);
      if (Number.isNaN(q.getTime())) return res.status(400).json({ erro: 'Data/hora inválida.' });
      d.agendada_para = q.toISOString();
    }
    if (c.status !== undefined) {
      if (c.status === 'cancelada') Object.assign(d, { status: 'cancelada', operario_id: null, assumida_em: null });
      else if (c.status === 'agendada') Object.assign(d, { status: 'agendada', operario_id: null, assumida_em: null, postada_em: null, link_postagem: null, observacao_operador: null });
      else return res.status(400).json({ erro: 'Só é possível cancelar ou reabrir (voltar para agendada).' });
    }
    if ((d.titulo !== undefined && d.titulo.length < 3) || (d.texto !== undefined && d.texto.length < 5)) return res.status(400).json({ erro: 'Título e texto não podem ficar vazios.' });
    if (!Object.keys(d).length) return res.status(400).json({ erro: 'Nada para alterar.' });
    const [p] = await sb(`op_postagens?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
    if (!p) return res.status(404).json({ erro: 'Postagem não encontrada.' });
    return res.json({ postagem: p });
  } catch (e) {
    console.error('admin/postagens/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
