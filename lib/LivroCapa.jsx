import React from 'react';
import s from '../styles/livroCapa.module.css';
import { CORES } from './livros';

/* Capa gerada em código (sem arquivo de imagem): fundo em degradê + cena do tema + título.
   Se um dia houver imagem pronta, passe capaUrl (https) e ela tem prioridade. */
const httpsOk = (u) => typeof u === 'string' && u.startsWith('https://');

function Cena({ tema }) {
  const p = { viewBox: '0 0 200 130', 'aria-hidden': true, className: s.cena };
  if (tema === 'igreja') {
    return (
      <svg {...p}>
        <circle className={s.sol} cx="150" cy="34" r="16" fill="#fff6c9" />
        <path d="M0 108 C40 92 80 108 120 98 S180 92 200 104 V130 H0z" fill="rgba(255,255,255,.18)" />
        <g transform="translate(62 30)">
          <rect x="8" y="46" width="60" height="42" fill="#eaf3ff" />
          <path d="M2 48 L38 26 L74 48z" fill="#0d2a66" />
          <rect x="30" y="8" width="16" height="40" fill="#eaf3ff" />
          <path d="M27 10 L38 -6 L49 10z" fill="#0d2a66" />
          <g className={s.cruz}><rect x="36" y="-26" width="4" height="18" rx="1" fill="#ffd86b" /><rect x="30" y="-20" width="16" height="4" rx="1" fill="#ffd86b" /></g>
          <path d="M31 88 V70 a7 7 0 0 1 14 0 V88z" fill="#13307a" />
          <rect x="14" y="58" width="10" height="16" rx="5" fill="#ffd86b" className={s.janela} />
          <rect x="52" y="58" width="10" height="16" rx="5" fill="#ffd86b" className={s.janela} />
        </g>
      </svg>
    );
  }
  if (tema === 'horta') {
    return (
      <svg {...p}>
        <circle className={s.sol} cx="152" cy="30" r="17" fill="#fff6c9" />
        <path d="M0 106 H200 V130 H0z" fill="rgba(0,0,0,.25)" />
        {[40, 76, 112, 148].map((x, i) => (
          <g key={x} className={s.broto} style={{ transformOrigin: `${x}px 106px`, animationDelay: `${i * 0.35}s` }}>
            <path d={`M${x} 106 V${78 - (i % 2) * 8}`} stroke="#d6ffe9" strokeWidth="3" strokeLinecap="round" />
            <path d={`M${x} ${86 - (i % 2) * 8} q-16 -2 -18 -16 q16 0 18 16z`} fill="#a6ffd6" />
            <path d={`M${x} ${80 - (i % 2) * 8} q16 -2 18 -16 q-16 0 -18 16z`} fill="#7fe8b9" />
          </g>
        ))}
      </svg>
    );
  }
  if (tema === 'partilha') {
    return (
      <svg {...p}>
        <circle className={s.sol} cx="150" cy="30" r="15" fill="#fff6c9" />
        <path d="M46 70 H154 L142 112 H58z" fill="#fff1d1" stroke="#9a5a12" strokeWidth="3" />
        <path d="M58 70 C58 40 142 40 142 70" fill="none" stroke="#fff1d1" strokeWidth="5" />
        <g className={s.pao}><ellipse cx="82" cy="66" rx="16" ry="10" fill="#e9a74a" /><ellipse cx="112" cy="64" rx="18" ry="11" fill="#f2bc66" /><circle cx="130" cy="68" r="8" fill="#d8432f" /></g>
      </svg>
    );
  }
  if (tema === 'despensa') {
    return (
      <svg {...p}>
        <rect x="26" y="96" width="148" height="6" rx="3" fill="rgba(255,255,255,.55)" />
        <rect x="26" y="56" width="148" height="6" rx="3" fill="rgba(255,255,255,.55)" />
        {[[40, 70, '#ffd86b'], [70, 62, '#a6ffd6'], [100, 70, '#ffb3b3'], [130, 66, '#cfe6ff'], [156, 72, '#ffd86b']].map(([x, y, c], i) => (
          <g key={x} className={s.pote} style={{ animationDelay: `${i * 0.3}s` }}>
            <rect x={x - 10} y={y} width="20" height="26" rx="5" fill={c} opacity=".9" />
            <rect x={x - 8} y={y - 6} width="16" height="7" rx="2" fill="#fff" />
          </g>
        ))}
        {[[50, 30, '#a6ffd6'], [92, 26, '#ffd86b'], [134, 30, '#e2cbff']].map(([x, y, c]) => (
          <g key={x}><rect x={x - 9} y={y} width="18" height="26" rx="5" fill={c} opacity=".85" /><rect x={x - 7} y={y - 6} width="14" height="7" rx="2" fill="#fff" /></g>
        ))}
      </svg>
    );
  }
  if (tema === 'grupos') {
    return (
      <svg {...p}>
        <circle cx="100" cy="70" r="46" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeDasharray="4 6" className={s.gira} />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const x = 100 + Math.cos(a) * 46;
          const y = 70 + Math.sin(a) * 46;
          return (
            <g key={i} className={s.pessoa} style={{ animationDelay: `${i * 0.25}s` }}>
              <circle cx={x} cy={y - 8} r="8" fill="#fff" />
              <path d={`M${x - 11} ${y + 14} q11 -20 22 0z`} fill="#ffd86b" />
            </g>
          );
        })}
        <circle cx="100" cy="70" r="9" fill="#ffd86b" className={s.sol} />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <circle className={s.sol} cx="100" cy="46" r="22" fill="#fff6c9" />
      <path d="M40 100 Q100 74 100 108 Q100 74 160 100 V114 Q100 90 100 120 Q100 90 40 114z" fill="#fff" opacity=".92" />
    </svg>
  );
}

export default function LivroCapa({ livro, capaUrl, mini }) {
  const c = CORES[livro.cor] || CORES.azul;
  const estilo = { '--a': c.a, '--b': c.b, '--luz': c.luz };
  return (
    <div className={`${s.capa} ${mini ? s.mini : ''}`} style={estilo} role="img" aria-label={`Capa do livro ${livro.titulo}`}>
      <span className={s.lombada} aria-hidden="true" />
      {httpsOk(capaUrl) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={capaUrl} alt="" className={s.foto} />
      ) : (
        <>
          <span className={s.etiqueta}>{livro.etiqueta || 'Livro'}</span>
          <Cena tema={livro.tema} />
          <span className={s.titulo}>{livro.titulo}</span>
          <span className={s.selo}>{livro.selo}</span>
        </>
      )}
      <span className={s.brilho} aria-hidden="true" />
    </div>
  );
}
