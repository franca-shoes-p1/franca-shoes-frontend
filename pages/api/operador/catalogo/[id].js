// Operador edita um modelo SEU, enquanto o dono ainda não publicou. Depois de publicado, só o dono muda.
import { exigirCatalogo } from '../../../../lib/operadorAuth';
import { sb, UUID } from '../../../../lib/varejoServer';
import { validarProduto, camposDoOperador } from '../../../../lib/produtosAdmin';

export default async function handler(req, res) {
  const op = await exigirCatalogo(req, res);
  if (!op) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Modelo inválido.' });
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    const [reg] = await sb(`op_catalogo_registros?produto_id=eq.${id}&operario_id=eq.${op.id}&select=id`);
    if (!reg) return res.status(404).json({ erro: 'Modelo não encontrado.' });
    const [p] = await sb(`rf_produtos?id=eq.${id}&select=id,publicado,ativo`);
    if (!p) return res.status(404).json({ erro: 'Modelo não encontrado.' });
    if (p.publicado || p.ativo) return res.status(403).json({ erro: 'Este modelo já foi publicado. Peça a alteração à coordenação.' });

    const c = req.body && typeof req.body === 'object' ? req.body : {};
    const { erro, dados } = validarProduto(camposDoOperador(c), { parcial: true });
    if (erro) return res.status(400).json({ erro });
    if (!Object.keys(dados).length) return res.status(400).json({ erro: 'Nada para alterar.' });
    const [novo] = await sb(`rf_produtos?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(dados) });
    return res.json({ produto: novo });
  } catch (e) {
    console.error('operador/catalogo/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 200) });
  }
}
