// Compra do passe de 30 dias: cria um pedido do tipo "passe" e abre o pagamento no Mercado Pago (PIX ou cartão).
import { sb, txt, siteUrl } from '../../../lib/varejoServer';
import { carregarConfigAssinatura, emailValido } from '../../../lib/assinaturaServer';

const so_digitos = (v) => String(v ?? '').replace(/\D/g, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-armadilha para robôs
  if (!process.env.MP_ACCESS_TOKEN) return res.status(503).json({ erro: 'Pagamento ainda não configurado. Fale com a loja pelo WhatsApp.' });
  const nome = txt(c.nome, 120);
  const email = txt(c.email, 120).toLowerCase();
  const whatsapp = so_digitos(c.whatsapp).slice(0, 15);
  if (nome.length < 3) return res.status(400).json({ erro: 'Informe seu nome completo.' });
  if (!emailValido(email)) return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  if (whatsapp.length < 10) return res.status(400).json({ erro: 'Informe um WhatsApp com DDD.' });
  try {
    const cfg = await carregarConfigAssinatura();
    const preco = Math.round(cfg.preco_passe * 100) / 100;
    const [pedido] = await sb('varejo_pedidos', {
      method: 'POST',
      body: JSON.stringify({
        tipo: 'passe',
        cliente_nome: nome, email, whatsapp,
        cep: '00000000', rua: 'Passe digital', numero_casa: 's/n', bairro: 'Digital', cidade: 'Digital', estado: 'SP',
        itens: [{ id: 'passe', titulo: 'Passe de assinante (30 dias)', tamanho: '', quantidade: 1, preco }],
        subtotal: preco, frete: 0, total: preco,
      }),
    });
    const base = siteUrl(req);
    const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'passe', title: 'Passe de assinante (30 dias)', quantity: 1, unit_price: preco, currency_id: 'BRL' }],
        payer: { name: nome, email },
        external_reference: pedido.id,
        notification_url: `${base}/api/varejo/webhook`,
        back_urls: {
          success: `${base}/assinar/obrigado?pedido=${pedido.numero}`,
          pending: `${base}/assinar/obrigado?pedido=${pedido.numero}`,
          failure: `${base}/assinar?falhou=1`,
        },
        auto_return: 'approved',
        statement_descriptor: 'FRANCA CALCADOS',
      }),
    });
    const j = await mp.json().catch(() => ({}));
    if (!mp.ok || !j.init_point) throw new Error('mp: ' + JSON.stringify(j).slice(0, 300));
    await sb(`varejo_pedidos?id=eq.${pedido.id}`, { method: 'PATCH', body: JSON.stringify({ mp_preference_id: j.id }) });
    return res.json({ ok: true, url: j.init_point });
  } catch (e) {
    console.error('varejo/passe', e.message);
    return res.status(500).json({ erro: 'Não foi possível abrir o pagamento agora. Tente de novo ou fale pelo WhatsApp.' });
  }
}
