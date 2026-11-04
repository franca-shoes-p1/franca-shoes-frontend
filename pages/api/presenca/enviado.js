// Para o n8n: marca o post da Presença como publicado depois de enviado ao canal.
import { exigirRadarToken } from '../../../lib/radarToken';
import { sb, UUID } from '../../../lib/varejoServer';

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    if (!UUID.test(b.id || '')) return res.status(400).json({ erro: 'id inválido.' });
    await sb(`mp_conteudos?id=eq.${b.id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'publicado', publicado_em: new Date().toISOString() }) });
    return res.json({ ok: true });
  } catch (e) {
    console.error('presenca/enviado', e.message);
    return res.status(500).json({ erro: String(e.message).slice(0, 120) });
  }
}
