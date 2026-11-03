import React from 'react';
import Link from 'next/link';
import s from '../styles/entrega.module.css';

/* Vitrine da Entrega em Casa na home, no mesmo molde das outras (selo, título, 3 passos, botões, palco e letreiro).
   O cartão do pedido é um exemplo ilustrativo: não mostra números reais de ninguém. */
export default function EntregaBanner() {
  return (
    <section id="entrega-em-casa" className={s.banner} aria-label="Entrega em Casa">
      <div className={s.dentro}>
        <div className={s.esq}>
          <span className={s.pilula}><i />Novo · Entrega em Casa</span>
          <h2 className={s.titulo}>Peça o calçado que quiser e <em>prove em casa antes de pagar</em></h2>
          <p className={s.texto}>
            Você descreve o que procura, nós achamos a fábrica de Franca com o melhor preço e levamos até a sua porta, em viagem pelo Brasil.
            Gostou? Paga em dinheiro na hora. Não gostou? Não paga nada. E você pode sair da fila de espera quando quiser.
          </p>
          <ul className={s.passos}>
            <li><b>1</b>Faça o pedido</li>
            <li><b>2</b>Receba a cotação</li>
            <li><b>3</b>Prove em casa</li>
          </ul>
          <div className={s.acoes}>
            <Link href="/encomendar" className={`${s.botao} ${s.principal}`}>Fazer minha encomenda</Link>
            <Link href="/entrega-em-casa" className={`${s.botao} ${s.contorno}`}>Conhecer o projeto</Link>
          </div>
          <p className={s.nota}>A viagem sai quando o lote da fábrica fecha, então não prometemos data exata. Você acompanha pelo WhatsApp.</p>
        </div>

        <div className={s.palco}>
          <div className={s.rota} aria-hidden="true">
            <span className={s.linha}><span className={s.onibus}>🚌</span></span>
            <span className={`${s.parada} ${s.origem}`} style={{ left: '8%' }}><b /><em>Franca</em></span>
            <span className={s.parada} style={{ left: '38%' }}><b /><em>Belo Horizonte</em></span>
            <span className={s.parada} style={{ left: '66%' }}><b /><em>Goiânia</em></span>
            <span className={s.parada} style={{ left: '92%' }}><b /><em>Sua cidade</em></span>
          </div>
          <div className={s.cartao} aria-hidden="true">
            <small>Exemplo de pedido</small>
            <strong>Sapatênis marrom, nº 41</strong>
            <div className={s.barra}><i /></div>
            <p>Os pedidos do mesmo produto se somam até fechar o lote da fábrica.</p>
          </div>
          <div className={s.duas}>
            <div className={s.mini}><b>🏠 Prova em casa</b>Só paga se gostar.</div>
            <div className={s.mini}><b>💵 Em dinheiro</b>Na hora da visita.</div>
          </div>
        </div>
      </div>
      <div className={s.letreiro} aria-hidden="true">
        <div className={s.trilho}>
          {[0, 1].map((k) => (
            <span key={k}>👟 Peça o que quiser · 🏭 Preço de fábrica · 🚌 Rota pelo Brasil · 🏠 Prove em casa · 💵 Pague só se gostar · 🚪 Saia da fila quando quiser · </span>
          ))}
        </div>
      </div>
    </section>
  );
}
