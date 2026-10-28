import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/home.module.css';
import o from '../styles/oficina.module.css';

/*
  RASCUNHO da página da Assistência da Comunidade e do plano Amigo da Obra.
  Fica com noindex e sem link no menu até você revisar.
  O plano Amigo da Obra só abre quando houver conta na Kiwify e o link abaixo estiver preenchido.
  O painel exclusivo do Assistente ainda não existe: vem depois do primeiro assistente em prova.
*/
const CONFIG = {
  nome: 'Igreja Eco',
  whatsapp: '5516991543663',
  // Preencher depois da conta da Kiwify. Vazio = o botão vira "Em breve".
  linkAmigoDaObra: '',
  precoAmigo: 'R$ 49,90 por mês',
  diasParticipacao: 30,
  cartoes: 5,
  diasProva: 30,
};

const DEPARTAMENTOS = [
  ['acolhimento', 'Acolhimento: quem chega e respostas em até 48 horas'],
  ['ensino', 'Ensino: estudos e ordem dos temas'],
  ['mordomia', 'Mordomia: horta, despensa e Vigiar e Cultivar'],
  ['partilha', 'Partilha: cestas e ligação com produtores'],
  ['cuidado', 'Cuidado com os membros: contato e visita, com sigilo'],
  ['comunicacao', 'Comunicação: vídeos, posts e grupos'],
  ['livros', 'Livros: fila, capas e revisão'],
  ['atendimento', 'Atendimento e conferência: respostas e conferência antes de publicar'],
];

const QUALIDADES = [
  ['Integridade', 'Cumpre o que combinou e admite quando erra.'],
  ['Serviço comprovado', 'Cartões aprovados sem retrabalho e tempo de participação.'],
  ['Discrição', 'Guarda sigilo de pedidos de oração e de dados dos membros.'],
  ['Maturidade', 'Discorda com respeito e aceita a decisão final.'],
  ['Constância', 'Aparece nas semanas ruins, não só nas boas.'],
  ['Humildade', 'Não busca título nem aparecer.'],
  ['Conhecimento do projeto', 'Leu o manual e entende o que a igreja faz e não faz.'],
  ['Disponibilidade honesta', 'Diz quantas horas tem, sem prometer mais.'],
];

const PASSOS = [
  ['1', 'Requisitos', `${CONFIG.diasParticipacao} dias de participação, ${CONFIG.cartoes} cartões aprovados sem retrabalho, manual lido e compromissos aceitos.`],
  ['2', 'Carta curta', 'Onde você quer servir e por quê.'],
  ['3', 'Avaliação e conversa', 'Notas de 1 a 5 em cada qualidade ajudam na decisão, e há uma conversa de 20 minutos.'],
  ['4', 'Prova', `${CONFIG.diasProva} dias como Assistente em Prova, com o painel só para leitura e comandos básicos.`],
  ['5', 'Confirmação', 'A confirmação vem por escrito, com a razão. O cargo é revisto a cada 90 dias.'],
];

const REGRAS = [
  'Dinheiro não compra cargo nem voz. Pagar o plano Amigo da Obra não dá vantagem na seleção.',
  'O Assistente não tem cargo pastoral nem consagração, e não tem autoridade espiritual nem sobre o dinheiro.',
  'A voz do Assistente é consultiva: ele opina, e a decisão final é de Ricardo, com os pareceres registrados.',
  'O cargo não substitui o pagamento por tarefa aprovada e os créditos do site, que continuam valendo. Sem promessa de ganho.',
  'Sem horário fixo, sem ordens diárias e sem exclusividade: o Assistente é autônomo.',
  'O cargo pode ser retirado por falta de serviço, quebra de sigilo ou ato contrário aos compromissos, sempre com conversa antes.',
];

