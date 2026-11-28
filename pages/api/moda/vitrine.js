// Vitrine pública (principal ou de um lojista). Só devolve o que o comprador pode ver.
import { vitrinePublica, faltaTabela } from '../../../lib/lojaLive';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    const d = await vitrinePublica(req.query.l);
    if (!d) return res.status(404).json({ erro: 'Loja não encontrada.' });
    return res.json(d);
  } catch (e) {
    if (faltaTabela(e)) return res.json({ loja: null, produtos: [] });
    console.error('vitrine', e.message);
    return res.status(500).json({ erro: 'A vitrine está indisponível agora.' });
  }
}
