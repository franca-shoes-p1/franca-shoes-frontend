// Lista e cadastra modelos (calçados/acessórios). Só para quem fez login no painel.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb } from '../../../../lib/varejoServer';
import { validarProduto, CAMPOS_ADMIN } from '../../../../lib/produtosAdmin';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const produtos = await sb(`rf_produtos?select=${CAMPOS_ADMIN}&order=criado_em.desc&limit=500`);
      return res.json({ produtos });
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
