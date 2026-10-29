// Respostas do assistente do Radar de Pontos. Não usa IA paga: perguntas prontas + busca por palavras.
// Para incluir uma pergunta nova, acrescente um item em PERGUNTAS.
export const WHATS_RADAR = 'https://wa.me/5516991543663?text=' + encodeURIComponent('Olá! Vi o Radar de Pontos no site e quero saber mais.');

export const PERGUNTAS = [
  {
    id: 'oque', q: 'O que é o Radar de Pontos?',
    chaves: ['radar', 'que é', 'projeto', 'funciona', 'explica', 'sobre'],
    r: 'É um jeito de divulgar calçados e acessórios de fábrica, cidade por cidade, com cartazes em locais que AUTORIZARAM. Cada cartaz tem um QR code que leva direto para a loja do site. Começamos por Belo Horizonte (MG).',
  },
  {
    id: 'comercio', q: 'Tenho um comércio. O que é ser Ponto Parceiro?',
    chaves: ['comércio', 'comercio', 'loja', 'parceiro', 'ponto', 'padaria', 'academia', 'dono', 'meu negócio'],
    r: 'É uma troca de divulgação: você deixa um cartaz pequeno com QR code no seu espaço, com o seu consentimento, e nós divulgamos o seu negócio de graça na Vitrine dos Parceiros do site, com o logotipo, a frase e os contatos que você escolher. Não custa nada, não tem contrato e você sai quando quiser.',
  },
  {
    id: 'pessoa', q: 'Posso participar sem ter comércio?',
    chaves: ['sem comércio', 'sem comercio', 'pessoa', 'autônomo', 'autonomo', 'qualquer', 'morador', 'condomínio', 'condominio', 'igreja', 'escola', 'participar', 'projeto', 'serviço', 'servico'],
    r: 'Pode sim. Qualquer pessoa participa: quem tem um serviço, trabalho ou projeto ganha uma vitrine grátis no site, e quem tem um espaço, como mural de condomínio, igreja, escola ou associação, pode ceder um cantinho para o cartaz. Faça a inscrição em "Quero participar".',
  },
  {
    id: 'digital', q: 'Não tenho ponto físico. Como participo?',
    chaves: ['sem ponto', 'ponto físico', 'ponto fisico', 'não tenho loja', 'nao tenho loja', 'sem loja', 'sem espaço', 'sem espaco', 'celular', 'status', 'stories', 'story', 'divulgar', 'digital', 'online'],
    r: 'Dá para participar só pelo celular. No seu painel você baixa uma imagem com o seu QR code (para status ou stories) e copia uma legenda pronta, com um tema novo a cada semana. Depois comprova a publicação e ganha selos. Você também pode propor troca de divulgação com outros parceiros da sua cidade. Não custa nada.',
  },
  {
    id: 'custo', q: 'Tem algum custo para o meu estabelecimento?',
    chaves: ['custo', 'custa', 'pagar', 'preço', 'valor', 'grátis', 'gratis', 'taxa'],
    r: 'Nenhum. O cartaz é por nossa conta e você não paga taxa. Também não prometemos pagamento ou comissão ao ponto: é uma parceria de divulgação.',
  },
  {
    id: 'autorizar', q: 'Como autorizo ou recuso?',
    chaves: ['autorizar', 'autorizo', 'recusar', 'recuso', 'aceitar', 'convite', 'link', 'não quero', 'nao quero'],
    r: 'Você recebe uma mensagem curta com um link. Na página do link há dois botões: "Sim, autorizo o cartaz" e "Não, obrigado". Se recusar, não enviamos mais nenhuma mensagem para você.',
  },
  {
    id: 'quem', q: 'Quem coloca o cartaz?',
    chaves: ['quem', 'coloca', 'cola', 'instala', 'visita', 'cartaz', 'panfleto', 'poste'],
    r: 'O responsável pelo projeto, pessoalmente, e só em locais que disseram "sim". Não colamos nada em postes, muros ou prédios públicos, porque isso não é permitido.',
  },
  {
    id: 'dados', q: 'O QR code coleta meus dados?',
    chaves: ['dados', 'privacidade', 'lgpd', 'rastreia', 'coleta', 'seguro', 'segurança'],
    r: 'O QR apenas conta que alguém abriu a página, sem guardar nome nem telefone. Seus dados só são pedidos se você fizer uma compra na loja. O contato do estabelecimento é usado só para o convite.',
  },
  {
    id: 'comprar', q: 'Sou cliente. Como compro e recebo?',
    chaves: ['comprar', 'compro', 'cliente', 'entrega', 'receber', 'recebo', 'pix', 'cartão', 'frete', 'pedido'],
    r: 'Aponte a câmera do celular para o QR, escolha o calçado na loja e pague por PIX ou cartão. A entrega em mãos acontece em "Dia de Entrega" marcado para a sua cidade, e os avisos aparecem no site e no WhatsApp.',
  },
  {
    id: 'cidades', q: 'Em quais cidades?',
    chaves: ['cidade', 'cidades', 'onde', 'belo horizonte', 'bh', 'rio de janeiro', 'goiânia', 'curitiba', 'salvador', 'florianópolis', 'vitória', 'campo grande', 'são paulo', 'capital', 'capitais'],
    r: 'Estamos abrindo as capitais do Brasil, uma de cada vez, começando por Rio de Janeiro, Goiânia, Curitiba, Campo Grande, Vitória, Salvador, Florianópolis, São Paulo e Belo Horizonte, a partir das rodoviárias e dos comércios por perto. Depois vêm as demais capitais. Se quiser a sua cidade, chame no WhatsApp.',
  },
  {
    id: 'garantia', q: 'Há promessa de ganho ou venda?',
    chaves: ['ganho', 'lucro', 'renda', 'promessa', 'garantia', 'dinheiro', 'ganhar'],
    r: 'Não. O Radar é divulgação: o cartaz leva a pessoa até a loja, mas não garante vendas nem ganhos. Preços e condições aparecem na loja antes de qualquer pagamento.',
  },
];

// Devolve a melhor resposta para um texto digitado.
export function responder(texto) {
  const t = String(texto || '').toLowerCase().trim();
  if (!t) return null;
  let melhor = null, nota = 0;
  for (const p of PERGUNTAS) {
    let n = 0;
    for (const c of p.chaves) if (t.includes(c)) n += c.length > 4 ? 2 : 1;
    if (n > nota) { nota = n; melhor = p; }
  }
  return melhor;
}
