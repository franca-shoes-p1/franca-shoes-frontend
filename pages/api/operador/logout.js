import { limparCookieOperador } from '../../../lib/operadorAuth';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', limparCookieOperador());
  res.json({ ok: true });
}
