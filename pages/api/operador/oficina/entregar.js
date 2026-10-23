// O operador entrega um cartão. Aprovar e pagar são só do dono.
import { sb, UUID, txt } from '../../../../lib/varejoServer';
import { exigirOperador } from '../../../../lib/operadorAuth';
import { nivelNum, historico, CAMPOS_CARTAO } from '../../../../lib/oficina';

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  try {
    if (!op.aceite_em) return res.status(403).json({ erro: 'Aceite as regras de trabalho primeiro.' });
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    if (!UUID.test(String(c.cartao_id || ''))) return res.status(400).json({ erro: 'Cartão inválido.' });
    const [cart] = await sb(`op_cartoes?id=eq.${c.cartao_id}&ativo=eq.true&select=${CAMPOS_CARTAO}`);
    if (!cart || cart.nivel_min > nivelNum(op.nivel)) return res.status(404).json({ erro: 'Cartão não encontrado.' });

    const anteriores = await sb(`op_entregas?operario_id=eq.${op.id}&cartao_id=eq.${cart.id}&select=id,status&order=criado_em.desc`);
    const emAnalise = anteriores.find((e) => e.status === 'entregue');
    if (emAnalise) return res.status(400).json({ erro: 'Sua entrega anterior ainda está em análise.' });
    if (cart.unica && anteriores.some((e) => ['aprovada', 'paga'].includes(e.status))) return res.status(400).json({ erro: 'Este cartão só vale uma vez e você já o concluiu.' });

    const n = cart.checklist.length;
    const checklist = Array.isArray(c.checklist) ? c.checklist.slice(0, n).map((x) => x === true) : [];
    if (checklist.length !== n) return res.status(400).json({ erro: 'Responda todos os itens do checklist.' });
    const respostas = {};
    for (const campo of cart.campos) {
      const v = txt((c.respostas || {})[campo.id], 6000);
      if (v.length < 3) return res.status(400).json({ erro: `Preencha: ${campo.rotulo}` });
      respostas[campo.id] = v;
    }
    const anexos = (Array.isArray(c.anexos) ? c.anexos : []).map((u) => String(u)).filter((u) => /^https:\/\//.test(u)).slice(0, 10);
    const base = process.env.SUPABASE_URL || '';
    if (anexos.some((u) => !u.startsWith(base + '/storage/v1/object/public/'))) return res.status(400).json({ erro: 'Anexo inválido.' });
    if (anexos.length < cart.prints) return res.status(400).json({ erro: `Anexe ${cart.prints} imagem(ns).` });

    const [e] = await sb('op_entregas', {
      method: 'POST',
      body: JSON.stringify({
        operario_id: op.id, cartao_id: cart.id, checklist, respostas, anexos,
        observacoes: txt(c.observacoes, 2000) || null,
        valor: cart.valor, pontos: cart.pontos,
      }),
    });
    await historico(op.id, 'entrega_enviada', { entrega_id: e.id, cartao: cart.codigo });
    return res.status(201).json({ ok: true, id: e.id });
  } catch (e) {
    console.error('operador/oficina/entregar', e.message);
    return res.status(500).json({ erro: 'Não foi possível enviar. Tente de novo.' });
  }
}
