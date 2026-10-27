// Clube de Fidelidade: níveis, formas de juntar pontos e catálogo de recompensas por fase.
// Edite só aqui: a página /fidelidade, a faixa da home e o painel do operador acompanham.
// Valores provisórios: ajuste quando os preços dos serviços estiverem definidos.
export const AVISO_MUDANCA = '30 dias';

export const NIVEIS = [
  { id: 'bronze', nome: 'Bronze', emoji: '🥉', de: 0, perks: ['Acesso à Oficina e aos cartões do seu nível', 'Resgate de brindes e benefícios'] },
  { id: 'prata', nome: 'Prata', emoji: '🥈', de: 1000, perks: ['Prioridade na escolha de tarefas novas', 'Aviso antecipado dos projetos novos'] },
  { id: 'ouro', nome: 'Ouro', emoji: '🥇', de: 5000, perks: ['Convite para testar projetos novos antes do público', 'Atendimento prioritário no WhatsApp'] },
  { id: 'diamante', nome: 'Diamante', emoji: '💎', de: 15000, perks: ['Sua sugestão de projeto entra na fila de análise da coordenação', 'Conversa periódica com a coordenação'] },
];

// Nível pelo total de pontos já ganhos (o saldo gasto em recompensas não faz você descer de nível).
export function nivelDe(acumulado) {
  const n = Number(acumulado) || 0;
  let atual = NIVEIS[0];
  for (const x of NIVEIS) if (n >= x.de) atual = x;
  const prox = NIVEIS.find((x) => x.de > n) || null;
  return { atual, prox, faltam: prox ? prox.de - n : 0, pct: prox ? Math.min(100, Math.round(((n - atual.de) / (prox.de - atual.de)) * 100)) : 100 };
}

export const COMO_JUNTAR = [
  { e: '🛠️', t: 'Fazer tarefas na Oficina', d: 'Cada cartão aprovado rende os pontos mostrados no próprio cartão.' },
  { e: '🛍️', t: 'Contratar nossos serviços', d: '1 Crédito para cada R$ 1,00 em serviços pagos e confirmados. Crédito vale o mesmo que ponto.' },
  { e: '📣', t: 'Indicar clientes', d: '1 ponto para cada R$ 1,00 do pedido pago por quem você indicou com o seu link de afiliado.' },
];

// disponivel: pode resgatar agora. breve: entra quando o projeto estiver pronto (sem data prometida).
// Pontos para operador/afiliado; clientes usam metade em Créditos (a conferência é feita pela coordenação).
export const RECOMPENSAS = [
  { fase: 'Disponíveis agora', itens: [
    { e: '🎓', t: 'Mentoria de 30 minutos', pontos: 300, d: 'Conversa individual sobre carreira e projetos.' },
    { e: '🏷️', t: 'Desconto em produto digital', pontos: 200, d: 'Desconto em produto ou serviço digital do ecossistema.' },
    { e: '🧩', t: '20% de desconto em um serviço do Ateliê', pontos: 2000, d: 'Em um pedido, com desconto máximo de R$ 200,00.' },
    { e: '🎁', t: 'Acessório da loja de calçados', pontos: 1000, d: 'Campanha de Inauguração, até 31/12/2026.' },
    { e: '👟', t: 'Calçado da loja', pontos: 2500, d: 'Campanha de Inauguração, até 31/12/2026.' },
    { e: '🌐', t: 'Página de vendas simples, grátis', pontos: 5000, d: 'Uma página de vendas montada pelo Ateliê, no modelo simples.' },
  ] },
  { fase: 'Em breve, quando cada projeto estiver pronto', itens: [
    { e: '🥬', t: 'Desconto em alimentos naturais da floresta', breve: true, d: 'Quando o projeto de alimentação estiver pronto, ele entra aqui com a pontuação.' },
    { e: '🏪', t: 'Desconto na Loja de Calçados Pronta', breve: true, d: 'Uma loja sua, com desconto por pontos, em estudo.' },
    { e: '✨', t: 'Cada projeto novo do site', breve: true, d: 'Todo produto ou projeto que entrar no catálogo do site ganha recompensas aqui.' },
  ] },
];
export const fmt = (n) => Number(n).toLocaleString('pt-BR');
