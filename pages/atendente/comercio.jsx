import React from 'react';
import Head from 'next/head';
import s from '../../styles/atendente.module.css';
import AtendenteMotor from '../../lib/AtendenteMotor';
import { Barra, Duvidas, Final } from '../../lib/AtendenteSecoes';
import { WHATS_ATENDENTE } from '../../lib/atendente';

const DORES = [
  { e: '⏰', t: 'Cliente pergunta fora do horário', p: 'O assistente responde na hora e deixa o pedido anotado para você.' },
  { e: '🔁', t: 'Mesma pergunta o dia todo', p: 'Preço, horário e prazo são respondidos sem você parar o que está fazendo.' },
  { e: '📝', t: 'Pedido perdido na conversa', p: 'Cada pedido vira um aviso no seu Telegram, com o que o cliente pediu.' },
];

export default function AtendenteComercio() {
  return (
    <div className={s.pagina}>
      <Head>
        <title>Atendente WhatsApp para lojas e comércio local | Igreja Eco</title>
        <meta name="description" content="Assistente com IA para loja e comércio local: responde preço e horário, anota pedido e avisa o dono no Telegram. Teste a demonstração." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Barra />
      <header className={`${s.capa} ${s.bloco}`}>
        <span className={s.pilula}><i />Para lojas e comércio local</span>
        <h1 className={s.titulo}>Seu comércio atende <em>mesmo quando você está ocupado</em></h1>
        <p className={s.texto}>O assistente responde preço, horário e catálogo pelo WhatsApp, anota o pedido e avisa você no Telegram.</p>
        <div className={s.acoes}>
          <a href="#demonstracao" className={`${s.botao} ${s.principal}`}>Testar com uma loja</a>
          <a href={WHATS_ATENDENTE} className={`${s.botao} ${s.contorno}`} target="_blank" rel="noopener noreferrer">Pedir orçamento no WhatsApp</a>
        </div>
      </header>
      <section className={s.blocoFundo} id="demonstracao">
        <div className={s.bloco}>
          <p className={s.rotulo}>Demonstração</p>
          <h2 className={s.h2}>Veja como o cliente <em>é atendido</em></h2>
          <div className={s.demoLargura}><AtendenteMotor inicial="calcados" /></div>
        </div>
      </section>
      <section className={s.bloco}>
        <p className={s.rotulo}>O problema</p>
        <h2 className={s.h2}>O que costuma atrapalhar o <em>dono do comércio</em></h2>
        <div className={s.grade}>
          {DORES.map((c) => (<div key={c.t} className={s.cartao}><span className={s.icone} aria-hidden="true">{c.e}</span><h3>{c.t}</h3><p>{c.p}</p></div>))}
        </div>
      </section>
      <Duvidas />
      <Final />
    </div>
  );
}
