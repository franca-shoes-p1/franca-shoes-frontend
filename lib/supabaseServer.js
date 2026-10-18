// Ajudantes do SERVIDOR (só rodam na Vercel, nunca no navegador).
// Usam a chave secreta do Supabase, que fica nas variáveis de ambiente da Vercel.

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function sb(path, { method = 'GET', body, prefer } = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltam as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel');
  }
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;

  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const texto = await res.text();
  let dados = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch (e) {
    dados = null;
  }
  if (!res.ok) {
    const detalhe = (dados && (dados.message || dados.hint)) || texto || res.status;
    throw new Error(`Supabase: ${detalhe}`);
  }
  return dados;
}

export function limparSlug(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Só aceita endereços https:// (evita links perigosos na página pública)
export function urlOk(u) {
  if (u === null || u === undefined || u === '') return true;
  try {
    return new URL(String(u)).protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Chama o n8n. tipo = 'gerar' ou 'reescrever'
export async function chamarN8n(tipo, ebookId) {
  const url = tipo === 'gerar' ? process.env.N8N_WEBHOOK_GERAR : process.env.N8N_WEBHOOK_REESCREVER;
  if (!url) throw new Error('Falta a variável N8N_WEBHOOK_' + tipo.toUpperCase() + ' na Vercel');
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-token': process.env.N8N_WEBHOOK_TOKEN || '',
      },
      body: JSON.stringify({ ebook_id: ebookId }),
      signal: controle.signal,
    });
    if (!res.ok) throw new Error(`n8n respondeu ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}
