// Dados da capa do Pedido de Construção (/construcao): tipos de negócio, páginas, níveis do pacote e o script de exemplo.
export const WHATS_CONSTRUCAO = 'https://wa.me/5516991543663?text=' + encodeURIComponent('Olá! Quero saber mais sobre montar o meu negócio no site.');

export const TIPOS = [
  { id: 'comercio', e: '🛍️', nome: 'Comércio', exemplo: 'Casa da Maria Moda', titulo: 'Tudo o que você procura, perto de você', vende: 'Roupas e acessórios para a família', padrao: ['inicio', 'catalogo', 'contato', 'pagamento'], extra: 'Entrega e tamanho do catálogo' },
  { id: 'servico', e: '🔧', nome: 'Serviço', exemplo: 'Studio Bela Forma', titulo: 'Agende o seu atendimento', vende: 'Cortes, unhas e cuidados com a pele', padrao: ['inicio', 'catalogo', 'contato', 'agenda'], extra: 'Como atende e como cobra' },
  { id: 'produto', e: '🏭', nome: 'Produto próprio', exemplo: 'Doces da Vovó Lia', titulo: 'Feito com cuidado, entregue para você', vende: 'Doces e bolos feitos por encomenda', padrao: ['inicio', 'catalogo', 'contato', 'pagamento'], extra: 'Entrega e encomenda' },
  { id: 'conteudo', e: '🎓', nome: 'Conteúdo ou curso', exemplo: 'Horta em Casa', titulo: 'Aprenda no seu ritmo', vende: 'Aulas em vídeo para quem quer plantar', padrao: ['inicio', 'blog', 'cliente', 'pagamento'], extra: 'Formatos e cobrança' },
  { id: 'ideia', e: '💡', nome: 'Ainda não sei', exemplo: 'Uma ideia nova', titulo: 'A sua ideia no ar', vende: 'Vamos descobrir juntos o melhor caminho', padrao: ['inicio', 'contato'], extra: 'Conversa para definir o escopo' },
];

export const PAGINAS = [
  { id: 'inicio', nome: 'Página inicial', e: '🏠' },
  { id: 'catalogo', nome: 'Catálogo ou serviços', e: '📖' },
  { id: 'contato', nome: 'Contato e WhatsApp', e: '💬' },
  { id: 'agenda', nome: 'Agenda online', e: '📅' },
  { id: 'pagamento', nome: 'Pagamento online', e: '💳' },
  { id: 'cliente', nome: 'Área do cliente', e: '🔐' },
  { id: 'blog', nome: 'Blog', e: '📝' },
  { id: 'faq', nome: 'Perguntas frequentes', e: '❓' },
];

export const ESTILOS = ['Simples e limpo', 'Moderno e colorido', 'Sofisticado e escuro'];

export const CORES = [
  { v: 'Verde', a: '#0a8f6a', b: '#43d6a4' }, { v: 'Azul', a: '#1e6bff', b: '#12c6e8' }, { v: 'Rosa', a: '#e5307a', b: '#ff8fb1' },
  { v: 'Laranja', a: '#f0600a', b: '#ffb347' }, { v: 'Roxo', a: '#6a3de8', b: '#b18cff' }, { v: 'Preto e dourado', a: '#14110f', b: '#c9a24a' },
];

export const JORNADA = [
  { n: 1, t: 'Você descreve', d: 'O assistente faz as perguntas certas para o seu tipo de negócio e desenha o site enquanto você responde.', tag: 'Já disponível' },
  { n: 2, t: 'O script chega até nós', d: 'Suas respostas viram um briefing de uma página, sempre na mesma ordem, e o dono é avisado no Telegram.', tag: 'Já disponível' },
  { n: 3, t: 'Conversamos e orçamos', d: 'Respondemos pelo WhatsApp com as pendências e o orçamento. Você só paga o que combinar conosco.', tag: 'Já disponível' },
  { n: 4, t: 'Produzimos e entregamos', d: 'O site é montado a partir do script e, se você quiser, o Atendente WhatsApp entra junto.', tag: 'Já disponível' },
  { n: 5, t: 'Continue na área do cliente', d: 'Em breve: continuar descrevendo cada parte do projeto e acompanhar as etapas num só lugar.', tag: 'Em breve' },
];

export const NIVEIS = [
  { id: 'ideia', e: '💡', t: 'Ideia', d: 'Para quem ainda está decidindo o negócio.', itens: ['Assistente de perguntas passo a passo', 'Script pronto com as pendências', 'Conversa de escopo no WhatsApp'] },
  { id: 'projeto', e: '🧱', t: 'Projeto', d: 'Para quem já sabe o que quer vender.', itens: ['Tudo do nível Ideia', 'Construção do site ou sistema', 'Orçamento combinado antes de começar'] },
  { id: 'pacote', e: '📦', t: 'Projeto + Atendente', d: 'O negócio e o atendimento no WhatsApp, juntos.', itens: ['Tudo do nível Projeto', 'Atendente WhatsApp com os dados do seu briefing', 'Piloto de 14 dias e aviso no Telegram'], destaque: true },
];

export const FAQ = [
  ['Quanto custa?', 'Depende do tipo de negócio e do que você precisa. O valor é combinado caso a caso, pelo WhatsApp, antes de qualquer pagamento.'],
  ['Preciso saber de tecnologia?', 'Não. O assistente faz perguntas simples e você responde do seu jeito. O que faltar aparece como pendência no script.'],
  ['O assistente cria o site sozinho?', 'Não. Ele desenha uma ideia e organiza o seu pedido. A construção é feita por nós, a partir do script que você enviou.'],
  ['O que acontece depois de enviar?', 'Você recebe um número de pedido e um código de acompanhamento, e respondemos pelo WhatsApp com as dúvidas e o orçamento.'],
  ['O Atendente WhatsApp tem algum risco?', 'Sim. Ele usa o canal não oficial do WhatsApp: não paga a API da Meta, mas o número pode ser limitado ou bloqueado. Recomendamos um número separado. O aviso completo está na página do Atendente.'],
  ['Posso desistir?', 'Pode. Enviar o pedido não é contratar. Só começamos a produzir depois do orçamento aceito por você.'],
];

const linha = (k, v) => `- ${k}: ${v}`;

// Script de exemplo, igual em formato ao que chega ao dono (lib/construcaoScript.js), com dados fictícios.
export function gerarScript(e) {
  const t = TIPOS.find((x) => x.id === e.tipo) || TIPOS[0];
  const nomes = PAGINAS.filter((p) => e.paginas.includes(p.id)).map((p) => p.nome);
  return [
    'PEDIDO DE CONSTRUÇÃO nº 0001 (exemplo)',
    `Tipo: ${t.nome}`,
    '',
    '1. NEGÓCIO',
    linha('Nome', t.exemplo),
    linha('O que vende ou faz', t.vende),
    '',
    '3. IDENTIDADE',
    linha('Estilo', e.estilo),
    linha('Cor principal', CORES[e.cor].v),
    '',
    '4. PÁGINAS E FUNÇÕES',
    linha('Páginas', nomes.length ? nomes.join(', ') : 'a definir'),
    '',
    '5. ATENDIMENTO',
    linha('Atendente WhatsApp', e.atendente ? 'sim (canal não oficial, ciente)' : 'não, por enquanto'),
    '',
    `Pendências: ${nomes.length ? 'público e prazo' : 'páginas, público e prazo'}`,
  ];
}
