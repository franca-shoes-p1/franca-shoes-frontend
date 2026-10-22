// Tarefa: o dono atribui operador/valor/prazo e decide aprovar, pedir ajuste ou marcar como paga.
// Regra do negócio, imposta aqui no servidor: só se paga tarefa APROVADA e com a parte do cliente já paga.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID, txt } from '../../../../lib/varejoServer';

const data = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? v : null);

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Tarefa inválida.' });
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    const [t] = await sb(`op_tarefas?id=eq.${id}&select=*,ordem:op_ordens(entrada_confirmada,saldo_confirmado)`);
    if (!t) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    const d = {};

    if (c.operario_id !== undefined) {
      if (c.operario_id === null || c.operario_id === '') d.operario_id = null;
      else {
        if (!UUID.test(String(c.operario_id))) return res.status(400).json({ erro: 'Operador inválido.' });
        const [op] = await sb(`op_operarios?id=eq.${c.operario_id}&ativo=eq.true&select=id`);
        if (!op) return res.status(400).json({ erro: 'Operador não encontrado ou inativo.' });
        d.operario_id = op.id;
      }
    }
    if (c.valor !== undefined) {
      let s = String(c.valor ?? '').replace(/[^\d,.-]/g, '');
      if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
      const n = parseFloat(s);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ erro: 'Valor inválido.' });
      d.valor = Math.round(n * 100) / 100;
    }
    if (c.prazo !== undefined) d.prazo = data(c.prazo);
    if (c.titulo !== undefined && txt(c.titulo, 160)) d.titulo = txt(c.titulo, 160);
    if (c.instrucoes !== undefined) d.instrucoes = txt(c.instrucoes, 2000) || null;
    if (c.criterio !== undefined) d.criterio = txt(c.criterio, 1000) || null;

    const acao = c.acao;
    if (acao === 'aprovar') {
      if (t.status !== 'entregue') return res.status(400).json({ erro: 'Só dá para aprovar uma tarefa entregue.' });
      d.status = 'aprovada';
      d.aprovada_em = new Date().toISOString();
    } else if (acao === 'ajuste') {
      if (t.status !== 'entregue') return res.status(400).json({ erro: 'Só dá para pedir ajuste de uma tarefa entregue.' });
      const com = txt(c.comentario, 1000);
      if (!com) return res.status(400).json({ erro: 'Diga o que precisa ajustar.' });
      d.status = 'ajuste';
      d.comentario_revisao = com;
    } else if (acao === 'pagar') {
      if (t.status !== 'aprovada') return res.status(400).json({ erro: 'Só se paga tarefa aprovada.' });
      if (!t.operario_id) return res.status(400).json({ erro: 'A tarefa não tem operador.' });
      const o = t.ordem || {};
      if (!o.entrada_confirmada) return res.status(400).json({ erro: 'O cliente ainda não pagou a entrada.' });
      if (t.depende_saldo && !o.saldo_confirmado) return res.status(400).json({ erro: 'Esta tarefa só é paga depois do saldo do cliente.' });
      d.status = 'paga';
      d.paga_em = new Date().toISOString();
    } else if (acao === 'cancelar') {
      if (t.status === 'paga') return res.status(400).json({ erro: 'Tarefa já paga não pode ser cancelada.' });
      d.status = 'cancelada';
    } else if (acao === 'reabrir') {
      if (t.status !== 'cancelada') return res.status(400).json({ erro: 'Só dá para reabrir tarefa cancelada.' });
      d.status = 'pendente';
    } else if (acao !== undefined) {
      return res.status(400).json({ erro: 'Ação inválida.' });
    }

    // Trocar o operador de uma tarefa já em andamento devolve ela para "pendente".
    if (d.operario_id !== undefined && d.operario_id !== t.operario_id && ['em_andamento', 'entregue', 'ajuste'].includes(t.status) && !d.status) d.status = 'pendente';
    if (!Object.keys(d).length) return res.status(400).json({ erro: 'Nada para alterar.' });
    const [nova] = await sb(`op_tarefas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
    return res.json({ tarefa: nova });
  } catch (e) {
    console.error('admin/tarefas/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
