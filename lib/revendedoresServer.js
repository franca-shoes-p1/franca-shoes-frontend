// Ajudantes do SERVIDOR do sistema de revendedores.
import crypto from 'crypto';
import { sb, txt } from './varejoServer';
import { so_digitos, r2 } from './fornecedores';
import { ESTADOS } from './varejo';

export const novoToken = () => crypto.randomBytes(12).toString('hex');
export const TOKEN = /^[0-9a-f]{24}$/;
export const CODIGO = /^[A-Z0-9]{6,10}$/;
const LETRAS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const novoCodigo = () => Array.from(crypto.randomBytes(8), (b) => LETRAS[b % LETRAS.length]).join('');

export const COLS_REV = 'id,criado_em,status,codigo,nome,whatsapp,email,cidade,estado,local_entrega,pix_tipo,pix_chave,pix_nome,margem_pct,assinatura_ate,aceite_termos_em';

export async function acharRevendedor(token) {
  if (!TOKEN.test(String(token || ''))) return null;
  const [r] = await sb(`rev_revendedores?token=eq.${token}&select=${COLS_REV}`);
  return r || null;
}
export async function revPorCodigo(codigo) {
  const c = String(codigo || '').toUpperCase();
  if (!CODIGO.test(c)) return null;
  const [r] = await sb(`rev_revendedores?codigo=eq.${c}&select=${COLS_REV}`);
  return r || null;
}

export async function lerConfig() {
  try {
    const l = await sb('rev_config?select=chave,valor');
    return Object.fromEntries(l.map((x) => [x.chave, x.valor]));
  } catch (e) { return {}; }
}

export function validarRevBasica(b, { exigirLocal = false } = {}) {
  const nome = txt(b.nome, 80);
  const whats = so_digitos(b.whatsapp);
  const email = txt(b.email, 120).toLowerCase();
  const cidade = txt(b.cidade, 80);
  const estado = txt(b.estado, 2).toUpperCase();
  if (nome.length < 3) return { erro: 'Informe o seu nome.' };
  if (whats.length < 10 || whats.length > 13) return { erro: 'WhatsApp inválido. Use DDD + número.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { erro: 'E-mail inválido.' };
  if (cidade.length < 2) return { erro: 'Informe a sua cidade.' };
  if (!ESTADOS.includes(estado)) return { erro: 'Escolha o estado.' };
  const local = txt(b.local_entrega, 200);
  if (exigirLocal && local.length < 5) return { erro: 'Informe onde você recebe a mercadoria (rodoviária ou endereço).' };
  const d = { nome, whatsapp: whats.length <= 11 ? '55' + whats : whats, email: email || null, cidade, estado, local_entrega: local || null };
  if (b.pix_chave !== undefined) {
    const tipo = txt(b.pix_tipo, 12);
    const chave = txt(b.pix_chave, 80);
    if (chave) {
      if (!['cpf', 'cnpj', 'celular', 'email', 'aleatoria'].includes(tipo)) return { erro: 'Escolha o tipo da chave PIX.' };
      if ((tipo === 'cpf' && so_digitos(chave).length !== 11) || (tipo === 'cnpj' && so_digitos(chave).length !== 14)) return { erro: 'A chave PIX não confere com o tipo escolhido.' };
      d.pix_tipo = tipo; d.pix_chave = chave; d.pix_nome = txt(b.pix_nome, 40) || null;
    }
  }
  return { dados: d };
}
export { r2 };
