// Captação de leads da vitrine: grava nome + WhatsApp na tabela cal_leads (criada por supabase-cal-lotes-portal.sql).
// Só o servidor grava (chave de serviço). Tem campo-armadilha "site" contra robôs e limite de tamanho.
// Opcional: N8N_WEBHOOK_LEADS (+ N8N_WEBHOOK_TOKEN) avisa você quando chegar um lead novo.
import { sb, txt } from '../../../lib/varejoServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (b.site) return res.status(200).json({ ok: true }); // robô: finge que deu certo

    const nome = txt(b.nome, 80);
    const whatsapp = txt(b.whatsapp, 30).replace(/[^\d+]/g, '');
    const digitos = whatsapp.replace(/\D/g, '');
    if (nome.length < 2) return res.status(400).json({ erro: 'Informe seu nome.' });
    if (digitos.length < 10 || digitos.length > 13) return res.status(400).json({ erro: 'Informe o WhatsApp com DDD.' });

    const linha = {
      evento: 'lead',
      nome,
      whatsapp,
      produto_sku: txt(b.interesse, 80) || null,
      entrega: ['rodoviaria', 'correios'].includes(b.entrega) ? b.entrega : null,
      cidade: txt(b.cidade, 80) || null,
      utm_source: txt(b.utm_source, 80) || null,
      utm_medium: txt(b.utm_medium, 80) || null,
      utm_campaign: txt(b.utm_campaign, 80) || null,
      utm_content: txt(b.utm_content, 80) || null,
      pagina: txt(b.pagina, 200) || null,
    };
    await sb('cal_leads', { method: 'POST', body: JSON.stringify(linha), headers: { Prefer: 'return=minimal' } });

    if (process.env.N8N_WEBHOOK_LEADS) {
      try {
        await fetch(process.env.N8N_WEBHOOK_LEADS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-webhook-token': process.env.N8N_WEBHOOK_TOKEN || '' },
          body: JSON.stringify({ evento: 'lead_novo', ...linha }),
        });
      } catch (e) {
        console.error('n8n leads', e.message);
      }
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('leads/captar', e.message);
    return res.status(500).json({ erro: 'Não foi possível registrar agora. Chame no WhatsApp.' });
  }
}
