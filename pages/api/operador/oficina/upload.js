// Imagem (print/arte) anexada a uma entrega.
import { exigirOperador } from '../../../../lib/operadorAuth';
import { receberFoto } from '../../../../lib/uploadFoto';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  if (!op.aceite_em) return res.status(403).json({ erro: 'Aceite as regras de trabalho primeiro.' });
  return receberFoto(req, res);
}
