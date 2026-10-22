// Catálogo PÚBLICO do varejo. Mostra só modelos publicados que tenham preço de venda ao consumidor.
// Nunca devolve o custo de fábrica, o fornecedor nem o nome da fábrica.
import { sb, UUID } from '../../../lib/varejoServer';

const CAMPOS = 'id,nome,titulo_publico,descricao,categoria,material,tamanhos,foto_url,preco_venda_sugerido';

const formatar = (p) => ({
  id: p.id,
  titulo: p.titulo_publico || p.nome,
  descricao: p.descricao || '',
  categoria: p.categoria || '',
  material: p.material || '',
  tamanhos: p.tamanhos || '',
  foto: p.foto_url && /^https:\/\//.test(p.foto_url) ? p.foto_url : '',
  preco: Number(p.preco_venda_sugerido) || 0,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const filtro = 'publicado=eq.true&ativo=eq.true&preco_venda_sugerido=gt.0';
    const id = String(req.query.id || '');
    if (id) {
      if (!UUID.test(id)) return res.status(404).json({ erro: 'Produto não encontrado.' });
      const [p] = await sb(`rf_produtos?select=${CAMPOS}&${filtro}&id=eq.${id}`);
      if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ produto: formatar(p) });
    }
    const linhas = await sb(`rf_produtos?select=${CAMPOS}&${filtro}&order=criado_em.desc&limit=200`);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ produtos: linhas.map(formatar) });
  } catch (e) {
    return res.status(200).json({ produtos: [] });
  }
}
