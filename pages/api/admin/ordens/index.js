// Ordens de produção: lista (com tarefas) e criação (com as 7 tarefas do modelo).
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, txt } from '../../../../lib/varejoServer';
import { MODELO_LOJA } from '../../../../lib/opModelos';

const data = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? v : null);
const dinheiro = (v) => {
  let s = String(v ?? '').replace(/[^\d,.-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
};

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const ordens = await sb('op_ordens?select=*&order=criado_em.desc&limit=100');
      const ids = ordens.map((o) => o.id);
      const tarefas = ids.length
        ? await sb(`op_tarefas?ordem_id=in.(${ids.join(',')})&select=*&order=posicao.asc&limit=2000`)
        : [];
      return res.json({ ordens: ordens.map((o) => ({ ...o, tarefas: tarefas.filter((t) => t.ordem_id === o.id) })) });
    }
    if (req.method === 'POST') {
      const c = req.body && typeof req.body === 'object' ? req.body : {};
      const cliente = txt(c.cliente, 120);
      const servico = txt(c.servico, 120);
      if (!cliente || !servico) return res.status(400).json({ erro: 'Informe cliente e serviço.' });
      const [ordem] = await sb('op_ordens', {
        method: 'POST',
        body: JSON.stringify({ cliente, servico, prazo: data(c.prazo), valor_total: dinheiro(c.valor_total), nota_interna: txt(c.nota_interna, 500) || null }),
      });
      if (c.modelo === 'loja') {
        const linhas = MODELO_LOJA.map((t, i) => ({
          ordem_id: ordem.id, posicao: i, setor: t.setor, titulo: t.titulo,
          instrucoes: t.instrucoes, criterio: t.criterio, depende_saldo: !!t.depende_saldo,
        }));
        await sb('op_tarefas', { method: 'POST', body: JSON.stringify(linhas) });
      }
      return res.status(201).json({ ordem });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('admin/ordens', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
