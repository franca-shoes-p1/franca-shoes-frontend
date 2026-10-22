import React from 'react';
import Link from 'next/link';
import s from '../styles/ateBanner.module.css';

const SETORES = ['Briefing', 'Texto', 'Design', 'Página', 'Agente de WhatsApp', 'Testes'];

const icone = { fill: 'none', stroke: '#7ff0ff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' };

export default function AtelieBanner() {
  return (
    <section className={s.banner} aria-label="Ateliê Sob Medida">
      <div className={s.dentro}>
        <div>
          <span className={s.pilula}><i />Novo · Ateliê Sob Medida</span>
          <h2 className={s.titulo}>Sua ideia vira <em>produto digital</em>. A gente monta.</h2>
          <p className={s.texto}>
            Consultoria, mentoria e montagem de sites, agentes de WhatsApp com IA e automações. Uma equipe de montadores executa
            cada peça e tudo é conferido antes de chegar até você.
          </p>
          <ul className={s.passos}>
            <li><b>1</b>Consultoria</li>
            <li><b>2</b>Mentoria</li>
            <li><b>3</b>Montagem</li>
          </ul>
          <div className={s.acoes}>
            <Link href="/atelie" className={`${s.botao} ${s.principal}`}>Conhecer o Ateliê</Link>
            <Link href="/atelie#montadores" className={`${s.botao} ${s.contorno}`}>Quero ser montador</Link>
          </div>
          <p className={s.nota}>Entrada de 50% e saldo na entrega. Sem promessa de resultado financeiro.</p>
        </div>

        <div className={s.palco} aria-hidden="true">
          <div className={s.cartao}>
            <h4 className={s.cartaoTopo}><span>Ordem de produção</span><span>Exemplo</span></h4>
            {SETORES.map((n) => (
              <div key={n} className={s.linha}>
                <span>{n}</span>
                <div className={s.barra}><span /></div>
                <div className={s.ok}>✓</div>
              </div>
            ))}
            <div className={s.rodape}><span>Conferido antes da entrega</span><span>Cada setor, um montador</span></div>
          </div>
          <div className={`${s.chip} ${s.c1}`}>
            <svg {...icone}><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 9h18M8 21h8" /></svg>Sites
          </div>
          <div className={`${s.chip} ${s.c2}`}>
            <svg {...icone}><path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.1-4.7A8 8 0 1 1 21 12z" /></svg>WhatsApp com IA
          </div>
          <div className={`${s.chip} ${s.c3}`}>
            <svg {...icone}><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H14a4 4 0 0 1 4 4v5.5" /></svg>Automação
          </div>
        </div>
      </div>
    </section>
  );
}
