import React from 'react';
import s from '../styles/ofiBanner.module.css';

const PASSOS = ['Ler o passo a passo', 'Fazer a tarefa', 'Conferir o checklist', 'Enviar a entrega', 'Tirar dúvida com a IA', 'Receber os pontos'];
const icone = { fill: 'none', stroke: '#7ff0ff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' };

export default function OficinaBanner() {
  return (
    <section className={s.banner} aria-label="Oficina Digital">
      <div className={s.dentro}>
        <div>
          <span className={s.pilula}><i />Novo · Oficina Digital</span>
          <h2 className={s.titulo}>Aprenda fazendo. Trabalhe <em>no seu horário</em>.</h2>
          <p className={s.texto}>
            Tarefas curtas feitas pelo celular, cada uma com passo a passo, checklist e uma IA para tirar dúvidas.
            Não precisa de experiência: você aprende na primeira tarefa e tudo é conferido antes de ser aprovado.
          </p>
          <ul className={s.passos}>
            <li><b>1</b>Escolha</li>
            <li><b>2</b>Faça</li>
            <li><b>3</b>Ganhe pontos</li>
          </ul>
          <div className={s.acoes}>
            <a href="#cadastro" className={`${s.botao} ${s.principal}`}>Quero participar</a>
            <a href="/operador" className={`${s.botao} ${s.contorno}`}>Já sou operador</a>
          </div>
          <p className={s.nota}>Trabalho como prestador autônomo. Sem promessa de renda: o valor de cada tarefa aparece antes de você começar.</p>
        </div>

        <div className={s.palco} aria-hidden="true">
          <div className={s.cartao}>
            <h4 className={s.cartaoTopo}><span>Cartão de tarefa</span><span>Exemplo</span></h4>
            {PASSOS.map((n) => (
              <div key={n} className={s.linha}>
                <span>{n}</span>
                <div className={s.barra}><span /></div>
                <div className={s.ok}>✓</div>
              </div>
            ))}
            <div className={s.rodape}><span>Conferido antes da aprovação</span><span>Pontos Oficina</span></div>
          </div>
          <div className={`${s.chip} ${s.c1}`}>
            <svg {...icone}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>Pelo celular
          </div>
          <div className={`${s.chip} ${s.c2}`}>
            <svg {...icone}><path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.1-4.7A8 8 0 1 1 21 12z" /></svg>IA tira dúvidas
          </div>
          <div className={`${s.chip} ${s.c3}`}>
            <svg {...icone}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" /></svg>Pontos Oficina
          </div>
        </div>
      </div>
    </section>
  );
}
