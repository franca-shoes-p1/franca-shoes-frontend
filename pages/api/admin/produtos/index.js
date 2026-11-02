// Lista e cadastra modelos (calçados/acessórios). Só para quem fez login no painel.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb } from '../../../../lib/varejoServer';
import { validarProduto, CAMPOS_ADMIN, CAMPOS_ADMIN_FAB } from '../../../../lib/produtosAdmin';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      // Com o SQL das fábricas rodado, traz também a fábrica de cada modelo e a lista de fábricas.
      let produtos;
      let fabricas = [];
      try {
        produtos = await sb(`rf_produtos?select=${CAMPOS_ADMIN_FAB}&order=criado_em.desc&limit=500`);
        fabricas = await sb('cal_fabricas?select=id,nome_interno,lote_minimo_pares&ativo=eq.true&order=nome_interno');
      } catch (e) {
        produtos = await sb(`rf_produtos?select=${CAMPOS_ADMIN}&order=criado_em.desc&limit=500`);
      }
      // Marca os modelos cadastrados por operadores (para você revisar antes de publicar).
      // Se o SQL do catálogo ainda não foi rodado, simplesmente não marca.
      try {
        const regs = await sb('op_catalogo_registros?select=produto_id&limit=2000');
        const deOp = new Set(regs.map((r) => r.produto_id));
        produtos.forEach((p) => { if (deOp.has(p.id)) p.de_operador = true; });
      } catch (e) {}
      return res.json({ produtos, fabricas });
    }
    if (req.method === 'POST') {
      const c = req.body && typeof req.body === 'object' ? req.body : {};
      const { erro, dados } = validarProduto(c);
      if (erro) return res.status(400).json({ erro });
      dados.publicado = c.publicado === undefined ? true : !!c.publicado;
      dados.ativo = dados.publicado;
      const [criado] = await sb('rf_produtos', { method: 'POST', body: JSON.stringify(dados) });
      return res.status(201).json({ produto: criado });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('admin/produtos', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
