// Botão "Ir para o site da empresa": conta o clique e leva a pessoa ao site da empresa.
// Não guarda IP: só uma marca anônima que muda todo dia (para não contar o mesmo clique várias vezes).
import crypto from 'crypto';
import { sb } from '../../../lib/varejoServer';
import { refDoCookie } from '../../../lib/ref';

const ROBO = /bot|crawl|spider|preview|slurp|headless|facebookexternalhit|whatsapp/i;

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const slug = String(req.query.s || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80);
  if (!slug) return res.redirect(302, '/fabricas');
  try {
    const [l] = await sb(`ff_lojas?slug=eq.${slug}&ativo=eq.true&select=id,site_url&limit=1`);
    if (!l) return res.redirect(302, '/fabricas');
    const ua = String(req.headers['user-agent'] || '');
    if (req.method === 'GET' && !ROBO.test(ua)) {
      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
      const dia = new Date().toISOString().slice(0, 10);
      const visitante = crypto.createHash('sha256').update(`${ip}|${ua}|${dia}|${process.env.ADMIN_SESSION_SECRET || ''}`).digest('hex').slice(0, 24);
      await sb('ff_cliques', { method: 'POST', body: JSON.stringify({ loja_id: l.id, ref: refDoCookie(req), visitante }) }).catch(() => {});
    }
    let destino = l.site_url;
    try {
      const u = new URL(l.site_url);
      if (u.protocol !== 'https:') return res.redirect(302, '/fabricas');
      u.searchParams.set('utm_source', 'igreja.eco.br');
      u.searchParams.set('utm_medium', 'vitrine-fabricas');
      destino = u.toString();
    } catch (e) {
      return res.redirect(302, '/fabricas');
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, destino);
  } catch (e) {
    console.error('fabricas/ir', e.message);
    return res.redirect(302, '/fabricas');
  }
}
