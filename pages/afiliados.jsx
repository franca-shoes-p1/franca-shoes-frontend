import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/afiliados.module.css';

const WHATS = `https://wa.me/5516991543663?text=${encodeURIComponent('Olá! Quero saber mais sobre o Programa de Afiliados.')}`;

const PASSOS = [
  { n: '1', t: 'Cadastre-se', p: 'Preencha o formulário abaixo. A coordenação chama você no WhatsApp.' },
  { n: '2', t: 'Receba o seu código', p: 'Você recebe um código de acesso e entra em www.igreja.eco.br/operador. Lá estão o seu link e o seu painel.' },
  { n: '3', t: 'Divulgue', p: 'Use o assistente de divulgação: escolha o negócio e o canal e receba o texto pronto, com o seu link.' },
  { n: '4', t: 'Ganhe pontos', p: 'Quando a pessoa que você indicou paga o pedido completo, os pontos entram no seu extrato.' },
];

const FAQ = [
  ['Preciso ter experiência?', 'Não. O assistente monta o texto, a ideia de arte e até um calendário de 7 dias de posts.'],
  ['Preciso pagar para participar?', 'Não. O cadastro é gratuito.'],
  ['Os pontos viram dinheiro?', 'Não. Pontos Oficina são benefícios, como o calçado ou o acessório da Campanha de Inauguração. Valem 12 meses e não são dinheiro nem participação em empresa.'],
  ['Quando os pontos entram?', 'Só depois que o pagamento completo do pedido da pessoa indicada é confirmado pela coordenação.'],
  ['Posso indicar a mim mesmo?', 'Não. Indicações da própria pessoa ou do mesmo WhatsApp não contam.'],
  ['Ganho alguma coisa por trazer outros afiliados?', 'Não. Os pontos vêm somente de vendas confirmadas, nunca de cadastros.'],
  ['Isso é emprego?', 'Não. É uma parceria de divulgação, sem vínculo de emprego e sem promessa de renda.'],
];

