// Regras por fábrica (navegador e servidor). Cada fábrica tem o seu jeito: lote mínimo, prazo e troca.
// O nome da fábrica nunca sai do servidor; o cliente só vê as regras.
import { VAREJO } from './varejo';

export const REGRAS_PADRAO = {
  lote_minimo: 1,
  prazo: VAREJO.prazoPreparoDias,
  defeito_dias: 30,
  troca_numeracao: true,
  obs: '',
};

// Linha da tabela cal_fabricas -> regras públicas (sem nome). Sem fábrica ligada: regras padrão da loja.
export function regrasPublicas(f) {
  if (!f) return { ...REGRAS_PADRAO };
  return {
    lote_minimo: Number(f.lote_minimo_pares) > 0 ? Number(f.lote_minimo_pares) : 1,
    prazo: (f.prazo_preparo || '').trim() || REGRAS_PADRAO.prazo,
    defeito_dias: Number(f.troca_defeito_dias) > 0 ? Number(f.troca_defeito_dias) : 30,
    troca_numeracao: f.troca_numeracao !== false,
    obs: (f.troca_obs || '').trim(),
  };
}
