// Painel do dono: aprovar revendedores, registrar assinatura, confirmar o PIX 2 e repassar a margem.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { COLS_REV, lerConfig } from '../../../lib/revendedoresServer';
import { MENSALIDADE } from '../../../lib/revendedores';
import { numeroBR } from '../../../lib/produtosAdmin';
import { r2, so_digitos } from '../../../lib/fornecedores';

async function carregar() {
  let revs;
  try { revs = await sb(`rev_revendedores?select=${COLS_REV},token&order=criado_em.desc&limit=300`); }
  catch (e) { return { semSql: true, revendedores: [], pedidos: [], lojas: [], config: {} }; }
  const [pedidos, lojas, config, forn] = await Promise.all([
    sb("forn_pedidos?status=in.(pago,pronto_coleta,coletado,enviado,entregue)&select=id,numero,criado_em,status,fornecedor_id,revendedor_id,cliente_nome,total,preco_fornecedor_total,comissao_total,frete,margem_revendedor_total,pix2_pago_em,repassado_em,entregue_em&order=criado_em.desc&limit=300").catch(() => []),
    sb('rev_loja_pedidos?select=*&order=criado_em.desc&limit=100').catch(() => []),
    lerConfig(),
    sb('forn_empresas?select=id,nome_fantasia').catch(() => []),
  ]);
  return { revendedores: revs, pedidos, lojas, config, fornecedores: forn, mensalidade: MENSALIDADE };
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

    if (b.acao === 'rev_estado') {
      if (!UUID.test(id) || !['pendente', 'ativo', 'pausado', 'recusado'].includes(b.estado)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`rev_revendedores?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: b.estado }) });
    } else if (b.acao === 'assinatura') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      const [r] = await sb(`rev_revendedores?id=eq.${id}&select=assinatura_ate`);
      if (!r) return res.status(404).json({ erro: 'Revendedor não encontrado.' });
      const valor = b.valor === undefined || b.valor === '' ? MENSALIDADE : numeroBR(b.valor);
      if (!(valor >= 0 && valor < 10000)) return res.status(400).json({ erro: 'Valor inválido.' });
      const hoje = new Date().toISOString().slice(0, 10);
      const base = r.assinatura_ate && r.assinatura_ate > hoje ? r.assinatura_ate : hoje;
      const ate = new Date(new Date(base).getTime() + 30 * 86400000).toISOString().slice(0, 10);
      await sb('rev_assinaturas', { method: 'POST', body: JSON.stringify({ revendedor_id: id, valor: r2(valor), dias: 30, ate }) });
      await sb(`rev_revendedores?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ assinatura_ate: ate }) });
    } else if (b.acao === 'rev_nota') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`rev_revendedores?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ observacao_interna: txt(b.texto, 500) || null }) });
    } else if (b.acao === 'pix2') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`forn_pedidos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ pix2_pago_em: b.desfazer ? null : agora }) });
    } else if (b.acao === 'repasse') {
      if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
      const [p] = await sb(`forn_pedidos?id=eq.${id}&select=status,pix2_pago_em,revendedor_id`);
      if (!p || !p.revendedor_id) return res.status(404).json({ erro: 'Pedido sem revendedor.' });
      if (!b.desfazer && !(p.status === 'entregue' && p.pix2_pago_em)) return res.status(400).json({ erro: 'Só dá para repassar depois da entrega confirmada e do PIX 2 recebido.' });
      await sb(`forn_pedidos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ repassado_em: b.desfazer ? null : agora }) });
    } else if (b.acao === 'loja_status') {
      if (!UUID.test(id) || !['novo', 'em_conversa', 'fechado', 'cancelado'].includes(b.estado)) return res.status(400).json({ erro: 'Dados inválidos.' });
      await sb(`rev_loja_pedidos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: b.estado }) });
    } else if (b.acao === 'config') {
      const tipo = txt(b.pix_tipo, 12);
      const chave = txt(b.pix_chave, 80);
      const nome = txt(b.pix_nome, 25);
      if (!['cpf', 'cnpj', 'celular', 'email', 'aleatoria'].includes(tipo)) return res.status(400).json({ erro: 'Escolha o tipo da chave PIX.' });
      if (chave.length < 5) return res.status(400).json({ erro: 'Informe a chave PIX.' });
      if ((tipo === 'cpf' && so_digitos(chave).length !== 11) || (tipo === 'cnpj' && so_digitos(chave).length !== 14)) return res.status(400).json({ erro: 'A chave PIX não confere com o tipo escolhido.' });
      if (nome.length < 3) return res.status(400).json({ erro: 'Informe o seu nome como aparece no banco.' });
      const linhas = [['pix_tipo', tipo], ['pix_chave', chave], ['pix_nome', nome]];
      await sb('rev_config?on_conflict=chave', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(linhas.map(([c, v]) => ({ chave: c, valor: v }))) });
    } else {
      return res.status(400).json({ erro: 'Ação desconhecida.' });
    }
    return res.json(await carregar());
  } catch (e) {
    console.error('admin/revendedores', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 200) });
  }
}
