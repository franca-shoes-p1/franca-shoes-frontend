import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/home.module.css';
import o from '../styles/oficina.module.css';
import OficinaBanner from '../lib/OficinaBanner';
import { api } from '../lib/adminClient';

/* Página pública da Oficina Digital: mesmo layout e acabamento da home (igreja.eco.br). */
const CONFIG = { nome: 'Igreja Eco', whatsapp: '5516991543663' };
const LINK_WHATS = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Olá! Vi a Oficina Digital e quero saber como funciona.')}`;

const ACESSOS = [
  { e: '🙋', t: 'Quero ser operador', p: 'Faça o seu cadastro. A coordenação chama você no WhatsApp com o código de acesso.', b: 'Fazer cadastro', href: '#cadastro', destaque: true },
  { e: '🔑', t: 'Sou operador', p: 'Entre com o seu código para ver suas tarefas, pontos e benefícios.', b: 'Entrar como operador', href: '/operador' },
  { e: '🤝', t: 'Sou cliente', p: 'Quer um site, agente de WhatsApp ou automação sob medida? Conheça o Ateliê.', b: 'Ver o Ateliê', href: '/atelie' },
  { e: '🧭', t: 'Vitrine de projetos', p: 'Veja o que estamos construindo e onde os Pontos Oficina podem virar benefícios.', b: 'Abrir a vitrine', href: '/vitrine' },
  { e: '🛠️', t: 'Painel do dono', p: 'Área reservada para a coordenação: entregas, pagamentos, chamados e cartões.', b: 'Entrar no painel', href: '/admin/oficina', dono: true },
];

const PASSOS = [
  { t: 'Cadastro', p: 'Você preenche o formulário abaixo em menos de um minuto.' },
  { t: 'Código no WhatsApp', p: 'A coordenação confirma e envia o seu código de acesso.' },
  { t: 'Primeira tarefa', p: 'Abra um cartão: tem passo a passo, checklist e a IA para tirar dúvidas.' },
  { t: 'Aprovação e pontos', p: 'A entrega é conferida. Aprovada, você recebe os Pontos Oficina.' },
];

const BENEFICIOS = [
  { e: '🏷️', t: 'Desconto em produto digital', p: 'Use os pontos em produtos e serviços do ecossistema, com o valor definido pelo dono.' },
  { e: '⏫', t: 'Prioridade em tarefas novas', p: 'Quem entrega bem escolhe primeiro as próximas tarefas.' },
  { e: '🎓', t: 'Mentoria', p: 'Pontos também podem virar tempo de orientação para aprender mais.' },
];

const FAQ = [
  ['Preciso de experiência?', 'Não. Cada cartão traz o passo a passo e a IA responde dúvidas com base nele. Você aprende fazendo a primeira tarefa.'],
  ['Vou ganhar dinheiro?', 'Não prometemos renda. Algumas tarefas rendem Pontos Oficina (benefícios) e, em outras, pode haver pagamento em reais. O valor aparece antes de você começar.'],
  ['O que são Pontos Oficina?', 'Benefícios como descontos, prioridade e mentoria. Valem 12 meses, não são dinheiro, não se compram e não viram participação em empresa.'],
  ['Tenho horário fixo?', 'Não. Você escolhe quando fazer. Tarefas curtas, de 15 a 40 minutos.'],
  ['Qual é o vínculo?', 'Você atua como prestador autônomo, sem vínculo de emprego, estágio ou sociedade.'],
  ['O que preciso para começar?', 'Um celular com internet e o WhatsApp. Para algumas tarefas, uma conta gratuita no Canva criada com o seu próprio e-mail.'],
];

