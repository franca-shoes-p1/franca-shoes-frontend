// Atualiza a ordem: confirmar entrada/saldo do cliente (a entrada libera a produção), status, nota.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID, txt } from '../../../../lib/varejoServer';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Ordem inválida.' });
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    const d = {};
    if (c.entrada_confirmada !== undefined) d.entrada_confirmada = !!c.entrada_confirmada;
    if (c.saldo_confirmado !== undefined) d.saldo_confirmado = !!c.saldo_confirmado;
    if (c.status !== undefined) {
      if (!['aberta', 'entregue', 'cancelada'].includes(c.status)) return res.status(400).json({ erro: 'Status inválido.' });
      d.status = c.status;
    }
    if (c.nota_interna !== undefined) d.nota_interna = txt(c.nota_interna, 500) || null;
    if (!Object.keys(d).length) return res.status(400).json({ erro: 'Nada para alterar.' });
    // O saldo só faz sentido depois da entrada.
    if (d.saldo_confirmado) {
      const [o] = await sb(`op_ordens?id=eq.${id}&select=entrada_confirmada`);
      if (!o) return res.status(404).json({ erro: 'Ordem não encontrada.' });
      if (!(o.entrada_confirmada || d.entrada_confirmada)) return res.status(400).json({ erro: 'Confirme a entrada antes do saldo.' });
    }
    const [ordem] = await sb(`op_ordens?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
    if (!ordem) return res.status(404).json({ erro: 'Ordem não encontrada.' });
    return res.json({ ordem });
  } catch (e) {
    console.error('admin/ordens/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
