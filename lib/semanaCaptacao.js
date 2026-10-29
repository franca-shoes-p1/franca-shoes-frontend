// Semana de captação: plano de 7 dias para formar a primeira lista de parceiros nas capitais da primeira fase.
// Regras mantidas: convite por mensagem antes de qualquer visita, um por vez, sem promessa de ganho,
// quem recusa não recebe mais mensagem. Os convites sobem em rampa para proteger o número do WhatsApp Business.
import { PRIMEIRA_FASE } from './pontos';

// Meta de convites por dia (dia 1 é só montar a lista).
export const QUOTA_CONVITES = [0, 10, 10, 15, 15, 20, 20];
export const CATEGORIAS = { captacao: 'Captação', contato: 'Contatos', convite: 'Convites', aprovacao: 'Aprovações', material: 'Materiais', viagem: 'Viagem', geral: 'Geral' };
export const META_POR_CIDADE = 40; // locais com WhatsApp ou e-mail por cidade ao fim da semana

export const hojeSP = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
export const somaDias = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const difDias = (a, b) => Math.round((new Date(a + 'T12:00:00Z') - new Date(b + 'T12:00:00Z')) / 86400000);

export function planoSemana(inicio) {
  const C = PRIMEIRA_FASE; // 9 cidades
  const t = []; let n = 0;
  const add = (dia, categoria, titulo, detalhe, cidade) => t.push({ chave: `plano-${dia}-${++n}`, categoria, titulo, detalhe: detalhe || null, cidade: cidade || null, data_prevista: somaDias(inicio, dia - 1), origem: 'plano' });
  const buscar = (dia, cidades, tipos, rotulo) => cidades.forEach((c) => add(dia, 'captacao', `Buscar locais em ${c} (${rotulo})`, `Em Mapa e pontos, escolha ${c}, marque ${tipos}, "Quantos por vez" 100 e clique em Buscar locais. Rode 2 vezes.`, c));

  // Dia 1 e 2: terminais e comércios do entorno
  add(1, 'captacao', 'Adicionar as rodoviárias das 9 cidades', 'Em Mapa e pontos, para cada cidade, clique em "Adicionar rodoviárias de ...". Confira a posição no mapa.');
  buscar(1, C.slice(0, 5), 'Terminais e Comércios', 'terminais e comércios');
  buscar(2, C.slice(5), 'Terminais e Comércios', 'terminais e comércios');
  add(2, 'contato', 'Adicionar contato nos locais sem WhatsApp', 'No Painel do dia, passo 1, lista "Sem contato": procure o WhatsApp no Google Maps e cole. Meta: 20 por dia.');
  // Dia 3 e 4: academias e faculdades
  buscar(3, C.slice(0, 5), 'Academias e Faculdades', 'academias e faculdades');
  buscar(4, C.slice(5), 'Academias e Faculdades', 'academias e faculdades');
  // Dia 5: igrejas
  C.slice(0, 5).forEach((c) => add(5, 'captacao', `Buscar locais em ${c} (igrejas)`, `Marque só Igrejas e templos. Convide só quem tiver mural ou espaço de avisos.`, c));
  add(5, 'convite', 'Enviar convites por e-mail', 'Para os locais que só têm e-mail, use o botão de e-mail do passo 1 (não conta na meta do WhatsApp).');
  // Dia 6: segunda rodada
  add(6, 'captacao', 'Segunda rodada nas cidades fracas', 'Em Painel do dia, veja o funil por cidade em Captação: nas cidades abaixo de 40 locais com contato, rode Buscar locais de novo com outros tipos.');
  add(6, 'aprovacao', 'Lembretes de 5 dias', 'Quem recebeu convite há 5 dias ou mais e não respondeu: envie UM lembrete (passo 4). Depois disso, não insista.');
  // Dia 7: balanço
  add(7, 'captacao', 'Balanço da semana e escolha da primeira cidade da viagem', 'Veja o funil por cidade. Escolha a cidade com mais autorizados e locais com contato para a primeira viagem.');
  add(7, 'viagem', 'Preparar a viagem (próxima etapa)', 'Com a cidade escolhida, vamos montar o roteiro com o passe livre e a lista de materiais para imprimir.');
  // Todos os dias
  for (let d = 1; d <= 7; d++) {
    if (QUOTA_CONVITES[d - 1] > 0) add(d, 'convite', `Enviar até ${QUOTA_CONVITES[d - 1]} convites por WhatsApp`, 'Um por vez, com o texto pronto do painel. Se alguém reclamar ou o WhatsApp avisar de bloqueio, pare por hoje e volte a 10 por dia.');
    if (d >= 3) add(d, 'aprovacao', 'Aprovar vitrines e divulgações (passos 5 e 6)', 'Painel do dia: aprove ou peça ajuste. Quem respondeu SIM espera o cartaz.');
  }
  return t;
}
