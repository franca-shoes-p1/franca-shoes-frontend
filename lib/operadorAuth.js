// Login dos operadores: código de acesso pessoal + cookie assinado. Separado do login do dono.
import crypto from 'crypto';
import { sb, UUID } from './varejoServer';

const DIAS = 14;
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const segredo = () => process.env.ADMIN_SESSION_SECRET || '';
const mac = (v) => crypto.createHmac('sha256', segredo()).update('op:' + v).digest('hex');

export const configurado = () => segredo().length >= 16;

export function normalizarCodigo(c) {
  return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
export function hashCodigo(c) {
  return crypto.createHmac('sha256', segredo()).update('codigo:' + normalizarCodigo(c)).digest('hex');
}
export function novoCodigo() {
  let s = '';
  for (let i = 0; i < 10; i++) s += ALFABETO[crypto.randomInt(ALFABETO.length)];
  return s.slice(0, 5) + '-' + s.slice(5);
}

export function criarCookieOperador(id) {
  const expira = String(Date.now() + DIAS * 24 * 3600 * 1000);
  const base = `${id}.${expira}`;
  return `opsess=${base}.${mac(base)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${DIAS * 24 * 3600}`;
}
export const limparCookieOperador = () => 'opsess=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';

// Devolve o operador logado (e ativo) ou null.
export async function operadorLogado(req) {
  if (!configurado()) return null;
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)opsess=([^;]+)/);
  if (!m) return null;
  const p = m[1].split('.');
  if (p.length !== 3 || !UUID.test(p[0]) || !(Number(p[1]) > Date.now())) return null;
  const esperado = mac(`${p[0]}.${p[1]}`);
  if (p[2].length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(p[2]), Buffer.from(esperado))) return null;
  const base = 'id,nome,setor,nivel,aceite_em,chave_pix';
  let op;
  try {
    [op] = await sb(`op_operarios?id=eq.${p[0]}&ativo=eq.true&select=${base},pode_catalogo`);
  } catch (e) {
    // Se o SQL do catálogo ainda não foi rodado, a coluna não existe: o login continua funcionando, sem catálogo.
    [op] = await sb(`op_operarios?id=eq.${p[0]}&ativo=eq.true&select=${base}`);
  }
  return op || null;
}

export async function exigirOperador(req, res) {
  const op = await operadorLogado(req).catch(() => null);
  if (!op) {
    res.status(401).json({ erro: 'Faça login.' });
    return null;
  }
  return op;
}

// Operador logado, que aceitou as regras e foi liberado pelo dono para cadastrar modelos.
export async function exigirCatalogo(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return null;
  if (!op.aceite_em) {
    res.status(403).json({ erro: 'Aceite as regras de trabalho primeiro.' });
    return null;
  }
  if (!op.pode_catalogo) {
    res.status(403).json({ erro: 'Você ainda não tem permissão para cadastrar modelos.' });
    return null;
  }
  return op;
}
