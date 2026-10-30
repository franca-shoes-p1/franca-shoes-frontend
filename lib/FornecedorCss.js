// Estilo compartilhado das páginas do fornecedor (cadastro e painel). Claro/escuro automático.
export const FORN_CSS = `
.fo{--bg:#f6f8fb;--cd:#fff;--bd:#dbe3ee;--tx:#14202e;--mu:#5d6b7c;--ac:#1d4ed8;--ok:#15803d;--er:#b91c1c;--am:#b45309;background:var(--bg);color:var(--tx);min-height:100vh;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
@media (prefers-color-scheme: dark){.fo{--bg:#0e1522;--cd:#162033;--bd:#26344d;--tx:#e8eef7;--mu:#9fb0c6;--ac:#6ea0ff;--ok:#4ade80;--er:#f87171;--am:#fbbf24}}
.fo *{box-sizing:border-box}
.fo-w{max-width:980px;margin:0 auto;padding:18px 16px 60px}
.fo h1{font-size:clamp(24px,5vw,34px);line-height:1.15;margin:0 0 8px}
.fo h2{font-size:20px;margin:0 0 10px}
.fo h3{font-size:17px;margin:0 0 6px}
.fo p{margin:0 0 10px}
.fo a{color:var(--ac)}
.fo-mu{color:var(--mu)}
.fo-card{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:16px;margin:0 0 14px}
.fo-hero{background:linear-gradient(120deg,#1e3a8a,#2563eb);color:#fff;border-radius:16px;padding:26px 20px;margin:0 0 16px}
.fo-hero p{color:#e0e9ff}
.fo-pass{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin:0 0 14px;padding:0;list-style:none}
.fo-pass li{background:var(--cd);border:1px solid var(--bd);border-radius:12px;padding:12px 14px;font-size:15px}
.fo-pass b{display:block;color:var(--ac);margin-bottom:2px}
.fo label{display:block;font-weight:600;margin:12px 0 4px}
.fo input,.fo select,.fo textarea{width:100%;padding:11px 12px;border:1px solid var(--bd);border-radius:10px;background:var(--bg);color:var(--tx);font:inherit}
.fo textarea{min-height:90px}
.fo .fo-chk{display:flex;gap:10px;align-items:flex-start;font-weight:500}
.fo .fo-chk input{width:auto;margin-top:5px}
.fo-btn{display:inline-block;background:var(--ac);color:#fff;border:0;border-radius:10px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}
.fo a.fo-btn{color:#fff}
.fo-btn:disabled{opacity:.5;cursor:default}
.fo-btn2{background:transparent;color:var(--ac);border:1px solid var(--ac)}
.fo a.fo-btn2{color:var(--ac)}
.fo-ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:10px;padding:10px 14px;margin:10px 0}
.fo-er{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:10px;padding:10px 14px;margin:10px 0}
.fo-am{background:#fffbeb;border:1px solid #fde68a;color:#78350f;border-radius:10px;padding:10px 14px;margin:10px 0}
@media (prefers-color-scheme: dark){.fo-ok{background:#052e1a;border-color:#14532d;color:#86efac}.fo-er{background:#2b0d0d;border-color:#7f1d1d;color:#fca5a5}.fo-am{background:#2b1d05;border-color:#78350f;color:#fcd34d}}
.fo-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}
.fo-tabs button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.fo-tabs button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.fo-tag{display:inline-block;color:#fff;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:700}
.fo-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.fo-grid2{display:grid;gap:12px;grid-template-columns:1fr 1fr}
@media (max-width:620px){.fo-grid2{grid-template-columns:1fr}}
.fo-foto{width:120px;height:120px;border:2px dashed var(--bd);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:40px;background:var(--bg)}
.fo-foto img{width:100%;height:100%;object-fit:cover}
.fo-calc{background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:10px 14px;margin:10px 0}
.fo-calc div{display:flex;justify-content:space-between;gap:10px}
.fo-prod{display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center}
.fo-prod .fo-th{width:64px;height:64px;border-radius:8px;overflow:hidden;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:26px}
.fo-prod .fo-th img{width:100%;height:100%;object-fit:cover}
.fo details{border-top:1px solid var(--bd);padding:10px 0}
.fo summary{cursor:pointer;font-weight:700}
`;
