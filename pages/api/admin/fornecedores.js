// Painel do dono: aprovar fornecedores e modelos, acompanhar pedidos (coleta e envio) e fazer o acerto semanal.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { COLS_EMPRESA, COLS_PRODUTO, recalcularPrecos } from '../../../lib/fornecedoresServer';
import { numeroBR } from '../../../lib/produtosAdmin';
import { r2 } from '../../../lib/fornecedores';

async function carregar() {
  let empresas;
  try { empresas = await sb(`forn_empresas?select=${COLS_EMPRESA},token&order=criado_em.desc&limit=300`); }
  catch (e) { return { semSql: true, empresas: [], produtos: [], pedidos: [], acertos: [] }; }
  const [produtos, pedidos] = await Promise.all([
    sb(`rf_produtos?fornecedor_id=not.is.null&select=${COLS_PRODUTO},fornecedor_id&order=criado_em.desc&limit=500`).catch(() => []),
    sb('forn_pedidos?select=*&order=criado_em.desc&limit=300').catch(() => []),
  ]);
  const acertos = empresas.map((e) => {
    const l = pedidos.filter((p) => p.fornecedor_id === e.id && ['enviado', 'entregue'].includes(p.status) && !p.comissao_acertada_em);
    const comissao = r2(l.reduce((s, p) => s + Number(p.comissao_total || 0), 0));
    const postagem = r2(l.reduce((s, p) => s + Number(p.custo_postagem || 0), 0));
    return { fornecedor_id: e.id, pedidos: l.length, semCusto: l.filter((p) => p.modo_entrega !== 'rota' && p.custo_postagem == null).length, comissao, postagem, total: r2(comissao + postagem) };
  }).filter((a) => a.pedidos > 0);
  return { empresas, produtos, pedidos, acertos };
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.json(await carregar());
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const b = req.body || {};
    const id = String(b.id || '');
    const agora = new Date().toISOString();

    if (b.acao === 'empresa_estado') {
      if (!UUID.test(id) || !['pendente', 'ativo', 'pausado', 'recusado'].includes(b.estado)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`forn_empresas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: b.estado }) });
      if (b.estado !== 'ativo') await sb(`rf_produtos?fornecedor_id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ativo: false, publicado: false }) });
      else await sb(`rf_produtos?fornecedor_id=eq.${id}&revisao=eq.aprovado`, { method: 'PATCH', body: JSON.stringify({ ativo: true, publicado: true }) });
    } else if (b.acao === 'empresa_comissao') {
      const pct = numeroBR(b.pct);
      if (!UUID.test(id) || !(pct >= 0 && pct <= 60)) return res.status(400).json({ erro: 'A comissão precisa estar entre 0 e 60%.' });
      await sb(`forn_empresas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ comissao_pct: r2(pct) }) });
      await recalcularPrecos(id, pct);
    } else if (b.acao === 'empresa_nota') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`forn_empresas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ observacao_interna: txt(b.texto, 500) || null }) });
    } else if (b.acao === 'produto_revisao') {
      if (!UUID.test(id) || !['aprovar', 'reprovar'].includes(b.decisao)) return res.status(400).json({ erro: 'Dados inválidos.' });
      const ok = b.decisao === 'aprovar';
      const [p] = await sb(`rf_produtos?id=eq.${id}&fornecedor_id=not.is.null&select=fornecedor_id`);
      if (!p) return res.status(404).json({ erro: 'Modelo não encontrado.' });
      const [e] = await sb(`forn_empresas?id=eq.${p.fornecedor_id}&select=status`);
      if (ok && (!e || e.status !== 'ativo')) return res.status(400).json({ erro: 'Aprove primeiro o fornecedor.' });
      await sb(`rf_produtos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ revisao: ok ? 'aprovado' : 'reprovado', publicado: ok, ativo: ok }) });
    } else if (b.acao === 'pedido') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      const [p] = await sb(`forn_pedidos?id=eq.${id}&select=id,status,modo_entrega`);
      if (!p) return res.status(404).json({ erro: 'Pedido não encontrado.' });
      let patch = null;
      if (b.passo === 'coletado' && p.status === 'pronto_coleta') patch = { status: 'coletado', coletado_em: agora };
      else if (b.passo === 'enviado' && ['pronto_coleta', 'coletado'].includes(p.status)) {
        const rastreio = txt(b.rastreio, 40).toUpperCase();
        const custo = numeroBR(b.custo);
        if (rastreio.length < 8) return res.status(400).json({ erro: 'Informe o código de rastreio dos Correios.' });
        if (!(custo >= 0 && custo < 1000)) return res.status(400).json({ erro: 'Informe o custo real da postagem (pode ser 0).' });
        patch = { status: 'enviado', enviado_em: agora, codigo_rastreio: rastreio, custo_postagem: r2(custo), ...(p.status === 'pronto_coleta' ? { coletado_em: agora } : {}) };
      } else if (b.passo === 'entregue' && (p.status === 'enviado' || (p.status === 'coletado' && p.modo_entrega === 'rota'))) patch = { status: 'entregue', entregue_em: agora };
      else if (b.passo === 'cancelar' && p.status !== 'entregue' && p.status !== 'cancelado') {
        const motivo = txt(b.motivo, 200);
        if (motivo.length < 5) return res.status(400).json({ erro: 'Escreva o motivo do cancelamento.' });
        patch = { status: 'cancelado', motivo_cancelamento: motivo };
      } else if (b.passo === 'entrega') {
        if (!['a_definir', 'rota', 'correios'].includes(b.modo)) return res.status(400).json({ erro: 'Modo de entrega inválido.' });
        patch = { modo_entrega: b.modo, local_entrega: txt(b.local, 250) || null };
        if (b.modo === 'rota' && !patch.local_entrega) return res.status(400).json({ erro: 'Informe o local de entrega (rodoviária ou endereço do revendedor) que vai na nota.' });
      } else if (b.passo === 'nota') patch = { nota_interna: txt(b.texto, 500) || null };
      else return res.status(400).json({ erro: 'Esse passo não está disponível para a situação atual do pedido.' });
      await sb(`forn_pedidos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    } else if (b.acao === 'acertar') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`forn_pedidos?fornecedor_id=eq.${id}&status=in.(enviado,entregue)&comissao_acertada_em=is.null`, { method: 'PATCH', body: JSON.stringify({ comissao_acertada_em: agora }) });
    } else {
      return res.status(400).json({ erro: 'Ação desconhecida.' });
    }
    return res.json(await carregar());
  } catch (e) {
    console.error('admin/fornecedores', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 200) });
  }
}
