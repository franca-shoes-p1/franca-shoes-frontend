// Fila de compra por fábrica (SERVIDOR): pedidos pagos que ainda não foram comprados, somados em pares por fábrica.
// Serve para o painel (quando comprar) e para o cliente ver "X de Y pares" no acompanhamento.
import { sb } from './varejoServer';

const so = (v) => (v == null ? null : v);

// Devolve { fab: Map(id -> linha cal_fabricas), prod: Map(produto_id -> fabrica_id|null), pedidos: [...] }
export async function carregarFila() {
  let fab = new Map();
  let prod = new Map();
  try {
    const fs = await sb('cal_fabricas?select=*&order=nome_interno');
    fab = new Map(fs.map((f) => [f.id, f]));
    const ps = await sb('rf_produtos?select=id,fabrica_id&limit=2000');
    prod = new Map(ps.map((p) => [p.id, so(p.fabrica_id)]));
  } catch (e) { /* SQL das fábricas ainda não rodado: tudo cai em "sem fábrica" */ }
  const pedidos = await sb('varejo_pedidos?status=eq.pago&select=id,numero,itens&order=numero.asc&limit=500');
  return { fab, prod, pedidos };
}

// Pares por fábrica de um pedido: { fabricaId|'' : pares }
export function paresDoPedido(itens, prod) {
  const r = {};
  (Array.isArray(itens) ? itens : []).forEach((i) => {
    if (i.id === 'passe') return; // passe de assinante não tem fábrica
    const k = prod.get(i.id) || '';
    r[k] = (r[k] || 0) + (Number(i.quantidade) || 0);
  });
  return r;
}

// Fila agrupada: [{ fabrica_id, nome_interno, minimo, pares, pedidos:[numero], pronto, mistos:[numero] }]
export function agruparFila({ fab, prod, pedidos }) {
  const g = new Map();
  pedidos.forEach((p) => {
    const por = paresDoPedido(p.itens, prod);
    const chaves = Object.keys(por);
    chaves.forEach((k) => {
      const f = k ? fab.get(k) : null;
      const cur = g.get(k) || { fabrica_id: k, nome_interno: f ? f.nome_interno : 'Sem fábrica definida', minimo: f ? Number(f.lote_minimo_pares) || 1 : 1, pares: 0, pedidos: [], mistos: [] };
      cur.pares += por[k];
      cur.pedidos.push(p.numero);
      if (chaves.length > 1) cur.mistos.push(p.numero);
      g.set(k, cur);
    });
  });
  return [...g.values()].map((x) => ({ ...x, pronto: x.pares >= x.minimo })).sort((a, b) => b.pares / b.minimo - a.pares / a.minimo);
}
