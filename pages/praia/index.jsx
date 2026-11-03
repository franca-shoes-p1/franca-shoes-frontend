import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/home.module.css';
import p from '../../styles/praia.module.css';
import PraiaLayout from '../../lib/PraiaLayout';
import PraiaHomeBanner from '../../lib/PraiaHomeBanner';
import { PASSOS, MODELO, KITS, FAQ, PRAIA } from '../../lib/praia';

const LINK_WHATS = `https://wa.me/${PRAIA.whatsapp}?text=${encodeURIComponent('Olá! Vi o Parceiros da Praia e quero saber como funciona.')}`;

export default function Praia() {
  const [v, setV] = useState(null);
  useEffect(() => { fetch('/api/praia/vagas').then((r) => r.json()).then(setV).catch(() => setV({ total: 0, livres: 0, cidades: [] })); }, []);
  return (
    <PraiaLayout titulo="Venda comida na praia em parceria">
      <PraiaHomeBanner />

      <section id="modelo" className={`${styles.secao} ${styles.clara}`}>
        <div className={styles.contido}>
          <p className={styles.sobre}>O modelo</p>
          <h2 className={styles.h2}>Parceria simples, com a conta aberta</h2>
          <p className={styles.sub}>Cada um faz a sua parte e o resultado é dividido no mesmo dia.</p>
          <div className={p.grade}>
            {MODELO.map((c) => (
              <div key={c.t} className={p.card} data-reveal="1"><div className={styles.emoji}>{c.e}</div><h3>{c.t}</h3><p>{c.p}</p></div>
            ))}
          </div>
          <p className={p.nota} style={{ marginTop: 22 }}>
            <b>Transparência:</b> não existe promessa de ganho. Depende da cidade, do clima e do seu esforço. Antes de sair, você vê o preço, o custo e a divisão de cada produto.
          </p>
        </div>
      </section>

      <section id="como" className={`${styles.secao} ${styles.escura}`}>
        <span className={`${styles.mancha} ${styles.m2}`} aria-hidden="true" />
        <div className={styles.contido}>
          <p className={styles.sobre}>Como funciona</p>
          <h2 className={styles.h2}>Do cadastro ao primeiro dia de venda</h2>
          <p className={styles.sub}>Cinco passos, tudo combinado pelo WhatsApp.</p>
          <ol className={styles.passos}>
            {PASSOS.map((x, i) => (
              <li key={x.t} data-reveal="1"><div className={styles.passoN}>{i + 1}</div><strong>{x.t}</strong><p>{x.p}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="kits" className={styles.secao}>
        <div className={styles.contido}>
          <p className={styles.sobre}>Os kits</p>
          <h2 className={styles.h2}>Equipamento emprestado, não vendido</h2>
          <p className={styles.sub}>Você retira o kit em comodato, com recibo, e devolve ao fim da parceria.</p>
          <div className={`${p.grade2} ${p.grade}`}>
            {KITS.map((c) => (
              <div key={c.t} className={p.card} data-reveal="1"><div className={styles.emoji}>{c.e}</div><h3>{c.t}</h3><p>{c.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="vagas" className={`${styles.secao} ${styles.clara}`}>
        <div className={styles.contido}>
          <p className={styles.sobre}>Vagas limitadas</p>
          <h2 className={styles.h2}>{v && v.total > 0 ? `${v.livres} de ${v.total} vagas abertas` : 'Vagas por cidade'}</h2>
          <p className={styles.sub}>Cada vaga é um kit real. Quando a cidade enche, você entra na lista de espera e é chamado quando abrir.</p>
          {v && v.cidades.length > 0 ? (
            <div className={p.vagas}>
              {v.cidades.map((c) => (
                <div key={c.cidade} className={p.vaga}>
                  <b>{c.cidade}</b>
                  <span>{c.livres} livres de {c.total}</span><br />
                  <span className={`${p.tag} ${c.livres > 0 ? '' : p.tagOff}`}>{c.livres > 0 ? 'Vagas abertas' : 'Lista de espera'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={p.nota}>As cidades do piloto serão anunciadas em breve. Cadastre-se agora e você entra na lista de espera, sem compromisso.</p>
          )}
          <div className={styles.acoes} style={{ marginTop: 26 }}>
            <Link href="/praia/cadastro" className={`${styles.botao} ${styles.principal}`}>Quero uma vaga</Link>
          </div>
        </div>
      </section>

      <section id="duvidas" className={styles.secao}>
        <div className={styles.contido}>
          <p className={styles.sobre}>Dúvidas frequentes</p>
          <h2 className={styles.h2}>Perguntas que todo mundo faz</h2>
          <div className={styles.faq} style={{ marginTop: 28, maxWidth: 820 }}>
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
          </div>
        </div>
      </section>

      <section className={styles.final}>
        <div className={styles.contido}>
          <h2 className={styles.h2}>Quer vender na praia nesta temporada?</h2>
          <p>Cadastre-se ou chame no WhatsApp. Sem compromisso e sem promessa de renda.</p>
          <div className={styles.acoes}>
            <Link href="/praia/cadastro" className={`${styles.botao} ${styles.principal}`}>Quero uma vaga</Link>
            <a href={LINK_WHATS} className={`${styles.botao} ${styles.contorno}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </div>
        </div>
      </section>
    </PraiaLayout>
  );
}
