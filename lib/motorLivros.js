// Motor de livros: monta a ficha de produção de um livro (título, capa, sumário, checklist e preço de teste)
// a partir de modelos prontos. Não usa IA e não gasta nada: tipo, tema e público são só configuração.
// Para incluir um tema, tipo ou público novo, acrescente um item na lista correspondente.

export const TIPOS = {
  manual: {
    nome: 'Manual', etiqueta: 'Manual', preco: 'R$ 29,90 (pagamento único)',
    capitulos: ['Por que este manual existe', 'Os princípios de {t}', 'Como começar, passo a passo', 'O que preparar antes', 'A rotina da semana', 'Erros comuns e como evitar', 'Modelos e fichas prontas', 'Cuidados e limites', 'Próximos passos'],
  },
  estudo: {
    nome: 'Programa de estudo', etiqueta: 'Programa', preco: 'R$ 39,90 por mês (assinatura)',
    capitulos: ['Semana 1: ponto de partida', 'Semana 2: o que a Palavra ensina sobre {t}', 'Semana 3: planejar', 'Semana 4: pôr em prática', 'Semana 5: aprofundar', 'Semana 6: dividir com outros', 'Semana 7: avaliar', 'Semana 8: continuar servindo'],
  },
  guia: {
    nome: 'Guia prático', etiqueta: 'Guia', preco: 'R$ 19,90 (pagamento único)',
    capitulos: ['Para quem é este guia', 'O essencial sobre {t}', 'Passo a passo ilustrado', 'Lista de conferência', 'Perguntas frequentes', 'Onde buscar ajuda'],
  },
  caderno: {
    nome: 'Caderno de tarefas', etiqueta: 'Caderno', preco: 'R$ 14,90 (pagamento único)',
    capitulos: ['Como usar este caderno', 'Tarefa 1: mapear', 'Tarefa 2: planejar {t}', 'Tarefa 3: fazer', 'Tarefa 4: registrar', 'Tarefa 5: avaliar', 'Folhas para imprimir'],
  },
};

export const TEMAS = {
  mordomia: { nome: 'Mordomia', de: 'de Mordomia', t: 'a mordomia', cena: 'igreja', cor: 'azul' },
  horta: { nome: 'Horta', de: 'da Horta', t: 'a horta', cena: 'horta', cor: 'verde' },
  partilha: { nome: 'Cestas e partilha', de: 'de Cestas e Partilha', t: 'as cestas e a partilha', cena: 'partilha', cor: 'ambar' },
  despensa: { nome: 'Despensa', de: 'da Despensa', t: 'a despensa da família', cena: 'despensa', cor: 'roxo' },
  grupos: { nome: 'Grupos na obra', de: 'de Grupos na Obra', t: 'os grupos de trabalho', cena: 'grupos', cor: 'azul' },
  acolhimento: { nome: 'Acolhimento', de: 'de Acolhimento', t: 'o acolhimento', cena: 'palavra', cor: 'verde' },
};

export const PUBLICOS = {
  igreja: 'a igreja e seus líderes',
  familia: 'a família do campo',
  lideres: 'quem conduz grupos',
  jovens: 'jovens e novos membros',
};

export const SETORES = [
  { e: '✍️', t: 'Redator', d: 'Transforma o rascunho da IA em texto final.' },
  { e: '📖', t: 'Revisão de quem ensina', d: 'Lê e aprova o conteúdo. Nada sai sem revisão.' },
  { e: '🎨', t: 'Design', d: 'Capa, miolo e modelos para imprimir.' },
  { e: '✅', t: 'Conferência', d: 'Links, entrega e mensagens antes de publicar.' },
  { e: '📣', t: 'Divulgação', d: 'Posts e convites, com a sua aprovação.' },
];

export function montarFicha({ tipo, tema, publico }) {
  const tp = TIPOS[tipo] || TIPOS.manual;
  const tm = TEMAS[tema] || TEMAS.mordomia;
  const pb = PUBLICOS[publico] || PUBLICOS.igreja;
  const titulo = `${tp.nome} ${tm.de}`;
  const selo = `Para ${pb}`;
  const capitulos = tp.capitulos.map((c, i) => `${i + 1}. ${c.replace('{t}', tm.t)}`);
  const livro = { titulo, selo, tema: tm.cena, cor: tm.cor, etiqueta: tp.etiqueta };
  const pedido = `Olá! Quero pedir este livro na vitrine da Igreja Eco: "${titulo}" (${selo}). Sumário sugerido com ${capitulos.length} partes. Podemos conversar?`;
  const texto = [
    `FICHA DE PRODUÇÃO: ${titulo}`,
    selo,
    '',
    'Sumário sugerido:',
    ...capitulos,
    '',
    `Preço de teste: ${tp.preco}`,
    'Equipe: ' + SETORES.map((s) => s.t).join(', '),
    '',
    'Sem promessa de ganho. Conteúdo revisado antes de publicar.',
  ].join('\n');
  return { livro, titulo, selo, capitulos, preco: tp.preco, pedido, texto };
}
