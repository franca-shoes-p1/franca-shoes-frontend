// Painel das encomendas da Entrega em Casa: listar, mudar a situação, anotar cotação. Só para quem fez login no painel.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { LISTA_STATUS_ENC } from '../../../lib/encomendas';

async function carregar() {
  const encomendas = await sb('rf_encomendas?select=*&order=criado_em.desc&limit=500');
  return { encomendas };
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
    if (c.acao !== 'atualizar') return res.status(400).json({ erro: 'Ação inválida.' });
    const id = txt(c.id, 40);
    if (!UUID.test(id)) return res.status(400).json({ erro: 'Encomenda inválida.' });
    const d = { atualizado_em: new Date().toISOString() };
    if (c.status !== undefined) {
      if (!LISTA_STATUS_ENC.includes(c.status)) return res.status(400).json({ erro: 'Situação inválida.' });
      d.status = c.status;
    }
    if (c.preco_cotado !== undefined) {
      if (c.preco_cotado === '' || c.preco_cotado === null) d.preco_cotado = null;
      else {
        const v = Number(String(c.preco_cotado).replace(',', '.'));
        if (!(v >= 0 && v < 100000)) return res.status(400).json({ erro: 'Preço inválido.' });
        d.preco_cotado = Math.round(v * 100) / 100;
      }
    }
    if (c.empresa_sugerida !== undefined) d.empresa_sugerida = txt(c.empresa_sugerida, 160) || null;
    if (c.observacao !== undefined) d.observacao = txt(c.observacao, 600) || null;
    await sb(`rf_encomendas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
    return res.json({ ...(await carregar()), aviso: 'Salvo.' });
  } catch (e) {
    const falta = /rf_encomendas|relation|does not exist|schema cache/i.test(e.message);
    console.error('admin/encomendas', e.message);
    return res.status(500).json({ erro: falta ? 'A tabela rf_encomendas ainda não existe: rode o SQL supabase-encomendas.sql.' : 'Não foi possível carregar agora.' });
  }
}
