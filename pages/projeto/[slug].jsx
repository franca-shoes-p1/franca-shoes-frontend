// Página pública de um projeto da Central (rascunho até ser marcada como publicada).
import React from 'react';
import Head from 'next/head';
import s from '../../styles/construcao.module.css';
import { Barra } from '../../lib/AtendenteSecoes';
import { Revela, Inclina, Magnetico, PalavraDigitada } from '../../lib/construcaoFx';
import { sb } from '../../lib/varejoServer';

export async function getServerSideProps({ params, res }) {
  const slug = String(params.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  let p = null;
  try { [p] = await sb(`central_projetos?slug=eq.${slug}&publicado=eq.true&select=nome,emoji,pagina`); } catch (e) { p = null; }
  if (!p || !p.pagina) return { notFound: true };
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return { props: { nome: p.nome, emoji: p.emoji, pg: p.pagina } };
}

export default function Projeto({ nome, emoji, pg }) {
  return (
    <div className={s.pagina}>
      <Head>
        <title>{nome} | Igreja Eco</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content={pg.subtitulo} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Barra />
      <header className={s.heroi}>
        <div className={s.grade} /><div className={`${s.aura} ${s.aura1}`} /><div className={`${s.aura} ${s.aura2}`} />
        <div className={s.wrap} style={{ position: 'relative', zIndex: 1, padding: '40px 20px 70px' }}>
          <span className={s.pilula}><b />{emoji} Projeto</span>
          <h1 className={s.h1}>{pg.titulo}</h1>
          <p className={s.lead}>{pg.subtitulo}</p>
          <div className={s.acoes}>
            <Magnetico href={pg.cta.href} target="_blank" rel="noopener noreferrer" className={`${s.botao} ${s.principal}`}>{pg.cta.texto}</Magnetico>
          </div>
        </div>
      </header>
      <section className={s.bloco}>
        <div className={s.wrap}>
          <div className={s.camadas}>
            {pg.destaques.map((d, i) => (
              <Revela key={d.t} atraso={i * 100}><Inclina className={s.camada}><span className={s.ic}>{d.e}</span><h3>{d.t}</h3><p>{d.d}</p></Inclina></Revela>
            ))}
          </div>
        </div>
      </section>
      <section className={`${s.bloco} ${s.blocoRoxo}`}>
        <div className={s.wrap}>
          <Revela><h2 className={s.h2}>Como funciona</h2></Revela>
          <div className={s.camadas}>
            {pg.passos.map((p, i) => (<Revela key={p.t} atraso={i * 100}><div className={s.camada}><h3>{i + 1}. {p.t}</h3><p>{p.d}</p></div></Revela>))}
          </div>
        </div>
      </section>
      <section className={s.bloco}>
        <div className={s.wrap}>
          <Revela><h2 className={s.h2}>Dúvidas</h2></Revela>
          <div className={s.faq}>{pg.faq.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}</div>
        </div>
      </section>
    </div>
  );
}
