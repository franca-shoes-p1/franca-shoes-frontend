// Painel do revendedor: acesso pelo link secreto (token). Nunca mostra o preço do fornecedor nem a comissão da loja.
import { sb, txt } from '../../../lib/varejoServer';
import { avisar } from '../../../lib/avisar';
import { acharRevendedor, validarRevBasica, lerConfig } from '../../../lib/revendedoresServer';
import { statusAssinatura, MENSALIDADE, MARGEM_MAX, PACOTES } from '../../../lib/revendedores';
import { r2 } from '../../../lib/fornecedores';
import { pixCopiaECola } from '../../../lib/pixCopiaCola';
import { numeroBR } from '../../../lib/produtosAdmin';

const COLS_PEDIDO =
  'id,numero,criado_em,entrega_dia,entrega_rodoviaria,cliente_avisado_em,nao_compareceu_em,status,cliente_nome,whatsapp,cidade,estado,itens,total,modo_entrega,local_entrega,margem_revendedor_total,pix2_pago_em,repassado_em,entregue_em';

async function carregar(r) {
  const [pedidos, cfg] = await Promise.all([
    sb(`forn_pedidos?revendedor_id=eq.${r.id}&select=${COLS_PEDIDO}&order=criado_em.desc&limit=200`).catch(() => []),
    lerConfig(),
  ]);
  const ativos = pedidos.filter((p) => p.status !== 'cancelado');
  const aReceber = r2(ativos.filter((p) => p.pix2_pago_em && p.status === 'entregue' && !p.repassado_em).reduce((s, p) => s + Number(p.margem_revendedor_total || 0), 0));
  const recebido = r2(ativos.filter((p) => p.repassado_em).reduce((s, p) => s + Number(p.margem_revendedor_total || 0), 0));
  const emAndamento = r2(ativos.filter((p) => !(p.status === 'entregue' && p.pix2_pago_em) && !p.repassado_em).reduce((s, p) => s + Number(p.margem_revendedor_total || 0), 0));
  const pix = cfg.pix_chave
    ? pixCopiaECola({ tipo: cfg.pix_tipo || 'cpf', chave: cfg.pix_chave, nome: cfg.pix_nome || 'RICARDO BELLO', cidade: 'FRANCA', valor: MENSALIDADE, txid: 'ASS' + r.codigo })
    : '';
  const { id, ...resto } = r;
  const ids = pedidos.map((p) => p.id).filter(Boolean);
  const regs = ids.length ? await sb(`entrega_registros?pedido_id=in.(${ids.join(',')})&select=pedido_id,criado_em,quem,texto&order=criado_em.asc`).catch(() => []) : [];
  pedidos.forEach((p) => { p.registros = regs.filter((x) => x.pedido_id === p.id); delete p.id; });
  return {
    revendedor: resto,
    assinatura: { status: statusAssinatura(r.assinatura_ate), ate: r.assinatura_ate, valor: MENSALIDADE, pix, titular: cfg.pix_nome || '' },
    pedidos,
    resumo: { aReceber, recebido, emAndamento },
    pacotes: PACOTES,
    lojaWhats: cfg.whatsapp_loja || '',
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const token = req.method === 'GET' ? req.query.token : (req.body || {}).token;
    const r = await acharRevendedor(token);
    if (!r) return res.status(404).json({ erro: 'Link inválido.' });
    if (r.status === 'recusado') return res.status(403).json({ erro: 'Este cadastro não foi aprovado.' });
    if (req.method === 'GET') return res.json(await carregar(r));
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
    if (r.status !== 'ativo') return res.status(403).json({ erro: r.status === 'pendente' ? 'Seu cadastro ainda está em análise.' : 'Seu cadastro está pausado. Fale com a loja.' });
    const b = req.body || {};

    if (b.acao === 'perfil') {
      const { erro, dados } = validarRevBasica(b.perfil || {}, { exigirLocal: true });
      if (erro) return res.status(400).json({ erro });
      await sb(`rev_revendedores?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify(dados) });
      return res.json(await carregar({ ...r, ...dados }));
    }
    if (b.acao === 'margem') {
      const pct = numeroBR(b.pct);
      if (!(pct >= 0 && pct <= MARGEM_MAX)) return res.status(400).json({ erro: `A margem precisa estar entre 0 e ${MARGEM_MAX}%.` });
      await sb(`rev_revendedores?id=eq.${r.id}`, { method: 'PATCH', body: JSON.stringify({ margem_pct: r2(pct) }) });
      return res.json(await carregar({ ...r, margem_pct: r2(pct) }));
    }
    if (b.acao === 'loja') {
      const pacote = PACOTES.find((p) => p.id === b.pacote);
      if (!pacote) return res.status(400).json({ erro: 'Escolha um pacote.' });
      const mensagem = txt(b.mensagem, 500);
      await sb('rev_loja_pedidos', { method: 'POST', body: JSON.stringify({ revendedor_id: r.id, pacote: pacote.id, mensagem: mensagem || null }) });
      await avisar(`🏪 ${r.nome} (${r.cidade}/${r.estado}) quer a ${pacote.nome}. WhatsApp ${r.whatsapp}. ${mensagem}`);
      return res.json({ ...(await carregar(r)), lojaEnviada: true });
    }
    if (b.acao === 'avisei') {
      const [p] = await sb(`forn_pedidos?numero=eq.${Number(b.numero) || 0}&revendedor_id=eq.${r.id}&select=id`);
      if (!p) return res.status(404).json({ erro: 'Pedido não encontrado.' });
      await sb(`forn_pedidos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ cliente_avisado_em: new Date().toISOString() }) });
      await sb('entrega_registros', { method: 'POST', body: JSON.stringify({ pedido_id: p.id, quem: 'revendedor', texto: `${r.nome} avisou o cliente sobre o dia e a hora da entrega.` }) });
      return res.json(await carregar(r));
    }
    return res.status(400).json({ erro: 'Ação desconhecida.' });
  } catch (err) {
    console.error('revendedor/painel', err.message);
    const faltaSql = /rev_|revendedor_id|column|relation/i.test(err.message || '');
    return res.status(500).json({ erro: faltaSql ? 'O painel ainda está sendo preparado. Tente mais tarde.' : 'Não foi possível concluir.' });
  }
}
