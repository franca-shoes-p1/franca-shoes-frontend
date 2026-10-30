import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../styles/varejo.module.css';
import { VAREJO, lerCarrinho, totalPares, guardarPontoDaUrl } from './varejo';

export default function VarejoLayout({ titulo, children }) {
  const [qtd, setQtd] = useState(0);
  useEffect(() => {
    guardarPontoDaUrl();
    setQtd(totalPares(lerCarrinho()));
    const atualizar = () => setQtd(totalPares(lerCarrinho()));
    window.addEventListener('carrinho-varejo', atualizar);
    window.addEventListener('storage', atualizar);
    return () => {
      window.removeEventListener('carrinho-varejo', atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  return (
    <div className={styles.pagina}>
      <Head>
        <title>{titulo ? `${titulo} | ${VAREJO.nomeLoja}` : `${VAREJO.nomeLoja} — calçados e acessórios direto da fábrica`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className={styles.topo}>
        <div className={styles.topoInterno}>
          <Link href="/calcados" className={styles.marca}>
            👟 {VAREJO.nomeLoja}
          </Link>
          <nav className={styles.topoLinks}>
            <a href={`https://wa.me/${VAREJO.whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <Link href="/calcados/carrinho" className={styles.botaoCarrinho}>
              🛒 Carrinho{qtd > 0 ? ` (${qtd})` : ''}
            </Link>
          </nav>
        </div>
      </header>
      <main className={styles.conteudo}>{children}</main>
      <footer className={styles.rodape}>
        <span>© {new Date().getFullYear()} {VAREJO.nomeLoja} — Franca, SP</span>
        <Link href="/calcados/politicas">Trocas, devoluções e entrega</Link>
        <Link href="/fornecedor">Sou fornecedor: quero vender aqui</Link>
        <Link href="/">Portal</Link>
      </footer>
    </div>
  );
}
