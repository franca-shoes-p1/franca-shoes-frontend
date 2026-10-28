// Motor de divulgação: monta posts, roteiros e um calendário de 7 dias a partir de modelos prontos.
// Não usa IA nem gasta nada: cada negócio e cada canal é só uma configuração. Para incluir um negócio novo, acrescente um item em NEGOCIOS.
const SITE = 'https://www.igreja.eco.br';

export const NEGOCIOS = {
  campanha: {
    nome: 'Campanha de Inauguração', emoji: '🎁', caminho: '/campanha',
    ganchos: {
      amigavel: 'Sabia que dá para ganhar um calçado ou acessório de fábrica de Franca juntando pontos?',
      animado: '🎉 Inauguração com brinde! Junte pontos e troque por um calçado ou acessório!',
      direto: 'Campanha de Inauguração: pontos e créditos viram calçado ou acessório.',
    },
    pontos: ['Operadores juntam Pontos Oficina em tarefas aprovadas', 'Clientes juntam Créditos nos serviços pagos', 'Sem sorteio e sem limite de vagas', 'Entrega gratuita, em lotes'],
    aviso: 'Pontos e créditos não são dinheiro nem participação e valem 12 meses. Não prometemos ganhos.',
    arte: 'Círculo amarelo com um tênis, fundo verde, selo "Frete grátis". Texto grande: "Ganhe um calçado".',
    tags: ['#CampanhaDeInauguração', '#Franca', '#Calçados', '#OficinaDigital'],
  },
  oficina: {
    nome: 'Oficina Digital', emoji: '🛠️', caminho: '/oficina',
    ganchos: {
      amigavel: 'Quer aprender fazendo e trabalhar no seu horário, só com o celular?',
      animado: '🛠️ Chegou a Oficina Digital! Tarefas curtas, passo a passo e pontos!',
      direto: 'Oficina Digital: tarefas curtas pelo celular, com passo a passo e conferência.',
    },
    pontos: ['Cartões de tarefa com passo a passo e checklist', 'IA que tira dúvidas na hora', 'Tudo é conferido antes de aprovar', 'Pontos Oficina viram benefícios'],
    aviso: 'Trabalho autônomo, sem promessa de renda. Pontos não são dinheiro.',
    arte: 'Cartão de tarefa com três itens marcados em verde, celular ao lado. Texto: "Aprenda fazendo".',
    tags: ['#OficinaDigital', '#TrabalhoNoCelular', '#AprenderFazendo', '#Franca'],
  },
  atelie: {
    nome: 'Ateliê Sob Medida', emoji: '🧩', caminho: '/atelie',
    ganchos: {
      amigavel: 'Tem uma ideia de site, de agente de WhatsApp ou de automação e não sabe por onde começar?',
      animado: '🧩 Sua ideia vira produto digital e a gente monta!',
      direto: 'Ateliê Sob Medida: consultoria, mentoria e montagem de sites, agentes de WhatsApp e automações.',
    },
    pontos: ['Consultoria para definir o que montar', 'Mentoria para você acompanhar', 'Equipe de montadores por setor', 'Tudo conferido antes de entregar'],
    aviso: 'Entrada de 50% e saldo na entrega. Sem promessa de resultado financeiro.',
    arte: 'Uma ordem de produção com setores marcados (Briefing, Texto, Design, Página). Fundo azul.',
    tags: ['#Ateliê', '#SiteSobMedida', '#AgenteDeWhatsApp', '#Automação'],
  },
  livros: {
    nome: 'Livros e Manuais', emoji: '📘', caminho: '/livros',
    ganchos: {
      amigavel: 'Quer um livro simples para estudar a Palavra e aprender a plantar, com uma tarefa por semana?',
      animado: '📘 Chegou a vitrine de livros da Igreja Eco! Estude, plante e sirva junto!',
      direto: 'Vitrine de livros e manuais: estudo, horta, partilha e grupos, em formato digital.',
    },
    pontos: ['Capítulo grátis para conhecer', 'Tarefas práticas de horta, despensa e partilha', 'Ser membro da igreja é gratuito', 'A igreja não pede dízimo nem oferta'],
    aviso: 'Livros digitais com 7 dias para desistir. Sem promessa de ganho, de cura ou de bênção financeira.',
    arte: 'Três capas de livro em leque, fundo roxo com detalhes dourados. Texto: "Estude, plante e sirva".',
    tags: ['#LivrosCristãos', '#Mordomia', '#HortaEmCasa', '#IgrejaEco'],
  },
  calcados: {
    nome: 'Loja de Calçados Pronta', emoji: '👟', caminho: '/', ancora: '#calcados',
    ganchos: {
      amigavel: 'Quer ter a sua loja online de calçados, já funcionando, sem aprender programação?',
      animado: '👟 Sua loja de calçados pronta, com PIX e cartão!',
      direto: 'Loja de Calçados Pronta: criamos e entregamos funcionando, com PIX e cartão.',
    },
    pontos: ['Loja online com PIX e cartão', 'Painel para cadastrar modelos pelo celular', 'Guia de fornecedores de Franca', 'Treinamento e suporte'],
    aviso: 'Entregamos a loja funcionando. Não prometemos vendas nem lucro.',
    arte: 'Celular mostrando a vitrine de calçados com quatro modelos coloridos. Fundo azul.',
    tags: ['#LojaDeCalçados', '#Franca', '#NegócioOnline', '#PIX'],
  },
};

