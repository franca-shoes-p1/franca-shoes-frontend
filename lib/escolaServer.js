// Escola de Agropecuária Ecológica: ajudantes do SERVIDOR (só rodam na Vercel).
// Login dos alunos: e-mail + senha (guardada só como hash) + cookie assinado. Separado do painel do dono, dos operadores e do passe de compra.
import crypto from 'crypto';
import { sb, UUID } from './varejoServer';

const DIAS = 30;
const segredo = () => process.env.ADMIN_SESSION_SECRET || '';
const mac = (v) => crypto.createHmac('sha256', segredo()).update('esc:' + v).digest('hex');

export const configurado = () => segredo().length >= 16;
export const emailOk = (e) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(String(e || '')) && String(e).length <= 120;

export function hashSenha(senha) {
  const sal = crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(String(senha), sal, 64).toString('hex');
  return `${sal}:${h}`;
}

export function senhaConfere(senha, guardado) {
  const [sal, h] = String(guardado || '').split(':');
  if (!sal || !h) return false;
  const novo = crypto.scryptSync(String(senha), sal, 64);
  const velho = Buffer.from(h, 'hex');
  return velho.length === novo.length && crypto.timingSafeEqual(novo, velho);
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function senhaTemporaria() {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALFABETO[crypto.randomInt(ALFABETO.length)];
  return s;
}

export function criarCookieAluno(id) {
  const expira = String(Date.now() + DIAS * 24 * 3600 * 1000);
  const base = `${id}.${expira}`;
  return `escsess=${base}.${mac(base)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${DIAS * 24 * 3600}`;
}
export const limparCookieAluno = () => 'escsess=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';

// Devolve o aluno logado (e ativo) ou null.
export async function alunoLogado(req) {
  if (!configurado()) return null;
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)escsess=([^;]+)/);
  if (!m) return null;
  const p = m[1].split('.');
  if (p.length !== 3 || !UUID.test(p[0]) || !(Number(p[1]) > Date.now())) return null;
  const esperado = mac(`${p[0]}.${p[1]}`);
  if (p[2].length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(p[2]), Buffer.from(esperado))) return null;
  const [a] = await sb(`esc_alunos?id=eq.${p[0]}&ativo=eq.true&select=id,nome,email`);
  return a || null;
}

export async function exigirAluno(req, res) {
  const a = await alunoLogado(req).catch(() => null);
  if (!a) {
    res.status(401).json({ erro: 'Entre na escola para ver as aulas.' });
    return null;
  }
  return a;
}

// Limite simples de tentativas por endereço (vale por instância do servidor).
const tentativas = new Map();
export function limitar(req, max = 10, minutos = 10) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const agora = Date.now();
  const l = (tentativas.get(ip) || []).filter((t) => agora - t < minutos * 60 * 1000);
  l.push(agora);
  tentativas.set(ip, l);
  if (tentativas.size > 5000) tentativas.clear();
  return l.length > max;
}
