// Entrar na escola: e-mail + senha.
import { sb, txt } from '../../../lib/varejoServer';
import { senhaConfere, criarCookieAluno, emailOk, limitar, configurado } from '../../../lib/escolaServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!configurado()) return res.status(503).json({ erro: 'A escola ainda não está configurada no servidor.' });
  if (limitar(req, 12)) return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const email = txt(c.email, 120).toLowerCase();
  const nao = { erro: 'E-mail ou senha incorretos.' };
  if (!emailOk(email) || !c.senha) return res.status(401).json(nao);
  try {
    const [a] = await sb(`esc_alunos?email=eq.${encodeURIComponent(email)}&ativo=eq.true&select=id,senha_hash&limit=1`);
    if (!a || !senhaConfere(c.senha, a.senha_hash)) return res.status(401).json(nao);
    res.setHeader('Set-Cookie', criarCookieAluno(a.id));
    return res.json({ ok: true });
  } catch (e) {
    console.error('escola/entrar', e.message);
    return res.status(500).json({ erro: 'Não foi possível entrar agora. Tente de novo.' });
  }
}
