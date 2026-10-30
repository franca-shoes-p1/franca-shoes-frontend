// Catálogo PÚBLICO do varejo. Mostra só modelos publicados que tenham preço de venda ao consumidor.
// Nunca devolve o custo de fábrica, o fornecedor nem o nome da fábrica.
import { sb, UUID } from '../../../lib/varejoServer';

const CAMPOS = 'id,nome,titulo_publico,descricao,categoria,material,tamanhos,foto_url,preco_venda_sugerido';
const CAMPOS_F = CAMPOS + ',fornecedor_id,estoque_status,prazo_postagem_dias';
// Modelos de fornecedor só aparecem depois de aprovados e quando não estão esgotados.
const FILTRO_F = 'and=(or(fornecedor_id.is.null,revisao.eq.aprovado),or(estoque_status.is.null,estoque_status.neq.esgotado))';

const formatar = (p) => ({
  id: p.id,
  titulo: p.titulo_publico || p.nome,
  descricao: p.descricao || '',
  categoria: p.categoria || '',
  material: p.material || '',
  tamanhos: p.tamanhos || '',
  foto: p.foto_url && /^https:\/\//.test(p.foto_url) ? p.foto_url : '',
  preco: Number(p.preco_venda_sugerido) || 0,
  vendedor: p.vendedor || '',
  fornecedorId: p.fornecedor_id || '',
  sobConsulta: p.estoque_status === 'sob_consulta',
  prazoPostagem: p.prazo_postagem_dias || 0,
});

// Tenta com os campos de fornecedor; se o SQL de fornecedores ainda não foi rodado, volta ao jeito antigo.
async function buscar(filtro, extra) {
  try {
    const linhas = await sb(`rf_produtos?select=${CAMPOS_F}&${filtro}&${FILTRO_F}${extra}`);
    const ids = [...new Set(linhas.map((p) => p.fornecedor_id).filter(Boolean))];
    let nomes = new Map();
    if (ids.length) {
      const emp = await sb(`forn_empresas?select=id,nome_fantasia&status=eq.ativo&id=in.(${ids.join(',')})`);
      nomes = new Map(emp.map((e) => [e.id, e.nome_fantasia]));
    }
    // modelo de fornecedor cuja empresa não está ativa não aparece
    return linhas.filter((p) => !p.fornecedor_id || nomes.has(p.fornecedor_id)).map((p) => ({ ...p, vendedor: nomes.get(p.fornecedor_id) || '' }));
  } catch (e) {
    return sb(`rf_produtos?select=${CAMPOS}&${filtro}${extra}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const filtro = 'publicado=eq.true&ativo=eq.true&preco_venda_sugerido=gt.0';
    const id = String(req.query.id || '');
    if (id) {
      if (!UUID.test(id)) return res.status(404).json({ erro: 'Produto não encontrado.' });
      const [p] = await buscar(filtro, `&id=eq.${id}`);
      if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ produto: formatar(p) });
    }
    const linhas = await buscar(filtro, '&order=criado_em.desc&limit=200');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ produtos: linhas.map(formatar) });
  } catch (e) {
    return res.status(200).json({ produtos: [] });
  }
}
