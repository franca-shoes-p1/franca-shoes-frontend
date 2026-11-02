import { limparCookieMembro } from '../../../lib/assinaturaServer';
export default function handler(req, res) {
  res.setHeader('Set-Cookie', limparCookieMembro());
  res.json({ ok: true });
}
