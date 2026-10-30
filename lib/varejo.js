// Funções compartilhadas da loja de varejo (rodam no navegador e no servidor).
// >>> AJUSTE AQUI os valores da sua operação (prazo, frete, WhatsApp). <<<

export const VAREJO = {
  nomeLoja: 'Franca Calçados',
  whatsapp: '5516991543663',
  // Como a loja trabalha sem estoque, o pedido é comprado na fábrica depois do pagamento.
  prazoPreparoDias: '3 a 5 dias úteis',
  prazoEntregaInfo: 'mais o prazo dos Correios',
  // Frete fixo por estado (valores PROVISÓRIOS: troque pelos seus custos reais).
  freteSP: 22,
  freteSulSudeste: 28, // RJ, MG, ES, PR, SC, RS
  freteOutros: 38,
  // Frete grátis a partir deste valor de produtos (0 = desligado).
  freteGratisAPartirDe: 0,
};

const SUL_SUDESTE = ['RJ', 'MG', 'ES', 'PR', 'SC', 'RS'];
export const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');

// O valor da tabela é o custo estimado; o comprador paga a tabela + 10% (a diferença aparece no acerto).
const comMargemFrete = (v) => Math.ceil(Number(v) * 1.1 * 100 - 1e-9) / 100;
export function calcularFrete(estado, subtotal) {
  const uf = String(estado || '').toUpperCase();
  if (VAREJO.freteGratisAPartirDe > 0 && subtotal >= VAREJO.freteGratisAPartirDe) return 0;
  if (uf === 'SP') return comMargemFrete(VAREJO.freteSP);
  if (SUL_SUDESTE.includes(uf)) return comMargemFrete(VAREJO.freteSulSudeste);
  return comMargemFrete(VAREJO.freteOutros);
}

// Aceita "35 ao 40", "35-40", "35 a 40", "35, 36, 37" ou "35/36/37". Devolve [] se não entender.
export function parseTamanhos(texto) {
  const t = String(texto || '').trim();
  if (!t) return [];
  const faixa = t.match(/^(\d{1,2})\s*(?:ao|a|até|-|–)\s*(\d{1,2})$/i);
  if (faixa) {
    const de = parseInt(faixa[1], 10);
    const ate = parseInt(faixa[2], 10);
    if (ate >= de && ate - de <= 30) return Array.from({ length: ate - de + 1 }, (_, i) => String(de + i));
  }
  const lista = t.split(/[\s,;/]+/).filter((x) => /^\d{1,2}([.,]5)?$/.test(x));
  return lista.length ? lista : [];
}

// ---- carrinho (só no navegador) ----
const CHAVE = 'carrinho_varejo';

export function lerCarrinho() {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function salvarCarrinho(itens) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
  } catch {}
  try {
    window.dispatchEvent(new Event('carrinho-varejo'));
  } catch {}
}

export function limparCarrinho() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {}
  try {
    window.dispatchEvent(new Event('carrinho-varejo'));
  } catch {}
}

export const chaveItem = (i) => `${i.id}|${i.tamanho || ''}`;

export function adicionarAoCarrinho(item) {
  const c = lerCarrinho();
  const existente = c.find((x) => chaveItem(x) === chaveItem(item));
  if (existente) existente.quantidade = Math.min(10, existente.quantidade + item.quantidade);
  else c.push(item);
  salvarCarrinho(c);
  return c;
}

export const totalPares = (c) => c.reduce((s, i) => s + i.quantidade, 0);
export const subtotalCarrinho = (c) => c.reduce((s, i) => s + i.preco * i.quantidade, 0);

// ---- ponto de origem (QR Code de cartaz), só no navegador ----
const CHAVE_PONTO = 'ponto_origem';

export function guardarPontoDaUrl() {
  try {
    const m = /[?&]ponto=([A-Za-z0-9]{4,10})(?:&|$)/.exec(window.location.search);
    if (m) localStorage.setItem(CHAVE_PONTO, m[1].toUpperCase());
  } catch {}
}

export function lerPonto() {
  try {
    const v = localStorage.getItem(CHAVE_PONTO) || '';
    return /^[A-Z0-9]{4,10}$/.test(v) ? v : '';
  } catch {
    return '';
  }
}

// ---- link de revendedor (?rev=CODIGO), só no navegador ----
const CHAVE_REV = 'rev_codigo';
export function guardarRevDaUrl() {
  try {
    const m = /[?&]rev=([A-Za-z0-9]{6,10})(?:&|$)/.exec(window.location.search);
    if (m) localStorage.setItem(CHAVE_REV, m[1].toUpperCase());
  } catch {}
}
export function lerRev() {
  try {
    const v = localStorage.getItem(CHAVE_REV) || '';
    return /^[A-Z0-9]{6,10}$/.test(v) ? v : '';
  } catch {
    return '';
  }
}
