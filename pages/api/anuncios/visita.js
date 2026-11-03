// Conta uma visita vinda de um link rastreado (utm_source e utm_campaign). Sem cookie e sem dado pessoal.
import { sb } from '../../../lib/varejoServer';
import { CANAIS_ANUNCIO } from '../../../lib/anuncios';

const tentativas = new Map();
function limite(ip) {
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter((t) => agora - t < 3600000);
  if (lista.length >= 60) return false;
  lista.push(agora); tentativas.set(ip, lista);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const canal = String(b.canal || '');
  const campanha = String(b.campanha || '');
  if (!CANAIS_ANUNCIO[canal] || !/^[a-z0-9-]{3,60}$/.test(campanha)) return res.json({ ok: true });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (!limite(ip)) return res.json({ ok: true });
  try { await sb('rf_anuncios_visitas', { method: 'POST', body: JSON.stringify([{ canal, campanha }]), headers: { Prefer: 'return=minimal' } }); } catch (e) { /* sem SQL ou sem rede: não atrapalha o visitante */ }
  return res.json({ ok: true });
}
