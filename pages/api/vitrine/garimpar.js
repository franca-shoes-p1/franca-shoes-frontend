// Para o n8n: roda o garimpo diário da vitrine (busca na internet + leitura de páginas de fornecedores).
// Cabeçalho x-radar-token igual à variável RADAR_N8N_TOKEN. Devolve "texto" pronto para o Telegram.
import { exigirRadarToken } from '../../../lib/radarToken';
import { garimpar, textoGarimpo } from '../../../lib/vitrineServer';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const r = await garimpar();
    return res.json({ ...r, texto: textoGarimpo(r) });
  } catch (e) {
    console.error('vitrine/garimpar', e.message);
    return res.status(500).json({ erro: 'Falhou: ' + String(e.message).slice(0, 120), texto: '⚠️ O garimpo da vitrine não funcionou hoje.' });
  }
}
