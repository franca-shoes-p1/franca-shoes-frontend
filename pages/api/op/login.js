import { entrar, montarCookies } from '../../../lib/opAuth';
import { sb, UUID } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido' });
  }
  try {
    const { email, senha } = req.body || {};
    const r = await entrar(String(email || '').trim().toLowerCase(), String(senha || ''));
    if (!r.ok || !r.dados || !r.dados.access_token) {
      await new Promise((x) => setTimeout(x, 800));
      return res.status(401).json({ erro: 'E-mail ou senha incorretos (ou e-mail ainda não confirmado).' });
    }
    res.setHeader('Set-Cookie', montarCookies(r.dados.access_token, r.dados.refresh_token));
    const id = r.dados.user && r.dados.user.id;
    let perfil = null;
    if (id && UUID.test(id)) {
      const linhas = await sb(`op_perfis?id=eq.${id}&select=papel,ativo`);
      perfil = linhas && linhas[0];
    }
    return res.status(200).json({ ok: true, papel: perfil ? perfil.papel : null, ativo: perfil ? perfil.ativo : false });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
