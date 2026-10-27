import React, { useRef } from 'react';
import Link from 'next/link';
import s from '../styles/sitesvitrine.module.css';
import { TIPOS, ETAPAS, NIVEIS, AVISO } from './sites';

/* Vitrine "Fábrica de Sites" na home: estilo planta de projeto (grade azul), cartões de visita em carrossel e linha das etapas. */
export default function SitesVitrine() {
  const trilho = useRef(null);
  const rolar = (dir) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 360), behavior: 'smooth' });
  };
  return (
    <section id="sites" className={s.vitrine} aria-label="Fábrica de Sites">
      <div className={s.grade} aria-hidden="true" />
      <div className={s.dentro}>
        <header className={s.topo}>
          <span className={s.pilula}><i />Fábrica de Sites · planta do projeto</span>
          <h2 className={s.titulo}>Qual site combina com o <em>seu negócio?</em></h2>
          <p className={s.texto}>
            Do mini site ao site com assistente de IA: veja cada tipo, o que vai dentro e como produzimos, do briefing até o suporte.
            Escolha o seu cartão e peça uma proposta.
          </p>
        </header>

        <div className={s.carrossel}>
          <button type="button" className={`${s.seta} ${s.esq}`} onClick={() => rolar(-1)} aria-label="Ver cartões anteriores">‹</button>
          <ul className={s.trilho} ref={trilho}>
            {TIPOS.map((t, i) => {
              const n = NIVEIS[t.nivel];
              return (
                <li key={t.id} className={s.item}>
                  <Link href={`/sites?tipo=${t.id}`} className={s.cartao} style={{ '--giro': `${i % 2 ? 1 : -1}deg` }}>
                    <span className={s.cantoA} aria-hidden="true" />
                    <span className={s.num}>Ficha {String(i + 1).padStart(2, '0')}</span>
                    <span className={s.icone} aria-hidden="true">{t.e}</span>
                    <b className={s.nome}>{t.nome}</b>
                    <span className={s.estilo}>{t.estilo}</span>
                    <span className={s.resumo}>{t.resumo}</span>
                    <span className={s.rodape}>
                      <span className={s.nivel} style={{ color: n.cor, background: n.fundo }}>{n.rotulo}</span>
                      <span className={s.ver}>6 itens detalhados →</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <button type="button" className={`${s.seta} ${s.dir}`} onClick={() => rolar(1)} aria-label="Ver próximos cartões">›</button>
        </div>

        <ol className={s.etapas} aria-label="Etapas da produção">
          {ETAPAS.map((e) => (
            <li key={e.n}><b>{e.n}</b><span>{e.t}</span></li>
          ))}
        </ol>

        <div className={s.acoes}>
          <Link href="/sites" className={`${s.botao} ${s.principal}`}>Ver a Fábrica de Sites completa</Link>
          <Link href="/sites#cartao" className={`${s.botao} ${s.contorno}`}>Montar o meu cartão</Link>
        </div>
        <p className={s.nota}>{AVISO}</p>
      </div>
    </section>
  );
}
