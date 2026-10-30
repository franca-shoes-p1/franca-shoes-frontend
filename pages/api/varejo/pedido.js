// Cria o pedido de varejo e o link de pagamento do Mercado Pago (PIX e cartão).
// Os preços e o frete são SEMPRE calculados aqui no servidor, nunca vêm do navegador.
import { sb, UUID, txt, siteUrl } from '../../../lib/varejoServer';
import { calcularFrete, ESTADOS, brl } from '../../../lib/varejo';
import { avisar } from '../../../lib/avisar';
import { novoToken } from '../../../lib/fornecedoresServer';
import { precoCliente, r2, cpfValido } from '../../../lib/fornecedores';

const so_digitos = (v) => String(v ?? '').replace(/\D/g, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-armadilha para robôs

  const semMP = !process.env.MP_ACCESS_TOKEN; // só é exigido para modelos da própria loja; fornecedor recebe por PIX direto
  const nome = txt(c.nome, 120);
  const email = txt(c.email, 120).toLowerCase();
  const whatsapp = so_digitos(c.whatsapp).slice(0, 15);
  const cep = so_digitos(c.cep).slice(0, 8);
  const rua = txt(c.rua, 120);
  const numero = txt(c.numero, 15);
  const complemento = txt(c.complemento, 60);
  const bairro = txt(c.bairro, 80);
  const cidade = txt(c.cidade, 80);
  const estado = txt(c.estado, 2).toUpperCase();

  if (nome.length < 3) return res.status(400).json({ erro: 'Informe seu nome completo.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  if (whatsapp.length < 10) return res.status(400).json({ erro: 'Informe um WhatsApp com DDD.' });
  if (cep.length !== 8 || !rua || !numero || !bairro || !cidade || !ESTADOS.includes(estado)) {
    return res.status(400).json({ erro: 'Preencha o endereço de entrega completo.' });
  }

  // Junta itens iguais (mesmo modelo + mesmo tamanho)
  const brutos = Array.isArray(c.itens) ? c.itens.slice(0, 30) : [];
  const linhas = new Map();
  for (const i of brutos) {
    const q = Math.floor(Number(i?.quantidade));
    const tamanho = txt(i?.tamanho, 10);
    if (!UUID.test(String(i?.id)) || !(q > 0 && q <= 10)) continue;
    const k = `${i.id}|${tamanho}`;
    const atual = linhas.get(k) || { id: i.id, tamanho, quantidade: 0 };
    atual.quantidade = Math.min(10, atual.quantidade + q);
    linhas.set(k, atual);
  }
  if (!linhas.size) return res.status(400).json({ erro: 'Seu carrinho está vazio.' });

  try {
    const ids = [...new Set([...linhas.values()].map((l) => l.id))].join(',');
    let produtos;
    try {
      produtos = await sb(
        `rf_produtos?select=id,nome,titulo_publico,preco_venda_sugerido,fornecedor_id,preco_fornecedor,estoque_status,revisao&publicado=eq.true&ativo=eq.true&preco_venda_sugerido=gt.0&id=in.(${ids})`
      );
    } catch (e) {
      // SQL de fornecedores ainda não rodado: segue como antes (só modelos da própria loja)
      produtos = await sb(
        `rf_produtos?select=id,nome,titulo_publico,preco_venda_sugerido&publicado=eq.true&ativo=eq.true&preco_venda_sugerido=gt.0&id=in.(${ids})`
      );
    }
    const doForn = produtos.filter((p) => p.fornecedor_id);
    if (doForn.length) {
      if (doForn.length !== produtos.length || new Set(doForn.map((p) => p.fornecedor_id)).size > 1) {
        return res.status(400).json({ erro: 'Cada pedido pode ter modelos de um só fornecedor. Faça um pedido para cada fornecedor.' });
      }
      if (!cpfValido(c.cpf)) return res.status(400).json({ erro: 'Informe um CPF válido: a nota fiscal sai no seu nome.' });
      if (c.autorizo !== true) return res.status(400).json({ erro: 'Marque a autorização de retirada e transporte para continuar.' });
      return await pedidoFornecedor({ res, c, linhas, produtos, dados: { nome, cpf: so_digitos(c.cpf), email, whatsapp, cep, rua, numero, complemento, bairro, cidade, estado } });
    }
    if (semMP) return res.status(503).json({ erro: 'Pagamento ainda não configurado. Fale com a loja pelo WhatsApp.' });
    const porId = new Map(produtos.map((p) => [p.id, p]));
    const itens = [];
    for (const l of linhas.values()) {
      const p = porId.get(l.id);
      if (!p) return res.status(400).json({ erro: 'Um dos produtos não está mais disponível. Atualize o carrinho.' });
      itens.push({
        id: p.id,
        titulo: p.titulo_publico || p.nome,
        tamanho: l.tamanho,
        quantidade: l.quantidade,
        preco: Math.round(Number(p.preco_venda_sugerido) * 100) / 100,
      });
    }

    const subtotal = Math.round(itens.reduce((s, i) => s + i.preco * i.quantidade, 0) * 100) / 100;
    const frete = calcularFrete(estado, subtotal);
    const total = Math.round((subtotal + frete) * 100) / 100;

    const [pedido] = await sb('varejo_pedidos', {
      method: 'POST',
      body: JSON.stringify({
        cliente_nome: nome,
        email,
        whatsapp,
        cep,
        rua,
        numero_casa: numero,
        complemento: complemento || null,
        bairro,
        cidade,
        estado,
        observacao: [txt(c.observacao, 300), /^[A-Z0-9]{4,10}$/.test(String(c.ponto || '')) ? `[ponto:${c.ponto}]` : ''].filter(Boolean).join(' ') || null,
        itens,
        subtotal,
        frete,
        total,
      }),
    });

    const base = siteUrl(req);
    const preferencia = {
      items: [
        ...itens.map((i) => ({
          id: i.id,
          title: `${i.titulo}${i.tamanho ? ' - nº ' + i.tamanho : ''}`.slice(0, 120),
          quantity: i.quantidade,
          unit_price: i.preco,
          currency_id: 'BRL',
        })),
        ...(frete > 0
          ? [{ id: 'frete', title: 'Frete', quantity: 1, unit_price: frete, currency_id: 'BRL' }]
          : []),
      ],
      payer: { name: nome, email },
      external_reference: pedido.id,
      notification_url: `${base}/api/varejo/webhook`,
      back_urls: {
        success: `${base}/calcados/obrigado?pedido=${pedido.numero}`,
        pending: `${base}/calcados/obrigado?pedido=${pedido.numero}`,
        failure: `${base}/calcados/obrigado?pedido=${pedido.numero}&falhou=1`,
      },
      auto_return: 'approved',
      statement_descriptor: 'FRANCA CALCADOS',
    };

    const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencia),
    });
    const mpJson = await mp.json().catch(() => ({}));
    if (!mp.ok || !mpJson.init_point) throw new Error('mp: ' + JSON.stringify(mpJson).slice(0, 300));

    await sb(`varejo_pedidos?id=eq.${pedido.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ mp_preference_id: mpJson.id }),
    });

    return res.json({ ok: true, numero: pedido.numero, url: mpJson.init_point });
  } catch (e) {
    console.error('varejo/pedido', e.message);
    return res.status(500).json({ erro: 'Não foi possível iniciar o pagamento agora. Tente de novo ou fale pelo WhatsApp.' });
  }
}

// Pedido de modelos de UM fornecedor: o cliente paga por PIX direto a ele. Preços sempre calculados aqui.
async function pedidoFornecedor({ res, c, linhas, produtos, dados }) {
  const [emp] = await sb(`forn_empresas?id=eq.${produtos[0].fornecedor_id}&select=id,nome_fantasia,status,pix_chave,comissao_pct`);
  if (!emp || emp.status !== 'ativo' || !emp.pix_chave) {
    return res.status(400).json({ erro: 'Este fornecedor não está recebendo pedidos agora. Escolha outro modelo ou fale com a loja.' });
  }
  const porId = new Map(produtos.map((p) => [p.id, p]));
  const itens = [];
  for (const l of linhas.values()) {
    const p = porId.get(l.id);
    if (!p || p.revisao !== 'aprovado' || p.estoque_status === 'esgotado' || !(Number(p.preco_fornecedor) > 0)) {
      return res.status(400).json({ erro: 'Um dos produtos não está mais disponível. Atualize o carrinho.' });
    }
    const preco = precoCliente(p.preco_fornecedor, emp.comissao_pct);
    itens.push({
      id: p.id,
      titulo: p.titulo_publico || p.nome,
      tamanho: l.tamanho,
      quantidade: l.quantidade,
      preco,
      preco_fornecedor: r2(p.preco_fornecedor),
      comissao_unit: r2(preco - p.preco_fornecedor),
    });
  }
  const subtotal = r2(itens.reduce((s, i) => s + i.preco * i.quantidade, 0));
  const pfTotal = r2(itens.reduce((s, i) => s + i.preco_fornecedor * i.quantidade, 0));
  const frete = calcularFrete(dados.estado, subtotal);
  const total = r2(subtotal + frete);
  const token = novoToken();
  const [pedido] = await sb('forn_pedidos', {
    method: 'POST',
    body: JSON.stringify({
      token,
      fornecedor_id: emp.id,
      cliente_nome: dados.nome,
      cliente_cpf: dados.cpf,
      aceite_autorizacao_em: new Date().toISOString(),
      email: dados.email,
      whatsapp: dados.whatsapp,
      cep: dados.cep,
      rua: dados.rua,
      numero_casa: dados.numero,
      complemento: dados.complemento || null,
      bairro: dados.bairro,
      cidade: dados.cidade,
      estado: dados.estado,
      observacao: txt(c.observacao, 300) || null,
      itens,
      subtotal,
      preco_fornecedor_total: pfTotal,
      comissao_total: r2(subtotal - pfTotal),
      frete,
      total,
    }),
  });
  await avisar(`🛒 Novo pedido #${pedido.numero} para ${emp.nome_fantasia}: ${brl(total)} (sua comissão ${brl(subtotal - pfTotal)}). Aguardando o PIX do cliente.`);
  return res.json({ ok: true, numero: pedido.numero, url: `/calcados/pagar?t=${token}` });
}
