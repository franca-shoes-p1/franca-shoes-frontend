import { cookieApagar } from '../../../lib/capturaServer';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', cookieApagar());
  res.json({ ok: true });
}
