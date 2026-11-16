import React from 'react';
import s from '../styles/construcao.module.css';

/* Planta baixa de um site que se desenha sozinha (stroke-dashoffset) e depois recebe blocos. Nada igual existe no resto do site. */
export default function ConstrucaoPlanta({ compacta = false }) {
  const B = (x, y, w, h, fill, d, txt, tc = '#2a1457') => (
    <g className={s.blocoSvg} style={{ animationDelay: `${d}s` }}>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={fill} />
      {txt && <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={tc}>{txt}</text>}
    </g>
  );
  return (
    <div style={{ position: 'relative' }}>
      <svg className={s.plantaSvg} viewBox="0 0 460 380" role="img" aria-label="Planta de um site sendo desenhada">
        <rect x="20" y="20" width="420" height="340" rx="18" className={s.tracoA} style={{ '--c': 1500 }} />
        <line x1="20" y1="62" x2="440" y2="62" className={s.tracoB} style={{ '--c': 420 }} />
        <circle cx="42" cy="41" r="5" className={s.tracoB} style={{ '--c': 40 }} />
        <circle cx="60" cy="41" r="5" className={s.tracoB} style={{ '--c': 40 }} />
        <circle cx="78" cy="41" r="5" className={s.tracoB} style={{ '--c': 40 }} />
        <path d="M40 330 H420 M40 80 V330" className={s.tracoB} style={{ '--c': 500 }} />
        {B(40, 80, 380, 96, '#ffd400', 2.2, 'Sua vitrine', '#2a1457')}
        {B(40, 190, 118, 70, '#b18cff', 2.55, 'Catálogo')}
        {B(171, 190, 118, 70, '#43d6a4', 2.75, 'Agenda')}
        {B(302, 190, 118, 70, '#ff8fb1', 2.95, 'Pagamento')}
        {B(40, 274, 250, 46, '#fff', 3.2, 'Perguntas e contato')}
        {B(302, 274, 118, 46, '#25d366', 3.4, '💬 WhatsApp', '#06361b')}
        <g className={s.cursorSvg} style={{ transformOrigin: '0 0' }}>
          <path d="M120 120 l0 26 l8 -7 l6 14 l7 -3 l-6 -14 l11 0 z" fill="#fff" stroke="#2a1457" strokeWidth="2" />
        </g>
      </svg>
      {!compacta && (<>
        <span className={`${s.chip} ${s.chip1}`}>🧱 Pedido nº 0001</span>
        <span className={`${s.chip} ${s.chip2}`}>✅ Script pronto</span>
        <span className={`${s.chip} ${s.chip3}`}>💬 Atendente no ar</span>
      </>)}
    </div>
  );
}
