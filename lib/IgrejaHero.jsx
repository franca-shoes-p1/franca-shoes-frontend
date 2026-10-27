import React from 'react';
import Link from 'next/link';
import s from '../styles/igrejahero.module.css';
import Redes from './Redes';

const NEGOCIOS = [
  { e: '🧩', t: 'Ateliê Sob Medida', d: 'Sites e agentes de WhatsApp sob medida', href: '/atelie' },
  { e: '🛠️', t: 'Oficina Digital', d: 'Tarefas pelo celular, com Pontos', href: '/oficina' },
  { e: '👟', t: 'Loja de Calçados Pronta', d: 'Sua loja online de calçados', href: '#calcados' },
  { e: '🏆', t: 'Clube de Fidelidade', d: 'Pontos que viram recompensas', href: '/fidelidade' },
  { e: '📚', t: 'Catálogo completo', d: '65 produtos e serviços', href: '/catalogo' },
];

const ESTRELAS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37 + 11) % 100, y: (i * 23 + 7) % 46, d: (i % 6) * 0.7, z: 1 + (i % 3) }));

export default function IgrejaHero() {
  return (
    <section className={s.banner} aria-label="Igreja Eco">
      <div className={s.dentro}>
        <header className={s.cabeca}>
          <span className={s.pilula}><i />Igreja Evangelho dos Pobres dos Alimentos Sagrados</span>
          <h2 className={s.titulo}>Canal YouTube <em>Portal da Comunidade Cristã da Bíblia Sagrada</em></h2>
          <p className={s.texto}>para Congregação da Palavra de Deus e Salvação de Jesus Cristo pela Fé no Espírito Santo</p>
        </header>

        <div className={s.grade}>
          <div className={s.cena} aria-hidden="true">
            <div className={s.ceu}>
              {ESTRELAS.map((e, i) => (<i key={i} className={s.estrela} style={{ left: e.x + '%', top: e.y + '%', animationDelay: e.d + 's', width: e.z + 1, height: e.z + 1 }} />))}
              <div className={s.lua}><b className={s.halo} /></div>
              <svg className={`${s.nuvem} ${s.n1}`} viewBox="0 0 120 50"><path d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-3 16 16 0 0 1 30 9 12 12 0 0 1 4 21z" fill="#cfe6ff" /></svg>
              <svg className={`${s.nuvem} ${s.n2}`} viewBox="0 0 120 50"><path d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-3 16 16 0 0 1 30 9 12 12 0 0 1 4 21z" fill="#9fc8ff" /></svg>
              {[0, 1].map((i) => (
                <svg key={i} className={`${s.passaro} ${s['p' + i]}`} viewBox="0 0 30 14"><path className={s.asa} d="M1 10C6 2 12 2 15 8 18 2 24 2 29 10" fill="none" stroke="#dff0ff" strokeWidth="2" strokeLinecap="round" /></svg>
              ))}
            </div>
            <svg className={s.terra} viewBox="0 0 600 480" preserveAspectRatio="xMidYMax slice">
              <defs>
                <linearGradient id="ih-m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d63b8" /><stop offset="1" stopColor="#0f3f86" /></linearGradient>
                <linearGradient id="ih-m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f4fb8" /><stop offset="1" stopColor="#072a5c" /></linearGradient>
                <radialGradient id="ih-luz" cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#fff6c9" /><stop offset="1" stopColor="#ffd86b" /></radialGradient>
              </defs>
              <path d="M0 330 C120 292 230 322 330 306 S520 284 600 318 V480 H0z" fill="url(#ih-m1)" />
              <g transform="translate(170 128) scale(1)">
                <rect x="20" y="120" width="220" height="116" fill="#eaf3ff" stroke="#b9d3f5" strokeWidth="2" />
                <path d="M5 124 L130 58 L255 124z" fill="#163f8f" />
                <path d="M5 124 L130 58 L255 124" fill="none" stroke="#0d2a66" strokeWidth="3" />
                <rect x="98" y="-6" width="64" height="136" fill="#eaf3ff" stroke="#b9d3f5" strokeWidth="2" />
                <path d="M88 -4 L130 -62 L172 -4z" fill="#163f8f" stroke="#0d2a66" strokeWidth="2" />
                <g className={s.cruz}><rect x="127" y="-100" width="6" height="40" rx="2" fill="#7ff0ff" /><rect x="114" y="-90" width="32" height="6" rx="2" fill="#7ff0ff" /></g>
                <rect x="112" y="12" width="36" height="46" rx="18" fill="#0d2a66" />
                <g className={s.sino} style={{ transformOrigin: '130px 18px' }}><path d="M118 52 q0-24 12-26 q12 2 12 26z" fill="#ffd86b" stroke="#c99a10" strokeWidth="2" /><circle cx="130" cy="55" r="4" fill="#c99a10" /></g>
                {[48, 178].map((x) => (<g key={x}><rect x={x} y="150" width="30" height="48" rx="15" fill="url(#ih-luz)" stroke="#b9d3f5" strokeWidth="2" className={s.janela} /><path d={`M${x + 15} 150v48M${x} 176h30`} stroke="#b9d3f5" strokeWidth="2" /></g>))}
                <path d="M104 236 V190 a26 26 0 0 1 52 0 V236z" fill="#1c4fa3" stroke="#0d2a66" strokeWidth="2" />
                <circle cx="147" cy="214" r="2.5" fill="#7ff0ff" />
              </g>
              <path d="M0 384 C140 350 250 384 360 370 S530 346 600 378 V480 H0z" fill="url(#ih-m2)" />
              <path d="M262 480 C274 432 292 404 320 392 C340 408 366 432 408 480z" fill="#8fb8ec" opacity=".75" />
              {[[70, 352, 1], [520, 346, .9], [120, 398, .65]].map(([x, y, e], i) => (
                <g key={i} className={s.arvore} style={{ transformOrigin: `${x}px ${y + 40}px`, animationDelay: `${i * .8}s` }} transform={`translate(${x} ${y}) scale(${e})`}>
                  <rect x="-5" y="-4" width="10" height="46" rx="3" fill="#0a2a5c" />
                  <circle cx="0" cy="-24" r="32" fill="#1a6aa8" /><circle cx="-22" cy="-6" r="22" fill="#2280b8" /><circle cx="22" cy="-8" r="24" fill="#1d73ad" />
                </g>
              ))}
              {[[40, 430], [180, 440], [450, 436], [560, 426]].map(([x, y], i) => (
                <g key={i} className={s.flor} style={{ animationDelay: `${i * .5}s`, transformOrigin: `${x}px ${y + 12}px` }}>
                  <path d={`M${x} ${y + 12}V${y}`} stroke="#7ff0ff" strokeWidth="2" /><circle cx={x} cy={y - 2} r="5" fill={i % 2 ? '#fff' : '#7ff0ff'} /><circle cx={x} cy={y - 2} r="2" fill="#163f8f" />
                </g>
              ))}
            </svg>
            <div className={s.pontos}>{Array.from({ length: 10 }, (_, i) => (<i key={i} style={{ left: (i * 10 + 5) + '%', animationDuration: (8 + (i % 4) * 2) + 's', animationDelay: '-' + (i * 1.3) + 's' }} />))}</div>
          </div>

          <div className={s.palco}>
            <div className={s.cartao}>
              <h4 className={s.cartaoTopo}><span>Nossos negócios</span><span>Igreja Eco</span></h4>
              <ul className={s.lista}>
                {NEGOCIOS.map((n) => (
                  <li key={n.t}>
                    <Link href={n.href} className={s.item}>
                      <span className={s.ic} aria-hidden="true">{n.e}</span>
                      <span className={s.it}><b>{n.t}</b><small>{n.d}</small></span>
                      <span className={s.seta} aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className={s.rodape}><span>Cada projeto, uma porta de entrada</span></div>
            </div>
            <div className={`${s.chip} ${s.c1}`}>🌐 Sites</div>
            <div className={`${s.chip} ${s.c2}`}>🤖 Automação</div>
            <div className={`${s.chip} ${s.c3}`}>🎁 Brindes</div>
          </div>
        </div>

        <div className={s.rede}><Redes titulo="Siga e fale com a gente" /></div>
      </div>
    </section>
  );
}
