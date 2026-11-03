import { limparCookieSocio } from '../../../../lib/praiaAuth';
export default function handler(req, res) { res.setHeader('Set-Cookie', limparCookieSocio()); res.json({ ok: true }); }
