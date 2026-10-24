// O operador pede um benefício. O dono aprova; os pontos só saem na aprovação, mas ficam reservados.
import { sb, UUID } from '../../../../lib/varejoServer';
import { exigirOperador } from '../../../../lib/operadorAuth';
import { saldoPontos, pontosReservados, historico } from '../../../../lib/oficina';

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  try {
    const id = String((req.body && req.body.beneficio_id) || '');
    if (!UUID.test(id)) return res.status(400).json({ erro: 'Benefício inválido.' });
    const [b] = await sb(`op_beneficios?id=eq.${id}&ativo=eq.true&select=id,nome,custo_pontos`);
    if (!b) return res.status(404).json({ erro: 'Benefício não encontrado.' });
    const disp = (await saldoPontos(op.id)) - (await pontosReservados(op.id));
    if (disp < b.custo_pontos) return res.status(400).json({ erro: `Pontos insuficientes (faltam ${b.custo_pontos - disp}).` });
    const [r] = await sb('op_resgates', { method: 'POST', body: JSON.stringify({ operario_id: op.id, beneficio_id: b.id, pontos: b.custo_pontos }) });
    await historico(op.id, 'resgate_pedido', { resgate_id: r.id, beneficio: b.nome });
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('operador/oficina/resgatar', e.message);
    return res.status(500).json({ erro: 'Não foi possível pedir agora.' });
  }
}
