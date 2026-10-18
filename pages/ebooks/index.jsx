import Head from 'next/head';
import { sb } from '../../lib/supabaseServer';

const brl = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
const fotoOk = (u) => typeof u === 'string' && u.startsWith('https://');

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    // Só campos públicos: os links de arquivo (PDF/EPUB) nunca saem do servidor.
    const ebooks = await sb(
      'ebooks?publicado=eq.true&select=slug,titulo,subtitulo,descricao_venda,preco,capa_url&order=criado_em.desc&limit=100'
    );
    return { props: { ebooks: ebooks || [] } };
  } catch (e) {
    return { props: { ebooks: [] } };
  }
}

export default function Ebooks({ ebooks }) {
  return (
    <main className="eb">
      <Head>
        <title>E-books práticos | Igreja Eco</title>
        <meta name="description" content="E-books práticos do tipo como fazer, para quem quer aprender e colocar em prática." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{`
        .eb{--bg:#fbfaf7;--cd:#fff;--bd:#e5e1d8;--tx:#1d2420;--mu:#5f6b64;--ac:#1f6b4a;background:var(--bg);color:var(--tx);min-height:100vh;
          font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5;padding:16px 16px 80px}
        @media (prefers-color-scheme: dark){.eb{--bg:#0f1512;--cd:#17211c;--bd:#26332c;--tx:#e8eee9;--mu:#a2b0a7;--ac:#57c08e}}
        .eb-in{max-width:1000px;margin:0 auto}
        .eb h1{font-size:clamp(24px,5vw,36px);margin:12px 0 6px}
        .eb-mu{color:var(--mu);font-size:14px}
        .eb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-top:18px}
        .eb-card{background:var(--cd);border:1px solid var(--bd);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit}
        .eb-capa{aspect-ratio:3/4;background:var(--bd);display:flex;align-items:center;justify-content:center;font-size:42px}
        .eb-capa img{width:100%;height:100%;object-fit:cover}
        .eb-corpo{padding:14px;display:flex;flex-direction:column;gap:6px;flex:1}
        .eb-corpo h3{margin:0;font-size:17px}
        .eb-preco{font-weight:700;color:var(--ac);margin-top:auto}
        .eb-vazio{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:22px;margin-top:18px}
        .eb a.eb-voltar{color:var(--ac);font-size:14px}
      `}</style>
      <div className="eb-in">
        <a className="eb-voltar" href="/">← Início</a>
        <h1>E-books práticos</h1>
        <p className="eb-mu">Guias do tipo como fazer, em português simples.</p>

        {ebooks.length === 0 && (
          <div className="eb-vazio">
            <b>Em breve.</b>
            <p className="eb-mu">Os primeiros e-books estão sendo preparados.</p>
          </div>
        )}

        <div className="eb-grid">
          {ebooks.map((e) => (
            <a href={`/ebooks/${e.slug}`} className="eb-card" key={e.slug}>
              <div className="eb-capa">{fotoOk(e.capa_url) ? <img src={e.capa_url} alt={e.titulo} loading="lazy" /> : '📘'}</div>
              <div className="eb-corpo">
                <h3>{e.titulo}</h3>
                {e.subtitulo && <span className="eb-mu">{e.subtitulo}</span>}
                {e.preco != null && <span className="eb-preco">{brl(e.preco)}</span>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
