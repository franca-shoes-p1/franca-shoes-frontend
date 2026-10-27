// Ações do dono na Oficina. Uma rota só, com "tipo" e "acao". Tudo validado aqui no servidor.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID, txt, } from '../../../../lib/varejoServer';
import { novoCodigo, hashCodigo, configurado } from '../../../../lib/operadorAuth';
import { historico } from '../../../../lib/oficina';

const num = (v) => {
  let s = String(v ?? '').replace(/[^\d,.-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
};
const bad = (res, m) => res.status(400).json({ erro: m });
const slug = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const doze = () => new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const { tipo, acao } = c;
  const id = String(c.id || '');
  try {
    if (tipo === 'entrega') {
      if (!UUID.test(id)) return bad(res, 'Entrega inválida.');
      const [e] = await sb(`op_entregas?id=eq.${id}&select=*`);
      if (!e) return res.status(404).json({ erro: 'Entrega não encontrada.' });
      if (acao === 'aprovar') {
        if (e.status !== 'entregue') return bad(res, 'Só dá para aprovar uma entrega em análise.');
        const ok = await sb(`op_entregas?id=eq.${id}&status=eq.entregue`, { method: 'PATCH', body: JSON.stringify({ status: 'aprovada', aprovada_em: new Date().toISOString(), comentario_revisao: null }) });
        if (!ok.length) return bad(res, 'Esta entrega já foi decidida.');
        if (e.pontos > 0) {
          // índice único (origem, origem_id) impede pontuar duas vezes a mesma entrega
          await sb('op_pontos', { method: 'POST', body: JSON.stringify({ operario_id: e.operario_id, pontos: e.pontos, motivo: 'Cartão aprovado', origem: 'entrega', origem_id: e.id, expira_em: doze() }) }).catch((x) => { if (!/duplicate|unique/i.test(x.message)) throw x; });
        }
        await historico(e.operario_id, 'entrega_aprovada', { entrega_id: id });
        return res.json({ ok: true });
      }
      if (acao === 'ajuste') {
        if (e.status !== 'entregue') return bad(res, 'Só dá para pedir ajuste de entrega em análise.');
        const com = txt(c.comentario, 1000);
        if (!com) return bad(res, 'Diga o que precisa ajustar.');
        await sb(`op_entregas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'ajuste', comentario_revisao: com }) });
        return res.json({ ok: true });
      }
      if (acao === 'recusar') {
        if (e.status !== 'entregue') return bad(res, 'Só dá para recusar entrega em análise.');
        await sb(`op_entregas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'recusada', comentario_revisao: txt(c.comentario, 1000) || null }) });
        return res.json({ ok: true });
      }
      if (acao === 'pagar') {
        if (e.status !== 'aprovada') return bad(res, 'Só se paga entrega aprovada.');
        if (!(Number(e.valor) > 0)) return bad(res, 'Este cartão não tem valor em reais.');
        await sb(`op_entregas?id=eq.${id}&status=eq.aprovada`, { method: 'PATCH', body: JSON.stringify({ status: 'paga', paga_em: new Date().toISOString() }) });
        await historico(e.operario_id, 'entrega_paga', { entrega_id: id, valor: e.valor });
        return res.json({ ok: true });
      }
      return bad(res, 'Ação inválida.');
    }

    if (tipo === 'chamado') {
      if (!UUID.test(id)) return bad(res, 'Chamado inválido.');
      if (acao !== 'resolver') return bad(res, 'Ação inválida.');
      await sb(`op_chamados?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'resolvido' }) });
      return res.json({ ok: true });
    }
    if (tipo === 'candidato') {
      if (!UUID.test(id)) return bad(res, 'Candidato inválido.');
      const [k] = await sb(`op_candidatos?id=eq.${id}&select=*`);
      if (!k) return res.status(404).json({ erro: 'Candidato não encontrado.' });
      if (acao === 'chamado' || acao === 'descartar') {
        await sb(`op_candidatos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: acao === 'chamado' ? 'chamado' : 'descartado' }) });
        return res.json({ ok: true });
      }
      if (acao === 'converter') {
        if (k.status === 'convertido') return bad(res, 'Já foi convertido.');
        if (!configurado()) return res.status(500).json({ erro: 'Falta ADMIN_SESSION_SECRET na Vercel (16+ caracteres).' });
        const codigo = novoCodigo();
        const [op] = await sb('op_operarios', { method: 'POST', body: JSON.stringify({ nome: k.nome, whatsapp: k.whatsapp, setor: k.origem === 'afiliados' ? 'Divulgação' : 'Testes', nivel: 'iniciante', codigo_hash: hashCodigo(codigo) }) });
        await sb(`op_candidatos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'convertido', operario_id: op.id }) });
        await historico(op.id, 'operador_criado', { candidato_id: id });
        return res.json({ ok: true, codigo, nome: k.nome, whatsapp: k.whatsapp });
      }
      return bad(res, 'Ação inválida.');
    }

    if (tipo === 'indicacao') {
      if (!UUID.test(id)) return bad(res, 'Indicação inválida.');
      if (acao !== 'cancelar') return bad(res, 'Ação inválida.');
      const ok = await sb(`op_indicacoes?id=eq.${id}&status=eq.registrada`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelada' }) });
      if (!ok.length) return bad(res, 'Só dá para cancelar uma indicação ainda não paga.');
      return res.json({ ok: true });
    }

    if (tipo === 'resgate') {
      if (!UUID.test(id)) return bad(res, 'Resgate inválido.');
      const [r] = await sb(`op_resgates?id=eq.${id}&select=*`);
      if (!r || r.status !== 'pendente') return bad(res, 'Pedido não está pendente.');
      if (acao === 'aprovar') {
        const [s] = await sb(`op_saldo_pontos?operario_id=eq.${r.operario_id}&select=saldo`);
        if (!s || s.saldo < r.pontos) return bad(res, 'O operador não tem mais pontos suficientes.');
        const ok = await sb(`op_resgates?id=eq.${id}&status=eq.pendente`, { method: 'PATCH', body: JSON.stringify({ status: 'aprovado', decidido_em: new Date().toISOString() }) });
        if (!ok.length) return bad(res, 'Pedido já decidido.');
        await sb('op_pontos', { method: 'POST', body: JSON.stringify({ operario_id: r.operario_id, pontos: -r.pontos, motivo: 'Benefício resgatado', origem: 'resgate', origem_id: r.id }) });
        return res.json({ ok: true });
      }
      if (acao === 'recusar') {
        await sb(`op_resgates?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'recusado', decidido_em: new Date().toISOString() }) });
        return res.json({ ok: true });
      }
      return bad(res, 'Ação inválida.');
    }

    if (tipo === 'pedido') {
      if (!UUID.test(id)) return bad(res, 'Pedido inválido.');
      const [p] = await sb(`op_atelie_pedidos?id=eq.${id}&select=*`);
      if (!p) return res.status(404).json({ erro: 'Pedido não encontrado.' });
      if (acao === 'cancelar') {
        await sb(`op_atelie_pedidos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelado' }) });
        return res.json({ ok: true });
      }
      if (acao === 'criar_ordem') {
        const ids = Array.isArray(c.cartoes) ? c.cartoes.filter((x) => UUID.test(String(x))).slice(0, 12) : [];
        if (!ids.length) return bad(res, 'Escolha pelo menos um cartão.');
        const ja = await sb(`op_ordens?pedido_id=eq.${id}&select=id&limit=1`);
        if (ja.length) return bad(res, 'Este pedido já virou uma ordem.');
        const cards = await sb(`op_cartoes?id=in.(${ids.join(',')})&ativo=eq.true&select=id,codigo,titulo,posto_slug,pronto_quando,ordem&order=ordem.asc`);
        if (!cards.length) return bad(res, 'Cartões não encontrados ou desligados.');
        const postos = await sb('op_postos?select=slug,nome');
        const nomePosto = Object.fromEntries(postos.map((x) => [x.slug, x.nome]));
        const valor = c.valor_total === undefined || c.valor_total === '' ? 0 : num(c.valor_total);
        if (valor === null) return bad(res, 'Valor inválido.');
        const prazo = /^\d{4}-\d{2}-\d{2}$/.test(String(c.prazo || '')) ? c.prazo : null;
        const [ordem] = await sb('op_ordens', { method: 'POST', body: JSON.stringify({ cliente: p.nome, servico: p.servico, prazo, valor_total: valor, pedido_id: p.id, nota_interna: txt(`Pedido #${p.numero} do site. WhatsApp ${p.whatsapp}.`, 500) }) });
        const linhas = cards.map((k, i) => ({
          ordem_id: ordem.id, posicao: i, cartao_id: k.id, prazo,
          setor: nomePosto[k.posto_slug] || 'Oficina',
          titulo: k.titulo,
          instrucoes: `Pedido do cliente ${p.nome}: ${p.descricao || 'sem descrição'}\n\nGuia: abra o cartão ${k.codigo} em www.igreja.eco.br/operador/cartao/${k.id} para ver o material e o passo a passo. Entregue aqui o resultado final (texto ou link).`,
          criterio: k.pronto_quando,
        }));
        await sb('op_tarefas', { method: 'POST', body: JSON.stringify(linhas) });
        await sb(`op_atelie_pedidos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'em_producao' }) });
        return res.json({ ok: true, numero: ordem.numero, tarefas: linhas.length });
      }
      return bad(res, 'Ação inválida.');
    }

    if (tipo === 'cartao') {
      if (!UUID.test(id)) return bad(res, 'Cartão inválido.');
      const d = {};
      if (c.valor !== undefined) { if (c.valor === '' || c.valor === null) d.valor = null; else { const n = num(c.valor); if (n === null) return bad(res, 'Valor inválido.'); d.valor = n; } }
      if (c.pontos !== undefined) { const n = parseInt(c.pontos, 10); if (!(n >= 0 && n <= 100000)) return bad(res, 'Pontos inválidos.'); d.pontos = n; }
      if (c.ativo !== undefined) d.ativo = c.ativo === true;
      if (c.regras !== undefined) {
        const TP = ['min_caracteres', 'contem', 'nao_contem', 'sem_colchetes', 'min_linhas', 'anexo'];
        if (!Array.isArray(c.regras) || c.regras.length > 30) return bad(res, 'Regras inválidas.');
        d.regras = c.regras.filter((r) => r && TP.includes(r.tipo)).map((r) => ({ tipo: r.tipo, campo: txt(r.campo, 60) || '', valor: txt(r.valor, 200) || '', minimo: parseInt(r.minimo, 10) || 0, msg: txt(r.msg, 200) || '' }));
      }
      if (!Object.keys(d).length) return bad(res, 'Nada para alterar.');
      await sb(`op_cartoes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
      return res.json({ ok: true });
    }

    if (tipo === 'empreendimento') {
      const CAT = ['digital', 'comercial', 'industrial', 'tangivel'];
      const ST = ['ideia', 'planejando', 'construindo', 'operando'];
      if (acao === 'criar') {
        const nome = txt(c.nome, 120);
        if (!nome) return bad(res, 'Informe o nome.');
        const body = { nome, slug: slug(nome) || 'projeto-' + Date.now(), categoria: CAT.includes(c.categoria) ? c.categoria : 'digital', status: ST.includes(c.status) ? c.status : 'ideia', resumo: txt(c.resumo, 600) || null, publico: false };
        const [e] = await sb('op_empreendimentos', { method: 'POST', body: JSON.stringify(body) });
        return res.status(201).json({ ok: true, id: e.id });
      }
      if (!UUID.test(id)) return bad(res, 'Empreendimento inválido.');
      if (acao === 'editar') {
        const d = {};
        if (c.publico !== undefined) d.publico = c.publico === true;
        if (c.status !== undefined) { if (!ST.includes(c.status)) return bad(res, 'Status inválido.'); d.status = c.status; }
        if (c.resumo !== undefined) d.resumo = txt(c.resumo, 600) || null;
        if (c.desconto_pct !== undefined) { const n = c.desconto_pct === '' || c.desconto_pct === null ? null : parseInt(c.desconto_pct, 10); if (n !== null && !(n >= 0 && n <= 100)) return bad(res, 'Desconto inválido.'); d.desconto_pct = n; }
        if (!Object.keys(d).length) return bad(res, 'Nada para alterar.');
        await sb(`op_empreendimentos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
        return res.json({ ok: true });
      }
      if (acao === 'marco') {
        const t = txt(c.titulo, 160); if (!t) return bad(res, 'Informe o marco.');
        await sb('op_marcos', { method: 'POST', body: JSON.stringify({ empreendimento_id: id, titulo: t }) });
        return res.json({ ok: true });
      }
      if (acao === 'atualizacao') {
        const t = txt(c.texto, 800); if (!t) return bad(res, 'Escreva a atualização.');
        await sb('op_atualizacoes', { method: 'POST', body: JSON.stringify({ empreendimento_id: id, texto: t }) });
        return res.json({ ok: true });
      }
      if (acao === 'vaga') {
        const t = txt(c.titulo, 160); if (!t) return bad(res, 'Informe a vaga.');
        await sb('op_vagas_projeto', { method: 'POST', body: JSON.stringify({ empreendimento_id: id, titulo: t, descricao: txt(c.descricao, 500) || null }) });
        return res.json({ ok: true });
      }
      return bad(res, 'Ação inválida.');
    }
    return bad(res, 'Tipo inválido.');
  } catch (e) {
    console.error('admin/oficina/acao', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
