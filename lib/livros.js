// Catálogo da vitrine de livros. Para incluir um livro novo, acrescente um item em LIVROS:
// a capa, o cartão e a faixa da home se atualizam sozinhos.
//   tema  : igreja | horta | partilha | despensa | grupos | palavra (define a cena da capa)
//   cor   : azul | verde | ambar | roxo (define o fundo da capa)
//   status: 'pronto' (tem página) | 'breve' (aparece como "Em breve", sem link)
export const LIVROS = [
  {
    id: 'manual-da-igreja',
    titulo: 'Manual da Igreja',
    selo: 'Evangelho dos Pobres dos Alimentos Sagrados',
    resumo: 'Missão, organização, como ser membro e como formar grupos para trabalhar na obra.',
    tema: 'igreja',
    cor: 'azul',
    status: 'pronto',
    href: '/manual-da-igreja',
    preco: 'R$ 29,90',
    etiqueta: 'Manual',
  },
  {
    id: 'vigiar-e-cultivar',
    titulo: 'Vigiar e Cultivar',
    selo: '8 semanas de estudo e horta',
    resumo: 'Estudo da Palavra com horta, despensa e partilha, uma tarefa por semana.',
    tema: 'horta',
    cor: 'verde',
    status: 'pronto',
    href: '/vigiar-e-cultivar',
    preco: 'R$ 39,90 por mês',
    etiqueta: 'Programa',
  },
  {
    id: 'cestas-e-partilha',
    titulo: 'Cestas e Partilha',
    selo: 'Guia prático',
    resumo: 'Como montar e entregar cestas com segurança e ligar a igreja a produtores da região.',
    tema: 'partilha',
    cor: 'ambar',
    status: 'breve',
    etiqueta: 'Guia',
  },
  {
    id: 'despensa-da-familia',
    titulo: 'Despensa da Família',
    selo: 'Caderno de tarefas',
    resumo: 'Organizar a despensa com rodízio de validade e conservar alimentos com segurança.',
    tema: 'despensa',
    cor: 'roxo',
    status: 'breve',
    etiqueta: 'Caderno',
  },
  {
    id: 'manual-do-lider-de-grupo',
    titulo: 'Manual do Líder de Grupo',
    selo: 'Para quem conduz',
    resumo: 'Como abrir, conduzir e dividir um grupo de 3 a 12 pessoas, com modelos de encontro e relatório.',
    tema: 'grupos',
    cor: 'azul',
    status: 'breve',
    etiqueta: 'Manual',
  },
];

export const CORES = {
  azul: { a: '#13307a', b: '#2f6fe0', luz: '#8fd0ff' },
  verde: { a: '#0b4a3d', b: '#1f9e7c', luz: '#a6ffd6' },
  ambar: { a: '#7a3b06', b: '#e08a1f', luz: '#ffe3a3' },
  roxo: { a: '#2c1a63', b: '#7a45d6', luz: '#e2cbff' },
};

export const ETAPAS = [
  { e: '💡', t: 'Ideia', d: 'Um tema que atende uma necessidade real da comunidade.' },
  { e: '🧭', t: 'Roteiro', d: 'Sumário e capítulos definidos antes de escrever.' },
  { e: '✍️', t: 'Rascunho', d: 'A IA rascunha e o redator da Oficina transforma em texto final.' },
  { e: '📖', t: 'Revisão', d: 'Quem lidera o ensino lê e aprova. Nada sai sem revisão.' },
  { e: '🎨', t: 'Capa e miolo', d: 'Design da capa, das páginas e dos modelos.' },
  { e: '🚀', t: 'Publicação', d: 'Página, venda e divulgação, com conferência final.' },
];
