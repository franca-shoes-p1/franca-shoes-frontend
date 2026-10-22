// Foto de um modelo, para operador com permissão de catálogo.
import { exigirCatalogo } from '../../../../lib/operadorAuth';
import { receberFoto } from '../../../../lib/uploadFoto';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  const op = await exigirCatalogo(req, res);
  if (!op) return;
  return receberFoto(req, res);
}
