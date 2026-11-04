// Máquina de Presença: segmentos e cidades das páginas de captação (piloto: Franca-SP).
// Os "slug" aqui são os MESMOS da tabela mp_segmentos / mp_cidades no Supabase.
// Para abrir um segmento ou cidade novo: acrescente aqui e rode o INSERT correspondente no Supabase.
import { VAREJO } from './varejo';

export const SEGMENTOS = {
  'calcados-fabrica': {
    nome: 'Calçados de fábrica',
    titulo: (c) => `Calçados e acessórios a preço de fábrica em ${c}`,
    promessa: 'Direto das fábricas de Franca, sem intermediário. Peça pelo WhatsApp, pague com PIX ou cartão e receba em casa.',
    publico: 'Para quem quer comprar bem e para quem quer revender.',
    beneficios: [
      ['🏭', 'Preço de fábrica', 'Modelos das fábricas de Franca, a capital nacional do calçado masculino.'],
      ['🚚', 'Entrega para todo o Brasil', 'Seu pedido é separado na fábrica e enviado a você.'],
      ['🤝', 'Revenda com margem', 'Compre em lote, revenda e fique com a diferença.'],
    ],
    iscaTitulo: 'Receba as ofertas de fábrica no seu WhatsApp',
    interesses: ['Comprar para mim', 'Comprar para revender', 'Quero ser revendedor(a)'],
    cta: 'Quero ver as ofertas',
    link: { texto: 'Ver o catálogo de calçados', href: '/calcados' },
  },
  'lojas-calcados': {
    nome: 'Lojas de calçados',
    titulo: (c) => `Mais clientes e vendas no automático para lojas de calçados em ${c}`,
    promessa: 'Presença digital, divulgação e atendimento automático feitos com IA para a sua loja vender mais, sem aumentar a equipe.',
    publico: 'Para donos de loja de calçados e acessórios.',
    beneficios: [
      ['📣', 'Divulgação todos os dias', 'Conteúdo e posts gerados e publicados por robôs nos canais certos.'],
      ['💬', 'Atendimento 24 horas', 'Um assistente responde dúvidas e agenda visitas no WhatsApp.'],
      ['🔎', 'Aparecer nas buscas', 'Sua loja visível no Google e nos mapas da sua cidade.'],
    ],
    iscaTitulo: 'Peça o diagnóstico grátis da presença digital da sua loja',
    interesses: ['Diagnóstico grátis', 'Divulgação automática', 'Atendimento automático no WhatsApp', 'Site ou loja virtual'],
    cta: 'Quero o diagnóstico grátis',
    link: { texto: 'Conhecer a Fábrica de Sites', href: '/sites' },
  },
  'comercio-local': {
    nome: 'Comércio local',
    titulo: (c) => `Presença digital e atendimento automático para o comércio de ${c}`,
    promessa: 'Do mini site ao atendimento por WhatsApp: soluções de IA e automação para o seu negócio ser encontrado e vender mais.',
    publico: 'Para lojas, serviços, clínicas, restaurantes e outros negócios locais.',
    beneficios: [
      ['🌐', 'Site e vitrine', 'Seu negócio no ar com página própria, mapa e botão de WhatsApp.'],
      ['🤖', 'Automação com IA', 'Respostas, avisos e divulgação rodando sozinhos.'],
      ['📊', 'Resultados claros', 'Você vê de onde vêm os clientes e o que funciona.'],
    ],
    iscaTitulo: 'Peça o diagnóstico grátis do seu negócio',
    interesses: ['Diagnóstico grátis', 'Site ou mini site', 'Divulgação automática', 'Atendimento automático no WhatsApp'],
    cta: 'Quero o diagnóstico grátis',
    link: { texto: 'Ver todos os serviços', href: '/catalogo' },
  },
};

export const CIDADES = {
  'franca-sp': { nome: 'Franca', uf: 'SP' },
};

export const FONE = VAREJO.whatsapp;

export function caminhos() {
  const out = [];
  Object.keys(SEGMENTOS).forEach((s) => Object.keys(CIDADES).forEach((c) => out.push({ params: { segmento: s, cidade: c } })));
  return out;
}
