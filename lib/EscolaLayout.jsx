import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import s from '../styles/escola.module.css';
import { chamar } from './escola';

/* Moldura comum das páginas da escola: cabeçalho com entrar/sair e rodapé. */
export default function EscolaLayout({ titulo, descricao, children, aoCarregarUsuario }) {
  const router = useRouter();
  const [eu, setEu] = useState(null);

  useEffect(() => {
    let vivo = true;
    chamar('/api/escola/eu').then((r) => { if (vivo) { setEu(r); if (aoCarregarUsuario) aoCarregarUsuario(r); } }).catch(() => { if (vivo) setEu({ logado: false }); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sair() {
    try { await chamar('/api/escola/sair', { method: 'POST', body: {} }); } catch (e) { /* segue */ }
    router.push('/escola');
    setEu({ logado: false });
  }

  return (
    <div className={s.pagina}>
      <Head>
        <title>{titulo ? `${titulo} | Escola de Agropecuária Ecológica` : 'Escola de Agropecuária Ecológica | Igreja Eco'}</title>
        <meta name="description" content={descricao || 'Aprenda agrofloresta, plantio ecológico e criação de pequenos animais. Cadastro gratuito de membro.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className={s.cabecalho}>
        <div className={`${s.contido} ${s.barra}`}>
          <Link href="/escola" className={s.marca}><span className={s.selo} aria-hidden="true">🌿</span><span>Escola Agroecológica</span></Link>
          <nav className={s.menu} aria-label="Escola">
            <Link href="/escola#trilhas">Trilhas</Link>
            <Link href="/">Site</Link>
            {eu && eu.logado ? (
              <>
                <span style={{ color: 'var(--cinza)', fontSize: '.9rem' }}>Olá, {String(eu.nome).split(' ')[0]}</span>
                <button type="button" onClick={sair}>Sair</button>
              </>
            ) : (
              <Link href="/escola/entrar" className={s.destaque}>Entrar / Cadastrar</Link>
            )}
          </nav>
        </div>
      </header>
      {children}
      <footer className={s.rodape}>
        <div className={s.contido}>
          Escola de Agropecuária Ecológica · <Link href="/">Igreja Eco</Link> · Conteúdo educativo de base: confirme normas sanitárias e ambientais com a assistência técnica e a prefeitura da sua região.
        </div>
      </footer>
    </div>
  );
}
