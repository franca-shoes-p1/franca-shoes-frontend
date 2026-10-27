// Listas do atendimento, usadas pelo formulário (/contato), pela API e pelo painel (/admin/contatos).
// Sem nada secreto: pode ir para o navegador.

export const ASSUNTOS = [
  'Dúvida sobre produtos',
  'Calçados e acessórios',
  'Produtos digitais, e-books e cursos',
  'Serviços de site, IA e automação (Ateliê)',
  'Quero ser operador',
  'Parcerias',
  'Outro assunto',
];

// Cada fonte do painel: tabela do Supabase, rótulo e os status que ela já usa.
export const FONTES = {
  contato: {
    tabela: 'op_contatos',
    rotulo: 'Fale conosco',
    status: ['novo', 'em_atendimento', 'respondido', 'resolvido', 'spam'],
    novo: 'novo',
    fechados: ['respondido', 'resolvido', 'spam'],
  },
  atelie_pedido: {
    tabela: 'op_atelie_pedidos',
    rotulo: 'Pedido do Ateliê',
    status: ['novo', 'em_consultoria', 'orcamento_enviado', 'entrada_paga', 'em_producao', 'entregue', 'cancelado'],
    novo: 'novo',
    fechados: ['entregue', 'cancelado'],
  },
  atelie_montador: {
    tabela: 'op_atelie_candidatos',
    rotulo: 'Candidato a montador',
    status: ['novo', 'triagem', 'teste_pago', 'aprovado', 'recusado'],
    novo: 'novo',
    fechados: ['aprovado', 'recusado'],
  },
  operador: {
    tabela: 'op_candidatos',
    rotulo: 'Candidato a operador',
    status: ['novo', 'chamado', 'convertido', 'descartado'],
    novo: 'novo',
    fechados: ['convertido', 'descartado'],
  },
};

export const NOME_STATUS = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  respondido: 'Respondido',
  resolvido: 'Resolvido',
  spam: 'Spam',
  em_consultoria: 'Em consultoria',
  orcamento_enviado: 'Orçamento enviado',
  entrada_paga: 'Entrada paga',
  em_producao: 'Em produção',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  triagem: 'Triagem',
  teste_pago: 'Teste pago',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  chamado: 'Chamado',
  convertido: 'Convertido',
  descartado: 'Descartado',
};

// Link do WhatsApp para responder (aceita número com ou sem DDI).
export function linkWhats(numero, texto) {
  let n = String(numero || '').replace(/\D/g, '');
  if (n.length === 10 || n.length === 11) n = '55' + n;
  if (n.length < 12) return null;
  return `https://wa.me/${n}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
}
