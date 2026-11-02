// Painel do departamento Vitrine: achados da IA, fila de divulgação e fontes de busca.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { garimpar, textoGarimpo, gerarDivulgacao, textoDivulgacao, siteBloqueado, normalizarUrl, apurarFundo, textoFundo } from '../../../lib/vitrineServer';

export const config = { maxDuration: 60 };

const CONFIG_LIMITES = { fundo_pct: [0, 100], carencia_dias: [0, 60], peso_validacao: [0, 100], peso_cadastro: [0, 100], peso_divulgacao: [0, 100] };
const TIPOS = ['validacao', 'cadastro', 'divulgacao'];
const STATUS = ['novo', 'em_validacao', 'validado', 'aprovado', 'rejeitado'];
const httpsOk = (u) => { try { const x = new URL(u); return x.protocol === 'https:' && !x.username && !x.password; } catch (e) { return false; } };
const num = (v) => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };

async function carregar() {
  let achados, fontes, canais, divulgacoes;
  try {
    [achados, fontes, canais, divulgacoes] = await Promise.all([
      sb('vit_achados?select=*&order=criado_em.desc&limit=200'),
      sb('vit_fontes?select=*&order=criado_em.desc&limit=100'),
      sb('vit_canais?select=*&order=ordem'),
      sb('vit_divulgacoes?status=eq.pendente&canal=neq.telegram_canal&select=*&order=criado_em.desc&limit=100'),
    ]);
  } catch (e) { return { semSql: true }; }
  const ids = [...new Set(divulgacoes.map((d) => d.produto_id))].filter((i) => UUID.test(i));
  let nomes = {};
  if (ids.length) {
    const p = await sb(`rf_produtos?id=in.(${ids.join(',')})&select=id,nome,titulo_publico`).catch(() => []);
    nomes = Object.fromEntries(p.map((x) => [x.id, x.titulo_publico || x.nome]));
  }
  const desde = new Date(Date.now() - 7 * 86400000).toISOString();
  const leads = await sb(`cal_leads?criado_em=gte.${desde}&select=utm_source&limit=2000`).catch(() => null);
  let dinheiro = null;
  try {
    const [config, contribs, pagamentos, produtos] = await Promise.all([
      sb('vit_config?select=*&order=chave'),
      sb('vit_contribuicoes?select=*&order=criado_em.desc&limit=200'),
      sb('vit_pagamentos?select=*&order=criado_em.desc&limit=300'),
      sb('rf_produtos?select=id,nome,titulo_publico&order=criado_em.desc&limit=200'),
    ]);
    const semCusto = await sb('varejo_pedidos?status=eq.entregue&custo_fabrica=is.null&select=numero&limit=100').catch(() => []);
    dinheiro = { config, contribs, pagamentos, produtos, semCusto: semCusto.length };
  } catch (e) { dinheiro = null; }
  return {
    dinheiro,
    achados, fontes, canais,
    divulgacoes: divulgacoes.map((d) => ({ ...d, produto: nomes[d.produto_id] || 'Produto' })),
    leads7: leads ? leads.length : null,
  };
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.json(await carregar());
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const b = req.body || {};
    const id = String(b.id || '');
    let aviso = '';
    switch (b.acao) {
      case 'fonte_add': {
        const tipo = b.tipo === 'pagina' ? 'pagina' : 'busca';
        const valor = txt(b.valor, 300);
        if (tipo === 'pagina') {
          if (!httpsOk(valor)) return res.status(400).json({ erro: 'Use um endereço que comece com https://' });
          if (siteBloqueado(new URL(valor).hostname)) return res.status(400).json({ erro: 'Esse site não permite leitura automática. Cadastre o achado à mão.' });
        } else if (valor.length < 8) return res.status(400).json({ erro: 'Escreva uma frase de busca mais completa.' });
        await sb('vit_fontes', { method: 'POST', body: JSON.stringify({ tipo, valor, categoria: txt(b.categoria, 40) || null }) });
        break;
      }
      case 'fonte_toggle':
        if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
        await sb(`vit_fontes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ativo: !!b.ativo }) });
        break;
      case 'fonte_del':
        if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
        await sb(`vit_fontes?id=eq.${id}`, { method: 'DELETE' });
        break;
      case 'achado_add': {
        if (!httpsOk(String(b.url || ''))) return res.status(400).json({ erro: 'Cole o endereço da página (começa com https://).' });
        const preco = num(b.preco_visto);
        await sb('vit_achados', { method: 'POST', body: JSON.stringify({ url: normalizarUrl(b.url), titulo: txt(b.titulo, 200) || null, categoria: txt(b.categoria, 40) || null, preco_visto: preco > 0 ? preco : null, notas: txt(b.notas, 400) || null, origem: 'manual' }) });
        break;
      }
      case 'achado_status': {
        if (!UUID.test(id) || !STATUS.includes(b.status) || b.status === 'aprovado') return res.status(400).json({ erro: 'Dados inválidos.' });
        await sb(`vit_achados?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: b.status, notas: b.notas !== undefined ? txt(b.notas, 400) : undefined, atualizado_em: new Date().toISOString() }) });
        break;
      }
      case 'achado_aprovar': {
        if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
        const custo = num(b.custo);
        if (!(custo > 0)) return res.status(400).json({ erro: 'Informe o custo confirmado pelo fornecedor (maior que zero).' });
        const venda = num(b.preco_venda);
        const [a] = await sb(`vit_achados?id=eq.${id}&select=*`);
        if (!a) return res.status(404).json({ erro: 'Achado não encontrado.' });
        if (a.produto_id) return res.status(400).json({ erro: 'Este achado já virou modelo.' });
        const [p] = await sb('rf_produtos', { method: 'POST', body: JSON.stringify({ nome: a.titulo || 'Modelo sem nome', titulo_publico: a.titulo || null, descricao: a.descricao || null, categoria: a.categoria || null, material: a.material || null, custo, preco_venda_sugerido: venda > 0 ? venda : null, publicado: false, ativo: false }) });
        await sb(`vit_achados?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'aprovado', produto_id: p.id, atualizado_em: new Date().toISOString() }) });
        aviso = 'Modelo criado como rascunho escondido. Abra /admin/calcados para colocar a foto autorizada, conferir o preço e publicar.';
        break;
      }
      case 'divulgacao_marcar':
        if (!UUID.test(id) || !['feito', 'pulado'].includes(b.status)) return res.status(400).json({ erro: 'Dados inválidos.' });
        await sb(`vit_divulgacoes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: b.status, concluido_em: new Date().toISOString() }) });
        break;
      case 'config_set': {
        const lim = CONFIG_LIMITES[b.chave];
        const v = num(b.valor);
        if (!lim) return res.status(400).json({ erro: 'Regra desconhecida.' });
        if (!(v >= lim[0] && v <= lim[1])) return res.status(400).json({ erro: `Valor inválido (use de ${lim[0]} a ${lim[1]}).` });
        await sb(`vit_config?chave=eq.${b.chave}`, { method: 'PATCH', body: JSON.stringify({ valor: v }) });
        break;
      }
      case 'contrib_add': {
        const produto_id = String(b.produto_id || '');
        const nome = txt(b.nome, 80);
        if (!UUID.test(produto_id) || nome.length < 2 || !TIPOS.includes(b.tipo)) return res.status(400).json({ erro: 'Escolha o produto, escreva o nome da pessoa e o tipo de ajuda.' });
        await sb('vit_contribuicoes', { method: 'POST', body: JSON.stringify({ produto_id, nome, tipo: b.tipo, operario_id: UUID.test(String(b.operario_id || '')) ? b.operario_id : null }) });
        break;
      }
      case 'contrib_del':
        if (!UUID.test(id)) return res.status(400).json({ erro: 'Dados inválidos.' });
        await sb(`vit_contribuicoes?id=eq.${id}`, { method: 'DELETE' });
        break;
      case 'apurar': { aviso = textoFundo(await apurarFundo()); break; }
      case 'pagar': {
        const nome = txt(b.nome, 80);
        if (nome.length < 2) return res.status(400).json({ erro: 'Dados inválidos.' });
        await sb(`vit_pagamentos?status=eq.a_pagar&nome=eq.${encodeURIComponent(nome)}`, { method: 'PATCH', body: JSON.stringify({ status: 'pago', pago_em: new Date().toISOString(), nota: txt(b.nota, 120) || null }) });
        aviso = `Pagamentos de ${nome} marcados como pagos.`;
        break;
      }
      case 'rodar_garimpo': { const r = await garimpar(); aviso = textoGarimpo(r); break; }
      case 'rodar_divulgacao': { const r = await gerarDivulgacao(); aviso = textoDivulgacao(r); break; }
      default:
        return res.status(400).json({ erro: 'Ação desconhecida.' });
    }
    return res.json({ ...(await carregar()), aviso });
  } catch (e) {
    const m = String(e.message || '');
    if (/duplicate|unique|23505/i.test(m)) return res.status(400).json({ erro: 'Isso já está cadastrado.' });
    console.error('admin/vitrine', m);
    return res.status(500).json({ erro: 'Não foi possível concluir. Tente de novo.' });
  }
}
