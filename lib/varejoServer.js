// Ajudantes do SERVIDOR da loja de varejo (rodam só na Vercel).
// Usam as mesmas variáveis de ambiente que a loja atual: SUPABASE_URL e SUPABASE_SERVICE_KEY.

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// O projeto tem duas variáveis com a chave de serviço (SUPABASE_SERVICE_KEY e SUPABASE_SERVICE_ROLE_KEY).
// Se uma estiver inválida, usa a outra e lembra qual funcionou.
let chaveBoa = null;
const chavesPossiveis = () => [...new Set([process.env.SUPABASE_SERVICE_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY].filter(Boolean))];
export const chaveAtiva = () => chaveBoa || chavesPossiveis()[0];

export async function sb(caminho, init = {}) {
  const base = process.env.SUPABASE_URL;
  const todas = chavesPossiveis();
  if (!base || !todas.length) throw new Error('config');
  const ordem = chaveBoa ? [chaveBoa, ...todas.filter((k) => k !== chaveBoa)] : todas;
  let ultimo = '';
  for (const chave of ordem) {
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
    if (r.ok) {
      chaveBoa = chave;
      return t ? JSON.parse(t) : [];
    }
    ultimo = t.slice(0, 200);
    // chave recusada (JWT inválido, vencido, de outro projeto): tenta a próxima
    if (!(r.status === 401 || r.status === 403 || /JWT|Invalid API key/i.test(t))) throw new Error('db: ' + ultimo);
  }
  throw new Error('db: ' + ultimo);
}

export const txt = (v, n) => String(v ?? '').trim().slice(0, n);

// Endereço público do site (para o Mercado Pago saber onde devolver o cliente).
export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}
