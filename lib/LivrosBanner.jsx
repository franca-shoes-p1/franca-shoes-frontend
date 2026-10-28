import React from 'react';
import Link from 'next/link';
import s from '../styles/livrosBanner.module.css';
import LivroCapa from './LivroCapa';
import { LIVROS } from './livros';

/* Faixa da vitrine de livros na home. Fica entre a vitrine do Ateliê e a da Oficina.
   As capas vêm de lib/livros.js: livro novo entra lá e aparece aqui sozinho. */
const EM_PRODUCAO = ['Roteiro dos capítulos', 'Rascunho com IA', 'Revisão de quem ensina', 'Capa e miolo', 'Conferência final'];

export default function LivrosBanner() {
  const leque = LIVROS.slice(0, 3);
  return (
    <>
      <section className={s.banner} aria-label="Livros e manuais">
        <span className={s.brilho1} aria-hidden="true" />
        <span className={s.brilho2} aria-hidden="true" />
        <div className={s.dentro}>
          <div>
            <span className={s.pilula}><i />Novo · Livros e Manuais</span>
            <h2 className={s.titulo}>Livros para estudar, plantar e <em>servir juntos</em>.</h2>
            <p className={s.texto}>
              Manuais e programas da Igreja Evangelho dos Pobres dos Alimentos Sagrados, escritos em linguagem simples,
              com tarefas práticas e novos títulos chegando. Ser membro é gratuito e a igreja não pede dízimo nem oferta.
            </p>
            <ul className={s.passos}>
              <li><b>1</b>Leia o capítulo grátis</li>
              <li><b>2</b>Faça a tarefa</li>
              <li><b>3</b>Entre num grupo</li>
            </ul>
            <div className={s.acoes}>
              <Link href="/livros" className={`${s.botao} ${s.principal}`}>Ver a vitrine de livros</Link>
              <Link href="/manual-da-igreja" className={`${s.botao} ${s.contorno}`}>Ler o Manual da Igreja</Link>
            </div>
            <p className={s.nota}>Sem promessa de ganho, de cura ou de bênção financeira. Livros digitais com 7 dias para desistir.</p>
          </div>

          <div className={s.palco}>
            <div className={s.leque} aria-hidden="true">
              {leque.map((l, i) => (
                <div key={l.id} className={`${s.livro} ${s['l' + i]}`}>
                  <LivroCapa livro={l} />
                </div>
              ))}
            </div>
            <div className={s.cartao} aria-hidden="true">
              <h4 className={s.cartaoTopo}><span>Próximo livro</span><span>Em produção</span></h4>
              {EM_PRODUCAO.map((n) => (
                <div key={n} className={s.linha}>
                  <span>{n}</span>
                  <div className={s.barra}><span /></div>
                  <div className={s.ok}>✓</div>
                </div>
              ))}
            </div>
            <div className={`${s.chip} ${s.c1}`} aria-hidden="true">📘 Capítulo grátis</div>
            <div className={`${s.chip} ${s.c2}`} aria-hidden="true">🌱 Tarefa da semana</div>
          </div>
        </div>
      </section>

      <nav className={s.faixa} aria-label="Atalhos dos livros">
        <div className={s.faixaGrade}>
          <Link href="/livros" className={s.faixaItem}><span>📚</span>Vitrine de livros</Link>
          <Link href="/manual-da-igreja" className={s.faixaItem}><span>⛪</span>Manual da Igreja</Link>
          <Link href="/vigiar-e-cultivar" className={s.faixaItem}><span>🌱</span>Vigiar e Cultivar</Link>
          <Link href="/livros#motor" className={s.faixaItem}><span>⚙️</span>Motor de livros</Link>
        </div>
      </nav>
    </>
  );
}
