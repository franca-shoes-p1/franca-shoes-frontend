import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/home.module.css';
import s from '../styles/livros.module.css';
import LivroCapa from '../lib/LivroCapa';
import MotorLivros from '../lib/MotorLivros';
import { LIVROS, ETAPAS } from '../lib/livros';
import { SETORES } from '../lib/motorLivros';

/*
  Vitrine de livros e manuais da Igreja Eco.
  - Livro novo: acrescente um item em lib/livros.js (capa, cartão e faixa da home se atualizam sozinhos).
  - RASCUNHO: a página fica com noindex até você mandar publicar.
*/
const CONFIG = { nome: 'Igreja Eco', whatsapp: '5516991543663' };
const zap = (t) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;

const FAQ = [
  ['Preciso pagar para ser membro da igreja?', 'Não. Ser membro é gratuito. Os livros são produtos à parte e comprar não é condição para participar.'],
  ['A igreja pede dízimo ou oferta?', 'Não. A obra é financiada com a venda dos produtos e serviços do projeto.'],
  ['Os livros são impressos?', 'São digitais. Versões impressas, se um dia existirem, serão feitas sob encomenda.'],
  ['E se eu me arrepender da compra?', 'Você tem 7 dias para desistir, com devolução integral.'],
  ['Posso sugerir um livro?', 'Pode. Use o motor de livros aqui embaixo ou fale com a gente no WhatsApp.'],
  ['Posso ajudar a produzir os livros?', 'Sim. A equipe da Oficina tem vagas para redator, design, conferência e divulgação. Quem colabora recebe por tarefa aprovada, depois que o cliente pagou, e créditos do site, sem promessa de ganho.'],
];

