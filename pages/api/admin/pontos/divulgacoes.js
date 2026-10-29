import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID } from '../../../../lib/varejoServer';

// Divulgações digitais enviadas pelos parceiros (GET) e decisão do admin (POST).
export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const divulgacoes = await sb('rf_divulgacoes?status=eq.pendente&select=id,ponto_id,semana,canal,link,obs,criado_em&order=criado_em.asc&limit=100');
      const trocas = await sb('rf_trocas?status=eq.aceita&select=id,de_id,para_id,criado_em&order=criado_em.desc&limit=50');
      return res.json({ divulgacoes, trocas });
    }
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const { id, decisao } = req.body || {};
    if (!UUID.test(String(id || ''))) return res.status(400).json({ erro: 'Divulgação inválida.' });
    const novo = decisao === 'aprovar' ? 'aprovado' : decisao === 'reprovar' ? 'reprovado' : null;
    if (!novo) return res.status(400).json({ erro: 'Decisão inválida.' });
    const r = await sb(`rf_divulgacoes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: novo }) });
    return res.json({ divulgacao: r[0] });
  } catch (e) {
    return res.json(req.method === 'GET' ? { divulgacoes: [], trocas: [], aviso: 'Rode o SQL supabase-pontos-trocas.sql no Supabase.' } : { erro: 'Não foi possível concluir.' });
  }
}
