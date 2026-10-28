import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/home.module.css';
import o from '../styles/oficina.module.css';

/*
  RASCUNHO da página do Manual da Igreja Evangelho dos Pobres dos Alimentos Sagrados.
  NÃO PUBLICAR antes de: (1) você ler a declaração de fé e os compromissos no documento;
  (2) conta da Kiwify criada e os links abaixo preenchidos.
  Enquanto isso, a página fica com noindex e sem link no menu.
*/
const CONFIG = {
  nome: 'Igreja Eco',
  igreja: 'Igreja Evangelho dos Pobres dos Alimentos Sagrados',
  whatsapp: '5516991543663',
  canal: 'https://www.youtube.com/@RicardoBello-o6v',
  // Preencher depois da conta da Kiwify. Vazio = o botão vira "Em breve".
  linkCapitulos: '',
  linkManual: '',
  linkPacoteLideres: '',
};
const zap = (t) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;

const FRENTES = [
  { e: '📖', t: 'Palavra', p: 'Ensino e vida de comunidade: lives, estudos semanais e grupos de conversa.' },
  { e: '🍞', t: 'Mesa', p: 'Alimento e partilha: horta, despensa e cestas, começando pequeno e com segurança dos alimentos.' },
  { e: '🤲', t: 'Obra', p: 'Grupos de 3 a 12 pessoas, cada um com uma tarefa e um responsável.' },
];

const PASSOS = [
  ['1', 'Conhecer', 'Assista a uma live ou leia o manual.'],
  ['2', 'Cadastrar', 'Informe nome, WhatsApp e cidade, aceitando o uso dos dados só para contato da igreja.'],
  ['3', 'Conversar', 'O acolhimento responde em até 48 horas, por uma pessoa.'],
  ['4', 'Servir', 'Escolha um grupo e uma forma de servir, e aceite os compromissos do membro.'],
];

const DENTRO = [
  'Quem somos, hoje: um projeto em formação, dito com clareza.',
  'Missão, visão e valores.',
  'As três frentes: Palavra, Mesa e Obra.',
  'Como a igreja se organiza e como funciona o atendimento aos membros.',
  'Como se tornar membro e o que não exigimos.',
  'Grupos para trabalhar na obra e como formar o seu.',
  'A mordomia na prática: o programa Vigiar e Cultivar.',
  'Declaração de fé, compromissos do membro e modelos de ficha e de relatório.',
];

const OFERTAS = [
  { n: 'Capítulos 1 e 2', preco: 'Grátis', inclui: 'Apresentação e quem somos, em PDF, em troca do seu contato.', chave: 'linkCapitulos', botao: 'Receber os capítulos grátis' },
  { n: 'Manual completo', preco: 'R$ 29,90', inclui: 'O livro digital com anexos e modelos. Pagamento único.', chave: 'linkManual', botao: 'Comprar o manual', destaque: true },
  { n: 'Pacote para líderes', preco: 'R$ 79,00', inclui: 'O manual mais modelos editáveis para plantar um grupo ou uma igreja pequena.', chave: 'linkPacoteLideres', botao: 'Comprar o pacote' },
];

const TRANSPARENCIA = [
  'A igreja não pede dízimo nem oferta. Ser membro é gratuito.',
  'A obra é financiada com a venda dos produtos e serviços do projeto.',
  'Precisamos de colaboradores. Quem ajuda recebe pagamento por tarefa aprovada, depois que o cliente pagou, e créditos do site. Sem promessa de ganho.',
  'É um projeto em formação, sem registro. Não contamos uma história que não aconteceu.',
  'Não prometemos cura, riqueza nem bem-estar em troca de contribuição.',
  'Quem quiser sair, sai sem constrangimento.',
];

const FAQ = [
  ['Preciso pagar para ser membro?', 'Não. Ser membro é gratuito. O que se vende é o livro e os produtos do projeto, e comprar não é condição para participar.'],
  ['A igreja pede dízimo ou oferta?', 'Não. A obra é financiada com a venda dos produtos e serviços do projeto.'],
  ['Preciso trabalhar na obra?', 'Não. Quem quiser colaborar escolhe tarefas e recebe pagamento por tarefa aprovada, depois que o cliente pagou, e créditos do site. Não há promessa de ganho.'],
  ['A igreja já tem registro e templo?', 'Não. É um projeto em formação, e o livro diz isso com clareza.'],
  ['E se eu me arrepender da compra?', 'Você tem 7 dias para desistir, com devolução integral.'],
  ['Como recebo o livro?', 'Por e-mail e pela área de membros da plataforma de pagamento.'],
];

