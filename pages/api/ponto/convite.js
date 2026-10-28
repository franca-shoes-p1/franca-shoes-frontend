// Resposta do dono do ponto ao convite (autorizar ou recusar). Público, protegido pelo token do convite.
import { sb } from '../../../lib/varejoServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const token = String((req.body && req.body.token) || '');
  const resposta = req.body && req.body.resposta;
  if (!/^[0-9a-f]{24}$/.test(token) || !['sim', 'nao'].includes(resposta)) {
    return res.status(400).json({ erro: 'Link inválido.' });
  }
  try {
    const [p] = await sb(`rf_pontos?token_convite=eq.${token}&select=id,status`);
    if (!p) return res.status(404).json({ erro: 'Convite não encontrado.' });
    if (['autorizado', 'ativo', 'recusado'].includes(p.status)) return res.json({ ok: true, status: p.status });
    const status = resposta === 'sim' ? 'autorizado' : 'recusado';
    await sb(`rf_pontos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ status, respondido_em: new Date().toISOString() }) });
    return res.json({ ok: true, status });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível registrar agora. Tente de novo.' });
  }
}
