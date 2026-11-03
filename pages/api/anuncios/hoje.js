// Para o n8n: lembrete diário no Telegram com os anúncios aprovados que estão agendados para hoje (ou atrasados).
import { exigirRadarToken } from '../../../lib/radarToken';
import { sb } from '../../../lib/varejoServer';
import { CANAIS_ANUNCIO } from '../../../lib/anuncios';

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  try {
    const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const posts = await sb(`rf_anuncios?status=eq.aprovado&agendado_para=lte.${hoje}&select=canal,cidade,titulo,texto&order=agendado_para&limit=8`);
    if (!posts.length) return res.json({ quantidade: 0, texto: '📣 Anúncios de hoje: nada agendado. Gere novos em /admin/anuncios.' });
    const corpo = posts.map((p, i) => `${i + 1}) ${(CANAIS_ANUNCIO[p.canal] || {}).nome || p.canal}${p.cidade ? ' · ' + p.cidade : ''}\n${String(p.texto).slice(0, 380)}`).join('\n\n');
    const texto = `📣 Anúncios de hoje (${posts.length}). Copie, poste e marque como publicado em /admin/anuncios:\n\n${corpo}`.slice(0, 3800);
    return res.json({ quantidade: posts.length, texto });
  } catch (e) {
    return res.status(500).json({ erro: 'Falhou.', texto: '⚠️ Não consegui montar os anúncios de hoje (rode o SQL supabase-anuncios.sql).' });
  }
}
