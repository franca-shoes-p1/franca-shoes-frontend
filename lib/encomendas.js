// Situações das encomendas da Entrega em Casa: textos em um lugar só (painel e API).
export const MIN_CIDADE = 6; // visitas confirmadas para a cidade entrar na rota (valor inicial, ajustável)

export const STATUS_ENC = {
  aguardando_cotacao: { rotulo: 'Aguardando cotação', cor: 'am' },
  cotado: { rotulo: 'Cotado (cliente confirmou?)', cor: '' },
  aguardando_lote: { rotulo: 'Aguardando lote mínimo', cor: 'am' },
  lote_fechado: { rotulo: 'Lote fechado', cor: 'ok' },
  comprado: { rotulo: 'Comprado em Franca', cor: 'ok' },
  rota_agendada: { rotulo: 'Rota agendada', cor: 'ok' },
  visita_confirmada: { rotulo: 'Visita confirmada', cor: 'ok' },
  entregue: { rotulo: 'Entregue', cor: 'ok' },
  recusou: { rotulo: 'Recusou na visita', cor: 'er' },
  desistiu: { rotulo: 'Desistiu da fila', cor: 'er' },
};
export const LISTA_STATUS_ENC = Object.keys(STATUS_ENC);
export const rotuloEnc = (s) => (STATUS_ENC[s] ? STATUS_ENC[s].rotulo : s);

// Quem já recebeu cotação e segue na fila conta como visita provável da cidade.
export const CONFIRMADOS = ['cotado', 'aguardando_lote', 'lote_fechado', 'comprado', 'rota_agendada', 'visita_confirmada'];
export const ENCERRADOS = ['entregue', 'recusou', 'desistiu'];

export const CATEGORIA_ROTULO = {
  calcado_fem: 'Calçado feminino', calcado_masc: 'Calçado masculino', calcado_infantil: 'Calçado infantil',
  acessorio: 'Acessório', outro: 'Outro produto', calcado: 'Calçado',
};
export const PACOTE_ROTULO = { loja_pronta: 'Negócio pronto', revenda: 'Revenda', site: 'Site/e-commerce', servicos: 'Serviços digitais' };
