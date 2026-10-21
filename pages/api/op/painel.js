import { exigir, idNum } from '../../../lib/opAuth';
import { sb, UUID } from '../../../lib/supabaseServer';

const STATUS_CANDIDATO = ['novo', 'em_teste', 'aprovado', 'banco_de_talentos', 'recusado'];
const SETORES = ['prospeccao', 'atendimento', 'montagem', 'conteudo', 'revisao', 'pesquisa', 'implantacao'];

// Área do DONO: GET = dados do painel, POST = ações.
export default async function handler(req, res) {
  try {
    const eu = await exigir(req, res, ['dono']);
    if (!eu) return;

    if (req.method === 'GET') {
      const [candidatos, operadores, leads, tarefas, pagamentos, catalogo] = await Promise.all([
        sb('op_candidatos?select=*&order=criado_em.desc&limit=100'),
        sb('op_perfis?select=*&papel=eq.operador&order=criado_em.desc&limit=200'),
        sb('op_leads_clientes?select=*&order=criado_em.desc&limit=100'),
        sb('op_tarefas?select=*&order=criado_em.desc&limit=300'),
        sb('op_pagamentos?select=*&order=criado_em.desc&limit=300'),
        sb('op_catalogo_produtos?select=id,modulo,nome,setor,preco_a_partir,ativo&order=ordem.asc&limit=100'),
      ]);
      return res.status(200).json({ perfil: eu.perfil, candidatos, operadores, leads, tarefas, pagamentos, catalogo });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ erro: 'Método não permitido' });
    }

    const b = req.body || {};
    const acao = b.acao;

    if (acao === 'aprovar_operador') {
      if (!UUID.test(String(b.id))) return res.status(400).json({ erro: 'Operador inválido.' });
      await sb(`op_perfis?id=eq.${b.id}&papel=eq.operador`, { method: 'PATCH', body: { ativo: !!b.ativo }, prefer: 'return=minimal' });
      return res.status(200).json({ ok: true });
    }

    if (acao === 'candidato_status') {
      const id = idNum(b.id);
      if (!id || !STATUS_CANDIDATO.includes(b.status)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`op_candidatos?id=eq.${id}`, { method: 'PATCH', body: { status: b.status }, prefer: 'return=minimal' });
      return res.status(200).json({ ok: true });
    }

    if (acao === 'criar_tarefa') {
      const titulo = String(b.titulo || '').trim().slice(0, 200);
      const setor = SETORES.includes(b.setor) ? b.setor : null;
      const valor = Math.max(0, Number(b.valor_fixo) || 0);
      const pontos = Math.max(0, Math.min(100, parseInt(b.pontos, 10) || 0));
      const produto = b.produto_id ? idNum(b.produto_id) : null;
      if (titulo.length < 3 || !setor) return res.status(400).json({ erro: 'Informe o título e o setor.' });
      const linha = { titulo, setor, valor_fixo: valor, pontos, status: 'aberta' };
      if (produto) linha.produto_id = produto;
      await sb('op_tarefas', { method: 'POST', body: linha, prefer: 'return=minimal' });
      return res.status(200).json({ ok: true });
    }

    if (acao === 'decidir_tarefa') {
      const id = idNum(b.id);
      if (!id || !['aprovar', 'devolver'].includes(b.decisao)) return res.status(400).json({ erro: 'Dados inválidos.' });
      const linhas = await sb(`op_tarefas?id=eq.${id}&select=*`);
      const t = linhas && linhas[0];
      if (!t || t.status !== 'em_revisao') return res.status(409).json({ erro: 'Esta tarefa não está aguardando revisão.' });
      if (b.decisao === 'devolver') {
        await sb(`op_tarefas?id=eq.${id}&status=eq.em_revisao`, {
          method: 'PATCH',
          body: { status: 'devolvida', comentario_revisao: String(b.comentario || '').slice(0, 500) },
          prefer: 'return=minimal',
        });
        return res.status(200).json({ ok: true });
      }
      // Aprovar: muda o status (só se ainda estiver em revisão) e gera o pagamento pendente
      const mudou = await sb(`op_tarefas?id=eq.${id}&status=eq.em_revisao`, {
        method: 'PATCH',
        body: { status: 'aprovada', aprovada_em: new Date().toISOString(), comentario_revisao: String(b.comentario || '').slice(0, 500) || null },
        prefer: 'return=representation',
      });
      if (mudou && mudou.length && t.operador_id && Number(t.valor_fixo) > 0) {
        const interno = !t.pedido_id;
        await sb('op_pagamentos', {
          method: 'POST',
          body: {
            operador_id: t.operador_id,
            tarefa_id: t.id,
            tipo: 'producao',
            valor: t.valor_fixo,
            referencia: interno ? 'Crédito a pagar (produto interno)' : 'Pedido de cliente',
            status: 'pendente',
          },
          prefer: 'return=minimal',
        });
      }
      return res.status(200).json({ ok: true });
    }

    if (acao === 'marcar_pago') {
      const id = idNum(b.id);
      if (!id) return res.status(400).json({ erro: 'Pagamento inválido.' });
      await sb(`op_pagamentos?id=eq.${id}&status=eq.pendente`, {
        method: 'PATCH',
        body: { status: 'pago', pago_em: new Date().toISOString() },
        prefer: 'return=minimal',
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ erro: 'Ação inválida.' });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