export default function Livros() {
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
  }, []);

  const prontos = LIVROS.filter((l) => l.status === 'pronto').length;
  const breves = LIVROS.length - prontos;

  return (
    <div className={styles.pagina} ref={raiz}>
      <Head>
        <title>Livros e Manuais | {CONFIG.nome}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Vitrine de livros e manuais da Igreja Evangelho dos Pobres dos Alimentos Sagrados: estudo, horta, partilha e grupos." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Livros e Manuais | Igreja Eco" />
        <meta property="og:description" content="Livros digitais para estudar, plantar e servir juntos." />
      </Head>

      <header className={styles.cabecalho}>
        <div className={styles.contido + ' ' + styles.barra}>
          <Link href="/" className={styles.marca} onClick={fechar}>
            <span className={styles.selo}>IE</span>
            <span>{CONFIG.nome}</span>
          </Link>
          <button className={styles.botaoMenu} aria-label="Abrir menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <span /><span /><span />
          </button>
          <nav className={`${styles.menu} ${menu ? styles.menuAberto : ''}`}>
            <a href="#estante" onClick={fechar}>Estante</a>
            <a href="#nasce" onClick={fechar}>Como nasce um livro</a>
            <a href="#motor" onClick={fechar}>Motor de livros</a>
            <a href="#equipe" onClick={fechar}>Equipe</a>
            <a href="#duvidas" onClick={fechar}>Dúvidas</a>
            <Link href="/" onClick={fechar}>Início</Link>
          </nav>
        </div>
      </header>

      <main id="topo">
        <section className={s.hero}>
          <span className={s.estrelas} aria-hidden="true" />
          <span className={s.brilhoA} aria-hidden="true" />
          <span className={s.brilhoB} aria-hidden="true" />
          <div className={s.heroDentro}>
            <div className={s.heroTexto}>
              <span className={s.pilula}><i />Vitrine · Livros e Manuais</span>
              <h1>Livros para estudar, plantar e <em>servir juntos</em></h1>
              <p>Manuais e programas da Igreja Evangelho dos Pobres dos Alimentos Sagrados, em linguagem simples e com tarefas práticas. Novos títulos entram na estante o tempo todo.</p>
              <div className={s.numeros}>
                <div><b>{prontos}</b><span>disponíveis</span></div>
                <div><b>{breves}</b><span>em breve</span></div>
                <div><b>0</b><span>de dízimo ou oferta</span></div>
              </div>
              <div className={s.acoes}>
                <a href="#estante" className={`${s.btn} ${s.btnOuro}`}>Ver a estante</a>
                <a href="#motor" className={`${s.btn} ${s.btnContorno}`}>Montar um livro</a>
              </div>
            </div>
            <div className={s.heroLeque} aria-hidden="true">
              {LIVROS.slice(0, 4).map((l, i) => (
                <div key={l.id} className={`${s.heroLivro} ${s['h' + i]}`}><LivroCapa livro={l} /></div>
              ))}
            </div>
          </div>
        </section>

        <section id="estante" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Estante</p>
            <h2 className={styles.h2}>Os livros da igreja</h2>
            <p className={styles.sub}>Cada capa leva para a página do livro. Os que estão em preparação aparecem como "Em breve".</p>
            <ul className={s.estante}>
              {LIVROS.map((l) => (
                <li key={l.id} className={s.item} data-reveal="1">
                  <div className={s.capaBox}>
                    <LivroCapa livro={l} />
                    <span className={`${s.selo} ${l.status === 'pronto' ? s.seloOk : s.seloBreve}`}>{l.status === 'pronto' ? 'Disponível' : 'Em breve'}</span>
                  </div>
                  <h3>{l.titulo}</h3>
                  <p className={s.resumo}>{l.resumo}</p>
                  {l.preco && <p className={s.preco}>{l.preco}</p>}
                  {l.status === 'pronto' ? (
                    <Link href={l.href} className={`${s.btn} ${s.btnAzul}`}>Conhecer o livro</Link>
                  ) : (
                    <a href={zap(`Olá! Quero ser avisado quando o livro "${l.titulo}" sair.`)} className={`${s.btn} ${s.btnContornoEscuro}`} target="_blank" rel="noopener noreferrer">Quero ser avisado</a>
                  )}
                </li>
              ))}
              <li className={`${s.item} ${s.sugira}`} data-reveal="1">
                <div className={s.sugiraCaixa}>
                  <span aria-hidden="true">💡</span>
                  <b>Falta um livro?</b>
                  <small>Monte a ficha no motor de livros e peça.</small>
                </div>
                <a href="#motor" className={`${s.btn} ${s.btnContornoEscuro}`}>Sugerir um livro</a>
              </li>
            </ul>
          </div>
        </section>

        <section id="nasce" className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>Como nasce um livro</p>
            <h2 className={styles.h2}>Da ideia à publicação, em 6 etapas</h2>
            <p className={styles.sub}>A IA ajuda a rascunhar, mas quem lidera o ensino lê e aprova. Nada sai sem revisão.</p>
            <ol className={s.etapas}>
              {ETAPAS.map((e, i) => (
                <li key={e.t} data-reveal="1" style={{ '--i': i }}>
                  <span className={s.etapaN}>{i + 1}</span>
                  <span className={s.etapaE} aria-hidden="true">{e.e}</span>
                  <strong>{e.t}</strong>
                  <p>{e.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="motor" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Motor de livros</p>
            <h2 className={styles.h2}>Monte a ficha de um livro e veja a capa nascer</h2>
            <p className={styles.sub}>Escolha o tipo, o tema e o público. O motor mostra a capa, o sumário e o preço de teste, e você pode pedir o livro ou copiar a ficha.</p>
            <MotorLivros />
          </div>
        </section>

        <section id="equipe" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Equipe</p>
            <h2 className={styles.h2}>Quem produz os livros</h2>
            <p className={styles.sub}>A mesma Oficina Digital do site. Quem colabora trabalha como prestador autônomo, recebe por tarefa aprovada, depois que o cliente pagou, e créditos do site. Sem promessa de ganho.</p>
            <div className={styles.grade3}>
              {SETORES.map((x) => (
                <div key={x.t} className={styles.cartao} data-reveal="1">
                  <div className={styles.emoji}>{x.e}</div>
                  <h3>{x.t}</h3>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
            <div className={styles.acoes} style={{ marginTop: 28 }}>
              <Link href="/oficina#cadastro" className={`${styles.botao} ${styles.principal}`}>Quero colaborar</Link>
              <Link href="/oficina" className={`${styles.botao} ${styles.contornoEscuro}`}>Conhecer a Oficina</Link>
            </div>
          </div>
        </section>

        <section id="duvidas" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Dúvidas frequentes</p>
            <h2 className={styles.h2}>Perguntas que todo mundo faz</h2>
            <div className={styles.faq} style={{ marginTop: 28, maxWidth: 820 }}>
              {FAQ.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.final}>
          <div className={styles.contido}>
            <h2 className={styles.h2}>Comece pelo Manual da Igreja</h2>
            <p>Conheça a missão, como a igreja se organiza e como fazer parte, sem custo e sem pressão.</p>
            <div className={styles.acoes}>
              <Link href="/manual-da-igreja" className={`${styles.botao} ${styles.principal}`}>Ler o Manual da Igreja</Link>
              <a href={zap('Olá! Vi a vitrine de livros da Igreja Eco e quero conversar.')} className={`${styles.botao} ${styles.contorno}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.rodape}>
        <div className={styles.contido + ' ' + styles.rodapeCentro}>
          <a href="#topo" className={styles.marca} onClick={fechar}>
            <span className={styles.selo}>IE</span>
            <span>{CONFIG.nome}</span>
          </a>
          <p>Livros e manuais: estudo, horta, partilha e grupos.</p>
          <Link href="/" className={styles.botaoPortal}>Voltar ao início<small>igreja.eco.br</small></Link>
        </div>
        <div className={styles.contido + ' ' + styles.rodapeFim}>© {new Date().getFullYear()} {CONFIG.nome}. Projeto em formação, sem registro. Não pedimos dízimo nem oferta.</div>
      </footer>
    </div>
  );
}
