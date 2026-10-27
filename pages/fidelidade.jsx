import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/fidelidade.module.css';
import { NIVEIS, COMO_JUNTAR, RECOMPENSAS, AVISO_MUDANCA, fmt } from '../lib/fidelidade';

const WHATS = `https://wa.me/5516991543663?text=${encodeURIComponent('Olá! Quero saber mais sobre o Clube de Fidelidade.')}`;

const FAQ = [
  ['Como vejo meus pontos e meu nível?', 'Entre em www.igreja.eco.br/operador e abra a Oficina. Lá aparecem seus pontos, seu nível e o que falta para o próximo.'],
  ['Os pontos viram dinheiro?', 'Não. Pontos são benefícios (brindes, descontos, serviços). Não são dinheiro, não se compram e não dão sociedade nem participação em empresa.'],
  ['Os pontos vencem?', 'Cada ponto vale por 12 meses a partir de quando foi ganho. O nível, porém, é calculado pelo total de pontos que você já ganhou, então gastar pontos em recompensas não faz você descer de nível.'],
  ['Sou cliente e não sou operador. Posso participar?', 'Pode. Cada R$ 1,00 pago e confirmado em serviços vira 1 Crédito, que vale o mesmo que um ponto. Clientes resgatam com a metade da pontuação das tabelas abaixo, em Créditos. A coordenação confere e entrega.'],
  ['O Clube é para sempre?', `O Clube vale enquanto o programa existir. Se alguma regra mudar, avisamos com ${AVISO_MUDANCA} de antecedência e os pontos que você já tem continuam valendo até a data de validade deles.`],
  ['Quando as recompensas "em breve" ficam disponíveis?', 'Quando cada projeto estiver pronto. Não prometemos data: quando um projeto novo for lançado, a recompensa dele entra aqui e no painel.'],
];

export default function Fidelidade() {
  return (
    <div className={s.pagina}>
      <Head>
        <title>Clube de Fidelidade | Igreja Eco</title>
        <meta name="description" content="Junte pontos fazendo tarefas, contratando ou indicando e troque por brindes, descontos e uma página de vendas grátis." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={s.topo}>
        <div className={s.topoDentro}>
          <Link href="/">← Igreja Eco</Link>
          <div className={s.topoLinks}>
            <Link href="/campanha">Campanha de Inauguração</Link>
            <Link href="/afiliados">Afiliados</Link>
            <Link href="/oficina">Oficina</Link>
          </div>
        </div>
      </div>
      <main className={s.miolo}>
        <h1 className={s.h1}>Clube de Fidelidade</h1>
        <p className={s.lead}>
          Quanto mais você participa, mais você ganha. Junte pontos fazendo tarefas, contratando ou indicando clientes e troque por brindes,
          descontos e até uma página de vendas grátis. Todo produto ou projeto novo que entrar no site ganha recompensas aqui.
        </p>

        <h2 className={s.h2}>Como juntar pontos</h2>
        <div className={s.grade}>
          {COMO_JUNTAR.map((c) => (
            <div key={c.t} className={s.cartao}><div className={s.bola}>{c.e}</div><h3>{c.t}</h3><p>{c.d}</p></div>
          ))}
        </div>

        <h2 className={s.h2}>Níveis</h2>
        <p className={s.lead} style={{ fontSize: 16 }}>O nível é pelo total de pontos que você já ganhou e não cai quando você usa os pontos.</p>
        <div className={s.grade}>
          {NIVEIS.map((n) => (
            <div key={n.id} className={`${s.cartao} ${s.nivel}`}>
              <div className={s.bola}>{n.emoji}</div>
              <h3>{n.nome}</h3>
              <div className={s.de}>{n.de === 0 ? 'Ao entrar' : `a partir de ${fmt(n.de)} pontos`}</div>
              <ul>{n.perks.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>

        <h2 className={s.h2}>Recompensas</h2>
        {RECOMPENSAS.map((f) => (
          <div key={f.fase} className={s.fase}>
            <h3>{f.fase}</h3>
            <table className={s.tabela}>
              <thead><tr><th>Recompensa</th><th>Pontos</th><th>Clientes (Créditos)</th></tr></thead>
              <tbody>
                {f.itens.map((i) => (
                  <tr key={i.t}>
                    <td><b>{i.e} {i.t}</b><small>{i.d}</small></td>
                    <td className={s.num}>{i.breve ? <span className={s.tag}>Em breve</span> : fmt(i.pontos)}</td>
                    <td className={s.num}>{i.breve ? <span className={s.tag}>Em breve</span> : fmt(Math.round(i.pontos / 2))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <h2 className={s.h2}>Regras claras</h2>
        <div className={s.cx}>
          <ul className={s.lista}>
            <li>Pontos <b>não são dinheiro</b>, não se compram e não dão sociedade nem participação. Cada ponto vale <b>12 meses</b>.</li>
            <li>Pontos de tarefas só vêm de entregas <b>aprovadas</b>. Pontos de vendas só entram com o <b>pagamento confirmado</b>.</li>
            <li>Sem sorteio, sem “primeiros colocados” e sem número limitado de vagas: quem chega à pontuação, resgata.</li>
            <li>Os modelos e a disponibilidade dependem de cada projeto. Combinamos os detalhes pelo WhatsApp.</li>
            <li>Mudanças nas regras são avisadas com <b>{AVISO_MUDANCA}</b> de antecedência.</li>
          </ul>
        </div>
        <div className={`${s.cx} ${s.am}`}>
          <b className={s.t}>Transparência</b>
          Não prometemos ganhos nem renda. O trabalho na Oficina é autônomo, e o valor de cada tarefa aparece antes de você começar.
          As pontuações desta página podem ser ajustadas com aviso prévio.
        </div>

        <h2 className={s.h2}>Dúvidas</h2>
        <div className={s.faq}>{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>

        <div className={s.cta}>
          <Link href="/oficina#cadastro">Começar a juntar pontos</Link>
          <Link className={s.sec} href="/afiliados">Ser afiliado</Link>
          <a className={s.sec} href={WHATS} target="_blank" rel="noopener noreferrer">Tirar dúvida no WhatsApp</a>
        </div>
      </main>
    </div>
  );
}
