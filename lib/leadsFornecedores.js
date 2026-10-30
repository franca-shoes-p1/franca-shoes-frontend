// Mensagens prontas e ajudantes para abordar fábricas (o robô prepara, você envia).
export const STATUS_LEAD = {
  novo: ['Novo', '#64748b'],
  abordado: ['Abordado', '#2563eb'],
  respondeu: ['Respondeu', '#7c3aed'],
  interessado: ['Interessado', '#d97706'],
  cadastrado: ['Cadastrado', '#16a34a'],
  frio: ['Frio', '#94a3b8'],
  descartado: ['Descartado', '#dc2626'],
};
export const LINK_CADASTRO = 'igreja.eco.br/fornecedor';

export const MENSAGENS = {
  curto: (n) => `Olá, ${n}! Tudo bem? Aqui é o Ricardo, do Franca Calçados (igreja.eco.br/calcados). Estamos montando uma vitrine com calçados direto de fábricas de Franca e queremos incluir a ${n}. Você coloca seus modelos e seu preço, o cliente paga o seu preço direto na sua conta por PIX e você emite a nota fiscal no nome dele. Não tem mensalidade nem taxa para você. Posso te mandar mais detalhes?`,
  completo: (n) => `Olá! Sou o Ricardo, do Franca Calçados. Resumo de como funciona para a ${n}:\n\n1) Cadastro gratuito em ${LINK_CADASTRO} e um painel só seu.\n2) Você cadastra seus modelos com foto, numeração, prazo de confecção e o SEU preço. Preço, estoque e política de troca são seus.\n3) O cliente paga o seu preço direto na sua conta (PIX 1). A nossa comissão e o frete são cobrados do cliente em outro PIX: você não paga nada para estar no site.\n4) Você faz o pedido e emite a nota fiscal no nome e CPF do cliente final.\n5) Nós coletamos na fábrica com a nota e cuidamos da entrega.\n\nO site está em fase de testes e não prometo volume de vendas, por isso estamos começando com poucas fábricas. Posso te mostrar o painel?`,
  retorno: (n) => `Oi, tudo bem? Passando para saber se você viu a minha mensagem sobre o Franca Calçados. Nesta fase inicial estamos fechando com apenas 2 fábricas e queria muito que a ${n} fosse uma delas. O cadastro é gratuito e leva uns 5 minutos: ${LINK_CADASTRO}. Se preferir, te explico por ligação rápida. Obrigado!`,
};
export const mensagemDo = (l) => (l.abordagens >= 1 ? MENSAGENS.retorno(l.nome) : MENSAGENS.curto(l.nome));
export const linkZap = (tel, texto) => {
  const d = String(tel || '').replace(/\D/g, '');
  const n = d.length <= 11 ? '55' + d : d;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
};
export const soDigitos = (s) => String(s || '').replace(/\D/g, '');
