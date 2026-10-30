// Foto de modelo enviada pelo fornecedor (confere o token antes de aceitar o arquivo).
import { acharEmpresa } from '../../../lib/fornecedoresServer';
import { receberFoto } from '../../../lib/uploadFoto';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const e = await acharEmpresa((req.body || {}).token);
    if (!e || e.status !== 'ativo') return res.status(403).json({ erro: 'Não autorizado.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Não foi possível concluir.' });
  }
  return receberFoto(req, res);
}
