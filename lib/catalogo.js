// Catálogo completo de produtos e serviços. Fonte única: pages/catalogo.jsx lê daqui.
// status: 'agora' = podemos atender hoje | 'encomenda' = montado sob pedido pelo Ateliê/Oficina
//         'breve' = em construção, sem data prometida | 'estudo' = ideia em estudo, ainda sem oferta
// novo: true = modalidade acrescentada neste catálogo (ainda a validar com clientes)
// Preços: não publicamos valores fixos aqui. Cada item é orçado por pedido.

export const STATUS = {
  agora: { rotulo: 'Disponível agora', cor: '#0b7a3b', fundo: '#d9f5e3' },
  encomenda: { rotulo: 'Sob encomenda', cor: '#1b4fb3', fundo: '#dde8ff' },
  breve: { rotulo: 'Em breve', cor: '#8a5a00', fundo: '#fff1c2' },
  estudo: { rotulo: 'Em estudo', cor: '#5b4a8a', fundo: '#ebe5ff' },
};

export const CATEGORIAS = [
  { id: 'sites', e: '🌐', t: 'Sites e vendas online', d: 'Para ser encontrado e vender pela internet.', itens: [
    { t: 'Site profissional sob medida', d: 'Site simples e bonito para o seu negócio ou profissão.', s: 'agora' },
    { t: 'Página de vendas com botão de WhatsApp', d: 'Uma página só, direta, para vender um produto ou serviço.', s: 'agora' },
    { t: 'Loja virtual com PIX e cartão', d: 'Catálogo, carrinho e pagamento.', s: 'encomenda' },
    { t: 'Catálogo no WhatsApp Business', d: 'Produtos organizados no WhatsApp, com fotos e preços.', s: 'agora' },
    { t: 'Landing page para curso ou evento', d: 'Página para vender inscrição, curso ou convite.', s: 'encomenda' },
    { t: 'Cardápio digital com QR Code', d: 'Para restaurantes, lanchonetes e padarias.', s: 'encomenda', novo: true },
    { t: 'Cartão de visita digital (link único)', d: 'Uma página com todos os seus contatos e serviços.', s: 'encomenda', novo: true },
    { t: 'Vitrine para artesãos e pequenos produtores', d: 'Mostrar e vender produtos feitos à mão.', s: 'encomenda', novo: true },
    { t: 'Mini site de uma página', d: 'Apresentação, serviços e botões de contato em uma única página.', s: 'agora', novo: true },
    { t: 'Página de captação de leads', d: 'Formulário curto com material gratuito para juntar contatos de interessados.', s: 'encomenda', novo: true },
    { t: 'Site com agendamento online', d: 'O cliente escolhe serviço, dia e horário livre sozinho.', s: 'encomenda', novo: true },
    { t: 'Site moderno com IA e animações', d: 'Rolagem em capítulos, tema claro e escuro e assistente de IA no site.', s: 'breve', novo: true },
  ] },
  { id: 'automacao', e: '🤖', t: 'Automação e inteligência artificial', d: 'Atender e organizar sem perder tempo.', itens: [
    { t: 'Assistente de WhatsApp com IA', d: 'Responde dúvidas, anota pedidos e chama você quando precisa.', s: 'agora' },
    { t: 'Agendamento automático', d: 'Clientes marcam horário sozinhos (salões, clínicas, oficinas).', s: 'encomenda' },
    { t: 'Cobrança e lembretes automáticos', d: 'Avisos de vencimento e confirmação de pagamento.', s: 'encomenda' },
    { t: 'Cadastro de clientes (CRM simples)', d: 'Lista organizada de quem comprou e quem pediu orçamento.', s: 'encomenda' },
    { t: 'Fluxos de automação sob medida', d: 'Liga pedido, planilha, aviso e e-mail sem trabalho manual.', s: 'agora' },
    { t: 'Agente de IA interno da empresa', d: 'Um assistente que responde com base nos materiais da própria empresa.', s: 'breve' },
    { t: 'Radar de defeitos e oportunidades', d: 'Levantamento de problemas de presença digital de uma empresa, com sugestões.', s: 'breve' },
    { t: 'Resposta automática de avaliações', d: 'Ajuda a responder comentários e avaliações no Google.', s: 'estudo', novo: true },
  ] },
  { id: 'marketing', e: '📣', t: 'Marketing e divulgação', d: 'Mostrar o seu negócio para mais gente.', itens: [
    { t: 'Pacote mensal de posts para Instagram', d: 'Artes e legendas prontas para publicar.', s: 'encomenda' },
    { t: 'Gestão de anúncios (Meta e Google)', d: 'Criação e acompanhamento de anúncios. A verba é paga direto à plataforma.', s: 'breve' },
    { t: 'Google Meu Negócio', d: 'Perfil completo no Google e no Maps.', s: 'encomenda' },
    { t: 'Edição de vídeos curtos', d: 'Cortes e legendas para Reels, Shorts e TikTok.', s: 'encomenda' },
    { t: 'E-mail e Telegram: listas e transmissões', d: 'Mensagens para quem já é seu cliente.', s: 'encomenda' },
    { t: 'Programa de fidelidade para o seu comércio', d: 'Pontos e níveis para os seus clientes, no estilo do nosso Clube.', s: 'estudo', novo: true },
    { t: 'Programa de indicação para o seu negócio', d: 'Links de afiliado para quem indica clientes.', s: 'estudo', novo: true },
  ] },
  { id: 'calcados', e: '👟', t: 'Calçados e acessórios', d: 'Direto de Franca, a capital do calçado.', itens: [
    { t: 'Loja de Calçados Pronta', d: 'Sua loja online de calçados, entregue funcionando.', s: 'agora' },
    { t: 'Calçados e acessórios no varejo', d: 'Compra de pares e acessórios pela loja do site.', s: 'agora' },
    { t: 'Rede de revendedores e lotes', d: 'Revendedores cadastrados vendendo lotes de fábrica.', s: 'breve' },
    { t: 'Outlet de mostruário', d: 'Modelos de mostruário com preço reduzido.', s: 'estudo' },
    { t: 'Radar de promoções de calçados', d: 'Garimpo de promoções a preço de fábrica, em relatório diário.', s: 'breve' },
  ] },
  { id: 'compras', e: '🛍️', t: 'Compras e entregas', d: 'Buscar e entregar o que você precisa.', itens: [
    { t: 'Compra e entrega pessoal', d: 'Compramos nos polos de comércio e entregamos em lotes, pelo passe livre.', s: 'estudo' },
    { t: 'Grupo de ofertas e promoções', d: 'Aviso de promoções dos grandes comércios por Telegram e WhatsApp.', s: 'estudo' },
    { t: 'Distribuidora de produtores locais', d: 'Hortifrúti e alimentos de produtores da região de Franca.', s: 'estudo' },
  ] },
  { id: 'agro', e: '🌱', t: 'Agro, alimentos naturais e campo', d: 'Serviços e produtos ligados ao campo e à alimentação natural.', itens: [
    { t: 'Alimentos naturais da floresta', d: 'Produtos da Amazônia com parceiros nativos, vendidos de São Paulo.', s: 'estudo' },
    { t: 'Agência rural digital', d: 'Atendimento por WhatsApp para produtores rurais, com agente de IA.', s: 'breve' },
    { t: 'Orientação sobre legalização rural', d: 'Informação geral para organizar a propriedade. Não substitui advogado nem despachante.', s: 'breve' },
    { t: 'Consultoria agropecuária e agroecologia', d: 'Orientação técnica geral. Saúde animal sempre com veterinário.', s: 'estudo' },
    { t: 'Café arábica agroecológico', d: 'Projetos com donos de terra na Alta Mogiana.', s: 'estudo' },
    { t: 'Projetos para chácaras, sítios e fazendas', d: 'Planejamento e infraestrutura de propriedades rurais.', s: 'estudo' },
    { t: 'Site e catálogo para o produtor rural', d: 'Vender direto ao consumidor, com WhatsApp e PIX.', s: 'encomenda', novo: true },
  ] },
  { id: 'cursos', e: '🎓', t: 'Cursos, e-books e mentorias', d: 'Aprender com material em português.', itens: [
    { t: 'Pacote de cursos de ovinocultura', d: 'Mais de 15 cursos, começando por raças e cruzamentos.', s: 'breve' },
    { t: 'Curso Anúncios que Vendem', d: 'Como anunciar no Instagram e no Google para comércios locais.', s: 'breve' },
    { t: 'Minicurso de agentes de IA com n8n', d: 'Montar automações na prática, passo a passo.', s: 'breve' },
    { t: 'E-books "como fazer"', d: 'Guias curtos e práticos sobre temas do dia a dia.', s: 'breve' },
    { t: 'Curso de comunidade na floresta com IA', d: 'Como planejar e financiar a vida no campo com renda online.', s: 'estudo' },
    { t: 'Mentoria de 30 minutos', d: 'Conversa individual sobre carreira e projetos.', s: 'agora' },
    { t: 'Metodologia da Oficina Digital', d: 'Como montar uma equipe de operadores autônomos em tarefas curtas.', s: 'breve' },
    { t: 'Planilhas e modelos prontos', d: 'Controle de caixa, estoque e agenda para pequenos negócios.', s: 'estudo', novo: true },
  ] },
  { id: 'igrejas', e: '⛪', t: 'Igrejas e comunidades', d: 'Para pastores, líderes e grupos.', itens: [
    { t: 'Presença digital para igrejas', d: 'Site simples, Google Meu Negócio e WhatsApp configurado.', s: 'encomenda' },
    { t: 'Pregações em conteúdo', d: 'Cada mensagem vira cortes, resumo, estudo e posts.', s: 'encomenda' },
    { t: 'Transmissão e edição de cultos', d: 'Para igrejas sem equipe de vídeo.', s: 'encomenda' },
    { t: 'Atendimento por WhatsApp para igrejas', d: 'Boas-vindas, pedidos de oração e agendamento.', s: 'encomenda' },
    { t: 'Mural de oração no Telegram', d: 'Grupo organizado de intercessão.', s: 'breve' },
    { t: 'Banco de talentos e rede de apoio', d: 'Membros oferecendo serviços uns aos outros.', s: 'estudo' },
  ] },
  { id: 'anuncios', e: '🚗', t: 'Veículos e imóveis', d: 'Anúncios com atendimento automático.', itens: [
    { t: 'Portal de anúncios de veículos', d: 'Planos de destaque para lojas e vendedores.', s: 'estudo' },
    { t: 'Anúncios de imóveis', d: 'Somente em parceria com corretor com CRECI.', s: 'estudo' },
  ] },
  { id: 'suporte', e: '🧰', t: 'Suporte e tecnologia no dia a dia', d: 'Quando a tecnologia trava.', itens: [
    { t: 'Suporte de computador e internet', d: 'Formatação, Wi-Fi, impressora, e-mail e remoção de vírus.', s: 'encomenda' },
    { t: 'Configurar redes sociais do negócio', d: 'Perfis comerciais, catálogo e primeiros posts.', s: 'agora' },
    { t: 'Ensino de IA para o seu negócio', d: 'Aprender a usar ChatGPT, Claude e Gemini no trabalho.', s: 'encomenda' },
    { t: 'Plano mensal de manutenção', d: 'Cuidamos do que montamos, todo mês.', s: 'encomenda' },
    { t: 'Soluções com apps do Google Play', d: 'Planos para comércios usando aplicativos e ferramentas gratuitas.', s: 'estudo' },
    { t: 'Currículo e perfil profissional', d: 'Currículo, LinkedIn e carta de apresentação.', s: 'encomenda', novo: true },
  ] },
  { id: 'gestao', e: '📊', t: 'Gestão e dados', d: 'Enxergar o negócio com clareza.', itens: [
    { t: 'Painel de indicadores', d: 'Vendas, atendimentos e resultados em uma tela.', s: 'encomenda' },
    { t: 'Controle de estoque digital', d: 'Entradas, saídas e alertas de falta.', s: 'encomenda' },
    { t: 'Consultoria de negócios digitais', d: 'Conversa para decidir o que montar primeiro.', s: 'encomenda' },
    { t: 'Organização para MEI', d: 'Rotina simples de caixa, preços e controle.', s: 'estudo', novo: true },
  ] },
  { id: 'turismo', e: '✈️', t: 'Turismo e viagens', d: 'Ideias para depois.', itens: [
    { t: 'Plataforma de turismo digital', d: 'Hospedagens e transportes em um só lugar.', s: 'estudo' },
  ] },
];

export function totais() {
  const t = { itens: 0, agora: 0, encomenda: 0, breve: 0, estudo: 0, categorias: CATEGORIAS.length };
  CATEGORIAS.forEach((c) => c.itens.forEach((i) => { t.itens += 1; t[i.s] += 1; }));
  return t;
}
