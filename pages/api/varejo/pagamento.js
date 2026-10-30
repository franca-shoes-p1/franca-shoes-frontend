// Página de pagamento do cliente (pedido de fornecedor). O acesso é pelo link com o código secreto do pedido.
// Nunca devolve a comissão nem dados internos.
import { sb } from '../../../lib/varejoServer';
import { avisar } from '../../../lib/avisar';
import { TOKEN } from '../../../lib/fornecedoresServer';
import { pixCopiaECola } from '../../../lib/pixCopiaCola';
import { lerConfig } from '../../../lib/revendedoresServer';

const COLS = 'id,numero,status,criado_em,itens,subtotal,frete,total,preco_fornecedor_total,pix2_pago_em,cliente_pagou_em,codigo_rastreio,motivo_cancelamento,fornecedor_id';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const t = req.method === 'GET' ? req.query.t : (req.body || {}).t;
    if (!TOKEN.test(String(t || ''))) return res.status(404).json({ erro: 'Link inválido.' });
    const [p] = await sb(`forn_pedidos?token=eq.${t}&select=${COLS}`);
    if (!p) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    const [f] = await sb(`forn_empresas?id=eq.${p.fornecedor_id}&select=nome_fantasia,documento,whatsapp,pix_tipo,pix_chave,pix_nome`);
    if (!f) return res.status(404).json({ erro: 'Pedido não encontrado.' });

    if (req.method === 'POST') {
      if ((req.body || {}).acao !== 'paguei') return res.status(400).json({ erro: 'Ação desconhecida.' });
      if (p.status === 'aguardando_pagamento') {
        await sb(`forn_pedidos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cliente_pagou', cliente_pagou_em: new Date().toISOString() }) });
        await avisar(`💸 Cliente do pedido #${p.numero} (${f.nome_fantasia}) diz que pagou o PIX. O fornecedor precisa confirmar no painel.`);
        p.status = 'cliente_pagou';
      }
    } else if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ erro: 'Método não permitido.' });
    }

    const aPagar = ['aguardando_pagamento', 'cliente_pagou'].includes(p.status);
    // PIX 1: preço do fornecedor, direto a ele. PIX 2: o restante (comissão, margem do revendedor e frete), para o dono da loja.
    const valor1 = Number(p.preco_fornecedor_total);
    const valor2 = Math.round((Number(p.total) - valor1) * 100) / 100;
    const cfg = valor2 > 0 && aPagar ? await lerConfig() : {};
    return res.json({
      pedido: {
        numero: p.numero,
        status: p.status,
        itens: (p.itens || []).map((i) => ({ titulo: i.titulo, tamanho: i.tamanho, quantidade: i.quantidade, preco: i.preco })),
        subtotal: Number(p.subtotal),
        frete: Number(p.frete),
        total: Number(p.total),
        rastreio: p.codigo_rastreio || '',
        motivo: p.status === 'cancelado' ? p.motivo_cancelamento || '' : '',
      },
      fornecedor: {
        nome: f.nome_fantasia,
        cnpj: f.documento && f.documento.length === 14 ? f.documento : '',
        whatsapp: f.whatsapp,
      },
      pix: aPagar && f.pix_chave
        ? { valor: valor1, copiaecola: pixCopiaECola({ tipo: f.pix_tipo, chave: f.pix_chave, nome: f.pix_nome || f.nome_fantasia, cidade: 'FRANCA', valor: valor1, txid: 'PED' + p.numero }), titular: f.pix_nome || f.nome_fantasia }
        : null,
      pix2: aPagar && valor2 > 0 && cfg.pix_chave
        ? { valor: valor2, copiaecola: pixCopiaECola({ tipo: cfg.pix_tipo || 'cpf', chave: cfg.pix_chave, nome: cfg.pix_nome || 'FRANCA CALCADOS', cidade: 'FRANCA', valor: valor2, txid: 'PED' + p.numero + 'B' }), titular: cfg.pix_nome || '' }
        : null,
      pix2Falta: aPagar && valor2 > 0 && !cfg.pix_chave,
      pix2Pago: !!p.pix2_pago_em,
    });
  } catch (e) {
    console.error('varejo/pagamento', e.message);
    return res.status(500).json({ erro: 'Não foi possível abrir o pedido agora.' });
  }
}
