// Painel do fornecedor: o acesso é pelo link secreto (token). Lê tudo e executa as ações do fornecedor.
import { sb, UUID, txt } from '../../../lib/varejoServer';
import { avisar } from '../../../lib/avisar';
import { acharEmpresa, validarEmpresaBasica, validarModeloFornecedor, COLS_PRODUTO } from '../../../lib/fornecedoresServer';
import { r2 } from '../../../lib/fornecedores';

const COLS_PEDIDO =
  'id,numero,criado_em,status,cliente_nome,cliente_cpf,modo_entrega,local_entrega,aceite_autorizacao_em,whatsapp,cep,rua,numero_casa,complemento,bairro,cidade,estado,observacao,itens,subtotal,preco_fornecedor_total,comissao_total,frete,total,cliente_pagou_em,pago_em,nota_na_embalagem,pronto_em,coletado_em,enviado_em,entregue_em,codigo_rastreio,custo_postagem,motivo_cancelamento,comissao_acertada_em';

async function carregar(e) {
  const [produtos, pedidos] = await Promise.all([
    sb(`rf_produtos?fornecedor_id=eq.${e.id}&select=${COLS_PRODUTO}&order=criado_em.desc&limit=300`).catch(() => []),
    sb(`forn_pedidos?fornecedor_id=eq.${e.id}&select=${COLS_PEDIDO}&order=criado_em.desc&limit=200`).catch(() => []),
  ]);
  // Extrato: pedidos enviados/entregues cuja comissão e postagem ainda não foram acertadas.
  const aberto = pedidos.filter((p) => ['enviado', 'entregue'].includes(p.status) && !p.comissao_acertada_em);
  const extrato = {
    pedidos: aberto.length,
    comissao: r2(aberto.reduce((s, p) => s + Number(p.comissao_total || 0), 0)),
    postagem: r2(aberto.reduce((s, p) => s + Number(p.custo_postagem || 0), 0)),
  };
  extrato.total = r2(extrato.comissao + extrato.postagem);
  const vendas = r2(pedidos.filter((p) => !['cancelado', 'aguardando_pagamento'].includes(p.status)).reduce((s, p) => s + Number(p.preco_fornecedor_total || 0), 0));
  return { empresa: (({ id, ...r }) => r)(e), produtos, pedidos, extrato, vendas };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const token = req.method === 'GET' ? req.query.token : (req.body || {}).token;
    const e = await acharEmpresa(token);
    if (!e) return res.status(404).json({ erro: 'Link inválido.' });
    if (e.status === 'recusado') return res.status(403).json({ erro: 'Este cadastro não foi aprovado.' });

    if (req.method === 'GET') return res.json(await carregar(e));
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
    if (e.status !== 'ativo') return res.status(403).json({ erro: e.status === 'pendente' ? 'Seu cadastro ainda está em análise.' : 'Seu cadastro está pausado. Fale com a loja.' });

    const b = req.body || {};

    if (b.acao === 'perfil') {
      const { erro, dados } = validarEmpresaBasica(b.perfil || {}, { exigirPix: true });
      if (erro) return res.status(400).json({ erro });
      await sb(`forn_empresas?id=eq.${e.id}`, { method: 'PATCH', body: JSON.stringify(dados) });
      return res.json(await carregar({ ...e, ...dados }));
    }

    if (b.acao === 'produto') {
      const c = b.produto || {};
      const { erro, dados } = validarModeloFornecedor(c, e.comissao_pct);
      if (erro) return res.status(400).json({ erro });
      if (c.id) {
        if (!UUID.test(String(c.id))) return res.status(400).json({ erro: 'Modelo inválido.' });
        const [atual] = await sb(`rf_produtos?id=eq.${c.id}&fornecedor_id=eq.${e.id}&select=${COLS_PRODUTO}`);
        if (!atual) return res.status(404).json({ erro: 'Modelo não encontrado.' });
        const mudouConteudo = ['titulo_publico', 'descricao', 'categoria', 'material', 'tamanhos', 'foto_url'].some((k) => String(atual[k] || '') !== String(dados[k] || ''));
        const patch = { ...dados };
        if (mudouConteudo) { patch.revisao = 'pendente'; patch.publicado = false; patch.ativo = false; }
        await sb(`rf_produtos?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
        if (mudouConteudo) await avisar(`📝 ${e.nome_fantasia} alterou o modelo "${dados.titulo_publico}". Revise em Fornecedores.`);
      } else {
        await sb('rf_produtos', { method: 'POST', body: JSON.stringify({ ...dados, fornecedor_id: e.id, revisao: 'pendente', publicado: false, ativo: false }) });
        await avisar(`🆕 ${e.nome_fantasia} cadastrou o modelo "${dados.titulo_publico}". Revise em Fornecedores.`);
      }
      return res.json(await carregar(e));
    }

    if (b.acao === 'produto_pausar') {
      if (!UUID.test(String(b.id))) return res.status(400).json({ erro: 'Modelo inválido.' });
      const [atual] = await sb(`rf_produtos?id=eq.${b.id}&fornecedor_id=eq.${e.id}&select=id,revisao`);
      if (!atual) return res.status(404).json({ erro: 'Modelo não encontrado.' });
      const ligar = !!b.ligar && atual.revisao === 'aprovado';
      await sb(`rf_produtos?id=eq.${b.id}`, { method: 'PATCH', body: JSON.stringify({ ativo: ligar, publicado: ligar }) });
      return res.json(await carregar(e));
    }

    if (b.acao === 'pedido') {
      if (!UUID.test(String(b.id))) return res.status(400).json({ erro: 'Pedido inválido.' });
      const [p] = await sb(`forn_pedidos?id=eq.${b.id}&fornecedor_id=eq.${e.id}&select=id,numero,status,cidade,estado`);
      if (!p) return res.status(404).json({ erro: 'Pedido não encontrado.' });
      const agora = new Date().toISOString();
      let patch = null;
      if (b.passo === 'confirmar_pagamento' && ['aguardando_pagamento', 'cliente_pagou'].includes(p.status)) {
        patch = { status: 'pago', pago_em: agora };
      } else if (b.passo === 'pronto' && p.status === 'pago') {
        if (b.nota_na_embalagem !== true) return res.status(400).json({ erro: 'Marque que a nota fiscal vai dentro da embalagem.' });
        patch = { status: 'pronto_coleta', pronto_em: agora, nota_na_embalagem: true };
        await avisar(`📦 Pedido #${p.numero} de ${e.nome_fantasia} está pronto para coleta (destino ${p.cidade}/${p.estado}).`);
      } else if (b.passo === 'cancelar' && ['aguardando_pagamento', 'cliente_pagou', 'pago'].includes(p.status)) {
        const motivo = txt(b.motivo, 200);
        if (motivo.length < 5) return res.status(400).json({ erro: 'Escreva o motivo do cancelamento (ex.: sem estoque no número pedido).' });
        patch = { status: 'cancelado', motivo_cancelamento: motivo };
        await avisar(`⚠️ ${e.nome_fantasia} cancelou o pedido #${p.numero}: ${motivo}. Se o cliente já pagou, o fornecedor precisa devolver o PIX.`);
      } else {
        return res.status(400).json({ erro: 'Esse passo não está disponível para a situação atual do pedido.' });
      }
      await sb(`forn_pedidos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      return res.json(await carregar(e));
    }

    return res.status(400).json({ erro: 'Ação desconhecida.' });
  } catch (err) {
    console.error('fornecedor/painel', err.message);
    const faltaSql = /forn_|fornecedor_id|column|relation/i.test(err.message || '');
    return res.status(500).json({ erro: faltaSql ? 'O painel ainda está sendo preparado. Tente mais tarde.' : 'Não foi possível concluir.' });
  }
}
