// Catálogo de pacotes para pequenos comércios.
// REVISAR: valores de referência pensados para caber no bolso de pequeno comércio.
// 'parcelas' = em quantas vezes a implantação pode ser paga (0 = não mostrar parcelamento).
// Só deixe parcelas > 0 se você realmente for oferecer o parcelamento (ex.: link de pagamento).
// Para mudar um preço ou item, edite só este arquivo.

export const SEGMENTOS = [
  { id: 'saloes', nome: 'Salões e estética', icone: '💇', dor: 'Agenda desorganizada, clientes que somem e pouca divulgação.',
    exemplos: ['Página com serviços, valores e botão de agendar', 'Lembrete de horário e aviso de retorno pelo WhatsApp', 'Posts de antes e depois, promoções e datas especiais'] },
  { id: 'mercadinhos', nome: 'Mercadinhos e mercearias', icone: '🛒', dor: 'Clientes perguntam preço e horário o dia todo, e o delivery vive no improviso.',
    exemplos: ['Catálogo de ofertas da semana compartilhável', 'Pedido pelo WhatsApp com lista organizada', 'Posts de ofertas e produtos da estação'] },
  { id: 'academias', nome: 'Academias e estúdios', icone: '🏋️', dor: 'Alunos que desistem em silêncio e dificuldade de atrair matrículas.',
    exemplos: ['Página com planos, horários e aula experimental', 'Aviso para alunos ausentes e aniversariantes', 'Posts de rotina, dicas e campanhas de matrícula'] },
  { id: 'oficinas', nome: 'Oficinas e serviços', icone: '🔧', dor: 'Orçamentos perdidos no WhatsApp e clientes que não voltam para a revisão.',
    exemplos: ['Página com serviços e pedido de orçamento', 'Lembrete de revisão e retorno do cliente', 'Posts de serviços, dicas de manutenção e promoções'] },
  { id: 'lojas', nome: 'Lojas', icone: '🛍️', dor: 'Vitrine só na porta, pouca presença na internet e vendas dependendo de quem passa na rua.',
    exemplos: ['Catálogo online com produtos e preços', 'Pedido e dúvidas pelo WhatsApp com respostas prontas', 'Posts de novidades, promoções e datas como Dia das Mães e Natal'] },
  { id: 'outros', nome: 'Outro comércio', icone: '🏪', dor: 'Qualquer pequeno negócio que quer aparecer e atender melhor.',
    exemplos: ['Página simples com o essencial do seu negócio', 'Respostas rápidas para as dúvidas mais comuns', 'Posts prontos para as redes sociais'] },
];

export const PACOTES = [
  {
    id: 'basico', nome: 'Básico', lema: 'Apareça na internet',
    implantacao: 297, mensal: 69, parcelas: 3, destaque: false,
    itens: [
      'Site de 1 página: o que você faz, horários, endereço e botão de WhatsApp',
      'Orientação para ajustar sua ficha no Google (Google Meu Negócio)',
      'Respostas prontas do WhatsApp para as perguntas mais comuns',
      '8 textos de posts prontos por mês para as redes sociais',
      'Entrega e ajustes iniciais acompanhados por mim',
    ],
  },
  {
    id: 'medio', nome: 'Médio', lema: 'Atenda melhor e venda mais',
    implantacao: 697, mensal: 149, parcelas: 4, destaque: true,
    itens: [
      'Tudo do Básico',
      'Atendimento automático no WhatsApp para perguntas frequentes',
      'Pedidos ou agendamentos organizados em uma lista simples',
      'Cadastro de clientes para contato futuro',
      '12 textos de posts por mês e calendário de divulgação',
      'Manutenção e suporte mensal',
    ],
  },
  {
    id: 'completo', nome: 'Completo', lema: 'Tenha uma operação organizada',
    implantacao: 1497, mensal: 297, parcelas: 6, destaque: false,
    itens: [
      'Tudo do Médio',
      'Painel de gestão com clientes, pedidos e dados do negócio',
      'Mensagens automáticas: lembretes, aniversários e reativação de clientes',
      'Catálogo ou loja virtual simples',
      '20 textos de posts por mês, com publicação automática nas redes',
      'Relatório mensal e reunião de ajuste',
    ],
  },
];

export const EXTRAS = [
  { nome: 'Logotipo e identidade simples', texto: 'Para negócios que ainda não têm marca.' },
  { nome: 'Vídeos curtos para redes sociais', texto: 'Roteiro e edição de vídeos de divulgação.' },
  { nome: 'Televendas e pós-venda', texto: 'Roteiros de contato com clientes e retorno de vendas.' },
  { nome: 'Domínio e hospedagem', texto: 'Endereço próprio (seunegocio.com.br) cuidado por mim.' },
  { nome: 'Treinamento da equipe', texto: 'Ensino de como usar o que foi instalado.' },
  { nome: 'Suporte de TI', texto: 'Computador, rede, impressora e sistemas do dia a dia.' },
];

export const ETAPAS = [
  { n: 1, titulo: 'Você escolhe o pacote', texto: 'Escolha o pacote e envie o pedido. Leva 1 minuto.' },
  { n: 2, titulo: 'Conversamos pelo WhatsApp', texto: 'Eu entro em contato, entendo seu negócio e confirmo o que será entregue.' },
  { n: 3, titulo: 'Eu monto e instalo', texto: 'Monto tudo com ferramentas de automação e te mostro antes de ligar.' },
  { n: 4, titulo: 'Você usa e eu cuido', texto: 'Você comanda o negócio e eu faço a manutenção e os ajustes.' },
];

export const PERGUNTAS = [
  { p: 'Preciso entender de tecnologia?', r: 'Não. Eu monto e explico o uso em linguagem simples.' },
  { p: 'Em quanto tempo fica pronto?', r: 'O prazo é combinado no atendimento, conforme o pacote e o seu negócio.' },
  { p: 'O que é a mensalidade?', r: 'Cobre manutenção, suporte e a parte que fica no ar todos os meses.' },
  { p: 'Posso mudar de pacote depois?', r: 'Sim. Você pode começar no Básico e subir quando quiser.' },
  { p: 'Vocês garantem mais vendas?', r: 'Não prometemos resultado de vendas. Entregamos a estrutura funcionando para você vender melhor.' },
];
