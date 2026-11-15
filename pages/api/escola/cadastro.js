// Cadastro gratuito de aluno: nome, e-mail e senha. Já entra logado.
import { sb, txt } from '../../../lib/varejoServer';
import { hashSenha, criarCookieAluno, emailOk, limitar, configurado } from '../../../lib/escolaServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!configurado()) return res.status(503).json({ erro: 'A escola ainda não está configurada no servidor.' });
  if (limitar(req, 8)) return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const nome = txt(c.nome, 80);
  const email = txt(c.email, 120).toLowerCase();
  const senha = String(c.senha || '');
  const whatsapp = String(c.whatsapp || '').replace(/\D/g, '').slice(0, 15);
  if (nome.length < 2) return res.status(400).json({ erro: 'Escreva o seu nome.' });
  if (!emailOk(email)) return res.status(400).json({ erro: 'Confira o e-mail.' });
  if (senha.length < 8 || senha.length > 100) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
  if (!c.aceite) return res.status(400).json({ erro: 'Marque que concorda em receber avisos sobre a escola.' });
  try {
    const [ja] = await sb(`esc_alunos?email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
    if (ja) return res.status(409).json({ erro: 'Já existe um cadastro com esse e-mail. Use “Entrar”.' });
    const [novo] = await sb('esc_alunos', {
      method: 'POST',
      body: JSON.stringify({ nome, email, whatsapp: whatsapp || null, senha_hash: hashSenha(senha) }),
    });
    res.setHeader('Set-Cookie', criarCookieAluno(novo.id));
    return res.json({ ok: true });
  } catch (e) {
    console.error('escola/cadastro', e.message);
    return res.status(500).json({ erro: 'Não foi possível cadastrar agora. Tente de novo.' });
  }
}
