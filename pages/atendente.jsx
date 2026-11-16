import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/atendente.module.css';
import AtendenteMotor from '../lib/AtendenteMotor';
import { Barra, Duvidas, Final } from '../lib/AtendenteSecoes';
import { PLANOS, WHATS_ATENDENTE } from '../lib/atendente';

const PARA_QUEM = [
  { e: '🛍️', t: 'Lojas', p: 'Catálogo, preço e pedido pelo WhatsApp.' },
  { e: '🩺', t: 'Clínicas e consultórios', p: 'Agenda, confirmação e lembrete para reduzir faltas.' },
  { e: '🍽️', t: 'Restaurantes e padarias', p: 'Cardápio do dia, encomenda e horário.' },
  { e: '🔧', t: 'Oficinas e serviços', p: 'Orçamento, prazo e agendamento.' },
  { e: '💇', t: 'Salões', p: 'Horários livres e confirmação.' },
];
const FAZ = [
  { e: '📖', t: 'Catálogo e preços', p: 'Responde com o que você cadastrar, sem inventar produto nem valor.' },
  { e: '📅', t: 'Agenda e lembrete', p: 'Reserva o horário e lembra o cliente antes.' },
  { e: '🛒', t: 'Pedido anotado', p: 'Registra o que o cliente quer e confirma.' },
  { e: '🔔', t: 'Aviso no Telegram', p: 'Você é avisado quando alguém quer comprar ou precisa de você.' },
  { e: '🧾', t: 'Painel do dia', p: 'Resumo de conversas, pedidos e pendências.' },
];
const PASSOS = [
  { t: 'Conversa', p: 'Você conta o que vende e onde perde tempo no WhatsApp.' },
  { t: 'Piloto de 14 dias', p: 'Montamos o assistente com o seu catálogo ou agenda e testamos juntos.' },
  { t: 'Ajustes', p: 'Corrigimos respostas e regras com o que os clientes realmente perguntam.' },
  { t: 'Entrega e acompanhamento', p: 'O assistente fica no ar e acompanhamos os primeiros dias.' },
];

export default function Atendente() {
  return (
    <div className={s.pagina}>
      <Head>
        <title>Atendente WhatsApp · Assistente com IA para o seu negócio | Igreja Eco</title>
        <meta name="description" content="Assistente com IA para atender no WhatsApp: catálogo, preços, agenda e aviso no Telegram. Teste a demonstração com dados de exemplo." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Barra />

      <header className={`${s.capa} ${s.bloco}`}>
        <span className={s.pilula}><i />Atendente WhatsApp</span>
        <h1 className={s.titulo}>Atendimento no WhatsApp <em>sem ficar preso ao celular</em></h1>
        <p className={s.texto}>Um assistente com IA que responde o cliente, mostra preços, marca horário e avisa você quando é hora de entrar na conversa.</p>
        <div className={s.acoes}>
          <a href="#demonstracao" className={`${s.botao} ${s.principal}`}>Testar agora</a>
          <a href={WHATS_ATENDENTE} className={`${s.botao} ${s.contorno}`} target="_blank" rel="noopener noreferrer">Pedir orçamento no WhatsApp</a>
        </div>
      </header>

      <section className={`${s.blocoFundo}`} id="demonstracao">
        <div className={s.bloco}>
          <p className={s.rotulo}>Demonstração</p>
          <h2 className={s.h2}>Converse com o assistente <em>como o seu cliente conversaria</em></h2>
          <p className={s.sub}>Escolha um tipo de negócio, toque numa pergunta ou escreva a sua. É o mesmo motor para todos: muda só a configuração.</p>
          <div className={s.demoLargura}><AtendenteMotor /></div>
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>Para quem é</p>
        <h2 className={s.h2}>Para o negócio que <em>responde tudo pelo WhatsApp</em></h2>
        <div className={s.grade}>
          {PARA_QUEM.map((c) => (<div key={c.t} className={s.cartao}><span className={s.icone} aria-hidden="true">{c.e}</span><h3>{c.t}</h3><p>{c.p}</p></div>))}
        </div>
        <p className={s.sub} style={{ marginTop: 16 }}>Começamos pelo comércio local. <Link href="/atendente/comercio"><b>Veja a página para lojas e comércio →</b></Link></p>
      </section>

      <section className={`${s.blocoFundo}`}>
        <div className={s.bloco}>
          <p className={s.rotulo}>O que ele faz</p>
          <h2 className={s.h2}>Do primeiro oi ao pedido <em>anotado</em></h2>
          <div className={s.grade}>
            {FAZ.map((c) => (<div key={c.t} className={s.cartao}><span className={s.icone} aria-hidden="true">{c.e}</span><h3>{c.t}</h3><p>{c.p}</p></div>))}
          </div>
        </div>
      </section>

      <section className={s.bloco} id="como">
        <p className={s.rotulo}>Como funciona</p>
        <h2 className={s.h2}>Da conversa ao assistente no ar em <em>4 passos</em></h2>
        <div className={s.grade}>
          {PASSOS.map((p, i) => (<div className={s.etapa} key={p.t}><b>{i + 1}</b><div><h3>{p.t}</h3><p>{p.p}</p></div></div>))}
        </div>
      </section>

      <section className={s.blocoFundo} id="planos">
        <div className={s.bloco}>
          <p className={s.rotulo}>Planos</p>
          <h2 className={s.h2}>Escolha o <em>ponto de partida</em></h2>
          <div className={s.grade}>
            {PLANOS.map((c) => (<div key={c.t} className={s.cartao}><span className={s.icone} aria-hidden="true">{c.e}</span><h3>{c.t}</h3><p>{c.d}</p><span className={s.sob}>Valor sob consulta</span></div>))}
          </div>
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>Canal</p>
        <h2 className={s.h2}>WhatsApp: <em>o que muda</em> entre piloto e oficial</h2>
        <div className={s.canal}>
          <p><b>Piloto:</b> usamos um número separado, sem disparo em massa, só para testar com você.</p>
          <p><b>Cliente pagante:</b> usamos o canal oficial da Meta, com a conta e o número em nome do próprio negócio. Isso protege o seu número.</p>
        </div>
      </section>

      <Duvidas />
      <Final />
    </div>
  );
}
