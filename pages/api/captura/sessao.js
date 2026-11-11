import { logado, configurado } from '../../../lib/capturaServer';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: logado(req), configurado: configurado() });
}
