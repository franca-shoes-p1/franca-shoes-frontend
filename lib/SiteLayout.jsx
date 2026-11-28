import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/site.module.css';
import p4 from '../styles/plano4.module.css';
import { PAGINA, TITULO } from './plano4';

/* Topo e rodapé das páginas principais. Contato: edite só aqui. */
export const EMAIL = 'ricardobelo1973@gmail.com';

const MENU = [
  ['/', 'Início'],
  ['/moda', 'Moda e Lembranças'],
  ['/#agenda', 'Agenda'],
  ['/projetos', 'Projetos'],
  ['/#contato', 'Contato'],
];

export default function SiteLayout({ titulo, descricao, faixa, children }) {
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
        <div className={`${s.barra} ${faixa ? s.comFaixa : ''}`}>
          <Link href="/" className={s.marca}><span className={s.selo}>IE</span>Igreja Eco</Link>
          <button type="button" className={s.abrir} aria-expanded={aberto} onClick={() => setAberto(!aberto)}>☰ Menu</button>
          <nav className={`${s.menu} ${aberto ? s.menuAberto : ''}`} aria-label="Principal">
            {MENU.map(([h, t]) => (<Link key={h} href={h} onClick={() => setAberto(false)}>{t}</Link>))}
          </nav>
        </div>
        {faixa && (
          <div className={p4.canto}>
            <Link href={PAGINA} aria-label={`Novo plano: ${TITULO}`}><b>NOVO PLANO</b><span>Venda sem pagar na hora</span></Link>
          </div>
        )}
      </header>
      {faixa && <Link href={PAGINA} className={p4.tira}>NOVO PLANO · {TITULO} →</Link>}
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
