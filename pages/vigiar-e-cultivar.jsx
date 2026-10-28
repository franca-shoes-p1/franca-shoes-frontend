import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/home.module.css';
import o from '../styles/oficina.module.css';

/*
  RASCUNHO da página do Kit Vigiar e Cultivar.
  NÃO PUBLICAR antes de: (1) aprovação do revisor bíblico e do revisor técnico;
  (2) conta da Kiwify criada e os links preenchidos abaixo;
  (3) nome do vendedor definido.
  Enquanto isso, a página fica com noindex e sem link no menu.
*/
const CONFIG = {
  nome: 'Igreja Eco',
  whatsapp: '5516991543663',
  // Preencher depois da conta da Kiwify. Vazio = o botão vira "Em breve".
  linkSemana1: '',
  linkCultivo: '',
  linkMordomia: '',
  vendedor: '[NOME DO VENDEDOR, a definir]',
};
const zap = (t) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;

const PUBLICOS = [
  { e: '⛪', t: 'Para a igreja', p: 'Monte um ministério de mordomia que cuida de quem tem fome e liga a comunidade a produtores da região.' },
  { e: '🌾', t: 'Para a família do campo', p: 'Organize horta, despensa e calendário de plantio com um estudo que dá sentido ao trabalho.' },
  { e: '🪴', t: 'Para quem tem só um quintal ou um vaso', p: 'Comece pequeno, com um passo por semana.' },
];

const SEMANAS = [
  ['1', 'Vigilância', 'Mapear o terreno, o quintal ou o espaço da igreja'],
  ['2', 'Mordomia da terra', 'Preparar o solo e os canteiros'],
  ['3', 'Planejar com sabedoria', 'Montar o calendário de plantio'],
  ['4', 'Estar preparado', 'Organizar a despensa básica da família'],
  ['5', 'Guardar com prudência', 'Conservar alimentos com segurança'],
  ['6', 'Multiplicar o que recebeu', 'Fazer composto e trocar sementes e mudas'],
  ['7', 'Partilhar', 'Montar cestas e ligar a igreja a produtores'],
  ['8', 'Servir até o fim', 'Abrir o ministério de mordomia'],
];

const RECEBE = [
  { e: '💬', t: 'Uma mensagem por semana', p: 'No Telegram, com estudo curto e a tarefa da semana.' },
  { e: '📋', t: 'Planilhas', p: 'De horta, despensa e cestas, prontas para usar.' },
  { e: '🗓️', t: 'Calendário de plantio', p: 'Para a sua região, conferido por um técnico.' },
  { e: '🤝', t: 'Grupo da comunidade', p: 'Para trocar experiências com quem está fazendo igual.' },
];

const PLANOS = [
  { n: 'Semente', preco: 'Grátis', inclui: 'A semana 1 e o grupo aberto.', chave: 'linkSemana1', botao: 'Receber a semana 1' },
  { n: 'Cultivo', preco: 'R$ 39,90 por mês', inclui: 'Trilha completa, depois mensagem semanal, planilhas, calendário e grupo.', chave: 'linkCultivo', botao: 'Assinar o Cultivo', destaque: true },
  { n: 'Mordomia', preco: 'R$ 97,00 por mês', inclui: 'Tudo do Cultivo, modelo de ministério, guia de parceria com produtores e atendimento prioritário.', chave: 'linkMordomia', botao: 'Assinar a Mordomia' },
];

const TRANSPARENCIA = [
  'O kit não marca data da volta de Cristo: Jesus disse que ninguém sabe o dia nem a hora (Mateus 24:36).',
  'Não promete lucro nem renda com a horta.',
  'Não substitui o técnico agrícola nem as orientações de segurança dos alimentos de órgãos oficiais.',
  'Os estudos são revisados por pastor, líder ou professor, e os conteúdos de horta por técnico ou produtor experiente.',
  `Quem vende: ${CONFIG.vendedor}. Os dados que você informar são usados só para enviar o conteúdo e atender você.`,
];

const FAQ = [
  ['Preciso de terreno?', 'Não. Um quintal ou vasos bastam para começar.'],
  ['Quanto custa para começar?', 'A semana 1 é grátis. Sementes e adubo dependem do que você já tem.'],
  ['Pode ser usado na igreja?', 'Sim. O plano Mordomia é feito para isso.'],
  ['Como recebo?', 'Pelo Telegram e pela área de membros.'],
  ['E se eu me arrepender?', 'Você tem 7 dias para desistir da compra, com devolução integral, e cancela quando quiser pelo mesmo canal em que assinou.'],
  ['Qual a forma de pagamento?', 'Pix, cartão ou boleto, conforme a plataforma de pagamento.'],
];

