// Pedido público da loja: grava no Supabase (sem pagamento). Os preços vêm do banco, nunca do navegador.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function sb(caminho, init = {}) {
  const base = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !chave) throw new Error('config');
  const r = await fetch(`${base}/rest/v1/${caminho}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: chave,
      ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
  const t = await r.text();
  if (!r.ok) throw new Error('db');
  return t ? JSON.parse(t) : [];
}

const txt = (v, n) => String(v ?? '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-armadilha para robôs
  const nome = txt(c.nome, 120);
  const whatsapp = txt(c.whatsapp, 30).replace(/[^\d+()\- ]/g, '');
  if (nome.length < 2 || whatsapp.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ erro: 'Informe seu nome e um WhatsApp com DDD.' });
  }
  const brutos = Array.isArray(c.itens) ? c.itens.slice(0, 40) : [];
  const qtd = new Map();
  for (const i of brutos) {
    const q = Math.floor(Number(i?.quantidade));
    if (UUID.test(String(i?.id)) && q > 0 && q <= 5000) qtd.set(i.id, (qtd.get(i.id) || 0) + q);
  }
  if (!qtd.size) return res.status(400).json({ erro: 'Carrinho vazio.' });
  try {
    const ids = [...qtd.keys()].join(',');
    const modelos = await sb(
      `rf_produtos?select=id,nome,titulo_publico,custo&publicado=eq.true&ativo=eq.true&id=in.(${ids})`
    );
    const itens = modelos
      .filter((m) => Number(m.custo) > 0)
      .map((m) => ({
        id: m.id,
        titulo: m.titulo_publico || m.nome,
        quantidade: qtd.get(m.id),
        preco_fabrica: Number(m.custo),
      }));
    if (!itens.length) return res.status(400).json({ erro: 'Esses modelos não estão mais disponíveis.' });
    const total = itens.reduce((s, i) => s + i.preco_fabrica * i.quantidade, 0);
    const pares = itens.reduce((s, i) => s + i.quantidade, 0);
    const [p] = await sb('rf_pedidos', {
      method: 'POST',
      body: JSON.stringify({
        cliente_nome: nome,
        whatsapp,
        email: txt(c.email, 120) || null,
        cidade: txt(c.cidade, 80) || null,
        estado: txt(c.estado, 2).toUpperCase() || null,
        observacao: txt(c.observacao, 500) || null,
        itens,
        total_fabrica: Math.round(total * 100) / 100,
        pares,
      }),
    });
    return res.json({ ok: true, numero: p.numero, itens, total, pares });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível registrar o pedido agora. Fale comigo pelo WhatsApp.' });
  }
}
