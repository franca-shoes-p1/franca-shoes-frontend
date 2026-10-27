// Programa de Afiliados (servidor): lê o código de divulgação do cookie, registra a indicação e concede os pontos.
// Regra: o afiliado ganha 1 Ponto Oficina por R$ 1,00 do pedido do cliente indicado, só depois que o pagamento é confirmado.
import { sb } from './varejoServer';

const RE = /^[a-z0-9]{6,12}$/i;
const dig = (s) => String(s || '').replace(/\D/g, '').slice(-10);

export function refDoCookie(req) {
  const m = /(?:^|;\s*)ie_ref=([^;]+)/.exec((req && req.headers && req.headers.cookie) || '');
  if (!m) return null;
  let v = '';
  try { v = decodeURIComponent(m[1]); } catch (e) { return null; }
  return RE.test(v) ? v.toLowerCase() : null;
}

// Nunca derruba o pedido ou o cadastro: se falhar, só registra no log.
export async function registrarIndicacao({ req, tipo, pedidoId, candidatoId, nome, whatsapp }) {
  try {
    const ref = refDoCookie(req);
    if (!ref) return null;
    const [a] = await sb(`op_operarios?ref_codigo=eq.${ref}&ativo=eq.true&select=id,whatsapp`);
    if (!a) return null;
    if (dig(a.whatsapp) && dig(a.whatsapp) === dig(whatsapp)) return null; // ninguém indica a si mesmo
    await sb('op_indicacoes', {
      method: 'POST',
      body: JSON.stringify({ afiliado_id: a.id, tipo, pedido_id: pedidoId || null, candidato_id: candidatoId || null, indicado: String(nome || '').slice(0, 120) }),
    });
    return a.id;
  } catch (e) {
    console.error('ref/registrar', e.message);
    return null;
  }
}

// Chamado quando o dono confirma o saldo (pagamento completo) de uma ordem criada a partir de um pedido.
export async function concederIndicacao(ordem) {
  try {
    if (!ordem || !ordem.pedido_id) return;
    const [ind] = await sb(`op_indicacoes?pedido_id=eq.${ordem.pedido_id}&status=eq.registrada&select=id,afiliado_id`);
    if (!ind) return;
    const pts = Math.floor(Number(ordem.valor_total) || 0);
    if (pts <= 0) return;
    const exp = new Date(); exp.setMonth(exp.getMonth() + 12);
    await sb('op_pontos', {
      method: 'POST',
      body: JSON.stringify({ operario_id: ind.afiliado_id, pontos: pts, motivo: `Indicação: pedido #${ordem.numero} pago`, origem: 'indicacao', origem_id: ordem.id, expira_em: exp.toISOString() }),
    });
    await sb(`op_indicacoes?id=eq.${ind.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'paga', valor: pts, pontos: pts, pago_em: new Date().toISOString() }) });
  } catch (e) {
    console.error('ref/conceder', e.message);
  }
}
