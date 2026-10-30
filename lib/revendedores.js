// Regras compartilhadas do sistema de revendedores (navegador e servidor).
import { r2 } from './fornecedores';

export const MENSALIDADE = 59;     // hipótese inicial, ajuste aqui
export const TOLERANCIA_DIAS = 5;  // dias depois do vencimento em que o link ainda vende
export const MARGEM_PADRAO = 40;
export const MARGEM_MAX = 100;

export const PACOTES = [
  { id: 'essencial', nome: 'Loja própria Essencial', implantacao: 497, mensal: 49, itens: ['Loja do revendedor fora do site da igreja', 'Catálogo da vitrine sincronizado', 'PIX e painel de pedidos'] },
  { id: 'completa', nome: 'Loja própria Completa', implantacao: 997, mensal: 79, itens: ['Tudo do Essencial', 'Logo e identidade simples', 'Avisos automáticos por WhatsApp', 'Material de divulgação'] },
];

export const STATUS_REV = {
  pendente: ['Em análise', '#d97706'],
  ativo: ['Ativo', '#16a34a'],
  pausado: ['Pausado', '#64748b'],
  recusado: ['Recusado', '#dc2626'],
};

// Preço ao cliente = preço do fornecedor + comissão da loja (%) + margem do revendedor (%).
export const precoComMargem = (pf, comissaoPct, margemPct) => r2(Number(pf) * (1 + ((Number(comissaoPct) || 0) + (Number(margemPct) || 0)) / 100));
export const margemUnitaria = (pf, margemPct) => r2(Number(pf) * ((Number(margemPct) || 0) / 100));

const hojeISO = () => new Date().toISOString().slice(0, 10);
// 'ok' (em dia), 'tolerancia' (venceu há pouco, ainda vende), 'vencida', 'nunca' (nunca pagou)
export function statusAssinatura(ate, hoje = hojeISO()) {
  if (!ate) return 'nunca';
  if (ate >= hoje) return 'ok';
  const dias = Math.floor((new Date(hoje) - new Date(ate)) / 86400000);
  return dias <= TOLERANCIA_DIAS ? 'tolerancia' : 'vencida';
}
export const podeVender = (r) => r && r.status === 'ativo' && ['ok', 'tolerancia'].includes(statusAssinatura(r.assinatura_ate));
