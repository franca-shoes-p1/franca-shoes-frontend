import { limparCookies } from '../../../lib/opAuth';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', limparCookies());
  res.status(200).json({ ok: true });
}
