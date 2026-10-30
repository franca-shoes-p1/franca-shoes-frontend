// Catálogo PÚBLICO do varejo. Mostra só modelos publicados que tenham preço de venda ao consumidor.
// Nunca devolve o custo de fábrica, o fornecedor nem o nome da fábrica.
import { sb, UUID } from '../../../lib/varejoServer';
import { textoTroca } from '../../../lib/fornecedores';
import { revPorCodigo } from '../../../lib/revendedoresServer';
import { podeVender, precoComMargem } from '../../../lib/revendedores';

const CAMPOS = 'id,nome,titulo_publico,descricao,categoria,material,tamanhos,foto_url,preco_venda_sugerido';
const CAMPOS_F = CAMPOS + ',fornecedor_id,preco_fornecedor,estoque_status,prazo_postagem_dias,prazo_confeccao_dias';
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
  preco: p.preco_final != null ? p.preco_final : Number(p.preco_venda_sugerido) || 0,
  vendedor: p.vendedor || '',
  fornecedorId: p.fornecedor_id || '',
  sobConsulta: p.estoque_status === 'sob_consulta',
  prazoPostagem: p.prazo_postagem_dias || 0,
  prazoConfeccao: p.prazo_confeccao_dias || 0,
  troca: p.troca || null,
});

// Tenta com os campos de fornecedor; se o SQL de fornecedores ainda não foi rodado, volta ao jeito antigo.
async function buscar(filtro, extra, margem = 0) {
  try {
    const linhas = await sb(`rf_produtos?select=${CAMPOS_F}&${filtro}&${FILTRO_F}${extra}`);
    const ids = [...new Set(linhas.map((p) => p.fornecedor_id).filter(Boolean))];
    let empresas = new Map();
    if (ids.length) {
      const emp = await sb(`forn_empresas?select=id,nome_fantasia,troca_defeito_dias,troca_vontade,troca_vontade_dias,troca_frete_vontade,troca_obs,comissao_pct&status=eq.ativo&id=in.(${ids.join(',')})`);
      empresas = new Map(emp.map((e) => [e.id, e]));
    }
    // modelo de fornecedor cuja empresa não está ativa não aparece
    return linhas
      .filter((p) => !p.fornecedor_id || empresas.has(p.fornecedor_id))
      .map((p) => {
        const e = empresas.get(p.fornecedor_id);
        const pf = Number(p.preco_fornecedor);
        const preco_final = e && pf > 0 ? precoComMargem(pf, e.comissao_pct, margem) : null;
        return { ...p, vendedor: e ? e.nome_fantasia : '', troca: e ? textoTroca(e) : null, preco_final };
      });
  } catch (e) {
    return sb(`rf_produtos?select=${CAMPOS}&${filtro}${extra}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const filtro = 'publicado=eq.true&ativo=eq.true&preco_venda_sugerido=gt.0';
    // Link de revendedor (?rev=CODIGO): o preço já inclui a margem dele. Link inativo: avisa e mostra o preço normal.
    let rev = null;
    let revInativo = false;
    const codigo = String(req.query.rev || '');
    if (codigo) {
      const r = await revPorCodigo(codigo).catch(() => null);
      if (r && podeVender(r)) rev = { nome: r.nome, cidade: r.cidade, estado: r.estado, margem: Number(r.margem_pct) || 0 };
      else revInativo = true;
    }
    const margem = rev ? rev.margem : 0;
    const id = String(req.query.id || '');
    if (id) {
      if (!UUID.test(id)) return res.status(404).json({ erro: 'Produto não encontrado.' });
      const [p] = await buscar(filtro, `&id=eq.${id}`, margem);
      if (!p) return res.status(404).json({ erro: 'Produto não encontrado.' });
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ produto: formatar(p), revendedor: rev ? { nome: rev.nome, cidade: rev.cidade, estado: rev.estado } : null, revInativo });
    }
    const linhas = await buscar(filtro, '&order=criado_em.desc&limit=200', margem);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ produtos: linhas.map(formatar), revendedor: rev ? { nome: rev.nome, cidade: rev.cidade, estado: rev.estado } : null, revInativo });
  } catch (e) {
    return res.status(200).json({ produtos: [] });
  }
}