function Botao({ href, classe, children, texto }) {
  if (!href) {
    return <span className={`${styles.botao} ${classe}`} aria-disabled="true" style={{ opacity: 0.6, cursor: 'default' }}>{texto || 'Em breve'}</span>;
  }
  return <a href={href} className={`${styles.botao} ${classe}`} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export default function VigiarECultivar() {
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
        <title>Vigiar e Cultivar | {CONFIG.nome}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="8 semanas para viver prontos e servindo: estudo da Palavra e horta, despensa e partilha, para a sua igreja e a sua família." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Vigiar e Cultivar" />
        <meta property="og:description" content="Estudo da Palavra e horta, despensa e partilha, em 8 semanas." />
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
            <a href="#para-quem" onClick={fechar}>Para quem</a>
            <a href="#semanas" onClick={fechar}>As 8 semanas</a>
            <a href="#planos" onClick={fechar}>Planos</a>
            <a href="#duvidas" onClick={fechar}>Dúvidas</a>
            <Link href="/" onClick={fechar}>Início</Link>
          </nav>
        </div>
      </header>

      <main id="topo">
        <section className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>Kit Vigiar e Cultivar</p>
            <h1 className={styles.h2}>Vigiar e Cultivar</h1>
            <p className={styles.sub}>8 semanas para viver prontos e servindo: estudo da Palavra e horta, despensa e partilha, para a sua igreja e a sua família.</p>
            <div className={styles.acoes}>
              <Botao href={CONFIG.linkSemana1} classe={styles.principal} texto="Semana 1 gratuita em breve">Receber a semana 1 grátis</Botao>
              <a href={zap('Olá! Vi a página Vigiar e Cultivar e quero saber mais.')} className={`${styles.botao} ${styles.contorno}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            </div>
          </div>
        </section>

        <section id="para-quem" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Para quem é</p>
            <h2 className={styles.h2}>Três jeitos de começar</h2>
            <div className={styles.grade3}>
              {PUBLICOS.map((c) => (
                <div key={c.t} className={styles.cartao} data-reveal="1">
                  <div className={styles.emoji}>{c.e}</div>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="semanas" className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>As 8 semanas</p>
            <h2 className={styles.h2}>Um estudo e uma tarefa por semana</h2>
            <ol className={styles.passos}>
              {SEMANAS.map(([n, tema, tarefa]) => (
                <li key={n} data-reveal="1">
                  <div className={styles.passoN}>{n}</div>
                  <strong>{tema}</strong>
                  <p>{tarefa}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>O que você recebe</p>
            <h2 className={styles.h2}>Tudo para estudar e praticar</h2>
            <div className={styles.grade3}>
              {RECEBE.map((c) => (
                <div key={c.t} className={styles.cartao} data-reveal="1">
                  <div className={styles.emoji}>{c.e}</div>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Planos</p>
            <h2 className={styles.h2}>Escolha o seu</h2>
            <p className={styles.sub}>Cancele quando quiser, pelo mesmo canal em que assinou. Você tem 7 dias para desistir da compra, com devolução integral.</p>
            <div className={styles.grade3}>
              {PLANOS.map((p) => (
                <div key={p.n} className={styles.cartao} data-reveal="1" style={p.destaque ? { outline: '2px solid currentColor' } : undefined}>
                  <h3>{p.n}</h3>
                  <p><strong>{p.preco}</strong></p>
                  <p>{p.inclui}</p>
                  <Botao href={CONFIG[p.chave]} classe={`${p.destaque ? styles.principal : styles.contornoEscuro}`}>{p.botao}</Botao>
                </div>
              ))}
            </div>
            <p className={styles.sub} style={{ marginTop: 20 }}>
              Quer acompanhamento na montagem da horta e do ministério? <a href={zap('Olá! Quero um orçamento de implantação do Vigiar e Cultivar.')} target="_blank" rel="noopener noreferrer">Peça um orçamento</a>.
            </p>
          </div>
        </section>

        <section className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Transparência</p>
            <h2 className={styles.h2}>O que este kit é e o que não é</h2>
            <ul className={o.lista}>
              {TRANSPARENCIA.map((t) => <li key={t}>{t}</li>)}
            </ul>
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
            <h2 className={styles.h2}>Comece pela semana 1</h2>
            <p>É grátis, sem compromisso e sem promessa de renda.</p>
            <div className={styles.acoes}>
              <Botao href={CONFIG.linkSemana1} classe={styles.principal} texto="Semana 1 gratuita em breve">Receber a semana 1 grátis</Botao>
              <a href={zap('Olá! Quero saber mais sobre o Vigiar e Cultivar.')} className={`${styles.botao} ${styles.contorno}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
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
          <p>Vigiar e Cultivar: estudo da Palavra e horta em 8 semanas.</p>
          <Link href="/" className={styles.botaoPortal}>Voltar ao início<small>igreja.eco.br</small></Link>
        </div>
        <div className={styles.contido + ' ' + styles.rodapeFim}>© {new Date().getFullYear()} {CONFIG.nome}. Este kit não promete lucro nem substitui orientação técnica.</div>
      </footer>
    </div>
  );
}