export const CANAIS = {
  feed: { nome: 'Instagram (post)', emoji: '📸' },
  story: { nome: 'Instagram (stories)', emoji: '⏱️' },
  reels: { nome: 'Reels / TikTok (roteiro)', emoji: '🎬' },
  whatsapp: { nome: 'WhatsApp', emoji: '💬' },
  telegram: { nome: 'Telegram', emoji: '✈️' },
  facebook: { nome: 'Facebook', emoji: '👍' },
};

export const TONS = { amigavel: 'Simples e amigável', animado: 'Animado', direto: 'Direto e profissional' };

export function linkDe(negocio, codigo) {
  const n = NEGOCIOS[negocio] || NEGOCIOS.oficina;
  const ref = codigo && /^[a-z0-9]{6,12}$/i.test(codigo) ? `?ref=${codigo.toLowerCase()}` : '';
  return `${SITE}${n.caminho}${ref}${n.ancora || ''}`;
}

const APOIO = 'Divulgação feita por parceiro(a) do programa de afiliados.';

// Texto principal de um canal. "variante" muda o ângulo do post (usado no calendário).
export function montarTexto({ negocio, canal, tom, codigo, variante }) {
  const n = NEGOCIOS[negocio] || NEGOCIOS.oficina;
  const link = linkDe(negocio, codigo);
  const gancho = variante && variante.gancho ? variante.gancho : n.ganchos[tom] || n.ganchos.amigavel;
  const lista = (variante && variante.pontos) || n.pontos;
  const bullets = (sim) => lista.map((p) => `${sim} ${p}`).join('\n');
  const tags = n.tags.join(' ');
  switch (canal) {
    case 'story':
      return [
        `QUADRO 1 (texto grande): ${gancho}`,
        `QUADRO 2: ${lista.slice(0, 2).join(' + ')}`,
        `QUADRO 3: ${lista.slice(2, 4).join(' + ')}`,
        `QUADRO 4 (com o adesivo de LINK): toque aqui e conheça\n${link}`,
        `Escreva pequeno no último quadro: ${n.aviso}`,
      ].join('\n\n');
    case 'reels':
      return [
        `GANCHO (0 a 3 s): ${gancho}`,
        `CENA 1 (3 a 8 s): mostre a tela do celular e diga "${lista[0]}".`,
        `CENA 2 (8 a 13 s): "${lista[1]}".`,
        `CENA 3 (13 a 18 s): "${lista[2]}".`,
        `FECHAMENTO (18 a 22 s): "Quer conhecer? O link está na bio."`,
        `LEGENDA: ${n.emoji} ${n.nome}. ${n.aviso} ${APOIO} ${tags}`,
        `LINK PARA A BIO: ${link}`,
      ].join('\n\n');
    case 'whatsapp':
      return `Oi! Lembrei de você. ${gancho}\n\n${bullets('•')}\n\nDá uma olhada com calma: ${link}\n\n(${n.aviso} ${APOIO})`;
    case 'telegram':
      return `${n.emoji} ${n.nome}\n\n${gancho}\n\n${bullets('✅')}\n\n👉 ${link}\n\n${n.aviso}\n${APOIO}`;
    case 'facebook':
      return `${gancho}\n\n${n.nome}:\n${bullets('✔')}\n\nConheça: ${link}\n\n${n.aviso} ${APOIO}`;
    case 'feed':
    default:
      return `${/^\p{Extended_Pictographic}/u.test(gancho) ? '' : n.emoji + ' '}${gancho}\n\n${bullets('✅')}\n\n👉 Link na bio (ou no primeiro comentário): ${link}\n\n${n.aviso}\n${APOIO}\n\n${tags}`;
  }
}

