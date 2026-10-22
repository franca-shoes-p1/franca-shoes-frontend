// Foto de um modelo (painel do dono). A lógica fica em lib/uploadFoto.js, compartilhada com o operador.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { receberFoto } from '../../../../lib/uploadFoto';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  return receberFoto(req, res);
}
