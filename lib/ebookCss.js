// Estilo compartilhado da vitrine e da página de venda dos e-books.
// Visual aprovado: verde-floresta + amarelo-gema, fontes Bricolage Grotesque e Nunito Sans.
export const FONTES =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=Nunito+Sans:wght@400;600;700&display=swap';

export const css = `
.eb{--g:#1F4D3A;--gd:#0F3324;--y:#F2B632;--ink:#14201A;--mu:#46554B;--bd:#DCE4D6;--bg:#F6F8F3;
  background:var(--bg);color:var(--ink);min-height:100vh;line-height:1.5;
  font-family:'Nunito Sans',system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
.eb *{box-sizing:border-box}
.eb a{color:var(--g)}
.eb h1,.eb h2,.eb h3{font-family:'Bricolage Grotesque',system-ui,sans-serif;margin:0}
.eb-wrap{max-width:1160px;margin:0 auto;padding:0 24px}

.eb-head{background:#fff;border-bottom:1px solid var(--bd)}
.eb-head .eb-wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding-top:18px;padding-bottom:18px}
.eb a.eb-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:800;font-size:22px}
.eb-logo i{width:14px;height:14px;border-radius:50%;background:var(--y);display:block}
.eb-nav{display:flex;flex-wrap:wrap;gap:24px;font-weight:600;font-size:16px}
.eb .eb-nav a{text-decoration:none;color:var(--ink);padding:4px 0;border-bottom:3px solid transparent}
.eb .eb-nav a.on{color:var(--g);border-bottom-color:var(--y)}

.eb-hero{background:var(--g)}
.eb-hero .eb-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:48px;padding-top:64px;padding-bottom:64px}
.eb-hl{flex:1 1 460px;min-width:0;display:flex;flex-direction:column;gap:20px}
.eb-eyebrow{font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--y)}
.eb-hero h1{font-weight:800;font-size:clamp(34px,4.4vw,56px);line-height:1.04;color:#fff}
.eb-hero p{margin:0;font-size:19px;line-height:1.55;color:rgba(255,255,255,.88);max-width:520px}
.eb-hr{flex:0 1 300px;min-width:220px;display:flex;justify-content:center}
.eb-hr .ebc{width:100%;max-width:280px;transform:rotate(3deg);box-shadow:0 24px 48px rgba(0,0,0,.35)}

.eb a.eb-btn{display:inline-block;background:var(--y);color:var(--ink);text-decoration:none;font-weight:700;font-size:17px;
  padding:15px 26px;border-radius:10px;align-self:flex-start;text-align:center}
.eb a.eb-btn.g{background:var(--g);color:#fff}
.eb a.eb-btn.o{background:#fff;color:var(--g);border:2px solid var(--g);padding:13px 24px}
.eb a.eb-btn.w{width:100%;font-size:18px;padding:16px 24px;border-radius:12px;align-self:stretch}

.eb-sec{padding:48px 0 72px}
.eb-sec h2{font-weight:800;font-size:34px}
.eb-sech{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:12px}
.eb-mu{color:var(--mu)}
.eb-chips{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 28px}
.eb-chip{font:inherit;font-size:15px;font-weight:700;padding:10px 18px;min-height:44px;border-radius:999px;
  border:2px solid #C5D1BF;background:#fff;color:#1F2A24;cursor:pointer}
.eb-chip[aria-pressed="true"]{background:var(--g);border-color:var(--g);color:#fff}
.eb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px}
.eb-card{background:#fff;border:1px solid var(--bd);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:14px}
.eb-card .ebc{border-radius:10px}
.eb-cb{display:flex;flex-direction:column;gap:8px;flex:1}
.eb-card h3{font-weight:700;font-size:20px;line-height:1.15}
.eb .eb-card h3 a{color:var(--ink);text-decoration:none}
.eb-card p{margin:0;font-size:15px;line-height:1.5;color:var(--mu)}
.eb-cf{display:flex;align-items:center;justify-content:space-between;gap:12px}
.eb-pr{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:800;font-size:24px;color:var(--g)}
.eb-card.soon{background:transparent;border:2px dashed #C5D1BF;justify-content:center;align-items:flex-start;gap:8px;min-height:260px}
.eb-card.soon b{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-size:20px}
.eb-vazio{background:#fff;border:1px solid var(--bd);border-radius:16px;padding:24px}

/* capa gerada automaticamente */
.ebc{container-type:inline-size;aspect-ratio:5/7;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;background:var(--bd)}
.ebc-top{padding:7cqw 7cqw 5cqw;display:flex;flex-direction:column;gap:3cqw}
.ebc-nicho{font-size:max(9px,3.4cqw);font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.ebc-tit{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:800;font-size:9.4cqw;line-height:1.03}
.ebc-bot{flex:1;min-height:0;background:var(--gd);border-radius:9cqw 9cqw 0 0;display:flex;align-items:flex-end;justify-content:center;padding:3cqw 8cqw 0;overflow:hidden}
.ebc-bot svg{width:100%;height:auto;display:block}
.ebc-img img{width:100%;height:100%;object-fit:cover;display:block}

/* página de venda */
.eb-crumb{padding:24px 0 0;font-size:15px;font-weight:600}
.eb-crumb a{text-decoration:none}
.eb-sale{display:flex;flex-wrap:wrap;gap:56px;align-items:flex-start;padding:24px 0 56px}
.eb-sc{flex:0 1 360px;min-width:240px;width:100%;max-width:360px}
.eb-sc .ebc{box-shadow:0 28px 56px rgba(20,32,26,.28)}
.eb-si{flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:20px}
.eb-tags{display:flex;flex-wrap:wrap;gap:8px}
.eb-tag{font-size:13px;font-weight:700;padding:5px 12px;border-radius:999px;background:#EEF2EA;color:#3F4D44}
.eb-tag.v{background:#DDEFD9;color:#1B5230}
.eb-si h1{font-weight:800;font-size:clamp(34px,4.2vw,52px);line-height:1.05}
.eb-sub{margin:0;font-size:20px;line-height:1.5;color:#2F3D35;font-weight:600}
.eb-desc p{margin:0 0 14px;font-size:18px;line-height:1.65;color:#2F3D35}
.eb-buy{background:#fff;border:1px solid var(--bd);border-radius:16px;padding:24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.eb-bp{display:flex;flex-direction:column;gap:4px}
.eb-bp small{font-size:14px;font-weight:600;color:var(--mu)}
.eb-bp strong{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:800;font-size:44px;line-height:1;color:var(--g)}
.eb-bp span{font-size:14px;color:var(--mu)}
.eb-bb{display:flex;flex-direction:column;gap:10px;flex:1 1 220px;max-width:320px}
.eb-learn{background:#fff;border-top:1px solid var(--bd);border-bottom:1px solid var(--bd)}
.eb-learn .eb-wrap{padding-top:56px;padding-bottom:56px;display:flex;flex-direction:column;gap:28px}
.eb-lg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px}
.eb-lc{background:var(--bg);border:1px solid var(--bd);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:12px}
.eb-ln{width:44px;height:44px;border-radius:50%;background:var(--y);color:var(--ink);display:flex;align-items:center;justify-content:center;
  font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:800;font-size:20px}
.eb-lc h3{font-weight:700;font-size:21px;line-height:1.15}
.eb-cta{background:var(--g)}
.eb-cta .eb-wrap{padding-top:56px;padding-bottom:56px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:28px}
.eb-cta h2{font-weight:800;font-size:36px;line-height:1.08;color:#fff}
.eb-cta p{margin:10px 0 0;font-size:18px;color:rgba(255,255,255,.88)}
.eb a.eb-btn.big{font-weight:800;font-size:19px;padding:18px 34px;border-radius:12px}

.eb-foot{background:var(--ink);color:#D7E0D2}
.eb-foot .eb-wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-top:32px;padding-bottom:32px;font-size:15px}
.eb-foot b{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:800;font-size:18px;color:#fff}
`;
