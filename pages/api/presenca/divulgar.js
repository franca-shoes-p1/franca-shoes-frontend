// Para o n8n: devolve o post do dia da Máquina de Presença (segmento do dia + link rastreável) e registra em mp_conteudos.
// Chamar de novo no mesmo dia devolve o mesmo post (se ainda pendente) ou nada (se já publicado).
import { exigirRadarToken } from '../../../lib/radarToken';
import { sb } from '../../../lib/varejoServer';
import { postDoDia, dataBR } from '../../../lib/presencaPosts';

const CANAL = 'telegram_vitrine';

async function idPor(tabela, campo, valor) {
  const [r] = (await sb(`${tabela}?${campo}=eq.${encodeURIComponent(valor)}&select=id&limit=1`)) || [];
  return r ? r.id : null;
}

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const p = postDoDia({ canal: CANAL });
    const [segmento_id, canal_id] = await Promise.all([idPor('mp_segmentos', 'slug', p.segmento), idPor('mp_canais', 'codigo', CANAL)]);
    if (!segmento_id || !canal_id) {
      return res.status(500).json({ erro: 'Faltam linhas em mp_segmentos ou mp_canais (rode o SQL da etapa 1).', texto: '⚠️ Presença: faltam segmentos ou canais no Supabase.' });
    }

    // Já existe post de hoje para este segmento e canal?
    const inicio = `${dataBR()}T03:00:00.000Z`; // 00:00 de Brasília
    const [ja] = (await sb(`mp_conteudos?segmento_id=eq.${segmento_id}&canal_id=eq.${canal_id}&criado_em=gte.${inicio}&select=id,status,texto,link,titulo&order=criado_em.desc&limit=1`)) || [];
    if (ja) {
      if (ja.status === 'publicado') return res.json({ posts_telegram: [], texto: `📣 Presença: o post de hoje (${p.segmento}) já foi publicado.` });
      return res.json({ posts_telegram: [{ id: ja.id, texto: ja.texto }], texto: `📣 Presença: post de hoje (${p.segmento}) reenviado.` });
    }

    const [novo] = (await sb('mp_conteudos', {
      method: 'POST',
      prefer: 'return=representation',
      body: JSON.stringify({ segmento_id, canal_id, titulo: p.titulo, texto: p.texto, link: p.link, status: 'pendente' }),
    })) || [];
    return res.json({ posts_telegram: [{ id: novo.id, texto: p.texto }], texto: `📣 Presença: publicando hoje "${p.titulo}".` });
  } catch (e) {
    console.error('presenca/divulgar', e.message);
    return res.status(500).json({ erro: String(e.message).slice(0, 120), texto: '⚠️ A divulgação da Presença não funcionou.' });
  }
}
