// Regras do passe de assinante e do desconto por ramo (navegador e servidor). Nenhum segredo aqui.
export const PASSE = { dias: 30, precoPadrao: 29.9, taxaPadrao: 4.98, fundoPadrao: 25 };

export const RAMOS_PADRAO = [
  { slug: 'calcados', nome: 'Calçados e acessórios', modo: 'margem', teto_pct: null, automatico: true },
  { slug: 'ebooks', nome: 'E-books e livros', modo: 'teto', teto_pct: 30, automatico: false },
  { slug: 'servicos', nome: 'Serviços sob medida (Ateliê, Sites, Oficina, Radar)', modo: 'teto', teto_pct: 15, automatico: false },
  { slug: 'cursos', nome: 'Cursos e outros', modo: 'teto', teto_pct: 20, automatico: false },
];

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/* Desconto por unidade para assinante. É o MENOR entre:
   (1) o que a margem permite sem tocar no fundo dos operadores (só quando o custo é conhecido), e
   (2) o teto percentual do ramo.
   O fundo dos operadores é calculado sobre o preço GERAL; o desconto sai da parte do dono. */
export function descontoUnitario({ preco, custo, taxaPct = PASSE.taxaPadrao, fundoPct = PASSE.fundoPadrao, tetoPct = null }) {
  const p = Number(preco) || 0;
  if (!(p > 0)) return 0;
  const c = Number(custo) || 0;
  let limite = Infinity;
  if (c > 0) {
    const lucro = p - c - p * (Number(taxaPct) || 0) / 100;
    limite = lucro > 0 ? lucro * (1 - (Number(fundoPct) || 0) / 100) : 0;
  }
  if (Number(tetoPct) > 0) limite = Math.min(limite, p * Number(tetoPct) / 100);
  if (!Number.isFinite(limite)) return 0; // sem custo e sem teto: não dá desconto
  return Math.max(0, Math.floor(limite * 100) / 100);
}

export const precoAssinante = (args) => r2((Number(args.preco) || 0) - descontoUnitario(args));
