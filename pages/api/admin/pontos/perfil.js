import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID } from '../../../../lib/varejoServer';

// Aprova ou reprova o perfil público de um parceiro.
export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const { id, decisao } = req.body || {};
  if (!UUID.test(String(id || ''))) return res.status(400).json({ erro: 'Ponto inválido.' });
  const novo = decisao === 'aprovar' ? 'aprovado' : decisao === 'reprovar' ? 'reprovado' : null;
  if (!novo) return res.status(400).json({ erro: 'Decisão inválida.' });
  try {
    const [p] = await sb(`rf_pontos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ perfil_status: novo }) });
    return res.json({ ponto: p });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível concluir. Confira se o SQL do perfil foi executado.' });
  }
}
