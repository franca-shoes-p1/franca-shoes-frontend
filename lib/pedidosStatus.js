// Situações do pedido da loja de varejo: textos em um lugar só (painel, página do cliente e página "Como comprar").
export const STATUS_PEDIDO = {
  aguardando_pagamento: { rotulo: 'Aguardando pagamento', cor: 'am' },
  pago: { rotulo: 'Pagamento confirmado', cor: 'ok' },
  em_compra_fabrica: { rotulo: 'Comprando na fábrica', cor: '' },
  enviado: { rotulo: 'Enviado ou em rota', cor: '' },
  entregue: { rotulo: 'Entregue', cor: 'ok' },
  pagamento_recusado: { rotulo: 'Pagamento recusado', cor: 'er' },
  valor_divergente: { rotulo: 'Em conferência', cor: 'am' },
  cancelado: { rotulo: 'Cancelado', cor: 'er' },
  reembolsado: { rotulo: 'Reembolsado', cor: '' },
};
export const LISTA_STATUS = Object.keys(STATUS_PEDIDO);
export const STATUS_LOTE = { aberto: 'Aberto (juntando pedidos)', fechado: 'Fechado (comprar na fábrica)', em_rota: 'Em rota', entregue: 'Entregue' };
export const rotuloStatus = (s) => (STATUS_PEDIDO[s] ? STATUS_PEDIDO[s].rotulo : s);

// Caminho feliz mostrado ao cliente (a barra de progresso). A rodoviária tem a etapa do lote.
export const ETAPAS = {
  correios: ['aguardando_pagamento', 'pago', 'em_compra_fabrica', 'enviado', 'entregue'],
  rodoviaria: ['aguardando_pagamento', 'pago', 'em_compra_fabrica', 'enviado', 'entregue'],
};
