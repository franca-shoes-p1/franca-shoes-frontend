// Central de Anúncios da Entrega em Casa: regras, ângulos, modelos de texto e links rastreados.
// Serve ao servidor e ao navegador (sem nada secreto aqui). Só canais gratuitos.
export const SITE = 'https://www.igreja.eco.br';

export const CANAIS_ANUNCIO = {
  feed: { nome: 'Instagram (post)', emoji: '📸', limite: 450, dica: 'Poste a arte quadrada e coloque o link na bio ou no primeiro comentário.' },
  story: { nome: 'Instagram (stories)', emoji: '⏱️', limite: 700, dica: 'Quatro quadros verticais; no último, use o adesivo de link.' },
  reels: { nome: 'Reels / TikTok (roteiro)', emoji: '🎬', limite: 900, dica: 'Grave na vertical, até 22 segundos, com legenda na tela.' },
  facebook: { nome: 'Facebook', emoji: '👍', limite: 450, dica: 'Poste na página e no seu perfil, com o link no texto.' },
  whatsapp: { nome: 'WhatsApp (status e contatos)', emoji: '💬', limite: 320, dica: 'Envie só a quem já conversou com você; no status, use a arte.' },
  telegram: { nome: 'Telegram (canal)', emoji: '✈️', limite: 400, dica: 'Pode ser publicado no canal; o texto já leva o link.' },
  grupo: { nome: 'Grupos da cidade', emoji: '👥', limite: 380, dica: 'Peça licença aos administradores e siga as regras do grupo; não poste em vários grupos ao mesmo tempo.' },
};

export const AVISO = 'A viagem sai quando o lote da fábrica fecha, então não há data fixa.';

export const ANGULOS = {
  prova: {
    nome: 'Prove em casa e só pague se gostar', titulo: 'Prove em casa e só pague se gostar',
    gancho: 'Cansou de comprar calçado sem provar? Aqui você experimenta em casa e só paga se gostar.',
    pontos: ['Você descreve o que quer', 'Achamos a fábrica de Franca com o melhor preço', 'Você prova em casa, sem pagar antes', 'Gostou? Paga em dinheiro na hora'],
  },
  preco: {
    nome: 'Preço de fábrica, sem catálogo', titulo: 'Calçado direto da fábrica de Franca',
    gancho: 'E se você pudesse pedir o calçado que quer, pelo preço de fábrica, sem escolher em catálogo?',
    pontos: ['Peça o modelo que você procura', 'Preço de fábrica, informado antes da visita', 'Nota fiscal da empresa', 'Pedir não custa nada'],
  },
  fila: {
    nome: 'Pedir é grátis e sair também', titulo: 'Pedir é grátis. Sair da fila também.',
    gancho: 'Faça a encomenda sem compromisso: não paga nada para pedir e sai da fila quando quiser.',
    pontos: ['Sem pagar antes', 'Sem prazo máximo de espera', 'Você acompanha tudo pelo WhatsApp', 'Pode desistir a qualquer momento'],
  },
  cidade: {
    nome: 'A sua cidade na próxima rota', titulo: 'A sua cidade na próxima rota',
    gancho: 'Estamos juntando pedidos na sua cidade para a próxima rota de entregas.',
    pontos: ['Peça o seu pelo formulário', 'A rota sai quando o lote da fábrica fecha', 'Você acompanha pelo WhatsApp', 'Prova em casa e paga só se gostar'],
  },
  duvida: {
    nome: 'Posso provar antes de pagar?', titulo: 'Posso provar antes de pagar?',
    gancho: 'Dúvida comum: "posso provar antes de pagar?" Pode. É assim que funciona a Entrega em Casa.',
    pontos: ['O produto vai até a sua casa', 'Você prova com calma', 'Só paga se gostar, em dinheiro', 'Se não gostar, não paga nada'],
  },
  bastidores: {
    nome: 'Do pedido até a sua porta', titulo: 'Do seu pedido até a sua porta',
    gancho: 'Quer saber como o seu pedido vira entrega? Veja o caminho do calçado.',
    pontos: ['O radar procura o melhor preço em Franca', 'Os pedidos se somam até fechar o lote', 'A viagem passa por várias cidades', 'A visita acontece na sua casa'],
  },
};

export const slug = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
export const campanhaDe = (cidade) => (slug(cidade) ? `entrega-${slug(cidade)}` : 'entrega-geral');

// Link do anúncio: leva ao funil e carrega canal e campanha, para o site contar visitas e pedidos por canal.
export function linkRastreado({ canal, campanha, angulo, cidade, uf }) {
  const q = new URLSearchParams({ utm_source: canal, utm_medium: 'organico', utm_campaign: campanha, utm_content: angulo });
  if (cidade) q.set('cidade', cidade);
  if (uf) q.set('uf', uf);
  return `${SITE}/encomendar?${q.toString()}`;
}

