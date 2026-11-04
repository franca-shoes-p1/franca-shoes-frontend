// Máquina de Presença: registra 1 visita por página e canal (sem cookie e sem dado pessoal).
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
    const [segmento_id, cidade_id, canal_id] = await Promise.all([
      SLUG.test(b.segmento || '') ? idPor('mp_segmentos', 'slug', b.segmento) : null,
      SLUG.test(b.cidade || '') ? idPor('mp_cidades', 'slug', b.cidade) : null,
      CODIGO.test(b.canal || '') ? idPor('mp_canais', 'codigo', b.canal) : null,
    ]);
    await sb('mp_eventos', {
      method: 'POST',
      prefer: 'return=minimal',
      body: JSON.stringify({ tipo: 'visita', canal_id, segmento_id, cidade_id, pagina: txt(b.pagina, 200) || null }),
    });
  } catch (e) { console.error('presenca/visita', e.message); }
  return res.status(200).json({ ok: true }); // nunca atrapalha o visitante
}
