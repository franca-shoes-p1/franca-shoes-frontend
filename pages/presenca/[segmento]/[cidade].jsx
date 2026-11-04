import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../../../styles/presenca.module.css';
import PresencaForm from '../../../lib/PresencaForm';
import { SEGMENTOS, CIDADES, FONE, caminhos } from '../../../lib/presenca';

export async function getStaticPaths() {
  return { paths: caminhos(), fallback: false };
}

export async function getStaticProps({ params }) {
  const seg = SEGMENTOS[params.segmento];
  const cid = CIDADES[params.cidade];
  if (!seg || !cid) return { notFound: true };
  return { props: { segSlug: params.segmento, cidSlug: params.cidade } };
}

export default function PaginaPresenca({ segSlug, cidSlug }) {
  const seg = SEGMENTOS[segSlug];
  const cid = CIDADES[cidSlug];
  const titulo = seg.titulo(cid.nome);

  useEffect(() => {
    try {
      const chave = `ie_visita_${segSlug}_${cidSlug}`;
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, '1');
      const q = new URLSearchParams(window.location.search);
      const c = (q.get('canal') || q.get('utm_source') || '').toLowerCase();
      fetch('/api/presenca/visita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmento: segSlug, cidade: cidSlug, canal: /^[a-z0-9_]{2,40}$/.test(c) ? c : 'site_igreja_eco', pagina: window.location.pathname }),
        keepalive: true,
      }).catch(() => {});
    } catch (e) { /* sem registro, a página continua igual */ }
  }, [segSlug, cidSlug]);

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: titulo,
    areaServed: { '@type': 'City', name: cid.nome },
    provider: { '@type': 'Organization', name: 'Igreja Eco', url: 'https://www.igreja.eco.br' },
    description: seg.promessa,
  };

  return (
    <>
      <Head>
        <title>{`${titulo} | Igreja Eco`}</title>
        <meta name="description" content={seg.promessa} />
        <link rel="canonical" href={`https://www.igreja.eco.br/presenca/${segSlug}/${cidSlug}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      </Head>
      <div className={s.pagina}>
        <header className={s.topo}>
          <Link href="/" className={s.voltar}>← Início</Link>
          <span className={s.selo}>{seg.nome} · {cid.nome}/{cid.uf}</span>
        </header>
        <main className={s.miolo}>
          <h1 className={s.h1}>{titulo}</h1>
          <p className={s.lead}>{seg.promessa}</p>
          <p className={s.publico}>{seg.publico}</p>
          <a className={s.botao} href="#formulario">{seg.cta}</a>

          <ul className={s.cards}>
            {seg.beneficios.map(([ic, t, d]) => (
              <li key={t} className={s.card}><span className={s.ic}>{ic}</span><b>{t}</b><small>{d}</small></li>
            ))}
          </ul>

          <PresencaForm segmento={segSlug} cidade={cidSlug} titulo={seg.iscaTitulo} interesses={seg.interesses} cta={seg.cta} fone={FONE} />

          <p className={s.links}>
            <Link href={seg.link.href}>{seg.link.texto}</Link>
            {' · '}
            <a href={`https://wa.me/${FONE}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </p>
          <nav className={s.outros} aria-label="Outras páginas">
            {Object.entries(SEGMENTOS).filter(([k]) => k !== segSlug).map(([k, v]) => (
              <Link key={k} href={`/presenca/${k}/${cidSlug}`}>{v.nome} em {cid.nome}</Link>
            ))}
          </nav>
        </main>
      </div>
    </>
  );
}
