// Registra um clique vindo da divulgação (posts do Motor de Divulgação ou botões da página /entrar).
// Grava na tabela mk_cliques do Supabase, que alimenta o resumo diário enviado no Telegram.
// Usa a chave secreta que já existe na Vercel (SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SERVICE_KEY). Nunca devolve erro ao visitante.

const CAMPANHA = /^[a-z0-9]{3,16}$/;
const TEXTO = /[^a-z0-9_-]/g;

function limpar(v, max) {
  return String(v || '').toLowerCase().replace(TEXTO, '').slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    let b = req.body;
    if (typeof b === 'string') b = JSON.parse(b);
    b = b || {};
    const campanha = String(b.campanha || '').toLowerCase();
    const canal = limpar(b.canal, 30);
    const ref = limpar(b.ref, 30);
    if (!CAMPANHA.test(campanha) || !canal) return res.status(204).end();

    const base = process.env.SUPABASE_URL;
    const chave = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!base || !chave) return res.status(204).end();

    await fetch(`${base}/rest/v1/mk_cliques`, {
      method: 'POST',
      headers: {
        apikey: chave,
        // Chave nova (sb_secret_...) vai só em apikey; chave antiga (eyJ...) também vai em Authorization.
        ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ campanha_codigo: campanha, canal, ref: ref || null }),
    });
  } catch (e) {
    /* contar clique nunca pode atrapalhar o visitante */
  }
  return res.status(204).end();
}
