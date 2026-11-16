import React from 'react';
import Link from 'next/link';
import s from '../styles/construcao.module.css';
import ConstrucaoPlanta from './ConstrucaoPlanta';
import { PalavraDigitada, Holofote, Magnetico } from './construcaoFx';

/* Vitrine do Pedido de Construção na home. */
export default function ConstrucaoBanner() {
  return (
    <section id="construcao" className={s.banner} aria-label="Monte o seu negócio">
      <div className={s.grade} />
      <div className={`${s.aura} ${s.aura1}`} />
      <Holofote>
        <div className={s.wrap}>
          <div className={s.bannerDentro}>
            <div>
              <span className={s.pilula}><b />Novo · Pedido de Construção</span>
              <h2 className={s.bannerTitulo}>Monte o seu negócio na internet: <PalavraDigitada palavras={['loja', 'agenda', 'curso', 'serviço', 'ideia']} /></h2>
              <p className={s.bannerTexto}>Responda perguntas simples, veja o site se desenhando e envie o pedido pronto. Se quiser, o Atendente WhatsApp entra no pacote.</p>
              <div className={s.bannerLista}><span>🧱 Projeto sob medida</span><span>📋 Script pronto</span><span>💬 Atendente opcional</span></div>
              <div className={s.acoes}>
                <Magnetico href="/monte-seu-negocio" className={`${s.botao} ${s.principal}`}>Montar o meu negócio</Magnetico>
                <Link href="/construcao" className={`${s.botao} ${s.contorno}`}>Ver como funciona</Link>
              </div>
            </div>
            <div className={s.bannerPalco}><ConstrucaoPlanta compacta /></div>
          </div>
        </div>
      </Holofote>
    </section>
  );
}
