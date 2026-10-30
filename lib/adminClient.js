// Ajudantes do NAVEGADOR para as páginas do painel (sem nada secreto aqui).

export async function api(url, opts = {}) {
  const config = {
    method: opts.method || 'GET',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  };
  if (opts.body !== undefined) config.body = JSON.stringify(opts.body);
  const res = await fetch(url, config);
  let dados = null;
  try {
    dados = await res.json();
  } catch (e) {
    dados = null;
  }
  if (!res.ok) {
    const erro = new Error((dados && dados.erro) || `Erro ${res.status}`);
    erro.status = res.status;
    throw erro;
  }
  return dados;
}

export const STATUS_EBOOK = {
  rascunho: 'Rascunho',
  escrevendo: 'Escrevendo…',
  revisao_humana: 'Aguardando sua revisão',
  pronto: 'Pronto (não publicado)',
  publicado: 'Publicado',
  erro: 'Erro',
};

export const STATUS_CAP = {
  pendente: 'Pendente',
  escrito: 'Escrito',
  aprovado: 'Aprovado',
  reescrever: 'Reescrever',
};

export const ADMIN_CSS = `
.ea{--bg:#f6f8fb;--cd:#fff;--bd:#dbe3ee;--tx:#14202e;--mu:#5d6b7c;--ac:#1d4ed8;--ok:#15803d;--er:#b91c1c;--am:#b45309;
  background:var(--bg);color:var(--tx);min-height:100vh;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;padding:20px 16px 80px}
@media (prefers-color-scheme: dark){.ea{--bg:#0e1522;--cd:#162033;--bd:#26344d;--tx:#e8eef7;--mu:#9fb0c6;--ac:#6ea0ff;--ok:#4ade80;--er:#f87171;--am:#fbbf24}}
.ea-in{max-width:980px;margin:0 auto}
.ea h1{font-size:26px;margin:0 0 4px}
.ea h2{font-size:18px;margin:0 0 10px}
.ea a{color:var(--ac)}
.ea-mu{color:var(--mu);font-size:14px}
.ea-card{background:var(--cd);border:1px solid var(--bd);border-radius:12px;padding:16px;margin-top:16px}
.ea-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.ea-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.ea label{display:block;font-size:13px;color:var(--mu);margin-bottom:4px}
.ea input,.ea textarea,.ea select{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--tx);font:inherit}
.ea textarea{min-height:120px;resize:vertical}
.ea-btn{display:inline-block;background:var(--ac);color:#fff;border:0;border-radius:8px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer;text-decoration:none}
.ea-btn:disabled{opacity:.5;cursor:default}
.ea-btn2{background:transparent;color:var(--ac);border:1px solid var(--ac)}
.ea-btn-ok{background:var(--ok)}
.ea-btn-er{background:var(--er)}
.ea-btn2.ea-btn-er{background:transparent;color:var(--er);border:1px solid var(--er)}
.ea a.ea-btn{color:#fff;text-decoration:none}
.ea a.ea-btn2{color:var(--ac)}
.ea-tag{display:inline-block;font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid var(--bd);color:var(--mu)}
.ea-tag.ok{color:var(--ok);border-color:var(--ok)}
.ea-tag.er{color:var(--er);border-color:var(--er)}
.ea-tag.am{color:var(--am);border-color:var(--am)}
.ea-msg{margin-top:12px;padding:10px 12px;border-radius:8px;border:1px solid var(--bd);background:var(--cd)}
.ea-msg.er{border-color:var(--er);color:var(--er)}
.ea-msg.ok{border-color:var(--ok);color:var(--ok)}
.ea-item{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--bd)}
.ea-item:first-child{border-top:0}
`;
