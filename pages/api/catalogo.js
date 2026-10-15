// Rota PÚBLICA do catálogo. Devolve só modelos publicados e só campos seguros.
// Nunca devolve fornecedor_id nem o nome da fábrica.
const CAMPOS = 'id,nome,titulo_publico,descricao,categoria,material,tamanhos,foto_url,custo,preco_venda_sugerido,preco_confirmado_em';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  const base = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !chave) return res.status(200).json({ modelos: [] });
  try {
    const r = await fetch(
      `${base}/rest/v1/rf_produtos?select=${CAMPOS}&publicado=eq.true&ativo=eq.true&order=criado_em.desc&limit=200`,
      {
        headers: {
          apikey: chave,
          ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
        },
      }
    );
    if (!r.ok) return res.status(200).json({ modelos: [] });
    const linhas = await r.json();
    const modelos = linhas.map((p) => ({
      id: p.id,
      titulo: p.titulo_publico || p.nome,
      descricao: p.descricao || '',
      categoria: p.categoria || '',
      material: p.material || '',
      tamanhos: p.tamanhos || '',
      foto: p.foto_url || '',
      precoFabrica: Number(p.custo) || 0,
      precoVenda: Number(p.preco_venda_sugerido) || 0,
      confirmadoEm: p.preco_confirmado_em || '',
    }));
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ modelos });
  } catch (e) {
    return res.status(200).json({ modelos: [] });
  }
}
