import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/entrar.module.css';
import { REDES } from '../lib/redes';

// Página única de links da Igreja Eco: é o endereço que vai no YouTube, no Instagram, no WhatsApp Business e nos cartazes.
// Para incluir um canal ou uma área do site, acrescente um item em CANAIS ou em AREAS.
// O canal de ofertas é o mesmo onde o Motor de Divulgação publica sozinho todos os dias.
const CANAL_OFERTAS = 'https://t.me/vitrine_igrejaeco';

const AREAS = [
  ['👟', 'Loja de Calçados Pronta', 'Calçados e acessórios de fábrica de Franca', '/calcados'],
  ['🎁', 'Clube de pontos', 'Junte pontos e troque por brindes e descontos', '/fidelidade'],
  ['🛠️', 'Oficina Digital', 'Tarefas curtas pelo celular, com passo a passo', '/oficina'],
  ['🧩', 'Ateliê Sob Medida', 'Sites, agentes de WhatsApp e automações', '/atelie'],
  ['🌐', 'Fábrica de Sites', 'Veja os sites que montamos', '/sites'],
  ['🏖️', 'Parceiros da Praia', 'Quem vende na praia na temporada', '/praia'],
  ['🗂️', 'Catálogo completo', 'Tudo o que o site oferece', '/catalogo'],
];

function registrar(canal, ref) {
  try {
    const dados = JSON.stringify({ campanha: 'entrar', canal, ref });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/divulgacao/clique', new Blob([dados], { type: 'application/json' }));
    } else {
      fetch('/api/divulgacao/clique', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: dados, keepalive: true }).catch(() => {});
    }
  } catch (e) { /* contar clique nunca atrapalha */ }
}

export default function Entrar() {
  const [ref, setRef] = useState('direto');
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      setRef((q.get('utm_source') || q.get('origem') || 'direto').toLowerCase().slice(0, 30));
    } catch (e) { /* fica "direto" */ }
  }, []);

  return (
    <div className={s.pagina}>
      <Head>
        <title>Entrar | Igreja Eco</title>
        <meta name="description" content="Todos os canais da Igreja Eco num lugar só: canal de ofertas no Telegram, WhatsApp, YouTube, Instagram e as áreas do site." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={s.miolo}>
        <div className={s.marca}>IE</div>
        <h1 className={s.h1}>Igreja Eco</h1>
        <p className={s.lead}>Escolha por onde você quer acompanhar as novidades.</p>

        <a
          className={s.destaque}
          href={CANAL_OFERTAS}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrar('telegram-ofertas', ref)}
        >
          <span className={s.destaqueIc}>📢</span>
          <span>
            <b>Canal de ofertas no Telegram</b>
            <small>Receba as novidades e promoções. Toque em “Entrar” e pronto.</small>
          </span>
        </a>

        <h2 className={s.h2}>Fale e acompanhe</h2>
        <ul className={s.lista}>
          {REDES.map((r) => (
            <li key={r.id}>
              {r.url ? (
                <a
                  className={s.canal}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ '--c': r.cor }}
                  onClick={() => registrar(r.id, ref)}
                >
                  <i className={s.ponto} />{r.nome}
                </a>
              ) : (
                <span className={`${s.canal} ${s.breve}`} style={{ '--c': r.cor }}>
                  <i className={s.ponto} />{r.nome} <small>em breve</small>
                </span>
              )}
            </li>
          ))}
        </ul>

        <h2 className={s.h2}>Conheça o site</h2>
        <ul className={s.areas}>
          {AREAS.map(([emoji, nome, desc, href]) => (
            <li key={href}>
              <Link href={href} className={s.area} onClick={() => registrar('site-' + href.replace('/', ''), ref)}>
                <span className={s.areaIc}>{emoji}</span>
                <span><b>{nome}</b><small>{desc}</small></span>
              </Link>
            </li>
          ))}
        </ul>

        <p className={s.nota}>
          Você só recebe mensagens se entrar no canal por vontade própria, e pode sair quando quiser.
          Pontos e créditos do site não são dinheiro nem participação. Não prometemos ganhos.
        </p>
        <Link href="/" className={s.voltar}>← Ir para o início do site</Link>
      </main>
    </div>
  );
}
