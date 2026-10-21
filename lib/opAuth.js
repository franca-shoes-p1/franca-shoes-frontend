// Login do sistema unificado (operadores e dono). SÓ roda no servidor (Vercel).
// Usa o Supabase Auth pela API REST e guarda a sessão em cookies HttpOnly.
// Variáveis na Vercel: SUPABASE_URL, SUPABASE_ANON_KEY (chave "publishable"),
// SUPABASE_SERVICE_ROLE_KEY (a mesma já usada pelo painel de e-books).
import { sb, UUID } from './supabaseServer';

const BASE = () => process.env.SUPABASE_URL;
const ANON = () => process.env.SUPABASE_ANON_KEY;
const DIAS = 30;

async function gotrue(caminho, corpo, token) {
  if (!BASE() || !ANON()) {
    throw new Error('Faltam as variáveis SUPABASE_URL e SUPABASE_ANON_KEY na Vercel');
  }
  const headers = { apikey: ANON(), 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE()}/auth/v1/${caminho}`, {
    method: corpo ? 'POST' : 'GET',
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await res.text();
  let dados = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch (e) {
    dados = null;
  }
  return { ok: res.ok, status: res.status, dados };
}

export const entrar = (email, senha) => gotrue('token?grant_type=password', { email, password: senha });
export const cadastrar = (email, senha, nome) => gotrue('signup', { email, password: senha, data: { nome } });
const usuario = (token) => gotrue('user', null, token);
const renovar = (refresh) => gotrue('token?grant_type=refresh_token', { refresh_token: refresh });

export function montarCookies(acesso, refresh) {
  const base = `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${DIAS * 24 * 3600}`;
  return [`op_at=${acesso}; ${base}`, `op_rt=${refresh}; ${base}`];
}

export function limparCookies() {
  const base = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
  return [`op_at=; ${base}`, `op_rt=; ${base}`];
}

function lerCookie(req, nome) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${nome}=([^;]+)`));
  return m ? m[1] : null;
}

// Confere o login. Devolve { user, perfil } ou responde 401/403 e devolve null.
// papeis = lista de papéis aceitos (ex.: ['dono']). inativoOk = deixa passar quem ainda não foi aprovado.
export async function exigir(req, res, papeis, { inativoOk = false } = {}) {
  const acesso = lerCookie(req, 'op_at');
  let u = acesso ? await usuario(acesso) : null;
  if (!u || !u.ok) {
    const rt = lerCookie(req, 'op_rt');
    if (rt) {
      const r = await renovar(rt);
      if (r.ok && r.dados && r.dados.access_token) {
        res.setHeader('Set-Cookie', montarCookies(r.dados.access_token, r.dados.refresh_token));
        u = await usuario(r.dados.access_token);
      }
    }
  }
  const id = u && u.ok && u.dados && u.dados.id;
  if (!id || !UUID.test(id)) {
    res.status(401).json({ erro: 'Faça login para continuar.' });
    return null;
  }
  const linhas = await sb(`op_perfis?id=eq.${id}&select=*`);
  const perfil = linhas && linhas[0];
  if (!perfil || (!perfil.ativo && !inativoOk) || (papeis && !papeis.includes(perfil.papel))) {
    res.status(403).json({ erro: 'Sem permissão para esta área.' });
    return null;
  }
  return { user: u.dados, perfil };
}

// Valida id numérico vindo do navegador
export function idNum(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}
