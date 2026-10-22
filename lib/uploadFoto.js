// Recebe a foto (já reduzida pelo navegador), guarda no Supabase Storage e devolve o endereço público.
// Usado pelo painel do dono (/api/admin/produtos/foto) e pelo operador com permissão de catálogo.
// O bucket "produtos" é criado sozinho na primeira vez, se ainda não existir.
import crypto from 'crypto';

const BUCKET = 'produtos';
const TIPOS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function cabecalhos(extra = {}) {
  const chave = process.env.SUPABASE_SERVICE_KEY;
  return {
    apikey: chave,
    ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
    ...extra,
  };
}

async function enviar(base, nome, buffer, tipo) {
  return fetch(`${base}/storage/v1/object/${BUCKET}/${nome}`, {
    method: 'POST',
    headers: cabecalhos({ 'Content-Type': tipo, 'Cache-Control': 'max-age=31536000' }),
    body: buffer,
  });
}

// Quem chama já conferiu o login. Só aceita POST.
export async function receberFoto(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });

  const base = process.env.SUPABASE_URL;
  if (!base || !process.env.SUPABASE_SERVICE_KEY) return res.status(500).json({ erro: 'Supabase não configurado na Vercel.' });

  const m = String((req.body && req.body.imagem) || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m || !TIPOS[m[1]]) return res.status(400).json({ erro: 'Envie uma foto JPG, PNG ou WebP.' });
  const buffer = Buffer.from(m[2], 'base64');
  if (buffer.length < 500 || buffer.length > 3 * 1024 * 1024) return res.status(400).json({ erro: 'Foto muito grande ou inválida.' });

  const nome = `${crypto.randomUUID()}.${TIPOS[m[1]]}`;
  try {
    let r = await enviar(base, nome, buffer, m[1]);
    if (!r.ok) {
      const corpo = await r.text();
      if (/bucket not found/i.test(corpo) || r.status === 404) {
        const c = await fetch(`${base}/storage/v1/bucket`, {
          method: 'POST',
          headers: cabecalhos({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
        });
        if (!c.ok && c.status !== 409) throw new Error('bucket: ' + (await c.text()).slice(0, 200));
        r = await enviar(base, nome, buffer, m[1]);
        if (!r.ok) throw new Error('upload: ' + (await r.text()).slice(0, 200));
      } else {
        throw new Error('upload: ' + corpo.slice(0, 200));
      }
    }
    return res.json({ url: `${base}/storage/v1/object/public/${BUCKET}/${nome}` });
  } catch (e) {
    console.error('uploadFoto', e.message);
    return res.status(500).json({ erro: 'Não foi possível enviar a foto: ' + e.message.slice(0, 200) });
  }
}
