import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import s from '../styles/moda.module.css';

const MENU = [
  ['/moda', 'Início'],
  ['/moda/como-funciona', 'Como funciona'],
  ['/moda/planos', 'Planos'],
  ['/moda/condicoes', 'Condições'],
  ['/moda/participar', 'Quero participar'],
];

export default function ModaLayout({ titulo, descricao, children }) {
  const { pathname } = useRouter();
  return (
    <div className={s.pagina}>
      <Head>
        <title>{`${titulo} | Loja de Moda e Lembranças`}</title>
        <meta name="description" content={descricao} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className={s.cabecalho}>
        <div className={s.contido}>
          <div className={s.barra}>
            <Link href="/moda" className={s.marca}><span className={s.selo}>IE</span>Loja de Moda e Lembranças</Link>
            <Link href="/" className={s.voltar}>← Site Igreja Eco</Link>
          </div>
          <nav className={s.menu} aria-label="Loja de Moda e Lembranças">
            {MENU.map(([h, t]) => (
              <Link key={h} href={h} className={pathname === h ? s.ativo : undefined} aria-current={pathname === h ? 'page' : undefined}>{t}</Link>
            ))}
          </nav>
        </div>
      </header>
      <p className={s.aviso}><b>Pré-lançamento:</b> o projeto está em preparação. Ainda não há vendas nem cobranças, e as informações podem ser ajustadas antes de qualquer contrato.</p>
      <main>{children}</main>
      <footer className={s.rodape}>
        <div className={s.contido}>Igreja Eco · Loja de Moda e Lembranças · <Link href="/">Voltar à página principal</Link></div>
      </footer>
    </div>
  );
}
