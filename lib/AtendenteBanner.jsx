import React from 'react';
import Link from 'next/link';
import s from '../styles/atendente.module.css';
import AtendenteMotor from './AtendenteMotor';

/* Vitrine do Atendente WhatsApp na home: fica entre o Clube (FestaBanner) e a Campanha de Inauguração. */
const CARDS = [
  { e: '💬', t: 'Catálogo e preços', d: 'O cliente pergunta, o assistente responde com o valor.' },
  { e: '📅', t: 'Agenda', d: 'Marca, confirma e lembra o horário para reduzir faltas.' },
  { e: '🔔', t: 'Você no comando', d: 'Pedido ou dúvida difícil chega para você no Telegram.' },
];

export default function AtendenteBanner() {
  return (
    <section id="atendente" className={s.banner} aria-label="Atendente WhatsApp">
      <div className={s.dentro}>
        <div className={s.esq}>
          <span className={s.pilula}><i />Novo · Atendente WhatsApp</span>
          <h2 className={s.titulo}>Seu negócio responde o cliente <em>no WhatsApp, o dia todo</em></h2>
          <p className={s.texto}>
            Um assistente com IA que mostra catálogo, tira dúvidas, marca horário e avisa você no Telegram quando alguém quer comprar.
          </p>
          <div className={s.cards}>
            {CARDS.map((c) => (
              <div key={c.t} className={s.medalhao}>
                <span className={s.circulo} aria-hidden="true">{c.e}</span>
                <div><b>{c.t}</b><small>{c.d}</small></div>
              </div>
            ))}
          </div>
          <div className={s.acoes}>
            <a href="#atendente-demo" className={`${s.botao} ${s.principal}`}>Testar o assistente agora</a>
            <Link href="/atendente" className={`${s.botao} ${s.contorno}`}>Ver como funciona</Link>
          </div>
          <p className={s.nota}>Demonstração com dados de exemplo. Valores e prazos são combinados caso a caso. Não prometemos resultados.</p>
        </div>
        <div className={s.palco}>
          <AtendenteMotor compacto id="atendente-demo" />
        </div>
      </div>
    </section>
  );
}
