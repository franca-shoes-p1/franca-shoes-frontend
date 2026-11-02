// Painel de pedidos da loja de varejo e dos lotes de retirada na rodoviária. Só para quem fez login no painel.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt } from '../../../lib/varejoServer';
import { LISTA_STATUS } from '../../../lib/pedidosStatus';
import { carregarFila, agruparFila, paresDoPedido } from '../../../lib/filaFabricas';

const CAMPOS = 'id,numero,criado_em,pago_em,status,cliente_nome,email,whatsapp,cep,rua,numero_casa,complemento,bairro,cidade,estado,observacao,itens,subtotal,frete,total,codigo_rastreio,nota_interna,entrega,lote_id,custo_fabrica';
const CAMPOS_BASE = CAMPOS.replace(',entrega,lote_id,custo_fabrica', '');
const STATUS_LOTE = ['aberto', 'fechado', 'em_rota', 'entregue'];
const dataOk = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));

async function carregar() {
  let pedidos;
  let semLotes = false;
  try {
    pedidos = await sb(`varejo_pedidos?select=${CAMPOS}&order=numero.desc&limit=300`);
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
  return { pedidos, lotes, semLotes, fabricas, fila, semFabricas };
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
    } else {
      return res.status(400).json({ erro: 'Ação desconhecida.' });
    }
    return res.json({ ...(await carregar()), aviso });
  } catch (e) {
    console.error('admin/pedidos', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