export function ideiaDeArte(negocio, formato) {
  const n = NEGOCIOS[negocio] || NEGOCIOS.oficina;
  const base = n.arte;
  if (formato === 'story') return `${base} Formato vertical (1080×1920), poucas palavras, letra grande.`;
  if (formato === 'reels') return `${base} Grave na vertical, luz natural, no máximo 22 segundos, com legenda na tela.`;
  return `${base} Formato quadrado (1080×1080), no máximo 12 palavras na imagem.`;
}

const DIAS = [
  { tema: 'Apresentação', canal: 'feed', gancho: (n) => `Apresentando: ${n.nome}. ${n.ganchos.direto}` },
  { tema: 'Como funciona', canal: 'story', gancho: (n) => `Como funciona o(a) ${n.nome}, em 3 passos simples.` },
  { tema: 'Bastidores', canal: 'reels', gancho: (n) => `Olha por dentro: veja o(a) ${n.nome} funcionando.` },
  { tema: 'Dúvida comum', canal: 'feed', gancho: (n) => `Uma dúvida que todo mundo tem sobre o(a) ${n.nome}: "preciso saber de tecnologia?" A resposta está no link.` },
  { tema: 'Pergunta para a audiência', canal: 'story', gancho: (n) => `Pergunta rápida: você já ouviu falar do(a) ${n.nome}? Responda aqui e eu te explico.` },
  { tema: 'Conversa individual', canal: 'whatsapp', gancho: (n) => `Tem uma coisa nova que lembra você: ${n.nome}.` },
  { tema: 'Chamada final', canal: 'telegram', gancho: (n) => `Última chamada da semana: conheça o(a) ${n.nome}.` },
];

export function calendario7({ negocio, tom, codigo }) {
  const n = NEGOCIOS[negocio] || NEGOCIOS.oficina;
  return DIAS.map((d, i) => ({
    dia: i + 1,
    tema: d.tema,
    canal: d.canal,
    arte: ideiaDeArte(negocio, d.canal === 'story' ? 'story' : d.canal === 'reels' ? 'reels' : 'feed'),
    texto: montarTexto({ negocio, canal: d.canal, tom, codigo, variante: { gancho: d.gancho(n) } }),
  }));
}

// Conferência de segurança: avisa quando o texto promete ganho ou usa palavras que a Oficina não pode usar.
const PROIBIDAS = [
  'renda garantida', 'ganhe por mês', 'ganhe dinheiro', 'dinheiro fácil', 'dinheiro facil', 'lucro garantido', 'ficar rico', 'enriquecer',
  'sem esforço', 'sem esforco', 'sociedade', 'retorno garantido', 'emprego', 'estágio', 'estagio', 'salário', 'salario', 'investimento', 'pirâmide', 'piramide', 'renda extra garantida',
];
export function conferirTexto(texto) {
  const t = String(texto || '').toLowerCase();
  const achadas = PROIBIDAS.filter((p) => t.includes(p));
  const falta = [];
  if (!/(não prometemos|nao prometemos|sem promessa|não são dinheiro|nao sao dinheiro)/.test(t)) falta.push('Inclua o aviso de que não há promessa de ganho.');
  if (!/parceiro|afiliado|divulga/.test(t)) falta.push('Diga que é uma divulgação feita por parceiro(a).');
  return { achadas, falta, ok: achadas.length === 0 && falta.length === 0 };
}
