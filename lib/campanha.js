// Dados da Campanha de Inauguração: edite só aqui e o site inteiro acompanha.
// Cálculo: o valor em créditos/pontos corresponde a cerca de 5 vezes o custo do item.
export const CAMPANHA = {
  nome: 'Campanha de Inauguração',
  validade: '31/12/2026',
  cliente: {
    regra: '1 Crédito Oficina para cada R$ 1,00 em serviços pagos e confirmados',
    acessorio: 500,
    calcado: 1250,
  },
  operador: {
    regra: 'Pontos Oficina ganhos em tarefas aprovadas e conferidas',
    acessorio: 1000,
    calcado: 2500,
  },
  whatsapp: '5516991543663',
};
export const fmt = (n) => n.toLocaleString('pt-BR');
