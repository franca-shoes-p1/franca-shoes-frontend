// Login do painel: senha única + cookie assinado. Só usado nas rotas /api/admin.
import crypto from 'crypto';

const DIAS = 7;

function segredo() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

function assinar(valor) {
  return crypto.createHmac('sha256', segredo()).update(valor).digest('hex');
}

export function senhaConfere(tentativa) {
  const certa = process.env.ADMIN_PASSWORD || '';
  if (!certa) return false;
  const a = crypto.createHash('sha256').update(String(tentativa || '')).digest();
  const b = crypto.createHash('sha256').update(certa).digest();
  return crypto.timingSafeEqual(a, b);
}

export function criarCookie() {
  const expira = String(Date.now() + DIAS * 24 * 3600 * 1000);
  return `ebadmin=${expira}.${assinar(expira)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${DIAS * 24 * 3600}`;
}

export function limparCookie() {
  return 'ebadmin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
}

export function ehAdmin(req) {
  if (!segredo() || segredo().length < 16) return false;
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)ebadmin=([^;]+)/);
  if (!m) return false;
  const partes = m[1].split('.');
  if (partes.length !== 2) return false;
  const [expira, mac] = partes;
  if (!(Number(expira) > Date.now())) return false;
  const esperado = assinar(expira);
  if (mac.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(esperado));
}

export function exigirAdmin(req, res) {
  if (ehAdmin(req)) return true;
  res.status(401).json({ erro: 'Não autorizado. Faça login.' });
  return false;
}
