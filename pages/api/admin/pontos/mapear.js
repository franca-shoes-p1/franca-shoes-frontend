// Busca locais da cidade no OpenStreetMap e cadastra como "Mapeado". Só no painel.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { mapearCidade } from '../../../../lib/mapearCidade';

export const config = { maxDuration: 40 };

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const r = await mapearCidade(req.body && typeof req.body === 'object' ? req.body : {});
  return res.status(r.status).json(r.json);
}