// Texto de reserva, sem IA: usado quando o Gemini não responde (chave, cota) ou devolve algo inválido.
export function modeloAnuncio({ canal, angulo, cidade, link }) {
  const a = ANGULOS[angulo] || ANGULOS.prova;
  const gancho = angulo === 'cidade' && cidade ? `Estamos juntando pedidos em ${cidade} para a próxima rota de entregas.` : a.gancho;
  const lista = (sim) => a.pontos.map((p) => `${sim} ${p}`).join('\n');
  switch (canal) {
    case 'story':
      return [`QUADRO 1: ${gancho}`, `QUADRO 2: ${a.pontos.slice(0, 2).join(' + ')}`, `QUADRO 3: ${a.pontos.slice(2).join(' + ')}`, `QUADRO 4 (adesivo de link): faça a sua encomenda\n${link}`, `Escreva pequeno: ${AVISO}`].join('\n\n');
    case 'reels':
      return [`GANCHO (0 a 3 s): ${gancho}`, `CENA 1: mostre o formulário no celular e diga "${a.pontos[0]}".`, `CENA 2: "${a.pontos[1]}".`, `CENA 3: "${a.pontos[2]}".`, `FECHAMENTO: "O link está na bio."`, `LEGENDA: 🏠 Entrega em Casa. ${AVISO}`, `LINK PARA A BIO: ${link}`].join('\n\n');
    case 'whatsapp':
      return `Oi! ${gancho}\n\n${lista('•')}\n\nFaça a sua encomenda aqui: ${link}\n\n${AVISO}`;
    case 'telegram':
      return `🏠 Entrega em Casa\n\n${gancho}\n\n${lista('✅')}\n\n👉 ${link}\n\n${AVISO}`;
    case 'grupo':
      return `Com licença dos administradores. ${gancho}\n\n${lista('•')}\n\nQuem quiser: ${link}\n\n${AVISO}`;
    case 'facebook':
      return `${gancho}\n\nEntrega em Casa:\n${lista('✔')}\n\nPeça o seu: ${link}\n\n${AVISO}`;
    case 'feed':
    default:
      return `🏠 ${gancho}\n\n${lista('✅')}\n\n👉 Link na bio: ${link}\n\n${AVISO}`;
  }
}

// Conferência automática: avisa o que o texto não pode prometer. Os avisos aparecem no painel; a decisão é sua.
const PROIBIDAS = ['imperdível', 'imperdivel', 'últimas unidades', 'ultimas unidades', 'só hoje', 'so hoje', 'corra', 'relâmpago', 'relampago', 'garantido', 'garantia de', 'renda', 'ganhe dinheiro', 'lucro', '% off', 'desconto de', 'frete grátis', 'frete gratis', 'entrega em', 'chega em', 'o melhor'];
export function conferirAnuncio(texto, canal) {
  const t = String(texto || '').toLowerCase();
  const avisos = PROIBIDAS.filter((p) => t.includes(p)).map((p) => `Evite "${p}": pode prometer algo que o projeto não garante.`);
  if (/r\$\s?\d/.test(t)) avisos.push('Tem um preço no texto: confirme se é real e atual.');
  if (/\b\d{1,2}\/\d{1,2}\b|\bdia \d{1,2}\b|até o dia/.test(t)) avisos.push('Tem uma data no texto: o projeto não tem data fixa de entrega.');
  const lim = CANAIS_ANUNCIO[canal] && CANAIS_ANUNCIO[canal].limite;
  if (lim && String(texto || '').length > lim + 220) avisos.push('Texto longo para este canal: considere encurtar.');
  if (!/lote|data fixa|quando/.test(t) && canal !== 'reels') avisos.push('Inclua que a viagem sai quando o lote fecha (sem data fixa).');
  return avisos;
}

export const FATOS = [
  'Projeto: Entrega em Casa. O cliente descreve qualquer calçado ou acessório que possa ser comprado em Franca-SP direto na empresa.',
  'O preço é o de fábrica mais a margem do projeto, informado na cotação antes da visita.',
  'Os pedidos do mesmo produto se somam até o lote mínimo da empresa; a viagem sai quando o lote fecha, sem data fixa.',
  'O cliente recebe a visita em casa, prova o produto e só paga, em dinheiro, se gostar. Se não gostar, não paga nada.',
  'Fazer a encomenda é grátis e o cliente pode sair da fila a qualquer momento.',
  'Começamos pelas capitais do Brasil; qualquer cidade com pedidos suficientes pode entrar na rota.',
];

export function montarPrompt({ angulo, cidade, canais }) {
  const a = ANGULOS[angulo] || ANGULOS.prova;
  const regras = canais.map((c) => `- ${c}: até ${CANAIS_ANUNCIO[c].limite} caracteres (${CANAIS_ANUNCIO[c].nome})`).join('\n');
  return 'Escreva anúncios curtos em português do Brasil para canais GRATUITOS. Use SOMENTE os fatos abaixo. ' +
    'Não invente preço, prazo, data, desconto, estoque, garantia, quantidade de pedidos nem depoimentos. Não use urgência falsa, exagero ("o melhor", "imperdível") nem promessa de ganho. ' +
    'No máximo 3 emojis por texto. Não inclua links nem preços (o link é adicionado depois). Deixe claro que a viagem sai quando o lote fecha. ' +
    'Para "story" escreva QUADRO 1 a QUADRO 4; para "reels" escreva um roteiro de até 22 segundos com GANCHO, CENAS e FECHAMENTO; para "grupo" comece pedindo licença aos administradores.\n' +
    `FATOS:\n${FATOS.map((f) => '- ' + f).join('\n')}\n` +
    `ÂNGULO: ${a.nome}${cidade ? `\nCIDADE-ALVO: ${cidade}` : ''}\nCANAIS E LIMITES:\n${regras}\n` +
    'Responda JSON: {"itens":[{"canal": string, "titulo": string (até 8 palavras, para a arte), "texto": string, "arte": string (ideia curta de imagem ou vídeo)}]}';
}
