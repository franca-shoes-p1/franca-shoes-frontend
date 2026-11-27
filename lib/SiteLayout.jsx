import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/site.module.css';

/* Topo e rodapé das páginas principais. Contato: edite só aqui. */
export const EMAIL = 'ricardobelo1973@gmail.com';

const MENU = [
  ['/', 'Início'],
  ['/moda', 'Moda e Lembranças'],
  ['/#agenda', 'Agenda'],
  ['/projetos', 'Projetos'],
  ['/#contato', 'Contato'],
];

export default function SiteLayout({ titulo, descricao, children }) {
  const { 0: aberto, 1: setAberto } = useState(false);
  const aba = titulo ? `${titulo} | Igreja Eco` : 'Igreja Eco · Loja de Moda e Lembranças';
  return (
    <div className={s.site}>
      <Head>
        <title>{aba}</title>
        <meta name="description" content={descricao} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={aba} />
        <meta property="og:description" content={descricao} />
      </Head>
      <header className={s.topo}>
        <div className={s.barra}>
          <Link href="/" className={s.marca}><span className={s.selo}>IE</span>Igreja Eco</Link>
          <button type="button" className={s.abrir} aria-expanded={aberto} onClick={() => setAberto(!aberto)}>☰ Menu</button>
          <nav className={`${s.menu} ${aberto ? s.menuAberto : ''}`} aria-label="Principal">
            {MENU.map(([h, t]) => (<Link key={h} href={h} onClick={() => setAberto(false)}>{t}</Link>))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className={s.rodape}>
        <div className={s.contido}>
          <p><b>Igreja Eco</b> · <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          <p><Link href="/projetos">Todos os projetos</Link> · <Link href="/catalogo">Catálogo</Link> · <Link href="/portal">Portal</Link> · <Link href="/calcados/politicas">Políticas da loja de calçados</Link></p>
          <p>© 2026 Igreja Eco. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
