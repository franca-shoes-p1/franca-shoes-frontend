// Painel da Oficina (só o dono): fila de entregas, candidatos, resgates, cartões, benefícios e vitrine.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb } from '../../../../lib/varejoServer';
import { preAvaliar } from '../../../../lib/preavaliacao';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  try {
    const [entregas, candidatos, resgates, cartoes, beneficios, empreendimentos, saldos, chamados, pedidos] = await Promise.all([
      sb('op_entregas?status=in.(entregue,ajuste,aprovada)&select=*,operario:op_operarios(nome,setor,nivel,whatsapp),cartao:op_cartoes(codigo,titulo,checklist,campos,regras)&order=entregue_em.asc&limit=200'),
      sb('op_candidatos?status=in.(novo,chamado)&select=*&order=criado_em.desc&limit=200'),
      sb('op_resgates?status=eq.pendente&select=id,pontos,criado_em,operario:op_operarios(nome,whatsapp),beneficio:op_beneficios(nome)&order=criado_em.asc'),
      sb('op_cartoes?select=id,codigo,titulo,posto_slug,valor,pontos,ativo,nivel_min,campos,regras&order=ordem.asc'),
      sb('op_beneficios?select=id,nome,custo_pontos,ativo&order=ordem.asc'),
      sb('op_empreendimentos?select=*&order=ordem.asc,criado_em.desc'),
      sb('op_saldo_pontos?select=operario_id,saldo'),
      sb('op_chamados?status=eq.aberto&select=id,criado_em,texto,operario:op_operarios(nome,whatsapp)&order=criado_em.desc&limit=200').catch(() => []),
      sb("op_atelie_pedidos?status=in.(novo,em_consultoria,orcamento_enviado,entrada_paga)&select=id,numero,criado_em,nome,whatsapp,servico,descricao,prazo,status&order=criado_em.desc&limit=100").catch(() => []),
    ]);
    for (const e of entregas) e.sugestao = e.status === 'entregue' ? preAvaliar(e.cartao && e.cartao.codigo, e.respostas, e.anexos, e.observacoes, e.cartao && e.cartao.regras) : null;
    return res.json({ entregas, chamados, pedidos, candidatos, resgates, cartoes, beneficios, empreendimentos, total_pontos: saldos.reduce((s, x) => s + x.saldo, 0) });
  } catch (e) {
    console.error('admin/oficina', e.message);
    return res.status(500).json({ erro: 'Não foi possível carregar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) + ' (o SQL da Fase 1 foi rodado?)' });
  }
}
