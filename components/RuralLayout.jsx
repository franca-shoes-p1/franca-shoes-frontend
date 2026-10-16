import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/rural.module.css';

export const WHATSAPP_NUMERO = '5516991543663';

export function linkWhats(mensagem) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

const MENU = [
  { href: '/rural', rotulo: 'Planejamento rural' },
  { href: '/plano-de-ocupacao', rotulo: 'Plano de ocupação' },
  { href: '/profissionais', rotulo: 'Sou profissional' },
  { href: '/', rotulo: 'Portal' },
];

export default function RuralLayout({ titulo, descricao, children }) {
  const { pathname } = useRouter();
  return (
    <div className={styles.pagina}>
      <Head>
        <title>{titulo}</title>
        <meta name="description" content={descricao} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.cabecalho}>
        <div className={`${styles.contido} ${styles.barra}`}>
          <Link href="/" className={styles.marca}>
            <span className={styles.marcaSelo}>IE</span>
            <span>Igreja Eco</span>
          </Link>
          <nav className={styles.menu}>
            {MENU.map((m) => (
              <Link key={m.href} href={m.href} className={pathname === m.href ? styles.ativo : ''}>
                {m.rotulo}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className={styles.rodape}>
        <div className={styles.contido}>
          <div className={styles.rodapeLinks}>
            <Link href="/rural">Planejamento rural</Link>
            <Link href="/plano-de-ocupacao">Plano de ocupação</Link>
            <Link href="/profissionais">Cadastro de profissionais</Link>
            <Link href="/">Portal Igreja Eco</Link>
          </div>
          <p className={styles.legal}>
            Os planos de ocupação são estudos preliminares de planejamento e não substituem projeto técnico,
            laudo, licença ou documento que exija profissional habilitado. Cada profissional parceiro é independente
            e responde pelo que executa e assina.
          </p>
        </div>
      </footer>
    </div>
  );
}
