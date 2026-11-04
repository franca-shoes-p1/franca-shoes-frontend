// Máquina de Presença: grava o lead na tabela mp_leads (e um evento em mp_eventos).
// Só o servidor grava (chave de serviço). Campo-armadilha "site" contra robôs. Exige consentimento (LGPD).
// Opcional: N8N_WEBHOOK_LEADS (+ N8N_WEBHOOK_TOKEN) avisa quando chegar um lead novo.
import { sb, txt } from '../../../lib/varejoServer';

const SLUG = /^[a-z0-9-]{2,60}$/;
const CODIGO = /^[a-z0-9_]{2,40}$/;

async function idPor(tabela, campo, valor) {
  if (!valor) return null;
  const [r] = (await sb(`${tabela}?${campo}=eq.${encodeURIComponent(valor)}&select=id&limit=1`)) || [];
  return r ? r.id : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (b.site) return res.status(200).json({ ok: true }); // robô: finge que deu certo

    const nome = txt(b.nome, 80);
    const telefone = txt(b.telefone, 30).replace(/[^\d+]/g, '');
    const digitos = telefone.replace(/\D/g, '');
    const email = txt(b.email, 120).toLowerCase();
    if (nome.length < 2) return res.status(400).json({ erro: 'Informe seu nome.' });
    if (digitos.length < 10 || digitos.length > 13) return res.status(400).json({ erro: 'Informe o WhatsApp com DDD.' });
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
    if (b.consentimento !== true) return res.status(400).json({ erro: 'Marque a autorização para receber nosso contato.' });

    const segSlug = SLUG.test(b.segmento || '') ? b.segmento : '';
    const cidSlug = SLUG.test(b.cidade || '') ? b.cidade : '';
    const canalCod = CODIGO.test(b.canal || '') ? b.canal : 'site_igreja_eco';

    const [segmento_id, cidade_id, canal_id] = await Promise.all([
      idPor('mp_segmentos', 'slug', segSlug),
      idPor('mp_cidades', 'slug', cidSlug),
      idPor('mp_canais', 'codigo', canalCod).then((id) => id || idPor('mp_canais', 'codigo', 'site_igreja_eco')),
    ]);

    const linha = {
      nome,
      empresa: txt(b.empresa, 120) || null,
      telefone,
      email: email || null,
      segmento_id,
      cidade_id,
      canal_id,
      origem_ref: txt(b.ref, 40) || null,
      interesse: txt(b.interesse, 120) || null,
      consentimento: true,
      etapa: 'novo',
    };
    const [lead] = (await sb('mp_leads', { method: 'POST', body: JSON.stringify(linha), prefer: 'return=representation' })) || [];

    try {
      await sb('mp_eventos', {
        method: 'POST',
        prefer: 'return=minimal',
        body: JSON.stringify({ tipo: 'lead', canal_id, segmento_id, cidade_id, lead_id: lead ? lead.id : null, pagina: txt(b.pagina, 200) || null }),
      });
    } catch (e) { console.error('presenca/evento', e.message); }

    if (process.env.N8N_WEBHOOK_LEADS) {
      try {
        await fetch(process.env.N8N_WEBHOOK_LEADS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-webhook-token': process.env.N8N_WEBHOOK_TOKEN || '' },
          body: JSON.stringify({ evento: 'presenca_lead_novo', nome, empresa: linha.empresa, telefone, segmento: segSlug, cidade: cidSlug, canal: canalCod, interesse: linha.interesse }),
        });
      } catch (e) { console.error('n8n presenca', e.message); }
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('presenca/captar', e.message);
    return res.status(500).json({ erro: 'Não foi possível registrar agora. Chame no WhatsApp.' });
  }
}
