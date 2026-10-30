// Público: política de troca de cada fornecedor ativo (para o Regulamento). Não devolve contatos nem dados internos.
import { sb } from '../../../lib/varejoServer';
import { textoTroca } from '../../../lib/fornecedores';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  try {
    const emps = await sb('forn_empresas?status=eq.ativo&select=nome_fantasia,troca_defeito_dias,troca_vontade,troca_vontade_dias,troca_frete_vontade,troca_obs&order=nome_fantasia.asc&limit=100');
    return res.json({ fornecedores: emps.map((e) => ({ nome: e.nome_fantasia, troca: textoTroca(e) })) });
  } catch (e) {
    return res.json({ fornecedores: [] });
  }
}