function Botao({ href, classe, children, texto }) {
  if (!href) {
    return <span className={`${styles.botao} ${classe}`} aria-disabled="true" style={{ opacity: 0.6, cursor: 'default' }}>{texto || 'Em breve'}</span>;
  }
  return <a href={href} className={`${styles.botao} ${classe}`} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export default function ManualDaIgreja() {
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

  return (
    <div className={styles.pagina} ref={raiz}>
      <Head>
        <title>Manual da Igreja | {CONFIG.nome}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Manual da Igreja Evangelho dos Pobres dos Alimentos Sagrados: missão, organização, como ser membro e como formar grupos para trabalhar na obra." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Manual da Igreja Evangelho dos Pobres dos Alimentos Sagrados" />
        <meta property="og:description" content="Um projeto em formação: Palavra, Mesa e Obra. Ser membro é gratuito." />
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
            <a href="#projeto" onClick={fechar}>O projeto</a>
            <a href="#membro" onClick={fechar}>Ser membro</a>
            <a href="#manual" onClick={fechar}>O manual</a>
            <a href="#duvidas" onClick={fechar}>Dúvidas</a>
            <Link href="/" onClick={fechar}>Início</Link>
          </nav>
        </div>
      </header>

      <main id="topo">
        <section className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>Manual da igreja</p>
            <h1 className={styles.h2}>{CONFIG.igreja}</h1>
            <p className={styles.sub}>Um projeto em formação para anunciar o evangelho aos pobres e servi-los com a Palavra, o alimento e a comunhão. Conheça como ele se organiza e faça parte desde o começo.</p>
            <div className={styles.acoes}>
              <Botao href={CONFIG.linkCapitulos} classe={styles.principal} texto="Capítulos grátis em breve">Receber os capítulos grátis</Botao>
              <a href={CONFIG.canal} className={`${styles.botao} ${styles.contorno}`} target="_blank" rel="noopener noreferrer">Ver o canal no YouTube</a>
            </div>
          </div>
        </section>

        <section id="projeto" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>O projeto</p>
            <h2 className={styles.h2}>Palavra, Mesa e Obra</h2>
            <p className={styles.sub}>Três frentes que se completam: ensinar, partilhar e trabalhar juntos.</p>
            <div className={styles.grade3}>
              {FRENTES.map((c) => (
                <div key={c.t} className={styles.cartao} data-reveal="1">
                  <div className={styles.emoji}>{c.e}</div>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="membro" className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>Como ser membro</p>
            <h2 className={styles.h2}>Quatro passos, sem custo</h2>
            <ol className={styles.passos}>
              {PASSOS.map(([n, t, p]) => (
                <li key={n} data-reveal="1">
                  <div className={styles.passoN}>{n}</div>
                  <strong>{t}</strong>
                  <p>{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="manual" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>O manual</p>
            <h2 className={styles.h2}>O que você encontra no livro</h2>
            <ul className={o.lista}>
              {DENTRO.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <div className={styles.grade3} style={{ marginTop: 32 }}>
              {OFERTAS.map((p) => (
                <div key={p.n} className={styles.cartao} data-reveal="1" style={p.destaque ? { outline: '2px solid currentColor' } : undefined}>
                  <h3>{p.n}</h3>
                  <p><strong>{p.preco}</strong></p>
                  <p>{p.inclui}</p>
                  <Botao href={CONFIG[p.chave]} classe={p.destaque ? styles.principal : styles.contornoEscuro}>{p.botao}</Botao>
                </div>
              ))}
            </div>
            <p className={styles.sub} style={{ marginTop: 20 }}>Você tem 7 dias para desistir da compra, com devolução integral.</p>
          </div>
        </section>

        <section className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Transparência</p>
            <h2 className={styles.h2}>O que dizemos com clareza</h2>
            <ul className={o.lista}>
              {TRANSPARENCIA.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className={styles.sub} style={{ marginTop: 20 }}>
              Quer ajudar na obra? <a href={zap('Olá! Quero colaborar na obra da Igreja Evangelho dos Pobres dos Alimentos Sagrados.')} target="_blank" rel="noopener noreferrer">Fale com a gente no WhatsApp</a> ou use o cadastro de operador da <Link href="/oficina">Oficina</Link>.
            </p>
          </div>
        </section>

        <section id="duvidas" className={styles.secao}>
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
            <h2 className={styles.h2}>Dê o primeiro passo</h2>
            <p>Receba os capítulos grátis, assista a uma live e converse com o acolhimento.</p>
            <div className={styles.acoes}>
              <Botao href={CONFIG.linkCapitulos} classe={styles.principal} texto="Capítulos grátis em breve">Receber os capítulos grátis</Botao>
              <a href={zap('Olá! Vi o manual da igreja e quero conversar com o acolhimento.')} className={`${styles.botao} ${styles.contorno}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
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
          <p>{CONFIG.igreja}: projeto em formação.</p>
          <Link href="/" className={styles.botaoPortal}>Voltar ao início<small>igreja.eco.br</small></Link>
        </div>
        <div className={styles.contido + ' ' + styles.rodapeFim}>© {new Date().getFullYear()} {CONFIG.nome}. Projeto em formação, sem registro. Não pedimos dízimo nem oferta.</div>
      </footer>
    </div>
  );
}
