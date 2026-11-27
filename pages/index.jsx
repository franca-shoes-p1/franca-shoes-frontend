import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout, { EMAIL } from '../lib/SiteLayout';
import { proximos } from '../lib/agenda';
import SimuladorModa from '../lib/SimuladorModa';
import s from '../styles/site.module.css';

const CANAL = 'https://www.youtube.com/@RicardoBello-o6v/streams';

/* Links antigos que apontavam para partes da home anterior. */
const ANTIGOS = {
  '#calcados': '/loja-de-calcados-pronta',
  '#video': '/loja-de-calcados-pronta#video',
  '#recebe': '/loja-de-calcados-pronta#recebe',
  '#como': '/loja-de-calcados-pronta#como',
  '#niveis': '/loja-de-calcados-pronta#niveis',
  '#duvidas': '/loja-de-calcados-pronta#duvidas',
  '#campanha': '/campanha',
  '#atendente': '/atendente',
  '#construcao': '/construcao',
  '#comunidade': '/inicio-2#comunidade',
};

const PLANOS = [
  ['🏬', 'Loja Abastecida', 'Você tem a sua loja, escolhe os produtos e eu guardo o estoque e entrego ao seu cliente.'],
  ['🔁', 'Revenda', 'Você compra de mim e revende do seu jeito.'],
  ['🙏', 'Membro', 'Para uso próprio, no grupo da igreja, com produto pelo preço do fornecedor.'],
];
const PASSOS = [
  ['Live', 'Mostro os produtos ao vivo.'],
  ['Escolha', 'Você escolhe o que quer.'],
  ['Pagamento', 'Até o fim da pausa, no horário avisado.'],
  ['Compra', 'Eu compro e confiro.'],
  ['Entrega', 'Conforme o seu plano.'],
];

const dataBr = (d) => d.split('-').reverse().join('/');

export default function Home() {
  const { 0: eventos, 1: setEventos } = useState([]);

  useEffect(() => {
    const destino = ANTIGOS[window.location.hash];
    if (destino) window.location.replace(destino);
    setEventos(proximos());
  }, []);

  return (
    <SiteLayout descricao="Roupas, calçados, acessórios e suvenires escolhidos ao vivo, direto dos fornecedores.">
      <section className={s.hero}>
        <div className={`${s.contido} ${s.heroGrade}`}>
          <div>
          <span className={s.selinho}>Pré-lançamento</span>
          <h1>Loja de Moda e Lembranças</h1>
          <p>Compre no Brás e nos principais comércios do Brasil sem sair de casa, para revender onde quiser.</p>
          <div className={s.acoes}>
            <Link href="/moda/participar" className={s.botao}>Quero participar</Link>
            <Link href="/moda" className={s.contorno}>Conhecer o projeto</Link>
          </div>
          </div>
          <SimuladorModa />
        </div>
      </section>

      <section id="agenda" className={s.secao}>
        <div className={s.contido}>
          <h2>Próximos eventos</h2>
          {eventos.length === 0 ? (
            <p className={s.vazio}>📅 As próximas datas serão anunciadas aqui. <a href={CANAL} target="_blank" rel="noopener noreferrer">Ver o canal das lives</a></p>
          ) : (
            <div className={s.grade}>
              {eventos.map((e) => (
                <article key={`${e.data}${e.hora}`} className={s.cartao}>
                  <span className={s.etiqueta}>{e.tipo}</span>
                  <h3>{dataBr(e.data)} às {e.hora}</h3>
                  <p>{e.local}</p>
                  <a href={e.link || CANAL} target="_blank" rel="noopener noreferrer">Acompanhar →</a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`${s.secao} ${s.clara}`}>
        <div className={s.contido}>
          <h2>Três formas de participar</h2>
          <div className={s.grade}>
            {PLANOS.map(([e, t, p]) => (
              <article key={t} className={s.cartao}>
                <span className={s.emoji} aria-hidden="true">{e}</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
          <p><Link href="/moda/planos">Ver detalhes dos planos →</Link></p>
        </div>
      </section>

      <section className={s.secao}>
        <div className={s.contido}>
          <h2>Como funciona</h2>
          <ol className={s.passos}>
            {PASSOS.map(([t, p]) => (<li key={t}><b>{t}</b><span>{p}</span></li>))}
          </ol>
          <p><Link href="/moda/como-funciona">Ver o passo a passo completo →</Link></p>
        </div>
      </section>

      <section className={`${s.secao} ${s.clara}`}>
        <div className={s.contido}>
          <h2>O que vamos oferecer</h2>
          <div className={s.categorias}>
            {[['👕', 'Roupas'], ['👟', 'Calçados'], ['👜', 'Acessórios'], ['🎁', 'Suvenires']].map(([e, t]) => (
              <div key={t}><span aria-hidden="true">{e}</span>{t}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className={s.secao}>
        <div className={s.contido}>
          <h2>Contato</h2>
          <p>Quer marcar uma conversa online? Isso ainda não é um contrato nem uma compra.</p>
          <div className={s.acoes}>
            <Link href="/moda/participar" className={s.botao}>Como falar com a gente</Link>
            <a href={`mailto:${EMAIL}`} className={s.contornoEscuro}>Enviar e-mail</a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
