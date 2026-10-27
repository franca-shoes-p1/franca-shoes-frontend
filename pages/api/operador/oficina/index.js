// Tela inicial da Oficina para o operador: cartões liberados, minhas entregas, pontos e benefícios.
import { sb } from '../../../../lib/varejoServer';
import { exigirOperador } from '../../../../lib/operadorAuth';
import { nivelNum, saldoPontos, pontosReservados, CAMPOS_CARTAO } from '../../../../lib/oficina';

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  try {
    const nivel = nivelNum(op.nivel);
    const [cartoes, entregas, extrato, beneficios, resgates, saldo, reservado, vagas, ganhos] = await Promise.all([
      sb(`op_cartoes?ativo=eq.true&nivel_min=lte.${nivel}&select=${CAMPOS_CARTAO.replace(/,(material|passos|checklist|erros|campos|seguranca|avaliacao|pronto_quando)/g, '')}&order=ordem.asc`),
      sb(`op_entregas?operario_id=eq.${op.id}&select=id,cartao_id,status,entregue_em,comentario_revisao,valor,pontos&order=criado_em.desc&limit=200`),
      sb(`op_pontos?operario_id=eq.${op.id}&select=pontos,motivo,criado_em,expira_em&order=criado_em.desc&limit=30`),
      sb('op_beneficios?ativo=eq.true&select=id,nome,descricao,custo_pontos&order=ordem.asc'),
      sb(`op_resgates?operario_id=eq.${op.id}&select=id,status,pontos,criado_em,beneficio:op_beneficios(nome)&order=criado_em.desc&limit=20`),
      saldoPontos(op.id),
      pontosReservados(op.id),
      sb('op_vagas_projeto?aberta=eq.true&select=id,titulo,descricao,empreendimento:op_empreendimentos!inner(nome,publico)&limit=20').catch(() => []),
      sb(`op_pontos?operario_id=eq.${op.id}&pontos=gt.0&select=pontos&limit=5000`).catch(() => []),
    ]);
    const porCartao = {};
    for (const e of entregas) (porCartao[e.cartao_id] = porCartao[e.cartao_id] || []).push(e);
    const lista = cartoes
      .filter((c) => !(c.unica && (porCartao[c.id] || []).some((e) => ['aprovada', 'paga'].includes(e.status))))
      .map((c) => ({ ...c, minhas: porCartao[c.id] || [] }));
    const feitos = cartoes.filter((c) => c.unica && (porCartao[c.id] || []).some((e) => ['aprovada', 'paga'].includes(e.status))).map((c) => c.codigo);
    return res.json({
      operador: { nome: op.nome, setor: op.setor, nivel: op.nivel, aceite_em: op.aceite_em },
      saldo, reservado, disponivel: saldo - reservado, acumulado: ganhos.reduce((s, x) => s + (x.pontos || 0), 0),
      cartoes: lista, feitos, extrato, beneficios, resgates,
      vagas: vagas.filter((v) => v.empreendimento && v.empreendimento.publico).map((v) => ({ id: v.id, titulo: v.titulo, descricao: v.descricao, empreendimento: v.empreendimento.nome })),
    });
  } catch (e) {
    console.error('operador/oficina', e.message);
    return res.status(500).json({ erro: 'Não foi possível carregar.' });
  }
}
