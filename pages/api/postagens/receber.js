// Porta de entrada AUTOMÁTICA: o n8n (que gera os posts com IA todo dia) envia o lote para cá.
// Protegida por um token combinado entre a Vercel e o n8n. Não usa login de operador nem do dono.
import { inserirLote, tokenConfere } from '../../../lib/postagens';

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  }
  if (!tokenConfere(req.headers['x-webhook-token'])) {
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ ok: false, erro: 'Token inválido.' });
  }
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const lista = Array.isArray(c) ? c : c.postagens;
  try {
    const r = await inserirLote(lista, { lote: c.lote, origem: 'ia' });
    return res.status(r.criadas || !r.erros.length ? 200 : 422).json({ ok: r.criadas > 0 || !r.erros.length, ...r });
  } catch (e) {
    if (e.publico) return res.status(400).json({ ok: false, erro: e.message });
    console.error('postagens/receber', e.message);
    return res.status(500).json({ ok: false, erro: 'Não foi possível gravar agora: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 200) });
  }
}
