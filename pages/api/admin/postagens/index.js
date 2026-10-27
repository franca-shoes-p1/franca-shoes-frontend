// Postagens (só o dono): lista a agenda e cadastra postagens novas à mão ou em lote
// (o lote pode vir do próprio Claude no chat, colado em /admin/postagens).
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb } from '../../../../lib/varejoServer';
import { inserirLote } from '../../../../lib/postagens';

const STATUS = ['agendada', 'em_andamento', 'postada', 'pulada', 'cancelada'];

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const filtro = STATUS.includes(req.query.status) ? `&status=eq.${req.query.status}` : '';
      const postagens = await sb(
        `op_postagens?select=*,operador:op_operarios(nome)${filtro}&order=agendada_para.desc&limit=300`
      );
      const todas = await sb(`op_postagens?select=status&agendada_para=gte.${new Date(Date.now() - 24 * 3600 * 1000).toISOString()}&limit=2000`);
      const contagem = {};
      todas.forEach((p) => { contagem[p.status] = (contagem[p.status] || 0) + 1; });
      return res.json({ postagens, contagem });
    }
    if (req.method === 'POST') {
      const c = req.body && typeof req.body === 'object' ? req.body : {};
      const lista = Array.isArray(c.postagens) ? c.postagens : c.postagem ? [c.postagem] : [];
      const r = await inserirLote(lista, { lote: c.lote, origem: c.origem === 'lote' ? 'lote' : 'manual' });
      if (!r.criadas && r.erros.length) return res.status(400).json({ erro: r.erros.slice(0, 3).map((e) => `#${e.indice + 1}: ${e.erro}`).join(' | ') });
      return res.status(201).json(r);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    if (e.publico) return res.status(400).json({ erro: e.message });
    console.error('admin/postagens', e.message);
    const faltaTabela = /op_postagens|does not exist/i.test(String(e.message));
    return res.status(500).json({ erro: faltaTabela ? 'A tabela de postagens ainda não existe: rode o supabase-postagens.sql no Supabase.' : 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
