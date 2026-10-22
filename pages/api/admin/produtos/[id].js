// Edita um modelo (ou só publica/oculta). Não apaga nada: "ocultar" é o jeito seguro de tirar da loja.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID } from '../../../../lib/varejoServer';
import { validarProduto } from '../../../../lib/produtosAdmin';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Modelo inválido.' });
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    const { erro, dados } = validarProduto(c, { parcial: true });
    if (erro) return res.status(400).json({ erro });
    if (!Object.keys(dados).length) return res.status(400).json({ erro: 'Nada para alterar.' });
    const [atualizado] = await sb(`rf_produtos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(dados) });
    if (!atualizado) return res.status(404).json({ erro: 'Modelo não encontrado.' });
    return res.json({ produto: atualizado });
  } catch (e) {
    console.error('admin/produtos/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
