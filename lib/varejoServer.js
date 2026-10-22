// Ajudantes do SERVIDOR da loja de varejo (rodam só na Vercel).
// Usam as mesmas variáveis de ambiente que a loja atual: SUPABASE_URL e SUPABASE_SERVICE_KEY.

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function sb(caminho, init = {}) {
  const base = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !chave) throw new Error('config');
  const r = await fetch(`${base}/rest/v1/${caminho}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: chave,
      ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
  const t = await r.text();
  if (!r.ok) throw new Error('db: ' + t.slice(0, 200));
  return t ? JSON.parse(t) : [];
}

export const txt = (v, n) => String(v ?? '').trim().slice(0, n);

// Endereço público do site (para o Mercado Pago saber onde devolver o cliente).
export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}
