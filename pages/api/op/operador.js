import { exigir, idNum } from '../../../lib/opAuth';
import { sb, urlOk } from '../../../lib/supabaseServer';

const LIMITE_EM_ANDAMENTO = 3;

// Área do OPERADOR: GET = minhas missões, POST = pegar missão / enviar entrega.
export default async function handler(req, res) {
  try {
    const eu = await exigir(req, res, ['operador', 'dono'], { inativoOk: true });
    if (!eu) return;
    const uid = eu.user.id;

    if (req.method === 'GET') {
      if (!eu.perfil.ativo) {
        return res.status(200).json({ perfil: eu.perfil, pendente: true });
      }
      const [minhas, abertas, pagamentos] = await Promise.all([
        sb(`op_tarefas?select=*&operador_id=eq.${uid}&order=criado_em.desc&limit=200`),
        sb('op_tarefas?select=*&status=eq.aberta&operador_id=is.null&order=criado_em.desc&limit=100'),
        sb(`op_pagamentos?select=*&operador_id=eq.${uid}&order=criado_em.desc&limit=200`),
      ]);
      const pontos = (minhas || []).filter((t) => t.status === 'aprovada').reduce((s, t) => s + (t.pontos || 0), 0);
      return res.status(200).json({ perfil: eu.perfil, pendente: false, minhas, abertas, pagamentos, pontos });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ erro: 'Método não permitido' });
    }
    if (!eu.perfil.ativo) return res.status(403).json({ erro: 'Sua conta ainda não foi aprovada.' });

    const b = req.body || {};
    const id = idNum(b.id);
    if (!id) return res.status(400).json({ erro: 'Missão inválida.' });

    if (b.acao === 'pegar') {
      const ativas = await sb(`op_tarefas?select=id&operador_id=eq.${uid}&status=in.(em_andamento,devolvida)`);
      if (ativas && ativas.length >= LIMITE_EM_ANDAMENTO) {
        return res.status(409).json({ erro: `Termine ou entregue uma missão antes de pegar outra (limite: ${LIMITE_EM_ANDAMENTO} ao mesmo tempo).` });
      }
      // Só pega se ainda estiver aberta e sem dono
      const r = await sb(`op_tarefas?id=eq.${id}&status=eq.aberta&operador_id=is.null`, {
        method: 'PATCH',
        body: { operador_id: uid, status: 'em_andamento' },
        prefer: 'return=representation',
      });
      if (!r || !r.length) return res.status(409).json({ erro: 'Essa missão acabou de ser pega por outra pessoa.' });
      return res.status(200).json({ ok: true });
    }

    if (b.acao === 'entregar') {
      const link = String(b.link || '').trim();
      if (!link || !urlOk(link)) return res.status(400).json({ erro: 'Cole um link que comece com https://' });
      const r = await sb(`op_tarefas?id=eq.${id}&operador_id=eq.${uid}&status=in.(em_andamento,devolvida)`, {
        method: 'PATCH',
        body: { link_entrega: link.slice(0, 500), status: 'em_revisao' },
        prefer: 'return=representation',
      });
      if (!r || !r.length) return res.status(409).json({ erro: 'Não foi possível enviar esta entrega.' });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ erro: 'Ação inválida.' });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
