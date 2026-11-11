// Ajudantes do SERVIDOR da captura do /sapatos (rodam só na Vercel / no seu computador, nunca no celular).
// Usam: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e CAPTURA_PIN.
import crypto from 'crypto';

export const BUCKET = 'fotos';
export const COOKIE = 'captura_sessao';
export const DIAS_SESSAO = 30;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const baseUrl = () => String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const chave = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const pin = () => String(process.env.CAPTURA_PIN || '');

export const configurado = () => !!(baseUrl() && chave() && pin().length >= 4);
export const txt = (v, n) => String(v ?? '').trim().slice(0, n);

// ---------- PIN e cookie ----------
const assinar = (exp) => crypto.createHmac('sha256', 'captura|' + pin() + '|' + chave()).update(String(exp)).digest('hex');

export function pinCorreto(tentativa) {
  const a = crypto.createHash('sha256').update(String(tentativa || '')).digest();
  const b = crypto.createHash('sha256').update(pin()).digest();
  return pin().length >= 4 && crypto.timingSafeEqual(a, b);
}

export function criarCookie(req) {
  const exp = Date.now() + DIAS_SESSAO * 86400000;
  const seguro = String(req.headers['x-forwarded-proto'] || '').includes('https') || process.env.NODE_ENV === 'production';
  return `${COOKIE}=${exp}.${assinar(exp)}; Path=/; Max-Age=${DIAS_SESSAO * 86400}; HttpOnly; SameSite=Lax${seguro ? '; Secure' : ''}`;
}
export const cookieApagar = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;

export function logado(req) {
  if (!configurado()) return false;
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=(\\d+)\\.([0-9a-f]{64})'));
  if (!m || Number(m[1]) < Date.now()) return false;
  const esperado = Buffer.from(assinar(m[1]));
  const recebido = Buffer.from(m[2]);
  return esperado.length === recebido.length && crypto.timingSafeEqual(esperado, recebido);
}

// Usar no começo de cada API: devolve true se pode continuar.
export function exigirLogin(req, res) {
  if (!configurado()) { res.status(500).json({ erro: 'Captura não configurada no servidor (veja o .env.local).' }); return false; }
  if (!logado(req)) { res.status(401).json({ erro: 'Digite o PIN.' }); return false; }
  return true;
}

// ---------- Supabase (chave de serviço: só aqui no servidor) ----------
const cab = (extra = {}) => ({ apikey: chave(), Authorization: `Bearer ${chave()}`, ...extra });

export async function sb(caminho, init = {}) {
  const r = await fetch(`${baseUrl()}/rest/v1/${caminho}`, {
    ...init,
    cache: 'no-store',
    headers: cab({ 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error('db: ' + t.slice(0, 300));
  return t ? JSON.parse(t) : [];
}

export async function guardarFoto(buffer, pasta) {
  const mes = new Date().toISOString().slice(0, 7);
  const nome = `captura/${pasta}/${mes}/${crypto.randomUUID()}.jpg`;
  const r = await fetch(`${baseUrl()}/storage/v1/object/${BUCKET}/${nome}`, {
    method: 'POST',
    headers: cab({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=31536000' }),
    body: buffer,
  });
  if (!r.ok) throw new Error('upload: ' + (await r.text()).slice(0, 300));
  return `${baseUrl()}/storage/v1/object/public/${BUCKET}/${nome}`;
}

// Só aceita endereços de fotos que estão no nosso bucket.
export const urlValida = (u) => typeof u === 'string' && u.startsWith(`${baseUrl()}/storage/v1/object/public/${BUCKET}/captura/`);
export const listaUrls = (l, max = 12) => (Array.isArray(l) ? l.filter(urlValida).slice(0, max) : []);
