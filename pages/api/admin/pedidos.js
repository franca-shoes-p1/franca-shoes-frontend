// Painel de pedidos da loja de varejo e dos lotes de retirada na rodoviária. Só para quem fez login no painel.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt } from '../../../lib/varejoServer';
import { LISTA_STATUS } from '../../../lib/pedidosStatus';
import { carregarFila, agruparFila, paresDoPedido } from '../../../lib/filaFabricas';
import { carregarConfigAssinatura, emailValido } from '../../../lib/assinaturaServer';

const CAMPOS = 'id,numero,criado_em,pago_em,status,cliente_nome,email,whatsapp,cep,rua,numero_casa,complemento,bairro,cidade,estado,observacao,itens,subtotal,frete,total,codigo_rastreio,nota_interna,entrega,lote_id,custo_fabrica,tipo';
const CAMPOS_BASE = CAMPOS.replace(',entrega,lote_id,custo_fabrica,tipo', '');
const CAMPOS_SEM_TIPO = CAMPOS.replace(',tipo', '');
const STATUS_LOTE = ['aberto', 'fechado', 'em_rota', 'entregue'];
const dataOk = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));

async function carregar() {
  let pedidos;
  let semLotes = false;
  try {
    try {
      pedidos = await sb(`varejo_pedidos?select=${CAMPOS}&order=numero.desc&limit=300`);
    } catch (e0) {
      // SQL da assinatura ainda não rodado: sem a coluna "tipo"
      pedidos = await sb(`varejo_pedidos?select=${CAMPOS_SEM_TIPO}&order=numero.desc&limit=300`);
    }
  } catch (e) {
    // SQL dos lotes ainda não rodado: mostra os pedidos mesmo assim
    pedidos = await sb(`varejo_pedidos?select=${CAMPOS_BASE}&order=numero.desc&limit=300`);
    semLotes = true;
  }
  let lotes = [];
  if (!semLotes) {
    try { lotes = await sb('cal_lotes?select=*&order=id.desc&limit=100'); } catch (e) { semLotes = true; }
  }
  const cont = {};
  pedidos.forEach((p) => { if (p.lote_id) cont[p.lote_id] = (cont[p.lote_id] || 0) + 1; });
  lotes = lotes.map((l) => ({ ...l, pedidos: cont[l.id] || 0 }));
  // Fábricas e fila de compra (pedidos pagos somados em pares por fábrica). Sem o SQL das fábricas, vem vazio.
  let fabricas = [];
  let fila = [];
  let semFabricas = false;
  try {
    fabricas = await sb('cal_fabricas?select=*&order=nome_interno');
    fila = agruparFila(await carregarFila());
  } catch (e) { semFabricas = true; }
  // Assinatura: preço do passe, ramos com desconto e assinantes (vazio se o SQL da assinatura não rodou)
  let assin = { pronto: false, config: null, ramos: [], membros: [] };
  try {
    const cfg = await carregarConfigAssinatura();
    const ramos = await sb('cal_ramos?select=*&order=ordem');
    const membros = await sb('cal_acessos_portal?select=chave,nome,whatsapp,expira_em&order=expira_em.desc&limit=300');
    assin = { pronto: cfg.pronto, config: { preco_passe: cfg.preco_passe, taxa_mp_pct: cfg.taxa_mp_pct, fundo_pct: cfg.fundo_pct }, ramos, membros };
  } catch (e) {}
  return { pedidos, lotes, semLotes, fabricas, fila, semFabricas, assin };
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') return res.json(await carregar());
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ erro: 'Método não permitido.' });
    }
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    let aviso = '';

    if (c.acao === 'pedido') {
      const id = txt(c.id, 40);
      if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ erro: 'Pedido inválido.' });
      const d = {};
      if (c.status !== undefined) {
        if (!LISTA_STATUS.includes(c.status)) return res.status(400).json({ erro: 'Situação inválida.' });
        d.status = c.status;
        if (c.status === 'pago') d.pago_em = new Date().toISOString();
      }
      if (c.codigo_rastreio !== undefined) d.codigo_rastreio = txt(c.codigo_rastreio, 40).toUpperCase() || null;
      if (c.nota_interna !== undefined) d.nota_interna = txt(c.nota_interna, 500) || null;
      if (c.custo_fabrica !== undefined) {
        const bruto = String(c.custo_fabrica).trim();
        if (bruto === '') d.custo_fabrica = null;
        else {
          const n = Number(bruto.replace(/\./g, '').replace(',', '.'));
          if (!(n >= 0 && n < 100000)) return res.status(400).json({ erro: 'Custo de fábrica inválido.' });
          d.custo_fabrica = Math.round(n * 100) / 100;
        }
      }
      if (!Object.keys(d).length) return res.status(400).json({ erro: 'Nada para alterar.' });
      await sb(`varejo_pedidos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
      aviso = 'Pedido atualizado.';
    } else if (c.acao === 'lote') {
      const id = Number(c.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: 'Lote inválido.' });
      const d = {};
      if (c.status !== undefined) {
        if (!STATUS_LOTE.includes(c.status)) return res.status(400).json({ erro: 'Situação do lote inválida.' });
        d.status = c.status;
        if (c.status === 'fechado') d.fechado_em = new Date().toISOString();
      }
      if (c.data_saida !== undefined) {
        const ds = txt(c.data_saida, 10);
        if (ds && !dataOk(ds)) return res.status(400).json({ erro: 'Data de saída inválida.' });
        d.data_saida = ds || null;
      }
      if (c.nota_interna !== undefined) d.nota_interna = txt(c.nota_interna, 500) || null;
      if (!Object.keys(d).length) return res.status(400).json({ erro: 'Nada para alterar.' });
      await sb(`cal_lotes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
      // Quando o lote sai em rota ou é entregue, os pedidos dele acompanham (só os que ainda estão no caminho).
      if (d.status === 'em_rota') {
        await sb(`varejo_pedidos?lote_id=eq.${id}&status=in.(pago,em_compra_fabrica)`, { method: 'PATCH', body: JSON.stringify({ status: 'enviado' }) });
      } else if (d.status === 'entregue') {
        await sb(`varejo_pedidos?lote_id=eq.${id}&status=in.(pago,em_compra_fabrica,enviado)`, { method: 'PATCH', body: JSON.stringify({ status: 'entregue' }) });
      }
      aviso = 'Lote atualizado.';
    } else if (c.acao === 'fabrica_salvar') {
      const nome = txt(c.nome_interno, 60);
      if (nome.length < 2) return res.status(400).json({ erro: 'Informe o nome da fábrica (só você vê).' });
      const lote = Math.floor(Number(c.lote_minimo_pares));
      const defeito = Math.floor(Number(c.troca_defeito_dias));
      if (!(lote >= 1 && lote <= 500)) return res.status(400).json({ erro: 'O lote mínimo deve ser de 1 a 500 pares.' });
      if (!(defeito >= 30 && defeito <= 365)) return res.status(400).json({ erro: 'O prazo de defeito deve ser de 30 a 365 dias (30 é o mínimo da loja).' });
      const d = {
        nome_interno: nome,
        lote_minimo_pares: lote,
        prazo_preparo: txt(c.prazo_preparo, 120) || null,
        troca_defeito_dias: defeito,
        troca_numeracao: c.troca_numeracao !== false,
        troca_obs: txt(c.troca_obs, 300) || null,
        ativo: c.ativo !== false,
      };
      if (c.id) {
        if (!/^[0-9a-f-]{36}$/i.test(String(c.id))) return res.status(400).json({ erro: 'Fábrica inválida.' });
        await sb(`cal_fabricas?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify(d) });
      } else {
        await sb('cal_fabricas', { method: 'POST', body: JSON.stringify(d) });
      }
      aviso = 'Regras da fábrica salvas.';
    } else if (c.acao === 'fila_comprar') {
      // Marca como "Comprando na fábrica" os pedidos pagos cujos itens são todos desta fábrica (pedido com fábricas misturadas fica para marcar à mão).
      const fid = String(c.fabrica_id || '');
      if (fid && !/^[0-9a-f-]{36}$/i.test(fid)) return res.status(400).json({ erro: 'Fábrica inválida.' });
      const base = await carregarFila();
      const grupo = agruparFila(base).find((g) => g.fabrica_id === fid);
      if (!grupo) return res.status(400).json({ erro: 'Não há pedidos pagos esperando esta fábrica.' });
      if (!grupo.pronto) return res.status(400).json({ erro: `Ainda não atingiu o lote mínimo: ${grupo.pares} de ${grupo.minimo} pares.` });
      const alvo = base.pedidos.filter((p) => { const k = Object.keys(paresDoPedido(p.itens, base.prod)); return k.length === 1 && k[0] === fid; });
      for (const p of alvo) await sb(`varejo_pedidos?id=eq.${p.id}&status=eq.pago`, { method: 'PATCH', body: JSON.stringify({ status: 'em_compra_fabrica' }) });
      aviso = alvo.length ? `${alvo.length} pedido(s) marcado(s) como "Comprando na fábrica".` : 'Nenhum pedido para marcar (pedidos com mais de uma fábrica você marca à mão).';
    } else if (c.acao === 'assin_config') {
      const preco = Number(String(c.preco_passe).replace(',', '.'));
      const taxa = Number(String(c.taxa_mp_pct).replace(',', '.'));
      if (!(preco >= 1 && preco <= 999)) return res.status(400).json({ erro: 'Preço do passe inválido (de 1 a 999).' });
      if (!(taxa >= 0 && taxa <= 30)) return res.status(400).json({ erro: 'Taxa do Mercado Pago inválida (de 0 a 30).' });
      const up = { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } };
      await sb('cal_config?on_conflict=chave', { ...up, body: JSON.stringify([{ chave: 'preco_passe', valor: preco.toFixed(2) }, { chave: 'taxa_mp_pct', valor: taxa.toFixed(2) }]) });
      aviso = 'Preço do passe e taxa salvos.';
    } else if (c.acao === 'ramo_salvar') {
      const slug = txt(c.slug, 30);
      if (!/^[a-z0-9_-]{2,30}$/.test(slug)) return res.status(400).json({ erro: 'Ramo inválido.' });
      const teto = c.teto_pct === '' || c.teto_pct == null ? null : Number(String(c.teto_pct).replace(',', '.'));
      if (teto !== null && !(teto >= 0 && teto <= 80)) return res.status(400).json({ erro: 'O teto de desconto deve ser de 0 a 80%.' });
      const modo = c.modo === 'margem' ? 'margem' : 'teto';
      if (modo === 'teto' && teto === null) return res.status(400).json({ erro: 'No modo "teto" informe o percentual.' });
      await sb(`cal_ramos?slug=eq.${slug}`, { method: 'PATCH', body: JSON.stringify({ teto_pct: teto, modo, automatico: !!c.automatico, ativo: c.ativo !== false }) });
      aviso = 'Ramo atualizado.';
    } else if (c.acao === 'membro_conceder') {
      const email = txt(c.email, 120).toLowerCase();
      const dias = Math.floor(Number(c.dias) || 30);
      if (!emailValido(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
      if (!(dias >= 1 && dias <= 365)) return res.status(400).json({ erro: 'Dias de 1 a 365.' });
      const [atual] = await sb(`cal_acessos_portal?chave=eq.${encodeURIComponent(email)}&select=expira_em&limit=1`);
      const base = atual ? Math.max(Date.parse(atual.expira_em) || 0, Date.now()) : Date.now();
      const expira = new Date(base + dias * 86400000).toISOString();
      if (atual) await sb(`cal_acessos_portal?chave=eq.${encodeURIComponent(email)}`, { method: 'PATCH', body: JSON.stringify({ expira_em: expira }) });
      else await sb('cal_acessos_portal', { method: 'POST', body: JSON.stringify({ chave: email, nome: txt(c.nome, 120) || null, expira_em: expira }) });
      aviso = `Acesso de ${email} liberado por mais ${dias} dia(s).`;
    } else {
      return res.status(400).json({ erro: 'Ação desconhecida.' });
    }
    return res.json({ ...(await carregar()), aviso });
  } catch (e) {
    console.error('admin/pedidos', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
