import { sb } from '../../../../lib/varejoServer';
import { hashCodigo, normalizarCodigo, criarCookieSocio, configurado } from '../../../../lib/praiaAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Método não permitido' }); }
  if (!configurado()) return res.status(500).json({ erro: 'Sistema ainda não configurado.' });
  const codigo = normalizarCodigo(req.body && req.body.codigo);
  try {
    const [s] = codigo.length === 10 ? await sb(`praia_parceiros?codigo_hash=eq.${hashCodigo(codigo)}&ativo=eq.true&select=id`) : [];
    if (!s) { await new Promise((r) => setTimeout(r, 1000)); return res.status(401).json({ erro: 'Código incorreto.' }); }
    res.setHeader('Set-Cookie', criarCookieSocio(s.id));
    return res.json({ ok: true });
  } catch (e) {
    console.error('praia/socio/login', e.message);
    return res.status(500).json({ erro: 'Erro ao entrar. Tente de novo.' });
  }
}
