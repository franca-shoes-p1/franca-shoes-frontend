import React from 'react';
import Link from 'next/link';
import s from '../styles/igrejahero.module.css';
import Redes from './Redes';

const FOLHAS = Array.from({ length: 14 }, (_, i) => ({
  l: (i * 7.3 + 4) % 100, d: 9 + (i % 5) * 1.7, a: (i * 1.3) % 9, r: i % 2 ? 1 : -1, t: ['🍃', '🍂', '🌿'][i % 3],
}));

export default function IgrejaHero() {
  return (
    <section className={s.hero} aria-label="Igreja Eco">
      <div className={s.palco}>
      <div className={s.ceu} aria-hidden="true">
        <div className={s.sol}><i className={s.raios} /></div>
        <svg className={`${s.nuvem} ${s.n1}`} viewBox="0 0 120 50"><path d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-3 16 16 0 0 1 30 9 12 12 0 0 1 4 21z" fill="#fff" opacity=".9" /></svg>
        <svg className={`${s.nuvem} ${s.n2}`} viewBox="0 0 120 50"><path d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-3 16 16 0 0 1 30 9 12 12 0 0 1 4 21z" fill="#fff" opacity=".7" /></svg>
        <svg className={`${s.nuvem} ${s.n3}`} viewBox="0 0 120 50"><path d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-3 16 16 0 0 1 30 9 12 12 0 0 1 4 21z" fill="#fff" opacity=".8" /></svg>
        {[0, 1, 2].map((i) => (
          <svg key={i} className={`${s.passaro} ${s['p' + i]}`} viewBox="0 0 30 14"><path className={s.asa} d="M1 10C6 2 12 2 15 8 18 2 24 2 29 10" fill="none" stroke="#2b3d36" strokeWidth="2" strokeLinecap="round" /></svg>
        ))}
      </div>

      <svg className={s.cena} viewBox="0 -60 1200 480" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="ih-morro1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fbf73" /><stop offset="1" stopColor="#3f9a52" /></linearGradient>
          <linearGradient id="ih-morro2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4fa860" /><stop offset="1" stopColor="#1f7a42" /></linearGradient>
          <radialGradient id="ih-luz" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff3a6" /><stop offset="1" stopColor="#ffd34d" /></radialGradient>
        </defs>
        <path d="M0 250 C200 200 380 230 560 215 S900 190 1200 240 V420 H0z" fill="url(#ih-morro1)" />
        {/* igreja */}
        <g transform="translate(470 70)">
          <rect x="20" y="120" width="220" height="116" fill="#fff8ea" stroke="#d9c9a4" strokeWidth="2" />
          <path d="M5 124 L130 58 L255 124z" fill="#b8472f" />
          <path d="M5 124 L130 58 L255 124" fill="none" stroke="#8c2f1d" strokeWidth="3" />
          {/* torre */}
          <rect x="98" y="-6" width="64" height="136" fill="#fff8ea" stroke="#d9c9a4" strokeWidth="2" />
          <path d="M88 -4 L130 -62 L172 -4z" fill="#b8472f" stroke="#8c2f1d" strokeWidth="2" />
          <g className={s.cruz}><rect x="127" y="-100" width="6" height="40" rx="2" fill="#b8731a" /><rect x="114" y="-90" width="32" height="6" rx="2" fill="#b8731a" /></g>
          <rect x="112" y="12" width="36" height="46" rx="18" fill="#3b2a1f" />
          <g className={s.sino} style={{ transformOrigin: '130px 18px' }}><path d="M118 52 q0-24 12-26 q12 2 12 26z" fill="#ffd34d" stroke="#c99a10" strokeWidth="2" /><circle cx="130" cy="55" r="4" fill="#c99a10" /></g>
          {/* janelas com luz */}
          {[48, 178].map((x) => (<g key={x}><rect x={x} y="150" width="30" height="48" rx="15" fill="url(#ih-luz)" stroke="#d9c9a4" strokeWidth="2" className={s.janela} /><path d={`M${x + 15} 150v48M${x} 176h30`} stroke="#d9c9a4" strokeWidth="2" /></g>))}
          {/* porta */}
          <path d="M104 236 V190 a26 26 0 0 1 52 0 V236z" fill="#7a4a2b" stroke="#5a3519" strokeWidth="2" />
          <circle cx="147" cy="214" r="2.5" fill="#ffd34d" />
        </g>
        <path d="M0 300 C240 262 420 300 640 285 S1000 258 1200 296 V420 H0z" fill="url(#ih-morro2)" />
        <path d="M575 420 C590 370 610 335 640 322 C660 338 690 370 740 420z" fill="#efd9a8" opacity=".9" />
        {/* árvores */}
        {[[140, 270, 1.15], [300, 296, .85], [930, 280, 1.1], [1090, 290, .9]].map(([x, y, e], i) => (
          <g key={i} className={s.arvore} style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * .7}s` }} transform={`translate(${x} ${y}) scale(${e})`}>
            <rect x="-5" y="-4" width="10" height="46" rx="3" fill="#7a4a2b" />
            <circle cx="0" cy="-24" r="34" fill="#2f8f4e" /><circle cx="-24" cy="-6" r="24" fill="#3ba35c" /><circle cx="24" cy="-8" r="26" fill="#37a058" />
          </g>
        ))}
        {/* flores */}
        {[[70, 350], [210, 372], [380, 360], [520, 380], [780, 372], [880, 352], [1010, 376], [1130, 356]].map(([x, y], i) => (
          <g key={i} className={s.flor} style={{ animationDelay: `${i * .45}s`, transformOrigin: `${x}px ${y + 14}px` }}>
            <path d={`M${x} ${y + 14}V${y}`} stroke="#2f8f4e" strokeWidth="3" /><circle cx={x} cy={y - 2} r="6" fill={['#ffd34d', '#ff8fb1', '#fff', '#ffb347'][i % 4]} /><circle cx={x} cy={y - 2} r="2.4" fill="#e8742a" />
          </g>
        ))}
      </svg>

      <div className={s.folhas} aria-hidden="true">
        {FOLHAS.map((f, i) => (
          <span key={i} style={{ left: f.l + '%', animationDuration: f.d + 's', animationDelay: '-' + f.a + 's', '--r': f.r }}>{f.t}</span>
        ))}
      </div>

      <div className={s.texto}>
        <span className={s.selo}>⛪ Igreja Eco</span>
        <h1>Conhecimento, tecnologia e comércio em um só lugar</h1>
        <p>Sites e automações sob medida, trabalho pelo celular na Oficina, calçados direto de Franca e um Clube que premia quem participa.</p>
        <div className={s.botoes}>
          <Link href="/catalogo" className={s.bt1}>📚 Ver o catálogo</Link>
          <Link href="/oficina" className={s.bt2}>🛠️ Trabalhar na Oficina</Link>
          <Link href="/fidelidade" className={s.bt2}>🏆 Clube de Fidelidade</Link>
        </div>
      </div>
      </div>
      <div className={s.faixaRedes}><Redes titulo="Siga e fale com a gente" /></div>
    </section>
  );
}
