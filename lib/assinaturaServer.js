// Assinatura (SERVIDOR): sessão do assinante, configurações e desconto por produto. Só roda na Vercel.
import crypto from 'crypto';
import { sb, txt } from './varejoServer';
import { PASSE, RAMOS_PADRAO, descontoUnitario } from './assinatura';

const DIAS_COOKIE = 30;
const segredo = () => (process.env.ADMIN_SESSION_SECRET || '') + ':membro';
const assinar = (v) => crypto.createHmac('sha256', segredo()).update(v).digest('hex');
const okSegredo = () => (process.env.ADMIN_SESSION_SECRET || '').length >= 16;

export const emailValido = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export function criarCookieMembro(email) {
  const expira = String(Date.now() + DIAS_COOKIE * 86400000);
  const base = Buffer.from(email, 'utf8').toString('base64url');
  return `ebmembro=${base}.${expira}.${assinar(base + '.' + expira)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${DIAS_COOKIE * 86400}`;
}
export const limparCookieMembro = () => 'ebmembro=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';

// E-mail do assinante logado (cookie assinado) ou ''. Não diz se o passe está ativo: use acessoDe().
export function emailDoCookie(req) {
  if (!okSegredo()) return '';
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)ebmembro=([^;]+)/);
  if (!m) return '';
  const p = m[1].split('.');
  if (p.length !== 3) return '';
  const [base, expira, mac] = p;
  if (!(Number(expira) > Date.now())) return '';
  const esperado = assinar(base + '.' + expira);
  if (mac.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(esperado))) return '';
  const email = Buffer.from(base, 'base64url').toString('utf8').toLowerCase();
  return emailValido(email) ? email : '';
}

// Linha de cal_acessos_portal (ou null) + se está ativa agora.
export async function acessoDe(email) {
  if (!email) return null;
  try {
    const [a] = await sb(`cal_acessos_portal?chave=eq.${encodeURIComponent(email)}&select=chave,nome,whatsapp,expira_em&limit=1`);
    if (!a) return null;
    return { ...a, ativo: Date.parse(a.expira_em) > Date.now() };
  } catch (e) { return null; }
}
// Assinante ativo a partir do cookie da requisição: devolve o acesso ou null.
export async function membroAtivo(req) {
  const a = await acessoDe(emailDoCookie(req));
  return a && a.ativo ? a : null;
}

// Configuração do passe e dos ramos (com padrões se o SQL ainda não foi rodado).
export async function carregarConfigAssinatura() {
  let preco = PASSE.precoPadrao;
  let taxa = PASSE.taxaPadrao;
  let ramos = RAMOS_PADRAO;
  let fundo = PASSE.fundoPadrao;
  let pronto = false;
  try {
    const cfg = await sb('cal_config?select=chave,valor');
    const m = Object.fromEntries(cfg.map((c) => [c.chave, c.valor]));
    if (Number(m.preco_passe) > 0) preco = Number(m.preco_passe);
    if (Number(m.taxa_mp_pct) >= 0 && m.taxa_mp_pct !== undefined) taxa = Number(m.taxa_mp_pct);
    const rs = await sb('cal_ramos?select=*&ativo=eq.true&order=ordem');
    if (rs.length) ramos = rs.map((r) => ({ slug: r.slug, nome: r.nome, modo: r.modo, teto_pct: r.teto_pct == null ? null : Number(r.teto_pct), automatico: !!r.automatico }));
    pronto = true;
  } catch (e) { /* SQL da assinatura ainda não rodado: usa os padrões */ }
  try {
    const [f] = await sb('vit_config?chave=eq.fundo_pct&select=valor&limit=1');
    if (f && Number(f.valor) >= 0) fundo = Number(f.valor);
  } catch (e) {}
  return { preco_passe: preco, taxa_mp_pct: taxa, fundo_pct: fundo, ramos, pronto };
}

// Preço de assinante por produto (id -> { preco_assinante, desconto }), sem expor custo.
// "linhas" precisa ter id e preço geral (preco_venda_sugerido ou preco).
export async function precosAssinante(linhas, cfg) {
  const ids = linhas.filter((p) => !p.fornecedor_id).map((p) => p.id);
  const out = new Map();
  if (!ids.length) return out;
  let base;
  try {
    base = await sb(`rf_produtos?select=id,custo,ramo&id=in.(${ids.join(',')})`);
  } catch (e) {
    try { base = await sb(`rf_produtos?select=id,custo&id=in.(${ids.join(',')})`); } catch (e2) { return out; }
  }
  const ramo = new Map(cfg.ramos.map((r) => [r.slug, r]));
  const dados = new Map(base.map((b) => [b.id, b]));
  linhas.forEach((p) => {
    const b = dados.get(p.id);
    if (!b) return;
    const r = ramo.get(b.ramo || 'calcados');
    if (!r || !r.automatico) return; // ramo sem desconto automático no site
    const preco = Number(p.preco_venda_sugerido != null ? p.preco_venda_sugerido : p.preco) || 0;
    const d = descontoUnitario({ preco, custo: b.custo, taxaPct: cfg.taxa_mp_pct, fundoPct: cfg.fundo_pct, tetoPct: r.modo === 'teto' ? r.teto_pct : r.teto_pct });
    if (d > 0) out.set(p.id, { desconto: d, preco_assinante: Math.round((preco - d) * 100) / 100 });
  });
  return out;
}

export { txt };
