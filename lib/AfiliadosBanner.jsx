import React from 'react';
import Link from 'next/link';
import s from '../styles/afiliados.module.css';

/* Vitrine do Programa de Afiliados na home: mesmo layout das outras vitrines, em roxo e laranja, com formas redondas. */
export default function AfiliadosBanner() {
  return (
    <section id="afiliados" className={s.banner} aria-label="Programa de Afiliados">
      <span className={`${s.bolha} ${s.b1}`} aria-hidden="true" />
      <span className={`${s.bolha} ${s.b2}`} aria-hidden="true" />
      <div className={s.dentro}>
        <div className={s.esq}>
          <span className={s.pilula}><i />Novo · Programa de Afiliados</span>
          <h2 className={s.titulo}>Divulgue, indique e <em>ganhe Pontos</em></h2>
          <p className={s.texto}>
            Mostre o site e os negócios para quem você conhece. Cada pessoa que você indicar e que fechar e pagar um pedido
            rende Pontos Oficina, que viram benefícios, como o calçado ou o acessório da Campanha de Inauguração.
          </p>
          <ul className={s.passos}>
            <li><b>1</b>Cadastre-se</li>
            <li><b>2</b>Divulgue com o seu link</li>
            <li><b>3</b>Ganhe pontos</li>
          </ul>
          <div className={s.acoes}>
            <Link href="/afiliados" className={`${s.botao} ${s.principal}`}>Quero ser afiliado</Link>
            <Link href="/afiliados/motor" className={`${s.botao} ${s.contorno}`}>Montar a minha divulgação</Link>
          </div>
          <p className={s.nota}>Sem promessa de renda. Pontos não são dinheiro, valem 12 meses e só contam depois que o pagamento do indicado é confirmado.</p>
        </div>

        <div className={s.palco} aria-hidden="true">
          <div className={s.grande}>
            <span className={s.megafone}>📣</span>
            <span className={s.selo}>1 ponto<br />por R$ 1</span>
          </div>
          <div className={`${s.orbita} ${s.o1}`}><span>🔗</span>Seu link</div>
          <div className={`${s.orbita} ${s.o2}`}><span>🎬</span>Posts prontos</div>
          <div className={`${s.orbita} ${s.o3}`}><span>🏅</span>Pontos Oficina</div>
        </div>
      </div>
    </section>
  );
}
