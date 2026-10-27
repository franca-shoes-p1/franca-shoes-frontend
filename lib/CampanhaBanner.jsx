import React from 'react';
import Link from 'next/link';
import s from '../styles/campanha.module.css';
import { CAMPANHA as C, fmt } from './campanha';

function Tenis() {
  return (
    <svg viewBox="0 0 120 80" role="img" aria-label="Tênis">
      <rect x="6" y="58" width="108" height="13" rx="6.5" fill="#fff" />
      <path d="M10 58C10 41 21 34 35 34l15-12c6-4.5 15-3 19 4l6 8c18 2 37 8 37 24z" fill="#ffd400" />
      <path d="M44 34l8 7M52 28l8 8M60 24l8 8" stroke="#0a5c2e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="48" r="4" fill="#0a5c2e" opacity=".25" />
    </svg>
  );
}

export default function CampanhaBanner() {
  return (
    <section id="campanha" className={s.banner} aria-label={C.nome}>
      <span className={`${s.bolha} ${s.b1}`} aria-hidden="true" />
      <span className={`${s.bolha} ${s.b2}`} aria-hidden="true" />
      <div className={s.dentro}>
        <div className={s.esq}>
          <span className={s.pilula}><i />{C.nome} · até {C.validade}</span>
          <h2 className={s.titulo}>Ganhe um <em>calçado ou acessório</em> da nossa loja</h2>
          <p className={s.texto}>
            Para quem trabalha na Oficina e para quem compra conosco: junte Pontos ou Créditos e troque por um calçado ou
            acessório de fábrica de Franca. Sem sorteio e sem número limitado de vagas: quem chegar lá, resgata.
          </p>
          <div className={s.dupla}>
            <div className={s.medalhao}>
              <span className={s.circulo}>🙋</span>
              <div>
                <b>Operadores</b>
                <small>{fmt(C.operador.acessorio)} pontos: acessório<br />{fmt(C.operador.calcado)} pontos: calçado</small>
              </div>
            </div>
            <div className={s.medalhao}>
              <span className={s.circulo}>🛍️</span>
              <div>
                <b>Clientes</b>
                <small>{fmt(C.cliente.acessorio)} créditos: acessório<br />{fmt(C.cliente.calcado)} créditos: calçado</small>
              </div>
            </div>
          </div>
          <div className={s.acoes}>
            <Link href="/campanha" className={`${s.botao} ${s.principal}`}>Ver as regras</Link>
            <Link href="/oficina#cadastro" className={`${s.botao} ${s.contorno}`}>Quero ser operador</Link>
            <Link href="/monte-sua-oficina" className={`${s.botao} ${s.contorno}`}>Quero ser cliente</Link>
          </div>
          <p className={s.nota}>
            Pontos e créditos não são dinheiro, sociedade nem participação, e valem por 12 meses. Não prometemos ganhos.
            Entrega pessoal gratuita em Franca e região; outras cidades, combinadas conforme a minha rota.
          </p>
        </div>

        <div className={s.palco} aria-hidden="true">
          <div className={s.grande}>
            <div className={s.tenis}><Tenis /></div>
            <span className={s.selo}>Frete<br />grátis*</span>
          </div>
          <div className={`${s.orbita} ${s.o1}`}><span>🎁</span>Brinde por pontos</div>
          <div className={`${s.orbita} ${s.o2}`}><span>🚚</span>Entrega pessoal</div>
          <div className={`${s.orbita} ${s.o3}`}><span>🏭</span>Fábrica de Franca</div>
        </div>
      </div>
    </section>
  );
}
