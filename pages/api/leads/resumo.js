// Para o n8n: resumo diário da fila de fábricas para abordar.
import { exigirRadarToken } from '../../../lib/radarToken';
import { sb } from '../../../lib/varejoServer';

export default async function handler(req, res) {
  if (!exigirRadarToken(req, res)) return;
  try {
    const h = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const [novos, retornos, interessados] = await Promise.all([
      sb('forn_leads?status=eq.novo&whatsapp=not.is.null&select=id&limit=500'),
      sb(`forn_leads?status=eq.abordado&proximo_contato=lte.${h}&select=id&limit=500`),
      sb('forn_leads?status=in.(respondeu,interessado)&select=id&limit=500'),
    ]);
    const texto = `🏭 Fábricas hoje: ${Math.min(novos.length, 15)} para abordar, ${retornos.length} retorno(s) a fazer, ${interessados.length} conversa(s) em andamento. Abra o painel: Guia de fornecedores → Fila de hoje.`;
    return res.json({ novos: novos.length, retornos: retornos.length, interessados: interessados.length, texto });
  } catch (e) {
    return res.status(500).json({ erro: 'Falhou.', texto: '⚠️ Não consegui montar o resumo das fábricas.' });
  }
}
