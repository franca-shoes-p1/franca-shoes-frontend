import Head from 'next/head';
import { useState } from 'react';
import { sb } from '../../lib/supabaseServer';
import { css, FONTES } from '../../lib/ebookCss';
import EbookCapa from '../../lib/EbookCapa';
import { Cabecalho, Rodape } from '../../lib/EbookLayout';

const brl = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
const limpa = (t) => String(t || '').replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/\s+/g, ' ').trim();
const resumo = (e) => {
  if (e.subtitulo) return limpa(e.subtitulo);
  const t = limpa(e.descricao_venda);
  return t.length > 120 ? `${t.slice(0, 117).trimEnd()}...` : t;
};

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    // Só campos públicos: os links de arquivo (PDF/EPUB) nunca saem do servidor.
    const ebooks = await sb(
      'ebooks?publicado=eq.true&select=slug,titulo,subtitulo,descricao_venda,preco,capa_url,nicho&order=criado_em.desc&limit=100'
    );
    return { props: { ebooks: ebooks || [] } };
  } catch (e) {
    return { props: { ebooks: [] } };
  }
}

export default function Ebooks({ ebooks }) {
  const [filtro, setFiltro] = useState('');
  const nichos = [...new Set(ebooks.map((e) => e.nicho).filter(Boolean))];
  const lista = filtro ? ebooks.filter((e) => e.nicho === filtro) : ebooks;
  const destaque = ebooks[0];

  return (
    <div className="eb">
      <Head>
        <title>E-books práticos | Igreja Eco</title>
        <meta name="description" content="E-books práticos do tipo como fazer, com passo a passo, listas de conferência e plano de ação." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={FONTES} />
      </Head>
      <style>{css}</style>

      <Cabecalho ativo="ebooks" />

      <section className="eb-hero">
        <div className="eb-wrap">
          <div className="eb-hl">
            <div className="eb-eyebrow">E-books práticos</div>
            <h1>Aprenda fazendo: guias claros para a vida no campo</h1>
            <p>Cada e-book traz passo a passo, listas de conferência e um plano de ação para você começar com segurança.</p>
            <a className="eb-btn" href="#vitrine">
              Ver os e-books
            </a>
          </div>
          {destaque && (
            <div className="eb-hr">
              <EbookCapa titulo={destaque.titulo} nicho={destaque.nicho} capaUrl={destaque.capa_url} slug={destaque.slug} />
            </div>
          )}
        </div>
      </section>

      <section className="eb-sec" id="vitrine">
        <div className="eb-wrap">
          <div className="eb-sech">
            <h2>Nossos e-books</h2>
            <span className="eb-mu">Entrega digital</span>
          </div>

          {nichos.length > 1 && (
            <div className="eb-chips">
              <button type="button" className="eb-chip" aria-pressed={filtro === ''} onClick={() => setFiltro('')}>
                Todos
              </button>
              {nichos.map((n) => (
                <button type="button" className="eb-chip" key={n} aria-pressed={filtro === n} onClick={() => setFiltro(n)}>
                  {n}
                </button>
              ))}
            </div>
          )}

          {ebooks.length === 0 && (
            <div className="eb-vazio" style={{ marginTop: 20 }}>
              <b>Em breve.</b>
              <p className="eb-mu" style={{ margin: '6px 0 0' }}>
                Os primeiros e-books estão sendo preparados.
              </p>
            </div>
          )}

          <div className="eb-grid" style={{ marginTop: nichos.length > 1 ? 0 : 24 }}>
            {lista.map((e) => (
              <article className="eb-card" key={e.slug}>
                <a href={`/ebooks/${e.slug}`} tabIndex={-1} aria-hidden="true">
                  <EbookCapa titulo={e.titulo} nicho={e.nicho} capaUrl={e.capa_url} slug={e.slug} />
                </a>
                <div className="eb-cb">
                  <h3>
                    <a href={`/ebooks/${e.slug}`}>{e.titulo}</a>
                  </h3>
                  {resumo(e) && <p>{resumo(e)}</p>}
                </div>
                <div className="eb-cf">
                  <span className="eb-pr">{e.preco != null ? brl(e.preco) : ''}</span>
                  <a className="eb-btn g" href={`/ebooks/${e.slug}`} style={{ fontSize: 15, padding: '12px 18px' }}>
                    Ver detalhes
                  </a>
                </div>
              </article>
            ))}
            {ebooks.length > 0 && !filtro && (
              <div className="eb-card soon">
                <b>Novos e-books em breve</b>
                <p>Estamos preparando mais guias práticos. Volte em breve.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Rodape />
    </div>
  );
}
