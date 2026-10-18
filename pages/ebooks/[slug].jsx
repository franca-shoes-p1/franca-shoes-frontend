import Head from 'next/head';
import { sb } from '../../lib/supabaseServer';
import { css, FONTES } from '../../lib/ebookCss';
import EbookCapa from '../../lib/EbookCapa';
import { Cabecalho, Rodape, WHATS } from '../../lib/EbookLayout';

const brl = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
const httpsOk = (u) => typeof u === 'string' && u.startsWith('https://');
const limpa = (t) => String(t || '').replace(/\*\*/g, '').replace(/^#+\s*/gm, '').trim();

export async function getServerSideProps({ params, res }) {
  const slug = String(params.slug || '');
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return { notFound: true };
  try {
    // Só campos públicos e só os TÍTULOS dos capítulos (nunca o texto nem os links dos arquivos).
    const r = await sb(
      `ebooks?slug=eq.${slug}&publicado=eq.true&select=slug,titulo,subtitulo,nicho,publico,descricao_venda,preco,capa_url,link_pagamento,ebook_chapters(ordem,titulo)&ebook_chapters.order=ordem.asc&limit=1`
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
  const duvida = `https://wa.me/${WHATS}?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre o e-book "${ebook.titulo}".`)}`;
  const caps = ebook.ebook_chapters || [];
  const paragrafos = limpa(ebook.descricao_venda).split(/\n{2,}|\n/).filter(Boolean);

  return (
    <div className="eb">
      <Head>
        <title>{ebook.titulo} | Igreja Eco</title>
        <meta name="description" content={limpa(ebook.descricao_venda || ebook.titulo).slice(0, 155)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={FONTES} />
      </Head>
      <style>{css}</style>

      <Cabecalho ativo="ebooks" />

      <div className="eb-wrap">
        <div className="eb-crumb">
          <a href="/ebooks">← Todos os e-books</a>
        </div>

        <section className="eb-sale">
          <div className="eb-sc">
            <EbookCapa titulo={ebook.titulo} nicho={ebook.nicho} capaUrl={ebook.capa_url} slug={ebook.slug} />
          </div>

          <div className="eb-si">
            <div className="eb-tags">
              {ebook.nicho && <span className="eb-tag v">{ebook.nicho}</span>}
              {ebook.publico && <span className="eb-tag">{ebook.publico}</span>}
              {caps.length > 0 && <span className="eb-tag">{caps.length} capítulos</span>}
            </div>
            <h1>{ebook.titulo}</h1>
            {ebook.subtitulo && <p className="eb-sub">{ebook.subtitulo}</p>}
            {paragrafos.length > 0 && (
              <div className="eb-desc">
                {paragrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            <div className="eb-buy">
              <div className="eb-bp">
                <small>Preço único</small>
                {ebook.preco != null && <strong>{brl(ebook.preco)}</strong>}
                <span>Formato digital. Você recebe o arquivo após a confirmação do pagamento.</span>
              </div>
              <div className="eb-bb">
                <a className="eb-btn g w" href={comprar} target="_blank" rel="noopener noreferrer">
                  Comprar agora
                </a>
                <a className="eb-btn o w" href={duvida} target="_blank" rel="noopener noreferrer" style={{ fontSize: 16, padding: '13px 24px' }}>
                  Tirar uma dúvida
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {caps.length > 0 && (
        <section className="eb-learn">
          <div className="eb-wrap">
            <h2 style={{ fontWeight: 800, fontSize: 34 }}>O que você vai aprender</h2>
            <div className="eb-lg">
              {caps.map((c) => (
                <div className="eb-lc" key={c.ordem}>
                  <div className="eb-ln">{c.ordem}</div>
                  <h3>{c.titulo}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="eb-cta">
        <div className="eb-wrap">
          <div>
            <h2>Comece com segurança</h2>
            <p>{ebook.preco != null ? `${brl(ebook.preco)} · ` : ''}Formato digital</p>
          </div>
          <a className="eb-btn big" href={comprar} target="_blank" rel="noopener noreferrer">
            Comprar agora
          </a>
        </div>
      </section>

      <Rodape />
    </div>
  );
}
