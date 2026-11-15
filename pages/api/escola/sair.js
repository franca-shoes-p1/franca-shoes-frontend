import { limparCookieAluno } from '../../../lib/escolaServer';
export default function handler(req, res) {
  res.setHeader('Set-Cookie', limparCookieAluno());
  res.json({ ok: true });
}
