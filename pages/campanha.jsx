import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/campanha.module.css';
import { CAMPANHA as C, fmt } from '../lib/campanha';

const LINK_WHATS = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent('Olá! Quero saber mais sobre a Campanha de Inauguração.')}`;

export default function Campanha() {
  return (
    <div className={s.pagina}>
      <Head>
        <title>Campanha de Inauguração | Igreja Eco</title>
        <meta name="description" content="Ganhe um calçado ou acessório da nossa loja juntando Pontos Oficina ou Créditos de compra. Veja as regras." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={s.miolo}>
        <Link href="/" className={s.voltar}>← Voltar ao início</Link>
        <h1 className={s.h1}>{C.nome}</h1>
        <p className={s.lead}>
          Para comemorar a abertura da Oficina Digital, quem trabalha conosco e quem compra conosco pode trocar Pontos ou Créditos
          por um calçado ou acessório de fábrica de Franca. Vale até {C.validade}.
        </p>

        <h2 className={s.h2}>Quanto vale</h2>
        <table className={s.tabela}>
          <thead><tr><th>Quem</th><th>Como junta</th><th>Acessório</th><th>Calçado</th></tr></thead>
          <tbody>
            <tr><td><b>Operadores</b></td><td>{C.operador.regra}</td><td>{fmt(C.operador.acessorio)} pontos</td><td>{fmt(C.operador.calcado)} pontos</td></tr>
            <tr><td><b>Clientes</b></td><td>{C.cliente.regra}</td><td>{fmt(C.cliente.acessorio)} créditos</td><td>{fmt(C.cliente.calcado)} créditos</td></tr>
          </tbody>
        </table>

        <h2 className={s.h2}>Regras claras</h2>
        <div className={s.cx}>
          <ul className={s.lista}>
            <li><b>Sem sorteio e sem “primeiros colocados”:</b> todo mundo que chegar à pontuação pode resgatar.</li>
            <li><b>Não é preciso curtir nem compartilhar nada</b> para participar.</li>
            <li>Pontos e Créditos <b>não são dinheiro</b>, não dão sociedade nem participação, e <b>valem por 12 meses</b> a partir de quando foram ganhos.</li>
            <li>Os Pontos dos operadores vêm só de tarefas <b>aprovadas e conferidas</b>. Os Créditos dos clientes vêm só de serviços <b>pagos e confirmados</b>.</li>
            <li>Os modelos e tamanhos dos calçados e acessórios dependem do que a loja tem na época. Você escolhe entre as opções disponíveis.</li>
            <li>A conferência dos pontos e dos créditos é feita pela coordenação, que confirma antes de entregar.</li>
          </ul>
        </div>
        <div className={`${s.cx} ${s.am}`}>
          <b className={s.t}>Entrega</b>
          A entrega pessoal é <b>gratuita em Franca e região</b>. Para outras cidades, combinamos conforme a rota de viagem. Se não houver como
          levar pessoalmente, combinamos antes o melhor jeito de enviar. Nada é cobrado sem você concordar.
        </div>
        <div className={s.cx}>
          <b className={s.t}>Transparência</b>
          Não prometemos ganhos nem renda. O trabalho na Oficina é autônomo, e o valor de cada tarefa aparece antes de você começar.
        </div>

        <div className={s.cta}>
          <Link href="/oficina#cadastro">Quero ser operador</Link>
          <Link href="/monte-sua-oficina">Quero ser cliente</Link>
          <a className={s.sec} href={LINK_WHATS} target="_blank" rel="noopener noreferrer">Tirar dúvida no WhatsApp</a>
        </div>
      </main>
    </div>
  );
}
