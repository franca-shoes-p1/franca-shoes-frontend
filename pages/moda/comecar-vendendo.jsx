import React from 'react';
import Link from 'next/link';
import ModaLayout from '../../lib/ModaLayout';
import s from '../../styles/moda.module.css';
import { TITULO, LUCRO, CONDICOES, WHATS } from '../../lib/plano4';

const PASSOS = [
  ['Cadastro', 'Você chama no WhatsApp e conhece as regras.'],
  ['Aprovação', 'Se aprovado, assina o contrato antes de qualquer compra.'],
  ['Live', 'Escolhe os produtos até o seu limite.'],
  ['Compra', 'Eu adianto o valor e compro.'],
  ['Venda', 'Você oferece aos seus compradores dentro do prazo.'],
  ['Acerto', 'O valor adiantado volta para mim e o lucro é seu.'],
];

export default function ComecarVendendo() {
  return (
    <ModaLayout titulo="Começar Vendendo" descricao={`${TITULO}. Conheça o plano, as etapas e as condições.`}>
      <section className={s.hero}>
        <div className={s.contido}>
          <span className={s.selinho}>Plano Começar Vendendo · em preparação</span>
          <h1>{TITULO}</h1>
          <p>{LUCRO}. Há mensalidade, limite, prazo e contrato.</p>
          <div className={s.acoes}>
            <a className={s.botao} href={WHATS} target="_blank" rel="noopener noreferrer">Quero saber as regras</a>
          </div>
        </div>
      </section>

      <section className={s.secao}>
        <div className={s.contido}>
          <h2>Como vai funcionar</h2>
          <ol className={s.passos}>
            {PASSOS.map(([t, d]) => (<li key={t}><b>{t}</b><span>{d}</span></li>))}
          </ol>
        </div>
      </section>

      <section className={`${s.secao} ${s.clara}`}>
        <div className={s.contido}>
          <h2>Exemplo para entender a conta</h2>
          <div className={s.grade}>
            <article className={s.cartao}><h2>R$ 40</h2><p>Eu adianto para comprar o produto.</p></article>
            <article className={s.cartao}><h2>R$ 60</h2><p>Você vende para o seu comprador.</p></article>
            <article className={s.cartao}><h2>R$ 20</h2><p>É o lucro da venda, que fica com você. Os R$ 40 voltam para mim.</p></article>
          </div>
          <p>Valores inventados só para o exemplo. A mensalidade e as suas despesas não estão nessa conta.</p>
        </div>
      </section>

      <section className={s.secao}>
        <div className={s.contido}>
          <h2>Regras que você recebe antes de entrar</h2>
          <ul style={{ paddingLeft: 22 }}>
            <li>Valor da mensalidade e o que ela inclui, e como cancelar.</li>
            <li>Limite de compra adiantada.</li>
            <li>Prazo para vender e quanto tempo dura o plano.</li>
            <li>Onde fica a mercadoria e como o comprador paga.</li>
            <li>O que acontece se o produto não for vendido, for perdido ou voltar com defeito.</li>
          </ul>
          <p>Depois do período do plano, você passa a pagar na hora da compra.</p>
          <p><small>{CONDICOES}</small></p>
          <div className={s.acoes}>
            <a className={s.botao} href={WHATS} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            <Link href="/moda/planos" style={{ alignSelf: 'center' }}>Ver os outros planos</Link>
          </div>
        </div>
      </section>
    </ModaLayout>
  );
}
