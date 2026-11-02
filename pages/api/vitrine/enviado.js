// Para o n8n: marca um texto da fila como enviado depois de publicar no canal.
import { exigirRadarToken } from '../../../lib/radarToken';
import { sb, UUID } from '../../../lib/varejoServer';

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const id = String((req.body && req.body.id) || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
  try {
    await sb(`vit_divulgacoes?id=eq.${id}&status=eq.pendente`, { method: 'PATCH', body: JSON.stringify({ status: 'enviado', concluido_em: new Date().toISOString() }) });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível marcar.' });
  }
}
