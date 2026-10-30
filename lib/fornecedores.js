// Regras compartilhadas do sistema de fornecedores (navegador e servidor).
// Preço ao cliente = preço do fornecedor + comissão (%). Exemplo: R$ 100 com 15% => cliente paga R$ 115.

export const COMISSAO_PADRAO = 15;

export const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const precoCliente = (precoFornecedor, pct) => r2(Number(precoFornecedor) * (1 + (Number(pct) || 0) / 100));
export const comissaoUnitaria = (precoFornecedor, pct) => r2(precoCliente(precoFornecedor, pct) - Number(precoFornecedor));

export const STATUS_EMPRESA = {
  pendente: ['Em análise', '#d97706'],
  ativo: ['Ativo', '#16a34a'],
  pausado: ['Pausado', '#64748b'],
  recusado: ['Recusado', '#dc2626'],
};

export const STATUS_PEDIDO = {
  aguardando_pagamento: ['Aguardando pagamento', '#64748b'],
  cliente_pagou: ['Cliente diz que pagou', '#d97706'],
  pago: ['Pago: separar o pedido', '#2563eb'],
  pronto_coleta: ['Pronto para coleta', '#7c3aed'],
  coletado: ['Coletado', '#0891b2'],
  enviado: ['Enviado', '#0d9488'],
  entregue: ['Entregue', '#16a34a'],
  cancelado: ['Cancelado', '#dc2626'],
};

export const PIX_TIPOS = [
  ['cnpj', 'CNPJ'],
  ['cpf', 'CPF'],
  ['celular', 'Celular'],
  ['email', 'E-mail'],
  ['aleatoria', 'Chave aleatória'],
];

export const ESTOQUE = [
  ['disponivel', 'Disponível'],
  ['sob_consulta', 'Sob consulta (confirmo a grade a cada pedido)'],
  ['esgotado', 'Esgotado (some do site)'],
];

export const REVISAO = {
  pendente: ['Aguardando aprovação', '#d97706'],
  aprovado: ['No site', '#16a34a'],
  reprovado: ['Precisa de ajuste', '#dc2626'],
};

export const so_digitos = (v) => String(v ?? '').replace(/\D/g, '');

// CPF: confere os dígitos verificadores.
export function cpfValido(v) {
  const c = so_digitos(v);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(c[i]) * (t + 1 - i);
    const d = ((soma * 10) % 11) % 10;
    if (d !== Number(c[t])) return false;
  }
  return true;
}
export const fmtCpf = (v) => so_digitos(v).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');

export const MODOS_ENTREGA = {
  a_definir: ['A definir', '#64748b'],
  rota: ['Rota (passe livre)', '#7c3aed'],
  correios: ['Correios', '#0d9488'],
};

// Texto curto da política de troca de um fornecedor (usado na vitrine, no pedido e no Regulamento).
export function textoTroca(e) {
  const defeito = Number(e?.troca_defeito_dias) > 0 ? Number(e.troca_defeito_dias) : 30;
  const linhas = [`Defeito de fabricação: troca em até ${defeito} dias, sem custo para o cliente.`];
  if (e?.troca_vontade) {
    const d = Number(e.troca_vontade_dias) > 0 ? ` em até ${Number(e.troca_vontade_dias)} dias` : '';
    linhas.push(`Troca por tamanho ou vontade: aceita${d}; o frete fica por conta ${e.troca_frete_vontade === 'fornecedor' ? 'do fornecedor' : 'do comprador'}.`);
  } else {
    linhas.push('Troca por tamanho ou vontade: este fornecedor não aceita. Confira a tabela de medidas antes de comprar.');
  }
  if (e?.troca_obs) linhas.push(String(e.troca_obs));
  return linhas;
}
