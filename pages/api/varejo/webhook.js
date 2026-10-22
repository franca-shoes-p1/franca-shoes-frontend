// Aviso automático do Mercado Pago ("o pagamento mudou de status").
// Não confiamos no que chega: usamos só o número do pagamento e consultamos o Mercado Pago com a nossa chave.
import { sb, UUID } from '../../../lib/varejoServer';

const STATUS = {
  approved: 'pago',
  authorized: 'pago',
  pending: 'aguardando_pagamento',
  in_process: 'aguardando_pagamento',
  in_mediation: 'aguardando_pagamento',
  rejected: 'pagamento_recusado',
  cancelled: 'cancelado',
  refunded: 'reembolsado',
  charged_back: 'reembolsado',
};

export default async function handler(req, res) {
  // Respondemos 200 quando o aviso foi tratado e 500 em falha temporária (aí o Mercado Pago reenvia).
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end();
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(200).json({ ok: false });

    const tipo = req.query.type || req.query.topic || req.body?.type || req.body?.topic;
    const idPagamento = String(req.query['data.id'] || req.query.id || req.body?.data?.id || '').replace(/\D/g, '');
    if (tipo !== 'payment' || !idPagamento) return res.status(200).json({ ok: true });

    const r = await fetch(`https://api.mercadopago.com/v1/payments/${idPagamento}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return res.status(500).json({ ok: false }); // o Mercado Pago tenta de novo
    const pg = await r.json();

    const ref = String(pg.external_reference || '');
    if (!UUID.test(ref)) return res.status(200).json({ ok: true });

    const [pedido] = await sb(`varejo_pedidos?select=*&id=eq.${ref}`);
    if (!pedido) return res.status(200).json({ ok: true });

    let novo = STATUS[pg.status] || pedido.status;
    // Segurança: só vira "pago" se o valor pago bate com o total do pedido.
    if (novo === 'pago' && Math.abs(Number(pg.transaction_amount) - Number(pedido.total)) > 0.01) {
      novo = 'valor_divergente';
    }
    // Nunca volta um pedido já enviado/entregue para um status anterior.
    const protegido = ['em_compra_fabrica', 'enviado', 'entregue'];
    if (protegido.includes(pedido.status) && novo !== 'reembolsado') novo = pedido.status;

    if (novo !== pedido.status || String(pedido.mp_payment_id || '') !== idPagamento) {
      await sb(`varejo_pedidos?id=eq.${ref}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: novo,
          mp_payment_id: idPagamento,
          mp_status: pg.status,
          pago_em: novo === 'pago' ? new Date().toISOString() : pedido.pago_em || null,
        }),
      });
    }

    // Aviso opcional (n8n -> WhatsApp) na primeira vez que o pedido vira "pago".
    if (novo === 'pago' && pedido.status !== 'pago' && process.env.N8N_WEBHOOK_VAREJO) {
      try {
        await fetch(process.env.N8N_WEBHOOK_VAREJO, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-webhook-token': process.env.N8N_WEBHOOK_TOKEN || '' },
          body: JSON.stringify({
            evento: 'pedido_pago',
            numero: pedido.numero,
            cliente: pedido.cliente_nome,
            whatsapp: pedido.whatsapp,
            cidade: `${pedido.cidade}/${pedido.estado}`,
            total: pedido.total,
            itens: pedido.itens,
          }),
        });
      } catch (e) {
        console.error('n8n varejo', e.message);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('varejo/webhook', e.message);
    return res.status(500).json({ ok: false }); // o Mercado Pago tenta de novo
  }
}
