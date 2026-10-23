// Um cartão completo (para o operador que tem nível para ele).
import { sb, UUID } from '../../../../lib/varejoServer';
import { exigirOperador } from '../../../../lib/operadorAuth';
import { nivelNum, CAMPOS_CARTAO } from '../../../../lib/oficina';

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Cartão inválido.' });
  try {
    const [c] = await sb(`op_cartoes?id=eq.${id}&ativo=eq.true&select=${CAMPOS_CARTAO}`);
    if (!c || c.nivel_min > nivelNum(op.nivel)) return res.status(404).json({ erro: 'Cartão não encontrado.' });
    const minhas = await sb(`op_entregas?operario_id=eq.${op.id}&cartao_id=eq.${id}&select=id,status,entregue_em,comentario_revisao,respostas,observacoes,checklist,anexos&order=criado_em.desc&limit=10`);
    return res.json({ cartao: c, minhas, aceite_em: op.aceite_em });
  } catch (e) {
    console.error('operador/oficina/cartao', e.message);
    return res.status(500).json({ erro: 'Não foi possível carregar.' });
  }
}
