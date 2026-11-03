import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/home.module.css';
import { PRAIA } from './praia';

/* Moldura das páginas /praia: mesmo cabeçalho e rodapé da Oficina, no padrão do igreja.eco.br. */
export default function PraiaLayout({ titulo, descricao, children, ativo }) {
  const raiz = useRef(null);
  const [menu, setMenu] = useState(false);
  const fechar = () => setMenu(false);

  useEffect(() => {
    const el = raiz.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    el.classList.add(styles.anim);
    const io = new IntersectionObserver(
      (itens) => itens.forEach((i) => { if (i.isIntersecting) { i.target.classList.add(styles.visivel); io.unobserve(i.target); } }),
      { threshold: 0.12 }
    );
    el.querySelectorAll('[data-reveal]').forEach((n) => io.observe(n));
    return () => io.disconnect();
  });

  return (
    <div className={styles.pagina} ref={raiz}>
      <Head>
        <title>{titulo ? `${titulo} | ` : ''}{PRAIA.nome}</title>
        <meta name="description" content={descricao || 'Venda comida na praia em parceria, com kit emprestado, lucro dividido 50/50 e conta aberta todo dia.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={`${PRAIA.nome}`} />
        <meta property="og:description" content="Venda comida na praia em parceria. Vagas limitadas por cidade." />
      </Head>
      <header className={styles.cabecalho}>
        <div className={styles.contido + ' ' + styles.barra}>
          <Link href="/" className={styles.marca} onClick={fechar}>
            <span className={styles.selo}>IE</span>
            <span>Igreja Eco</span>
          </Link>
          <button className={styles.botaoMenu} aria-label="Abrir menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <span /><span /><span />
          </button>
          <nav className={`${styles.menu} ${menu ? styles.menuAberto : ''}`}>
            <Link href="/praia#como" onClick={fechar}>Como funciona</Link>
            <Link href="/praia#vagas" onClick={fechar}>Vagas</Link>
            <Link href="/praia#duvidas" onClick={fechar}>Dúvidas</Link>
            <Link href="/praia/socio" onClick={fechar} style={ativo === 'socio' ? { opacity: 1 } : undefined}>Área do sócio</Link>
            <Link href="/" onClick={fechar}>Início</Link>
            <Link href="/praia/cadastro" className={styles.menuCta} onClick={fechar}>Quero uma vaga</Link>
          </nav>
        </div>
      </header>
      <main id="topo">{children}</main>
      <footer className={styles.rodape}>
        <div className={styles.contido + ' ' + styles.rodapeCentro}>
          <Link href="/praia" className={styles.marca}>
            <span className={styles.selo}>IE</span>
            <span>{PRAIA.nome}</span>
          </Link>
          <p>Parceria comercial entre autônomos, com conta aberta todo dia.</p>
          <Link href="/" className={styles.botaoPortal}>Voltar ao início<small>igreja.eco.br</small></Link>
          <p><Link href="/praia/privacidade">Privacidade</Link></p>
        </div>
        <div className={styles.contido + ' ' + styles.rodapeFim}>© {new Date().getFullYear()} Igreja Eco. Sem vínculo de emprego e sem promessa de ganho.</div>
      </footer>
    </div>
  );
}
