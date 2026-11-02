// Informação pública do passe: preço e desconto por ramo (sem custo nenhum).
import { carregarConfigAssinatura } from '../../../lib/assinaturaServer';
export default async function handler(req, res) {
  const cfg = await carregarConfigAssinatura();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.json({ preco_passe: cfg.preco_passe, ramos: cfg.ramos });
}
