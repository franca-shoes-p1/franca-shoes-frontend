import { cadastrar, montarCookies } from '../../../lib/opAuth';
import { sb, UUID } from '../../../lib/supabaseServer';

// Cria a conta de um operador. Ele fica INATIVO até o dono aprovar no painel.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido' });
  }
  try {
    const b = req.body || {};
    const email = String(b.email || '').trim().toLowerCase();
    const senha = String(b.senha || '');
    const nome = String(b.nome || '').trim().slice(0, 120);
    const whatsapp = String(b.whatsapp || '').replace(/\D/g, '').slice(0, 15);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
    if (senha.length < 8) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
    if (nome.length < 2) return res.status(400).json({ erro: 'Informe seu nome.' });
    if (!b.lgpd) return res.status(400).json({ erro: 'É preciso aceitar o uso dos seus dados para criar a conta.' });

    const r = await cadastrar(email, senha, nome);
    if (!r.ok) {
      const msg = (r.dados && (r.dados.msg || r.dados.error_description || r.dados.message)) || 'Não foi possível criar a conta.';
      return res.status(400).json({ erro: msg });
    }
    const id = (r.dados && ((r.dados.user && r.dados.user.id) || r.dados.id)) || null;
    if (id && UUID.test(id)) {
      await sb('op_perfis', {
        method: 'POST',
        body: { id, papel: 'operador', nome, whatsapp: whatsapp || null, ativo: false },
        prefer: 'resolution=ignore-duplicates,return=minimal',
      });
    }
    const logado = !!(r.dados && r.dados.access_token);
    if (logado) res.setHeader('Set-Cookie', montarCookies(r.dados.access_token, r.dados.refresh_token));
    return res.status(200).json({ ok: true, logado });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
