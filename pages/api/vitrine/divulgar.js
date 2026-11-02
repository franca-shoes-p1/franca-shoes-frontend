// Para o n8n: cria a fila de divulgação do dia. Devolve "texto" (resumo para você) e "posts_telegram" (publicar no canal).
import { exigirRadarToken } from '../../../lib/radarToken';
import { gerarDivulgacao, textoDivulgacao } from '../../../lib/vitrineServer';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const r = await gerarDivulgacao();
    return res.json({ ...r, posts_telegram: r.auto || [], texto: textoDivulgacao(r) });
  } catch (e) {
    console.error('vitrine/divulgar', e.message);
    return res.status(500).json({ erro: 'Falhou: ' + String(e.message).slice(0, 120), texto: '⚠️ A divulgação da vitrine não funcionou hoje.' });
  }
}
