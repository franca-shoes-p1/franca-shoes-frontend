import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/pacotes.module.css';
import { SEGMENTOS, PACOTES, EXTRAS, ETAPAS, PERGUNTAS } from '../data/pacotes';

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function Pacotes() {
  const [segId, setSegId] = useState(SEGMENTOS[0].id);
  const seg = SEGMENTOS.find((s) => s.id === segId);

  return (
    <div className={styles.pagina}>
      <Head>
        <title>Pacotes para o seu comércio | Igreja Eco</title>
        <meta name="description" content="Pacotes prontos de site, atendimento automático e divulgação para salões, mercadinhos, academias e oficinas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.topo}>
        <div className={styles.topoBarra}>
          <Link href="/" className={styles.marca}><span className={styles.selo}>IE</span><span>Igreja Eco</span></Link>
          <Link href="/" className={styles.voltar}>← Voltar ao portal</Link>
        </div>
      </header>

      <section className={styles.heroi}>
        <div className={styles.contido}>
          <p className={styles.sobretitulo}>Soluções prontas para pequenos comércios</p>
          <h1>Seu negócio na internet, atendendo e divulgando, sem complicação</h1>
          <p className={styles.heroiTexto}>
            Site, atendimento automático e divulgação em pacotes prontos. Você escolhe, eu monto, instalo e cuido da manutenção.
          </p>
          <a href="#pacotes" className={styles.botao}>Ver os pacotes</a>
        </div>
      </section>

      <main className={styles.contido}>
        <section id="pacotes" className={styles.secao}>
          <h2>Escolha o seu tipo de negócio</h2>
          <div className={styles.abas} role="tablist">
            {SEGMENTOS.map((s) => (
              <button key={s.id} role="tab" aria-selected={s.id === segId}
                className={s.id === segId ? styles.abaAtiva : styles.aba} onClick={() => setSegId(s.id)}>
                <span aria-hidden="true">{s.icone}</span> {s.nome}
              </button>
            ))}
          </div>

          <div className={styles.segmento}>
            <p><strong>Para quem é:</strong> {seg.dor}</p>
            <ul>{seg.exemplos.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>

          <div className={styles.grade}>
            {PACOTES.map((p) => (
              <article key={p.id} className={p.destaque ? styles.cartaoDestaque : styles.cartao}>
                {p.destaque && <span className={styles.faixa}>Mais escolhido</span>}
                <h3>{p.nome}</h3>
                <p className={styles.lema}>{p.lema}</p>
                <p className={styles.preco}>{brl(p.implantacao)} <small>implantação</small></p>
                {p.parcelas > 0 && <p className={styles.parcela}>ou {p.parcelas}x de {brl(Math.ceil(p.implantacao / p.parcelas))}</p>}
                <p className={styles.mensal}>+ {brl(p.mensal)}/mês de manutenção</p>
                <ul className={styles.itens}>{p.itens.map((i) => <li key={i}>{i}</li>)}</ul>
                <Link href={`/pedido?servico=${encodeURIComponent('Pacote pronto para comércio')}&pacote=${encodeURIComponent(`${p.nome} - ${seg.nome}`)}`}
                  className={p.destaque ? styles.botao : styles.botaoContorno}>
                  Quero o pacote {p.nome}
                </Link>
              </article>
            ))}
          </div>
          <p className={styles.nota}>Valores de implantação são pagos uma vez. Os detalhes finais são confirmados no atendimento, de acordo com o seu negócio.</p>
        </section>

        <section className={styles.secao}>
          <h2>Como funciona</h2>
          <div className={styles.etapas}>
            {ETAPAS.map((e) => (
              <div key={e.n} className={styles.etapa}><span className={styles.num}>{e.n}</span><h3>{e.titulo}</h3><p>{e.texto}</p></div>
            ))}
          </div>
        </section>

        <section className={styles.secao}>
          <h2>Serviços extras</h2>
          <div className={styles.extras}>
            {EXTRAS.map((x) => <div key={x.nome} className={styles.extra}><h3>{x.nome}</h3><p>{x.texto}</p></div>)}
          </div>
        </section>

        <section className={styles.secao}>
          <h2>Perguntas frequentes</h2>
          {PERGUNTAS.map((q) => (
            <details key={q.p} className={styles.pergunta}><summary>{q.p}</summary><p>{q.r}</p></details>
          ))}
        </section>

        <section className={styles.final}>
          <h2>Vamos montar o seu?</h2>
          <p>Conte sobre o seu negócio e eu respondo pelo WhatsApp, sem compromisso.</p>
          <Link href="/pedido?servico=Pacote%20pronto%20para%20com%C3%A9rcio" className={styles.botao}>Pedir meu pacote</Link>
        </section>
      </main>
    </div>
  );
}
