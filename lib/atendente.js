// Atendente WhatsApp: textos e respostas da demonstração. Não usa IA paga nem envia nada para fora:
// perguntas prontas + busca por palavras, no mesmo molde do assistente do Radar de Pontos.
// Para criar uma demonstração nova, acrescente um item em CONFIGS (é só uma configuração; o motor é o mesmo).
export const WHATS_ATENDENTE = 'https://wa.me/5516991543663?text=' + encodeURIComponent('Olá! Vi o Atendente WhatsApp no site e quero um orçamento.');

export const SEM_RESPOSTA = 'Essa eu não sei responder sozinho. Na vida real, eu avisaria o dono no Telegram e ele responderia por aqui.';

export const CONFIGS = [
  {
    id: 'calcados',
    rotulo: 'Calçados',
    nome: 'Assistente da Loja Exemplo',
    avatar: '👟',
    saudacao: 'Olá! Procura sapato, tênis ou sandália?',
    perguntas: [
      { id: 'sandalia', q: 'Quais sandálias vocês têm?', chaves: ['sandália', 'sandalia', 'chinelo', 'rasteira'],
        r: 'Temos a Sandália feminina por R$ 59,90, tamanhos 34 ao 39. Quer que eu anote o pedido?' },
      { id: 'tenis', q: 'Tem tênis esportivo?', chaves: ['tênis', 'tenis', 'esporte', 'corrida', 'academia'],
        r: 'Temos o Tênis esportivo por R$ 119,90 e o Tênis infantil por R$ 79,90. Qual tamanho você usa?' },
      { id: 'social', q: 'Quero um sapato social', chaves: ['social', 'sapato', 'trabalho', 'casamento', 'formatura'],
        r: 'O Sapato social custa R$ 149,90 e o Sapatênis casual, R$ 129,90. Os dois têm tamanhos 38 ao 44.' },
      { id: 'prazo', q: 'Qual o prazo de entrega?', chaves: ['prazo', 'entrega', 'frete', 'demora', 'chega'],
        r: 'Nesta loja de exemplo, o pedido sai em até 3 dias úteis. O prazo real aparece para o cliente antes do pagamento.' },
      { id: 'comprar', q: 'Quero comprar', chaves: ['comprar', 'quero', 'pedido', 'levar', 'fechar'],
        r: 'Pedido anotado: 1 Tênis esportivo, R$ 119,90. O dono foi avisado e confirma o pagamento com você.',
        aviso: 'Novo pedido: Tênis esportivo, R$ 119,90. Cliente aguardando confirmação.' },
    ],
  },
  {
    id: 'clinica',
    rotulo: 'Clínica',
    nome: 'Assistente da Clínica Exemplo',
    avatar: '🩺',
    saudacao: 'Olá! Quer marcar ou remarcar um horário?',
    perguntas: [
      { id: 'horarios', q: 'Que horários têm amanhã?', chaves: ['horário', 'horario', 'amanhã', 'amanha', 'vaga', 'disponível', 'disponivel', 'semana'],
        r: 'Amanhã há vaga às 9h, 10h30 e 15h. Qual prefere?' },
      { id: 'marcar', q: 'Quero marcar às 10h30', chaves: ['marcar', 'agendar', '10h30', 'reservar', 'quero'],
        r: 'Horário reservado: amanhã, 10h30. Vou lembrar você um dia antes para confirmar.',
        aviso: 'Horário reservado: amanhã, 10h30. Lembrete automático programado.' },
      { id: 'remarcar', q: 'Preciso remarcar', chaves: ['remarcar', 'cancelar', 'adiar', 'não posso', 'nao posso', 'mudar'],
        r: 'Sem problema. Posso passar para quinta, às 9h, ou sexta, às 15h. Qual serve?' },
      { id: 'valores', q: 'Quanto custa a consulta?', chaves: ['valor', 'valores', 'preço', 'preco', 'custa', 'quanto', 'consulta'],
        r: 'Nesta clínica de exemplo, a consulta custa R$ 200,00. Na clínica real, o assistente usa a tabela que a clínica cadastrar.' },
      { id: 'dados', q: 'Preciso informar meu problema de saúde?', chaves: ['saúde', 'saude', 'sintoma', 'doença', 'doenca', 'exame', 'problema', 'dados'],
        r: 'Não. O assistente só marca horário. Assuntos de saúde ficam para a consulta, com o profissional.' },
    ],
  },
  {
    id: 'comercio',
    rotulo: 'Comércio local',
    nome: 'Assistente da Padaria Exemplo',
    avatar: '🥖',
    saudacao: 'Olá! Quer ver o cardápio do dia ou encomendar?',
    perguntas: [
      { id: 'cardapio', q: 'O que tem hoje?', chaves: ['hoje', 'cardápio', 'cardapio', 'tem', 'pão', 'pao', 'bolo', 'salgado'],
        r: 'Hoje temos pão francês, bolo de fubá a R$ 18,00 e coxinha a R$ 6,00. Quer encomendar algo?' },
      { id: 'horario', q: 'Até que horas abre?', chaves: ['horário', 'horario', 'abre', 'fecha', 'aberto', 'domingo'],
        r: 'Abrimos de segunda a sábado, das 6h às 19h, e domingo, das 6h às 12h.' },
      { id: 'encomenda', q: 'Quero encomendar um bolo', chaves: ['encomendar', 'encomenda', 'bolo', 'aniversário', 'aniversario', 'festa', 'quero'],
        r: 'Encomenda anotada: 1 bolo de fubá para amanhã, retirada às 16h. O dono foi avisado.',
        aviso: 'Nova encomenda: 1 bolo de fubá, retirada amanhã às 16h.' },
      { id: 'entrega', q: 'Vocês entregam?', chaves: ['entrega', 'entregam', 'delivery', 'motoboy', 'retirar', 'retirada'],
        r: 'Nesta padaria de exemplo, entregamos num raio de 3 km, com taxa combinada na hora. Também dá para retirar no balcão.' },
      { id: 'pagamento', q: 'Como posso pagar?', chaves: ['pagar', 'pagamento', 'pix', 'cartão', 'cartao', 'dinheiro'],
        r: 'Aceitamos PIX, cartão e dinheiro. O assistente passa a chave PIX quando o pedido é confirmado.' },
    ],
  },
];

export const PLANOS = [
  { e: '💬', t: 'Atendente WhatsApp', d: 'Responde dúvidas, mostra catálogo e preços e avisa o dono no Telegram.' },
  { e: '📅', t: 'Atendente + agenda', d: 'Marca, confirma e lembra o horário para reduzir faltas.' },
  { e: '🛍️', t: 'Pedidos e vendas', d: 'Anota o pedido, confirma os dados e organiza a fila do dia.' },
  { e: '🎯', t: 'Captura e recuperação de leads', d: 'Guarda quem perguntou e não comprou e volta a chamar com educação.' },
  { e: '📊', t: 'Painel e relatório diário', d: 'Resumo do dia: conversas, pedidos, horários e pendências.' },
];

// Devolve a melhor resposta (por palavras) para um texto digitado, dentro de uma configuração.
export function responder(config, texto) {
  const t = String(texto || '').toLowerCase().trim();
  if (!t) return null;
  let melhor = null, nota = 0;
  for (const p of config.perguntas) {
    let n = 0;
    for (const c of p.chaves) if (t.includes(c)) n += c.length > 4 ? 2 : 1;
    if (n > nota) { nota = n; melhor = p; }
  }
  return melhor;
}
