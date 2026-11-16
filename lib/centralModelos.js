// Modelos da Central de Projetos: cada tipo gera etapas, tarefas nas duas pistas (m = manual, a = automática) e o esqueleto da página.
export const TIPOS = {
  livro: { e: '📚', nome: 'Livro ou manual' },
  loja: { e: '🛍️', nome: 'Loja ou vitrine' },
  servico: { e: '🔧', nome: 'Serviço' },
  agencia: { e: '🏗️', nome: 'Agência ou pacote' },
  curso: { e: '🎓', nome: 'Curso' },
  outro: { e: '📁', nome: 'Outro' },
};
export const STATUS = { ideia: 'Ideia', planejando: 'Planejando', andamento: 'Em andamento', pausado: 'Pausado', concluido: 'Concluído' };

const m = (t) => ({ t, p: 'manual' });
const a = (t) => ({ t, p: 'auto' });

export const MODELOS = {
  livro: [
    ['Ideia e roteiro', [m('Definir tema, público e sumário'), m('Aprovar título e preço de teste'), a('Rascunhar os capítulos com IA')]],
    ['Texto e capa', [m('Ler, corrigir e aprovar cada capítulo'), m('Escolher a capa e o miolo'), a('Gerar a capa em código e a ficha do livro')]],
    ['Venda', [m('Criar a conta de venda e cadastrar o produto'), m('Ligar o botão de compra na página'), a('Avisar no Telegram a cada nova compra ou contato')]],
    ['Divulgação', [m('Gravar o vídeo ou live de lançamento'), a('Gerar os textos para YouTube, Telegram e redes'), a('Postar o lembrete semanal nos canais')]],
  ],
  loja: [
    ['Catálogo', [m('Listar os produtos, preços e fotos'), a('Montar a vitrine a partir da lista')]],
    ['Pagamento e entrega', [m('Definir formas de pagamento e entrega'), a('Avisar cada pedido novo no Telegram')]],
    ['Divulgação', [m('Escolher onde divulgar'), a('Gerar as postagens da semana')]],
  ],
  servico: [
    ['Oferta', [m('Escrever o que faz, para quem e como cobra'), a('Montar a página do serviço e o pedido')]],
    ['Atendimento', [m('Definir horários e regras de atendimento'), a('Responder as dúvidas comuns no WhatsApp')]],
    ['Divulgação', [m('Reunir 3 exemplos ou depoimentos reais'), a('Gerar as postagens de apresentação')]],
  ],
  agencia: [
    ['Pacote', [m('Definir os níveis e o que cada um entrega'), a('Gerar a página de apresentação')]],
    ['Pedidos', [m('Responder cada pedido e combinar o valor'), a('Registrar o pedido e montar o script')]],
    ['Produção', [m('Produzir e entregar'), a('Lembrar prazos e pendências')]],
  ],
  curso: [
    ['Conteúdo', [m('Definir módulos e aulas'), a('Rascunhar roteiros das aulas com IA'), m('Gravar e revisar as aulas')]],
    ['Venda', [m('Criar a página e o preço'), a('Entregar o acesso depois do pagamento')]],
  ],
  outro: [['Geral', [m('Descrever o objetivo e o primeiro passo')]]],
};

export function gerarTarefas(tipo) {
  const mod = MODELOS[tipo] || MODELOS.outro;
  const out = []; let o = 0;
  mod.forEach(([etapa, ts]) => ts.forEach((x) => out.push({ etapa, titulo: x.t, pista: x.p, ordem: o++ })));
  return out;
}

export const slugar = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'projeto';

// Esqueleto da página pública do projeto (rascunho: só aparece depois que você marcar como publicado).
export function gerarPagina({ nome, tipo, resumo }) {
  const t = TIPOS[tipo] || TIPOS.outro;
  const porTipo = {
    livro: [['📖', 'Conteúdo claro', 'Linguagem simples e tarefas práticas.'], ['🎁', 'Capítulo grátis', 'Conheça antes de decidir.'], ['↩️', '7 dias para desistir', 'Compra digital com devolução.']],
    loja: [['🛍️', 'Catálogo', 'Produtos e preços à vista.'], ['💳', 'Pagamento fácil', 'Formas combinadas com clareza.'], ['🚚', 'Entrega', 'Regras de entrega informadas.']],
    servico: [['🔧', 'O que fazemos', 'Serviço explicado sem enrolação.'], ['📅', 'Agenda', 'Combine o melhor horário.'], ['💬', 'Fale no WhatsApp', 'Resposta de uma pessoa.']],
    agencia: [['🧱', 'Projeto sob medida', 'Feito a partir do seu pedido.'], ['📋', 'Script pronto', 'Seu pedido chega organizado.'], ['💬', 'Atendente opcional', 'Entra no mesmo pacote.']],
    curso: [['🎬', 'Aulas', 'Aprenda no seu ritmo.'], ['📝', 'Atividades', 'Pratique cada módulo.'], ['🔐', 'Acesso', 'Liberado depois do pagamento.']],
    outro: [['💡', 'A ideia', 'Em poucas palavras.'], ['🧭', 'Como funciona', 'Passo a passo.'], ['💬', 'Fale conosco', 'Tire suas dúvidas.']],
  };
  return {
    titulo: nome,
    subtitulo: resumo || `${t.nome}: página em construção.`,
    destaques: (porTipo[tipo] || porTipo.outro).map(([e, tt, d]) => ({ e, t: tt, d })),
    passos: [{ t: 'Conheça', d: 'Veja do que se trata.' }, { t: 'Converse', d: 'Tire suas dúvidas pelo WhatsApp.' }, { t: 'Decida', d: 'Sem pressão e sem promessa de ganho.' }],
    faq: [['Quanto custa?', 'O valor é informado antes de qualquer pagamento.'], ['Posso desistir?', 'Pode, conforme as regras informadas na compra.']],
    cta: { texto: 'Falar no WhatsApp', href: 'https://wa.me/5516991543663?text=' + encodeURIComponent(`Olá! Quero saber mais sobre ${nome}.`) },
  };
}

