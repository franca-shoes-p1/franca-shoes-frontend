// Escola de Agropecuária Ecológica: ajudantes que servem para o navegador e para o servidor.

// Aceita só links do YouTube e devolve o código do vídeo (ou null). Evita colar endereço estranho na página.
export function youtubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(String(url).trim());
    if (u.protocol !== 'https:') return null;
    const h = u.hostname.replace(/^www\.|^m\./, '');
    let id = null;
    if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else {
        const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/?]+)/);
        if (m) id = m[2];
      }
    }
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
  } catch (e) {
    return null;
  }
}

export const slugEscola = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export async function chamar(url, opts = {}) {
  const config = { method: opts.method || 'GET', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } };
  if (opts.body !== undefined) config.body = JSON.stringify(opts.body);
  const res = await fetch(url, config);
  let dados = null;
  try { dados = await res.json(); } catch (e) { dados = null; }
  if (!res.ok) {
    const erro = new Error((dados && dados.erro) || `Erro ${res.status}`);
    erro.status = res.status;
    throw erro;
  }
  return dados;
}
