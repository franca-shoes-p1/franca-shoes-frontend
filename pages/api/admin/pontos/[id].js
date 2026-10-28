import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID } from '../../../../lib/varejoServer';
import { validar } from '../../../../lib/pontosServer';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Ponto inválido.' });
  try {
    if (req.method === 'GET') {
      const [p] = await sb(`rf_pontos?id=eq.${id}&select=*`);
      if (!p) return res.status(404).json({ erro: 'Ponto não encontrado.' });
      return res.json({ ponto: p });
    }
    if (req.method === 'PATCH') {
      const [atual] = await sb(`rf_pontos?id=eq.${id}&select=*`);
      if (!atual) return res.status(404).json({ erro: 'Ponto não encontrado.' });
      const { erro, dados } = validar({ ...atual, ...(req.body || {}) });
      if (erro) return res.status(400).json({ erro });
      if (dados.status === 'convidado' && atual.status !== 'convidado') dados.convidado_em = new Date().toISOString();
      const [novo] = await sb(`rf_pontos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(dados) });
      return res.json({ ponto: novo });
    }
    if (req.method === 'DELETE') {
      await sb(`rf_pontos?id=eq.${id}`, { method: 'DELETE' });
      return res.json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('admin/pontos/id', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir.' });
  }
}
