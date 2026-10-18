import Head from 'next/head';
import { sb } from '../../lib/supabaseServer';

const WHATS = '5516991543663';
const brl = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
const httpsOk = (u) => typeof u === 'string' && u.startsWith('https://');

export async function getServerSideProps({ params, res }) {
  const slug = String(params.slug || '');
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return { notFound: true };
  try {
    // Só campos públicos e só os TÍTULOS dos capítulos (nunca o texto nem os links dos arquivos).
    const r = await sb(
      `ebooks?slug=eq.${slug}&publicado=eq.true&select=slug,titulo,subtitulo,descricao_venda,preco,capa_url,link_pagamento,ebook_chapters(ordem,titulo)&ebook_chapters.order=ordem.asc&limit=1`
    );
    if (!r || !r.length) return { notFound: true };
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return { props: { ebook: r[0] } };
  } catch (e) {
    return { notFound: true };
  }
}

export default function EbookPagina({ ebook }) {
  const comprar = httpsOk(ebook.link_pagamento)
    ? ebook.link_pagamento
    : `https://wa.me/${WHATS}?text=${encodeURIComponent(`Olá! Quero comprar o e-book "${ebook.titulo}".`)}`;
  const caps = ebook.ebook_chapters || [];

  return (
    <main className="eb">
      <Head>
        <title>{ebook.titulo} | Igreja Eco</title>
        <meta name="description" content={(ebook.descricao_venda || ebook.titulo).slice(0, 155)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{`
        .eb{--bg:#fbfaf7;--cd:#fff;--bd:#e5e1d8;--tx:#1d2420;--mu:#5f6b64;--ac:#1f6b4a;background:var(--bg);color:var(--tx);min-height:100vh;
          font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;padding:16px 16px 80px}
        @media (prefers-color-scheme: dark){.eb{--bg:#0f1512;--cd:#17211c;--bd:#26332c;--tx:#e8eee9;--mu:#a2b0a7;--ac:#57c08e}}
        .eb-in{max-width:860px;margin:0 auto}
        .eb a.eb-voltar{color:var(--ac);font-size:14px}
        .eb-topo{display:grid;grid-template-columns:minmax(0,260px) 1fr;gap:22px;margin-top:14px}
        @media (max-width:640px){.eb-topo{grid-template-columns:1fr}}
        .eb-capa{aspect-ratio:3/4;background:var(--bd);border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:64px}
        .eb-capa img{width:100%;height:100%;object-fit:cover}
        .eb h1{font-size:clamp(24px,5vw,34px);margin:0 0 6px;line-height:1.2}
        .eb-mu{color:var(--mu)}
        .eb-preco{font-size:28px;font-weight:800;color:var(--ac);margin:12px 0}
        .eb-btn{display:inline-block;background:var(--ac);color:#fff;border-radius:10px;padding:14px 24px;font-weight:700;text-decoration:none}
        .eb-card{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-top:18px}
        .eb-card h2{margin:0 0 8px;font-size:19px}
        .eb-texto{white-space:pre-line}
        .eb ol{margin:0;padding-left:22px}
      `}</style>
      <div className="eb-in">
        <a className="eb-voltar" href="/ebooks">← Todos os e-books</a>
        <div className="eb-topo">
          <div className="eb-capa">{httpsOk(ebook.capa_url) ? <img src={ebook.capa_url} alt={ebook.titulo} /> : '📘'}</div>
          <div>
            <h1>{ebook.titulo}</h1>
            {ebook.subtitulo && <p className="eb-mu">{ebook.subtitulo}</p>}
            {ebook.preco != null && <div className="eb-preco">{brl(ebook.preco)}</div>}
            <a className="eb-btn" href={comprar} target="_blank" rel="noopener noreferrer">
              Quero este e-book
            </a>
            <p className="eb-mu" style={{ fontSize: 13 }}>
              Formato digital (PDF). Você recebe o arquivo após a confirmação do pagamento.
            </p>
          </div>
        </div>

        {ebook.descricao_venda && (
          <div className="eb-card">
            <h2>Sobre este e-book</h2>
            <div className="eb-texto">{ebook.descricao_venda}</div>
          </div>
        )}

        {caps.length > 0 && (
          <div className="eb-card">
            <h2>O que você vai aprender</h2>
            <ol>
              {caps.map((c) => (
                <li key={c.ordem}>{c.titulo}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