export default function Afiliados() {
  const [f, setF] = useState({ nome: '', whatsapp: '', cidade: '', interesse: '', aceito: false, site: '' });
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setOcupado(true); setMsg(null);
    try {
      const r = await fetch('/api/oficina/candidatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, origem: 'afiliados' }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || 'Não foi possível enviar.');
      setMsg({ tipo: 'ok', texto: 'Cadastro recebido! A coordenação chama você no WhatsApp.' });
      setF({ nome: '', whatsapp: '', cidade: '', interesse: '', aceito: false, site: '' });
    } catch (err) { setMsg({ tipo: 'er', texto: err.message }); }
    setOcupado(false);
  }

  return (
    <div className={s.pagina}>
      <Head>
        <title>Programa de Afiliados | Igreja Eco</title>
        <meta name="description" content="Divulgue o site e os negócios da Igreja Eco e ganhe Pontos Oficina por cada pedido pago de quem você indicar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={s.topo}>
        <div className={s.topoDentro}>
          <Link href="/">← Igreja Eco</Link>
          <div className={s.topoLinks}>
            <Link href="/afiliados/motor">Assistente de divulgação</Link>
            <a href="/manual-afiliado">Manual do afiliado</a>
            <Link href="/campanha">Campanha</Link>
          </div>
        </div>
      </div>
      <main className={s.miolo}>
        <h1 className={s.h1}>Programa de Afiliados</h1>
        <p className={s.lead}>
          Divulgue o Ateliê, a Oficina Digital e a Loja de Calçados Pronta para quem você conhece. Cada pessoa que você indicar e que pagar
          o pedido completo rende <b>Pontos Oficina</b>, que você troca por benefícios, como o calçado ou o acessório da Campanha de Inauguração.
        </p>

        <h2 className={s.h2}>Como funciona</h2>
        <div className={s.grade}>
          {PASSOS.map((p) => (
            <div key={p.n} className={s.cartao}>
              <div className={s.bola}>{p.n}</div>
              <h3>{p.t}</h3>
              <p>{p.p}</p>
            </div>
          ))}
        </div>

        <h2 className={s.h2}>Quanto vale</h2>
        <table className={s.tabela}>
          <thead><tr><th>Quando</th><th>Você ganha</th></tr></thead>
          <tbody>
            <tr><td>O cliente que você indicou <b>paga o pedido completo</b></td><td><b>1 Ponto Oficina para cada R$ 1,00</b> do pedido</td></tr>
          </tbody>
        </table>
        <div className={`${s.cx} ${s.am}`}>
          <b className={s.t}>Exemplo</b>
          Um pedido de R$ 50,00 pago por alguém que você indicou rende 50 pontos. Na Campanha de Inauguração, o acessório custa 1.000 pontos e o calçado 2.500 pontos.
          Pontos de tarefas feitas na Oficina somam com os da divulgação.
        </div>

        <h2 className={s.h2}>Regras de ouro</h2>
        <div className={s.cx}>
          <b className={s.t}>Pode</b>
          <ul className={s.lista}>
            <li>Divulgar com o seu link, nas suas redes e conversas, dizendo que é uma divulgação de parceiro(a).</li>
            <li>Usar os textos do assistente de divulgação.</li>
            <li>Responder dúvidas com sinceridade e chamar a coordenação quando não souber.</li>
          </ul>
        </div>
        <div className={`${s.cx} ${s.er}`}>
          <b className={s.t}>Não pode</b>
          <ul className={s.lista}>
            <li>Prometer renda, lucro, emprego, sociedade ou “dinheiro fácil”.</li>
            <li>Mandar mensagem em massa para quem não conhece (spam) ou criar perfis falsos.</li>
            <li>Dizer que o brinde é garantido sem ter os pontos, ou inventar depoimentos.</li>
            <li>Indicar a si mesmo ou combinar indicações falsas. Isso cancela os pontos.</li>
          </ul>
        </div>

        <h2 className={s.h2}>Quero participar</h2>
        <form className={s.form} onSubmit={enviar}>
          <label>Seu nome<input value={f.nome} onChange={set('nome')} required maxLength={120} autoComplete="name" /></label>
          <label>Seu WhatsApp com DDD<input value={f.whatsapp} onChange={set('whatsapp')} required inputMode="tel" maxLength={30} autoComplete="tel" /></label>
          <label>Sua cidade<input value={f.cidade} onChange={set('cidade')} maxLength={80} /></label>
          <label>Onde você pretende divulgar?<textarea value={f.interesse} onChange={set('interesse')} maxLength={300} placeholder="Instagram, WhatsApp, Telegram, grupos…" /></label>
          <div className={s.isca} aria-hidden="true"><input tabIndex={-1} autoComplete="off" value={f.site} onChange={set('site')} /></div>
          <label className={s.linha}><input type="checkbox" checked={f.aceito} onChange={set('aceito')} />Aceito receber contato da coordenação por WhatsApp e li as regras de ouro.</label>
          {msg && <div className={`${s.msg} ${s[msg.tipo]}`}>{msg.texto}</div>}
          <button className={s.btn} disabled={ocupado || !f.aceito}>{ocupado ? 'Enviando…' : 'Enviar cadastro'}</button>
        </form>

        <h2 className={s.h2}>Dúvidas</h2>
        <div className={s.faq}>
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>

        <div className={`${s.cx} ${s.am}`} style={{ marginTop: 28 }}>
          <b className={s.t}>Transparência</b>
          Parceria de divulgação, sem vínculo de emprego e sem promessa de renda. Pontos Oficina não são dinheiro nem participação em empresa e valem por 12 meses.
          Dúvidas? <a href={WHATS} target="_blank" rel="noopener noreferrer"><b>Chame no WhatsApp</b></a>.
        </div>
      </main>
    </div>
  );
}
