import { senhaConfere, criarCookie } from '../../../lib/adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido' });
  }
  const senha = req.body && req.body.senha;
  if (!senhaConfere(senha)) {
    // pequena espera para dificultar tentativas em sequência
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ erro: 'Senha incorreta' });
  }
  res.setHeader('Set-Cookie', criarCookie());
  return res.status(200).json({ ok: true });
}
