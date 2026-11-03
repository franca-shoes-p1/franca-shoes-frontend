// Vitrine "Fábricas de Franca" (SERVIDOR): lista pública, bônus de passe. Só roda na Vercel.
import { sb } from './varejoServer';
import { BONUS_PADRAO } from './fabricasFranca';

const hojeISO = () => new Date().toISOString().slice(0, 10);
// Destaque patrocinado vale enquanto estiver marcado e dentro da data combinada.
export const patrocinioAtivo = (l) => !!l.patrocinada && (!l.patrocinio_ate || String(l.patrocinio_ate) >= hojeISO());

// Só campos públicos: nunca devolve CNPJ nem a anotação privada do patrocínio.
export async function listarLojasPublicas() {
  try {
    const rows = await sb('ff_lojas?ativo=eq.true&select=id,slug,nome,cidade,segmento,descricao,patrocinada,patrocinio_ate,ordem&order=ordem.asc,nome.asc&limit=200');
    const lista = rows.map((l) => ({
      id: l.id,
      slug: l.slug,
      nome: l.nome,
      cidade: l.cidade || '',
      segmento: l.segmento,
      descricao: l.descricao || '',
      patrocinada: patrocinioAtivo(l),
    }));
    lista.sort((a, b) => Number(b.patrocinada) - Number(a.patrocinada)); // ordenação estável: mantém a ordem dentro de cada grupo
    return lista;
  } catch (e) {
    return []; // SQL ainda não rodado ou banco indisponível: página mostra "em breve"
  }
}

// Dias de passe dados quando uma compra registrada é aprovada (cal_config.ff_bonus_dias; 0 desliga).
export async function bonusDias() {
  try {
    const [c] = await sb('cal_config?chave=eq.ff_bonus_dias&select=valor&limit=1');
    const n = c ? parseInt(c.valor, 10) : NaN;
    return Number.isInteger(n) && n >= 0 && n <= 365 ? n : BONUS_PADRAO;
  } catch (e) {
    return BONUS_PADRAO;
  }
}

// Soma dias ao passe da pessoa (acumula quando ainda está ativo), na mesma tabela do passe de assinante.
export async function concederBonus({ email, nome, whatsapp, dias }) {
  const chave = String(email).toLowerCase();
  const [a] = await sb(`cal_acessos_portal?chave=eq.${encodeURIComponent(chave)}&select=chave,expira_em&limit=1`);
  const base = a && Date.parse(a.expira_em) > Date.now() ? Date.parse(a.expira_em) : Date.now();
  const expira_em = new Date(base + dias * 86400000).toISOString();
  if (a) {
    await sb(`cal_acessos_portal?chave=eq.${encodeURIComponent(chave)}`, { method: 'PATCH', body: JSON.stringify({ expira_em }) });
  } else {
    await sb('cal_acessos_portal', { method: 'POST', body: JSON.stringify({ chave, nome, whatsapp, expira_em }) });
  }
  return expira_em;
}
