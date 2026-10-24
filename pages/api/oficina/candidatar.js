// Inscrição pública de quem quer ser operador. Sem promessa de ganho; só guarda nome e WhatsApp.
import { sb, txt } from '../../../lib/varejoServer';

const recentes = new Map(); // limite simples por endereço (zera quando a função reinicia)

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-isca: robôs preenchem, pessoas não
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const agora = Date.now();
  const n = (recentes.get(ip) || []).filter((t) => agora - t < 3600 * 1000);
  if (n.length >= 5) return res.status(429).json({ erro: 'Muitas tentativas. Tente mais tarde.' });
  recentes.set(ip, [...n, agora]);
  const nome = txt(c.nome, 120);
  const zap = txt(c.whatsapp, 30).replace(/[^\d+()\s-]/g, '');
  if (nome.length < 2 || zap.replace(/\D/g, '').length < 10) return res.status(400).json({ erro: 'Informe seu nome e um WhatsApp com DDD.' });
  if (c.aceito !== true) return res.status(400).json({ erro: 'Marque que aceita receber contato.' });
  try {
    await sb('op_candidatos', { method: 'POST', body: JSON.stringify({ nome, whatsapp: zap, cidade: txt(c.cidade, 80) || null, interesse: txt(c.interesse, 300) || null, origem: txt(c.origem, 60) || null }) });
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('oficina/candidatar', e.message);
    return res.status(500).json({ erro: 'Não foi possível enviar agora. Tente de novo.' });
  }
}
