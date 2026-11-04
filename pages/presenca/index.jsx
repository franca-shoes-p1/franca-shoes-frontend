import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../../styles/presenca.module.css';
import { SEGMENTOS, CIDADES } from '../../lib/presenca';

export default function PresencaIndice() {
  const cidades = Object.entries(CIDADES);
  return (
    <>
      <Head>
        <title>Soluções para o comércio e calçados de fábrica | Igreja Eco</title>
        <meta name="description" content="Escolha o seu segmento e a sua cidade: calçados de fábrica, divulgação e atendimento automático para lojas e comércio local." />
      </Head>
      <div className={s.pagina}>
        <header className={s.topo}><Link href="/" className={s.voltar}>← Início</Link></header>
        <main className={s.miolo}>
          <h1 className={s.h1}>Escolha o seu segmento</h1>
          <p className={s.lead}>Soluções de IA e automação e calçados de fábrica, para a sua cidade.</p>
          <ul className={s.cards}>
            {cidades.flatMap(([cs, c]) => Object.entries(SEGMENTOS).map(([ss, sg]) => (
              <li key={`${ss}-${cs}`} className={s.card}>
                <Link href={`/presenca/${ss}/${cs}`}><b>{sg.nome} em {c.nome}/{c.uf}</b><small>{sg.promessa}</small></Link>
              </li>
            )))}
          </ul>
        </main>
      </div>
    </>
  );
}
