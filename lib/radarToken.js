// Acesso do n8n (robô) às rotas /api/radar/*: cabeçalho x-radar-token igual à variável RADAR_N8N_TOKEN da Vercel.
import crypto from 'crypto';

export function exigirRadarToken(req, res) {
  const certo = process.env.RADAR_N8N_TOKEN || '';
  if (certo.length < 16) { res.status(503).json({ erro: 'RADAR_N8N_TOKEN não configurado (mínimo 16 caracteres).' }); return false; }
  const a = crypto.createHash('sha256').update(String(req.headers['x-radar-token'] || '')).digest();
  const b = crypto.createHash('sha256').update(certo).digest();
  if (!crypto.timingSafeEqual(a, b)) { res.status(401).json({ erro: 'Não autorizado.' }); return false; }
  return true;
}
