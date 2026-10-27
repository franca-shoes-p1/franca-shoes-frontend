// Edita um operador: ativar/desativar, nível, dados, ou gerar um código novo (o antigo deixa de valer).
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID, txt } from '../../../../lib/varejoServer';
import { novoCodigo, hashCodigo } from '../../../../lib/operadorAuth';

const NIVEIS = ['iniciante', 'aprovado', 'referencia'];

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Operador inválido.' });
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    const c = req.body && typeof req.body === 'object' ? req.body : {};
    const d = {};
    if (c.nome !== undefined) d.nome = txt(c.nome, 120);
    if (c.setor !== undefined) d.setor = txt(c.setor, 80);
    if (c.whatsapp !== undefined) d.whatsapp = txt(c.whatsapp, 30) || null;
    if (c.chave_pix !== undefined) d.chave_pix = txt(c.chave_pix, 120) || null;
    if (c.nota_interna !== undefined) d.nota_interna = txt(c.nota_interna, 500) || null;
    if (c.nivel !== undefined) {
      if (!NIVEIS.includes(c.nivel)) return res.status(400).json({ erro: 'Nível inválido.' });
      d.nivel = c.nivel;
    }
    if (c.ativo !== undefined) d.ativo = !!c.ativo;
    if (c.pode_catalogo !== undefined) d.pode_catalogo = !!c.pode_catalogo;
    if (c.pode_postagens !== undefined) d.pode_postagens = !!c.pode_postagens;
    let codigo = null;
    if (c.novo_codigo) {
      codigo = novoCodigo();
      d.codigo_hash = hashCodigo(codigo);
    }
    if ((d.nome !== undefined && !d.nome) || (d.setor !== undefined && !d.setor)) return res.status(400).json({ erro: 'Nome e setor não podem ficar vazios.' });
    if (!Object.keys(d).length) return res.status(400).json({ erro: 'Nada para alterar.' });
    const [op] = await sb(`op_operarios?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d) });
    if (!op) return res.status(404).json({ erro: 'Operador não encontrado.' });
    delete op.codigo_hash;
    return res.json({ operador: op, codigo });
  } catch (e) {
    console.error('admin/operadores/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