const FAQ = [
  ['Preciso pagar para ser Assistente?', 'Não. O cargo vem do serviço prestado e da seleção, nunca de pagamento.'],
  ['Quem assina o Amigo da Obra ganha cargo ou voz?', 'Não. O plano é de apoio e conteúdo: nunca dá cargo, voto, voz nas reuniões nem acesso a dados de membros.'],
  ['Já posso me candidatar?', `Quando você tiver ${CONFIG.diasParticipacao} dias de participação, ${CONFIG.cartoes} cartões aprovados e o manual lido. Convites do Ricardo podem encurtar a espera, e a prova de ${CONFIG.diasProva} dias continua.`],
  ['Com que frequência são as reuniões?', 'Mensais no começo, com 45 minutos por videoconferência. Passam a quinzenais quando houver três ou mais assistentes.'],
  ['E se eu me arrepender do plano?', 'Você tem 7 dias para desistir, com devolução integral.'],
  ['Meus dados ficam seguros?', 'Pedimos só o necessário, com o seu aceite, e usamos apenas para contato da igreja.'],
];

function Botao({ href, classe, children, texto }) {
  if (!href) {
    return <span className={`${styles.botao} ${classe}`} aria-disabled="true" style={{ opacity: 0.6, cursor: 'default' }}>{texto || 'Em breve'}</span>;
  }
  return <a href={href} className={`${styles.botao} ${classe}`} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export default function Assistencia() {
  const raiz = useRef(null);
  const [menu, setMenu] = useState(false);
  const [f, setF] = useState({ nome: '', whatsapp: '', cidade: '', departamento: '', carta: '', aceito: false, site: '' });
  const [msg, setMsg] = useState(null);
  const [ok, setOk] = useState(false);
  const [ocupado, setOcupado] = useState(false);
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

  async function enviar(ev) {
    ev.preventDefault();
    setOcupado(true); setMsg(null);
    try {
      const r = await fetch('/api/assistencia/candidatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.erro || 'Não foi possível enviar agora.');
      setOk(true);
    } catch (e) { setMsg(e.message); }
    setOcupado(false);
  }

  return (
    <div className={styles.pagina} ref={raiz}>
      <Head>
        <title>Assistência da Comunidade | {CONFIG.nome}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Assistência da Comunidade: cargo de serviço da igreja, por convite ou candidatura. E o plano Amigo da Obra, que apoia sem dar cargo nem voz." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <a href="#duas" onClick={fechar}>Duas portas</a>
            <a href="#escolha" onClick={fechar}>Como escolhemos</a>
            <a href="#candidatar" onClick={fechar}>Candidatura</a>
            <a href="#duvidas" onClick={fechar}>Dúvidas</a>
            <Link href="/" onClick={fechar}>Início</Link>
          </nav>
        </div>
      </header>

      <main id="topo">
        <section className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>Assistência da Comunidade</p>
            <h1 className={styles.h2}>Servir junto, com confiança</h1>
            <p className={styles.sub}>Um cargo de serviço para quem já trabalha na obra, e um plano de apoio aberto a qualquer pessoa. As duas portas não se misturam: dinheiro não compra cargo nem voz.</p>
            <div className={styles.acoes}>
              <a href="#candidatar" className={`${styles.botao} ${styles.principal}`}>Quero me candidatar</a>
              <a href="#duas" className={`${styles.botao} ${styles.contorno}`}>Ver as duas portas</a>
            </div>
          </div>
        </section>

        <section id="duas" className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Duas portas</p>
            <h2 className={styles.h2}>Cargo de serviço e plano de apoio</h2>
            <div className={styles.grade3}>
              <div className={styles.cartao} data-reveal="1">
                <div className={styles.emoji}>🤝</div>
                <h3>Assistência da Comunidade</h3>
                <p>Cargo de serviço, por convite ou candidatura. Você contribui com trabalho, tempo e habilidade, e recebe painel exclusivo, voz consultiva nas reuniões e o reconhecimento do cargo.</p>
              </div>
              <div className={styles.cartao} data-reveal="1">
                <div className={styles.emoji}>🌾</div>
                <h3>Amigo da Obra</h3>
                <p>Assinatura opcional de {CONFIG.precoAmigo} (valor de teste): acesso antecipado aos livros novos, grupo exclusivo no Telegram, bastidores, uma conversa ao vivo por mês e desconto nos livros.</p>
                <p><strong>Nunca dá cargo, voto, voz nas reuniões nem acesso a dados de membros.</strong></p>
                <Botao href={CONFIG.linkAmigoDaObra} classe={styles.contornoEscuro} texto="Em breve">Quero ser Amigo da Obra</Botao>
              </div>
            </div>
            <p className={styles.sub} style={{ marginTop: 20 }}>Você tem 7 dias para desistir do plano, com devolução integral.</p>
          </div>
        </section>

        <section id="escolha" className={`${styles.secao} ${styles.escura}`}>
          <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
          <div className={styles.contido}>
            <p className={styles.sobre}>Como escolhemos</p>
            <h2 className={styles.h2}>Cinco passos, os mesmos para todos</h2>
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

        <section className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Qualidades</p>
            <h2 className={styles.h2}>O que observamos</h2>
            <p className={styles.sub}>Vale mais o que a pessoa já fez do que o que ela diz sobre si.</p>
            <div className={styles.grade3} style={{ marginTop: 24 }}>
              {QUALIDADES.map(([t, p]) => (
                <div key={t} className={styles.cartao} data-reveal="1">
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.secao} ${styles.clara}`}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Transparência</p>
            <h2 className={styles.h2}>O que dizemos com clareza</h2>
            <ul className={o.lista}>
              {REGRAS.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </section>

        <section id="candidatar" className={styles.secao}>
          <div className={styles.contido}>
            <p className={styles.sobre}>Candidatura</p>
            <h2 className={styles.h2}>Quero servir como Assistente</h2>
            <p className={styles.sub}>Sua candidatura é lida com os requisitos ao lado: {CONFIG.diasParticipacao} dias, {CONFIG.cartoes} cartões aprovados e o manual lido. Ainda não cumpre? Envie mesmo assim, e a gente conversa.</p>
            {ok ? (
              <div className={o.sucesso}>
                <h3>Recebemos a sua carta.</h3>
                <p>Ela será lida com cuidado, e a resposta vem por WhatsApp.</p>
              </div>
            ) : (
              <form className={o.form} onSubmit={enviar} style={{ marginTop: 24 }}>
                {msg && <div className={o.erro}>{msg}</div>}
                <label htmlFor="an">Seu nome</label>
                <input id="an" type="text" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required />
                <label htmlFor="aw">WhatsApp com DDD</label>
                <input id="aw" type="tel" inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} required />
                <label htmlFor="ac">Cidade</label>
                <input id="ac" type="text" value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} />
                <label htmlFor="ad">Onde quer servir?</label>
                <select id="ad" value={f.departamento} onChange={(e) => setF({ ...f, departamento: e.target.value })} style={{ width: '100%', font: 'inherit', padding: '13px 16px', borderRadius: 14 }}>
                  <option value="">Ainda não sei</option>
                  {DEPARTAMENTOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
                <label htmlFor="al">Carta curta: onde quer servir e por quê</label>
                <textarea id="al" value={f.carta} onChange={(e) => setF({ ...f, carta: e.target.value })} required minLength={20} maxLength={1200} />
                <input className={o.isca} name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.site} onChange={(e) => setF({ ...f, site: e.target.value })} />
                <label className={o.aceite}>
                  <input type="checkbox" checked={f.aceito} onChange={(e) => setF({ ...f, aceito: e.target.checked })} />
                  <span>Aceito que meus dados sejam usados só para contato da igreja sobre esta candidatura.</span>
                </label>
                <button className={`${styles.botao} ${styles.principal} ${o.enviar}`} disabled={ocupado || !f.aceito}>
                  {ocupado ? 'Enviando…' : 'Enviar candidatura'}
                </button>
              </form>
            )}
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
      </main>

      <footer className={styles.rodape}>
        <div className={styles.contido + ' ' + styles.rodapeCentro}>
          <a href="#topo" className={styles.marca} onClick={fechar}>
            <span className={styles.selo}>IE</span>
            <span>{CONFIG.nome}</span>
          </a>
          <p>Assistência da Comunidade: projeto em formação.</p>
          <Link href="/" className={styles.botaoPortal}>Voltar ao início<small>igreja.eco.br</small></Link>
        </div>
        <div className={styles.contido + ' ' + styles.rodapeFim}>© {new Date().getFullYear()} {CONFIG.nome}. Projeto em formação, sem registro. Não pedimos dízimo nem oferta.</div>
      </footer>
    </div>
  );
}
