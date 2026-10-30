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
