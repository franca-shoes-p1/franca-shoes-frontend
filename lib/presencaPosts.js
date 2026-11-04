// Máquina de Presença: posts do dia para o Telegram, por segmento. Sem IA e sem custo: modelos prontos que se revezam.
// O segmento muda a cada dia e o modelo muda a cada rodada, para o canal não repetir o mesmo texto.
import { SEGMENTOS, CIDADES } from './presenca';

const SITE = 'https://www.igreja.eco.br';

const MODELOS = {
  'calcados-fabrica': [
    (c) => `👟 Calçados e acessórios a preço de fábrica em ${c}.\n\nDireto das fábricas de Franca, sem intermediário. Peça pelo WhatsApp, pague com PIX ou cartão e receba em casa.\n\nQuer comprar para você ou para revender? Veja as ofertas:`,
    (c) => `🏭 Franca é a capital do calçado, e você compra direto da fábrica.\n\nModelos para uso e para revenda, entrega para todo o Brasil.\n\nPeça o seu agora:`,
    (c) => `🤝 Quer revender calçados com boa margem?\n\nCompre em lote direto das fábricas de Franca e fique com a diferença. Veja como começar:`,
  ],
  'lojas-calcados': [
    (c) => `🏪 Dono de loja de calçados em ${c}?\n\nDivulgação todo dia, atendimento 24 horas no WhatsApp e presença no Google, tudo no automático.\n\nPeça o diagnóstico grátis da presença digital da sua loja:`,
    (c) => `💬 Sua loja responde o cliente às 22h?\n\nUm assistente de IA atende, tira dúvidas e agenda visitas enquanto você descansa.\n\nDiagnóstico grátis para lojas de calçados:`,
    (c) => `🔎 Seu cliente procura calçado no Google e encontra a concorrência?\n\nFazemos a sua loja aparecer, com divulgação diária e atendimento automático.\n\nPeça o diagnóstico grátis:`,
  ],
  'comercio-local': [
    (c) => `📣 Comerciante de ${c}: seu negócio é encontrado na internet?\n\nSite, divulgação e atendimento automático com IA para vender mais.\n\nPeça o diagnóstico grátis:`,
    (c) => `🤖 Atendimento automático no WhatsApp para o seu comércio.\n\nRespostas na hora, 24 horas, e você só cuida dos casos que importam.\n\nDiagnóstico grátis para o seu negócio:`,
    (c) => `🌐 Mini site com mapa e botão de WhatsApp para o seu negócio em ${c}.\n\nPronto para ser encontrado e para receber clientes todos os dias.\n\nPeça o diagnóstico grátis:`,
  ],
};

// Dia do ano no horário de Brasília (UTC-3).
function diaDoAno(data = new Date()) {
  const br = new Date(data.getTime() - 3 * 3600 * 1000);
  const ini = Date.UTC(br.getUTCFullYear(), 0, 0);
  return Math.floor((br.getTime() - ini) / 86400000);
}

export function dataBR(data = new Date()) {
  return new Date(data.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

export function postDoDia({ canal = 'telegram_vitrine', cidade = 'franca-sp', data = new Date() } = {}) {
  const segs = Object.keys(SEGMENTOS);
  const d = diaDoAno(data);
  const segmento = segs[d % segs.length];
  const lista = MODELOS[segmento];
  const modelo = lista[Math.floor(d / segs.length) % lista.length];
  const cid = CIDADES[cidade];
  const link = `${SITE}/presenca/${segmento}/${cidade}?canal=${canal}&utm_medium=presenca&utm_campaign=${segmento}`;
  const titulo = SEGMENTOS[segmento].titulo(cid.nome);
  const texto = `${modelo(cid.nome)}\n👉 ${link}`;
  return { segmento, cidade, canal, titulo, texto, link };
}
