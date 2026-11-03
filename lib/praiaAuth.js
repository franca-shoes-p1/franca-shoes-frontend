// Login da Área do Sócio: código pessoal + cookie assinado. Separado do painel do dono e dos operadores.
import crypto from 'crypto';
import { sb, UUID } from './varejoServer';
import { hashCodigo, normalizarCodigo, novoCodigo, configurado } from './operadorAuth';

export { hashCodigo, normalizarCodigo, novoCodigo, configurado };
const DIAS = 14;
const segredo = () => process.env.ADMIN_SESSION_SECRET || '';
const mac = (v) => crypto.createHmac('sha256', segredo()).update('pr:' + v).digest('hex');

export function criarCookieSocio(id) {
  const expira = String(Date.now() + DIAS * 24 * 3600 * 1000);
  const base = `${id}.${expira}`;
  return `prsess=${base}.${mac(base)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${DIAS * 24 * 3600}`;
}
export const limparCookieSocio = () => 'prsess=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';

export async function socioLogado(req) {
  if (!configurado()) return null;
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)prsess=([^;]+)/);
  if (!m) return null;
  const p = m[1].split('.');
  if (p.length !== 3 || !UUID.test(p[0]) || !(Number(p[1]) > Date.now())) return null;
  const esperado = mac(`${p[0]}.${p[1]}`);
  if (p[2].length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(p[2]), Buffer.from(esperado))) return null;
  const [s] = await sb(`praia_parceiros?id=eq.${p[0]}&ativo=eq.true&select=id,nome,cidade,kit,cadastro_ambulante,curso_manipulacao,contrato_assinado`);
  return s || null;
}

export async function exigirSocio(req, res) {
  const s = await socioLogado(req).catch(() => null);
  if (!s) { res.status(401).json({ erro: 'Faça login.' }); return null; }
  return s;
}

// Vagas por cidade: total cadastrado menos sócios ativos. Sem cidades cadastradas, devolve vazio.
export async function calcularVagas() {
  const vagas = await sb('praia_vagas?ativo=eq.true&select=cidade,total&order=cidade');
  const parc = vagas.length ? await sb('praia_parceiros?ativo=eq.true&select=cidade') : [];
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const cidades = vagas.map((v) => {
    const ocupadas = parc.filter((x) => norm(x.cidade) === norm(v.cidade)).length;
    return { cidade: v.cidade, total: v.total, ocupadas, livres: Math.max(0, v.total - ocupadas) };
  });
  return { cidades, total: cidades.reduce((a, c) => a + c.total, 0), livres: cidades.reduce((a, c) => a + c.livres, 0) };
}
export const normCidade = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
