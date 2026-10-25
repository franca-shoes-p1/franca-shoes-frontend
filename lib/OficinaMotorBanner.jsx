import React from 'react';
import s from '../styles/assBanner.module.css';

const PRONTOS = [
  { e: '⚙️', t: 'Motor das tarefas', d: 'Um molde: cada tarefa nova vira só um cartão com passos e checklist.' },
  { e: '🤖', t: 'Tutor de IA', d: 'Tira dúvidas dentro do cartão e chama a coordenação se não souber.' },
  { e: '🔍', t: 'Pré-avaliação', d: 'Confere a entrega antes da revisão. Só sugere: quem aprova é uma pessoa.' },
  { e: '🔔', t: 'Aviso ao dono', d: 'Cada entrega nova chega no Telegram, com a nota da IA.' },
  { e: '🏅', t: 'Pontos Oficina', d: 'Tarefa aprovada vira pontos e benefícios, com validade de 12 meses.' },
];

export default function OficinaMotorBanner() {
  return (
    <section className={s.banner} aria-label="Motor da Oficina">
      <div className={s.dentro}>
        <div>
          <span className={s.pilula}><i />Novo · Motor da Oficina</span>
          <h2 className={s.titulo}>Peça uma tarefa <em>e veja ela ganhar forma</em></h2>
          <p className={s.texto}>
            Responda em poucos passos e acompanhe o cartão de tarefa ao vivo. No fim, você envia o pedido e respondemos no
            WhatsApp, sem compromisso. É o mesmo motor dos assistentes do Ateliê.
          </p>
          <div className={s.acoes}>
            <a href="/monte-sua-oficina" className={`${s.botao} ${s.principal}`}>Pedir uma tarefa</a>
            <a href="/assistentes" className={`${s.botao} ${s.contorno}`}>Ver todos os assistentes</a>
            <a href="/atelie" className={`${s.botao} ${s.contorno}`}>Conhecer o Ateliê</a>
          </div>
          <p className={s.nota}>Pedido sem compromisso. Não prometemos vendas nem lucro.</p>
        </div>

        <div className={s.palco}>
          <div className={s.cartao}>
            <h3 className={s.cartaoTopo}><span>Já está pronto</span><span>Novo</span></h3>
            {PRONTOS.map((p) => (
              <div key={p.t} className={s.linha}>
                <span className={s.emoji} aria-hidden="true">{p.e}</span>
                <span className={s.info}><b>{p.t}</b><small>{p.d}</small></span>
                <span className={s.ok} aria-hidden="true">✓</span>
              </div>
            ))}
            <div className={s.rodape}><span>Prévia ao vivo em cada passo</span><span>Funciona no celular</span></div>
          </div>
          <div className={`${s.chip} ${s.c1}`} aria-hidden="true">⚡ Prévia ao vivo</div>
          <div className={`${s.chip} ${s.c2}`} aria-hidden="true">📱 Celular e computador</div>
        </div>
      </div>
    </section>
  );
}
