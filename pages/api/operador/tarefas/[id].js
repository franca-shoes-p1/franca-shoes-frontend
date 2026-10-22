// O operador começa ou entrega a própria tarefa. Aprovar e pagar são só do dono.
import { sb, UUID, txt } from '../../../../lib/varejoServer';
import { exigirOperador } from '../../../../lib/operadorAuth';

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Tarefa inválida.' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    if (!op.aceite_em) return res.status(403).json({ erro: 'Aceite as regras de trabalho primeiro.' });
    const [t] = await sb(`op_tarefas?id=eq.${id}&operario_id=eq.${op.id}&select=id,status,ordem:op_ordens!inner(entrada_confirmada)`);
    if (!t || !t.ordem || !t.ordem.entrada_confirmada) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    const acao = req.body && req.body.acao;
    let d;
    if (acao === 'iniciar') {
      if (!['pendente', 'ajuste'].includes(t.status)) return res.status(400).json({ erro: 'Esta tarefa não pode ser iniciada agora.' });
      d = { status: 'em_andamento' };
    } else if (acao === 'entregar') {
      if (t.status !== 'em_andamento') return res.status(400).json({ erro: 'Inicie a tarefa antes de entregar.' });
      const texto = txt(req.body.texto, 3000);
      if (texto.length < 5) return res.status(400).json({ erro: 'Descreva a entrega ou cole o link do trabalho.' });
      d = { status: 'entregue', entrega_texto: texto, entregue_em: new Date().toISOString(), comentario_revisao: null };
    } else {
      return res.status(400).json({ erro: 'Ação inválida.' });
    }
    const [nova] = await sb(`op_tarefas?id=eq.${id}&operario_id=eq.${op.id}`, { method: 'PATCH', body: JSON.stringify(d) });
    return res.json({ tarefa: { id: nova.id, status: nova.status } });
  } catch (e) {
    console.error('operador/tarefas/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar.' });
  }
}
