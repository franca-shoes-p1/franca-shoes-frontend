// Registros do sócio: retirada, sobra e fechamento do dia. Todas as regras são conferidas aqui no servidor.
import { sb, txt } from '../../../../lib/varejoServer';
import { exigirSocio } from '../../../../lib/praiaAuth';

const dinheiro = (v) => { const n = parseFloat(String(v ?? '0').replace(/\./g, '').replace(',', '.')); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
const bad = (res, m) => res.status(400).json({ erro: m });

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  const s = await exigirSocio(req, res);
  if (!s) return;
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const hoje = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
  try {
    if (c.tipo === 'movimento') {
      if (!(s.cadastro_ambulante && s.curso_manipulacao && s.contrato_assinado)) return bad(res, 'O kit ainda não foi liberado: faltam cadastro de ambulante, curso ou contrato.');
      const kind = c.mov === 'sobra' ? 'sobra' : 'saida';
      const produto = parseInt(c.produto_id, 10);
      const qtd = parseInt(c.quantidade, 10);
      if (!(produto > 0) || !(qtd >= 0) || qtd > 10000) return bad(res, 'Escolha o produto e uma quantidade válida.');
      if (kind === 'saida') {
        // sem fechamento do dia anterior não há nova retirada
        const antes = await sb(`praia_estoque_movimentos?parceiro_id=eq.${s.id}&data=lt.${hoje}&select=data&order=data.desc&limit=1`);
        if (antes[0]) {
          const f = await sb(`praia_fechamentos?parceiro_id=eq.${s.id}&data=eq.${antes[0].data}&select=id`);
          if (!f.length) return bad(res, `Falta o fechamento de ${antes[0].data.split('-').reverse().join('/')}. Faça o fechamento antes de retirar estoque.`);
        }
      }
      const fech = await sb(`praia_fechamentos?parceiro_id=eq.${s.id}&data=eq.${hoje}&select=id`);
      if (fech.length) return bad(res, 'O dia de hoje já foi fechado.');
      await sb('praia_estoque_movimentos', { method: 'POST', body: JSON.stringify({ parceiro_id: s.id, produto_id: produto, tipo: kind, quantidade: qtd, data: hoje, foto_url: txt(c.foto_url, 400) || null }) });
      return res.json({ ok: true });
    }
    if (c.tipo === 'fechamento') {
      const pix = dinheiro(c.valor_pix), din = dinheiro(c.valor_dinheiro), gelo = dinheiro(c.gelo_embalagem);
      if (pix === null || din === null || gelo === null) return bad(res, 'Confira os valores informados.');
      const jaTem = await sb(`praia_fechamentos?parceiro_id=eq.${s.id}&data=eq.${hoje}&select=id`);
      if (jaTem.length) return bad(res, 'O dia de hoje já foi fechado.');
      const saidas = await sb(`praia_estoque_movimentos?parceiro_id=eq.${s.id}&data=eq.${hoje}&tipo=eq.saida&select=id&limit=1`);
      if (!saidas.length) return bad(res, 'Registre a retirada de estoque antes de fechar o dia.');
      await sb('praia_fechamentos', { method: 'POST', body: JSON.stringify({ parceiro_id: s.id, data: hoje, valor_pix: pix, valor_dinheiro: din, gelo_embalagem: gelo }) });
      return res.json({ ok: true });
    }
    return bad(res, 'Ação inválida.');
  } catch (e) {
    console.error('praia/socio/acao', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar agora.' });
  }
}
