import React from 'react';
import Link from 'next/link';
import p4 from '../styles/plano4.module.css';
import { PAGINA, TITULO, LUCRO, CONDICOES, WHATS } from './plano4';

const ETAPAS = [
  ['1. Escolha na live', 'Você escolhe os produtos, até o limite do seu cadastro.'],
  ['2. Eu faço a compra', 'Adianto o valor e a mercadoria fica comigo.'],
  ['3. Você vende', 'Você divulga; o comprador paga na minha conta.'],
  ['4. Acerto', 'Envio ao comprador. O adiantado fica comigo e o lucro vai para você.'],
];

export default function OfertaPlano() {
  return (
    <section className={p4.oferta} aria-labelledby="oferta-titulo">
      <div className={p4.caixa}>
        <span className={p4.novo}>Novo plano · Começar Vendendo</span>
        <h2 id="oferta-titulo">{TITULO}</h2>
        <p className={p4.destaque}>{LUCRO}*</p>
        <ol className={p4.etapas}>
          {ETAPAS.map(([t, d]) => (<li key={t}><b>{t}</b>{d}</li>))}
        </ol>
        <div className={p4.botoes}>
          <a className={p4.cheio} href={WHATS} target="_blank" rel="noopener noreferrer">Quero uma vaga no WhatsApp</a>
          <Link className={p4.vazado} href={PAGINA}>Ver as regras</Link>
        </div>
        <p className={p4.letras}>* {CONDICOES}</p>
      </div>
    </section>
  );
}
