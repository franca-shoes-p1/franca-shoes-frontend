// Envio do logotipo pelo parceiro (confere o token antes de aceitar o arquivo).
import { sb } from '../../../lib/varejoServer';
import { receberFoto } from '../../../lib/uploadFoto';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const token = String((req.body || {}).token || '');
  if (!/^[0-9a-f]{24}$/.test(token)) return res.status(404).json({ erro: 'Link inválido.' });
  try {
    const [p] = await sb(`rf_pontos?token_convite=eq.${token}&select=id,status`);
    if (!p || !['autorizado', 'ativo'].includes(p.status)) return res.status(403).json({ erro: 'Não autorizado.' });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível concluir.' });
  }
  return receberFoto(req, res);
}
