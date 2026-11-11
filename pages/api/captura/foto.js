// Recebe UMA foto (JPEG já reduzida no celular, enviada como arquivo cru) e guarda no bucket "fotos".
import { exigirLogin, guardarFoto } from '../../../lib/capturaServer';

export const config = { api: { bodyParser: false } };

const PASTAS = ['produto', 'etiqueta', 'ponto'];
const MAX = 4 * 1024 * 1024; // a Vercel aceita no máximo ~4,5 MB por envio

function lerCorpo(req) {
  return new Promise((ok, falha) => {
    const partes = [];
    let total = 0;
    req.on('data', (c) => {
      total += c.length;
      if (total > MAX) { falha(new Error('grande')); req.destroy(); } else partes.push(c);
    });
    req.on('end', () => ok(Buffer.concat(partes)));
    req.on('error', falha);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!exigirLogin(req, res)) return;
  const pasta = String(req.query.tipo || '');
  if (!PASTAS.includes(pasta)) return res.status(400).json({ erro: 'Tipo de foto inválido.' });
  try {
    const buf = await lerCorpo(req);
    if (buf.length < 500 || !(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) return res.status(400).json({ erro: 'Envie uma foto JPEG.' });
    const url = await guardarFoto(buf, pasta);
    return res.json({ url });
  } catch (e) {
    if (e.message === 'grande') return res.status(413).json({ erro: 'Foto muito grande.' });
    console.error('captura/foto', e.message);
    return res.status(500).json({ erro: 'Não foi possível guardar a foto agora.' });
  }
}
