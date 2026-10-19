import { limparCookie } from '../../../lib/adminAuth';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', limparCookie());
  return res.status(200).json({ ok: true });
}
