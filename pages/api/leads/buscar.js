// Para o n8n: busca fábricas de calçados de Franca no mapa e devolve um resumo para o Telegram.
import { exigirRadarToken } from '../../../lib/radarToken';
import { buscarFabricasMapa } from '../../../lib/leadsMapa';

export const config = { maxDuration: 40 };

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const r = await buscarFabricasMapa();
    const texto = r.erro ? `⚠️ Busca de fábricas: ${r.erro}` : `🏭 Busca de fábricas em Franca: ${r.novos} nova(s) para abordar (${r.comWhats || 0} com WhatsApp).`;
    return res.json({ ...r, texto });
  } catch (e) {
    return res.status(500).json({ erro: 'Falhou: ' + String(e.message).slice(0, 120), texto: '⚠️ A busca de fábricas não funcionou.' });
  }
}