export default function Oficina() {
  const raiz = useRef(null);
  const [menu, setMenu] = useState(false);
  const fechar = () => setMenu(false);
  const [f, setF] = useState({ nome: '', whatsapp: '', cidade: '', interesse: '', aceito: false, site: '' });
  const [msg, setMsg] = useState(null);
  const [ok, setOk] = useState(false);
  const [ocupado, setOcupado] = useState(false);

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

  async function enviar(ev) {
    ev.preventDefault();
    setOcupado(true); setMsg(null);
    try {
      const origem = new URLSearchParams(window.location.search).get('origem') || '';
      await api('/api/oficina/candidatar', { method: 'POST', body: { ...f, origem } });
      setOk(true);
    } catch (e) { setMsg(e.message); }
    setOcupado(false);
  }

  return (
    <div className={styles.pagina} ref={raiz}>
      <Head>
        <title>Oficina Digital | {CONFIG.nome}</title>
        <meta name="description" content="Tarefas curtas feitas pelo celular, com passo a passo, checklist e IA para tirar dúvidas. Sem experiência. Você escolhe quando trabalhar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Oficina Digital" />
        <meta property="og:description" content="Aprenda fazendo e trabalhe no seu horário, pelo celular. Sem promessa de renda." />
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
            <a href="#acessos" onClick={fechar}>Acessos</a>
            <a href="#como" onClick={fechar}>Como funciona</a>
            <a href="#pontos" onClick={fechar}>Pontos</a>
            <a href="#duvidas" onClick={fechar}>Dúvidas</a>
            <Link href="/" onClick={fechar}>Início</Link>
            <a href="#cadastro" className={styles.menuCta} onClick={fechar}>Quero participar</a>
          </nav>
        </div>
      </header>

      <main id="topo">
        <OficinaBanner />

        <section id="acessos" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Acessos</p>
            <h2 className={styles.h2}>Escolha por onde entrar</h2>
            <p className={styles.sub}>Cada pessoa tem o seu caminho: operadores, clientes e a coordenação.</p>
            <div className={o.acessos}>
              {ACESSOS.map((a) => {
                const cls = `${o.acesso} ${a.destaque ? o.destaqueAcesso : ''} ${a.dono ? o.donoAcesso : ''}`;
                const btn = `${styles.botao} ${a.dono ? styles.principal : a.destaque ? styles.principal : styles.contornoEscuro}`;
                return (
                  <div key={a.t} className={cls} data-reveal="1">
                    <div className={`${styles.emoji} ${a.dono ? o.emojiDono : ''}`}>{a.e}</div>
                    <h3>{a.t}</h3>
                    <p>{a.p}</p>
                    {a.href.startsWith('#') ? <a href={a.href} className={btn}>{a.b}</a> : <Link href={a.href} className={btn}>{a.b}</Link>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="como" className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>Como funciona</p>
            <h2 className={styles.h2}>Do cadastro à primeira tarefa em 4 passos</h2>
            <p className={styles.sub}>Tudo pelo celular, no seu ritmo.</p>
            <ol className={styles.passos}>
              {PASSOS.map((p, i) => (
                <li key={p.t} data-reveal="1">
                  <div className={styles.passoN}>{i + 1}</div>
                  <strong>{p.t}</strong>
                  <p>{p.p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pontos" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Pontos Oficina</p>
            <h2 className={styles.h2}>Cada tarefa aprovada vira pontos</h2>
            <p className={styles.sub}>Pontos são benefícios. Valem 12 meses, não são dinheiro, não se compram e não viram participação em empresa.</p>
            <div className={styles.grade3}>
              {BENEFICIOS.map((c) => (
                <div key={c.t} className={styles.cartao} data-reveal="1">
                  <div className={styles.emoji}>{c.e}</div>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cadastro" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido + ' ' + o.cadGrade}>
            <div>
              <p className={styles.sobre}>Cadastro</p>
              <h2 className={styles.h2}>Quero participar</h2>
              <p className={styles.sub}>Preencha ao lado. A coordenação chama você no WhatsApp com o seu código de acesso.</p>
              <ul className={o.lista}>
                <li><b>Você escolhe quando trabalhar.</b> Sem horário fixo.</li>
                <li><b>Sem promessa de renda.</b> O valor de cada tarefa aparece antes de começar.</li>
                <li><b>Prestador autônomo.</b> Sem vínculo de emprego, estágio ou sociedade.</li>
              </ul>
            </div>
            {ok ? (
              <div className={o.sucesso}>
                <h3>Recebemos o seu cadastro.</h3>
                <p>Em breve a coordenação chama você no WhatsApp com o seu código de acesso.</p>
              </div>
            ) : (
              <form className={o.form} onSubmit={enviar}>
                {msg && <div className={o.erro}>{msg}</div>}
                <label htmlFor="n">Seu nome</label>
                <input id="n" type="text" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required />
                <label htmlFor="w">WhatsApp com DDD</label>
                <input id="w" type="tel" inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} required />
                <label htmlFor="c">Cidade</label>
                <input id="c" type="text" value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} />
                <label htmlFor="i">O que você gostaria de fazer? (opcional)</label>
                <textarea id="i" value={f.interesse} onChange={(e) => setF({ ...f, interesse: e.target.value })} />
                <input className={o.isca} name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.site} onChange={(e) => setF({ ...f, site: e.target.value })} />
                <label className={o.aceite}>
                  <input type="checkbox" checked={f.aceito} onChange={(e) => setF({ ...f, aceito: e.target.checked })} />
                  <span>Aceito receber contato por WhatsApp sobre a Oficina Digital. Usaremos seus dados só para isso.</span>
                </label>
                <button className={`${styles.botao} ${styles.principal} ${o.enviar}`} disabled={ocupado || !f.aceito}>
                  {ocupado ? 'Enviando…' : 'Enviar cadastro'}
                </button>
              </form>
            )}
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
            <h2 className={styles.h2}>Pronto para fazer a sua primeira tarefa?</h2>
            <p>Cadastre-se ou chame no WhatsApp. Sem compromisso e sem promessa de renda.</p>
            <div className={styles.acoes}>
              <a href="#cadastro" className={`${styles.botao} ${styles.principal}`}>Fazer cadastro</a>
              <a href={LINK_WHATS} className={`${styles.botao} ${styles.contorno}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
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
          <p>Oficina Digital: tarefas online com passo a passo e IA.</p>
          <Link href="/" className={styles.botaoPortal}>Voltar ao início<small>igreja.eco.br</small></Link>
        </div>
        <div className={styles.contido + ' ' + styles.rodapeFim}>© {new Date().getFullYear()} {CONFIG.nome}. Pontos Oficina não são dinheiro nem participação em empresa.</div>
      </footer>
    </div>
  );
}
