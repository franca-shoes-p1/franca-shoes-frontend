import { configurado, pinCorreto, criarCookie } from '../../../lib/capturaServer';

const erros = new Map(); // limite simples por IP: 8 erros em 15 minutos
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!configurado()) return res.status(500).json({ erro: 'Captura não configurada no servidor (veja o .env.local).' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const agora = Date.now();
  const lista = (erros.get(ip) || []).filter((t) => agora - t < 900000);
  if (lista.length >= 8) return res.status(429).json({ erro: 'Muitas tentativas. Espere 15 minutos.' });
  if (!pinCorreto(req.body && req.body.pin)) {
    lista.push(agora); erros.set(ip, lista);
    return res.status(401).json({ erro: 'PIN incorreto.' });
  }
  erros.delete(ip);
  res.setHeader('Set-Cookie', criarCookie(req));
  return res.json({ ok: true });
}