// Projetos que já existem nas conversas. "Semear" cria estes na Central. s: feita | fazendo | a_fazer
const T = (etapa, titulo, pista, status = 'a_fazer') => ({ etapa, titulo, pista, status });
export const SEMENTES = [
  {
    slug: 'livros-e-manuais', nome: 'Livros e Manuais', tipo: 'livro', emoji: '📚', status: 'andamento',
    resumo: 'Vitrine de livros da Igreja Eco: Manual da Igreja, Vigiar e Cultivar e novos títulos.', link_site: '/livros',
    proximo_passo: 'Fechar o Manual da Igreja: preencher os campos em aberto, aprovar nome e preços de teste e criar a conta de venda.',
    tarefas: [
      T('No ar', 'Vitrine /livros com capas, estante e motor de livros', 'manual', 'feita'),
      T('No ar', 'Faixa de livros na home', 'manual', 'feita'),
      T('Manual da Igreja', 'Preencher os campos [A PREENCHER] do livro (liderança, declaração de fé, compromissos, links)', 'manual'),
      T('Manual da Igreja', 'Aprovar o nome do livro e os preços de teste (R$ 29,90 manual, R$ 79,00 pacote de líderes)', 'manual'),
      T('Manual da Igreja', 'Criar a conta de venda (Kiwify) e cadastrar o produto', 'manual'),
      T('Manual da Igreja', 'Decidir a publicação da página (tirar o noindex)', 'manual'),
      T('Assistência', 'Revisar e decidir sobre o PR #49 (Assistência da Comunidade e Amigo da Obra)', 'manual'),
      T('Próximos títulos', 'Aprovar ou trocar os 3 livros "Em breve" (Cestas e Partilha, Despensa da Família, Manual do Líder de Grupo)', 'manual'),
      T('Divulgação', 'Gerar os textos de divulgação dos livros (motor de divulgação)', 'auto'),
      T('Divulgação', 'Fluxos n8n de divulgação (YouTube, Telegram, redes)', 'auto'),
      T('Divulgação', 'Aviso no Telegram a cada novo contato ou compra', 'auto'),
    ],
  },
  {
    slug: 'pedido-de-construcao', nome: 'Pedido de Construção', tipo: 'agencia', emoji: '🏗️', status: 'andamento',
    resumo: 'Assistente que recebe o pedido de um negócio, monta o script e entrega o projeto, com Atendente WhatsApp opcional.', link_site: '/construcao',
    proximo_passo: 'Fazer um pedido de teste e confirmar o aviso no Telegram; definir os valores dos três pacotes.',
    tarefas: [
      T('Fase 1', 'Assistente /monte-seu-negocio, API e script do pedido', 'manual', 'feita'),
      T('Fase 1', 'Capa /construcao e banner na home', 'manual', 'feita'),
      T('Fase 1', 'Pedido de teste e confirmação do aviso no Telegram', 'manual'),
      T('Fase 1', 'Definir os valores dos três pacotes (Ideia, Projeto, Projeto + Atendente)', 'manual'),
      T('Fase 2', 'Painel de pedidos /admin/construcao (fila, status, copiar script)', 'manual'),
      T('Fase 2', 'Aviso automático no Telegram a cada pedido novo', 'auto'),
      T('Fase 3', 'Área do cliente (login, briefing completo, anexos, retomar)', 'manual'),
      T('Fase 4', 'Etapas, aprovações e pagamentos', 'manual'),
    ],
  },
  {
    slug: 'atendente-whatsapp', nome: 'Atendente WhatsApp', tipo: 'servico', emoji: '💬', status: 'andamento',
    resumo: 'Assistente com IA no WhatsApp para lojas, clínicas e serviços, no canal não oficial (com aviso ao cliente).', link_site: '/atendente',
    proximo_passo: 'Fechar o primeiro piloto de 14 dias com um cliente real.',
    tarefas: [
      T('No ar', 'Página /atendente, assistente /monte-seu-atendente e aviso do canal', 'manual', 'feita'),
      T('Piloto', 'Escolher o primeiro cliente do piloto de 14 dias', 'manual'),
      T('Piloto', 'Subir o n8n e o canal no servidor 24h', 'manual'),
      T('Piloto', 'Respostas automáticas com o catálogo do cliente', 'auto'),
      T('Piloto', 'Avisar no Telegram quando o cliente quer comprar', 'auto'),
    ],
  },
];
