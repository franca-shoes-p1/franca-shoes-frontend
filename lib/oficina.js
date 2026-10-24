// Regras da Oficina Digital (servidor). Pontos, níveis e leitura dos cartões.
import { sb } from './varejoServer';

export const NIVEL_NUM = { iniciante: 0, aprovado: 1, referencia: 2 };
export const nivelNum = (n) => NIVEL_NUM[n] ?? 0;

export async function saldoPontos(operarioId) {
  const [r] = await sb(`op_saldo_pontos?operario_id=eq.${operarioId}&select=saldo`);
  return r ? r.saldo : 0;
}

// Pontos já pedidos em resgates ainda não decididos (ficam reservados).
export async function pontosReservados(operarioId) {
  const l = await sb(`op_resgates?operario_id=eq.${operarioId}&status=eq.pendente&select=pontos`);
  return l.reduce((s, x) => s + x.pontos, 0);
}

export const historico = (operario_id, evento, detalhe = {}) =>
  sb('op_historico', { method: 'POST', body: JSON.stringify({ operario_id, evento, detalhe }) }).catch(() => {});

export const CAMPOS_CARTAO = 'id,codigo,titulo,posto_slug,nivel_min,tempo,objetivo,pronto_quando,material,passos,checklist,erros,campos,prints,avaliacao,seguranca,valor,pontos,unica,ordem';
