// Contador público de vagas: só números, nada pessoal. Se o SQL ainda não foi rodado, devolve zero.
import { calcularVagas } from '../../../lib/praiaAuth';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
  try {
    return res.json(await calcularVagas());
  } catch (e) {
    return res.json({ cidades: [], total: 0, livres: 0 });
  }
}
