// O que o operador enxerga: só as próprias tarefas, e só de ordens com a entrada do cliente confirmada.
// Nunca devolve valores do cliente, só o que a tarefa paga.
import { sb } from '../../../../lib/varejoServer';
import { exigirOperador } from '../../../../lib/operadorAuth';

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  try {
    if (req.method === 'POST') {
      // Aceite das regras de trabalho (primeiro acesso).
      const c = req.body || {};
      if (c.aceito !== true) return res.status(400).json({ erro: 'Marque que leu e aceita.' });
      await sb(`op_operarios?id=eq.${op.id}`, { method: 'PATCH', body: JSON.stringify({ aceite_em: new Date().toISOString() }) });
      return res.json({ ok: true });
    }
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ erro: 'Método não permitido.' });
    }
    const brutas = await sb(
      `op_tarefas?operario_id=eq.${op.id}&status=neq.cancelada&select=id,setor,titulo,instrucoes,criterio,prazo,valor,status,entrega_texto,comentario_revisao,entregue_em,aprovada_em,paga_em,ordem:op_ordens!inner(numero,cliente,servico,entrada_confirmada)&order=criado_em.desc&limit=200`
    );
    const tarefas = brutas
      .filter((t) => t.ordem && t.ordem.entrada_confirmada)
      .map((t) => ({ ...t, ordem: { numero: t.ordem.numero, cliente: t.ordem.cliente, servico: t.ordem.servico } }));
    return res.json({ operador: { nome: op.nome, setor: op.setor, nivel: op.nivel, aceite_em: op.aceite_em, pode_catalogo: !!op.pode_catalogo, pode_postagens: !!op.pode_postagens }, tarefas });
  } catch (e) {
    console.error('operador/tarefas', e.message);
    return res.status(500).json({ erro: 'Não foi possível carregar.' });
  }
}
