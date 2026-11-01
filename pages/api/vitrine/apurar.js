// Para o n8n: apura o fundo da equipe (pedidos entregues, com custo informado e fora do prazo de arrependimento)
// e devolve o resumo do que há a pagar. Cabeçalho x-radar-token igual a RADAR_N8N_TOKEN.
import { exigirRadarToken } from '../../../lib/radarToken';
import { apurarFundo, textoFundo } from '../../../lib/vitrineServer';

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const r = await apurarFundo();
    return res.json({ ...r, texto: textoFundo(r) });
  } catch (e) {
    console.error('vitrine/apurar', e.message);
    return res.status(500).json({ erro: 'Falhou.', texto: '⚠️ A apuração do fundo da equipe não funcionou.' });
  }
}
