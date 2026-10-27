import React from 'react';
import { REDES } from './redes';
import s from '../styles/redes.module.css';

function Icone({ id }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (id === 'youtube') return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M10.5 9.5v5l4.2-2.5z" fill="#fff" /></svg>;
  if (id === 'instagram') return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r="0.6" fill="#fff" /></svg>;
  if (id === 'facebook') return <svg {...p}><path d="M14 8h2.5V4.5H14C11.8 4.5 10.5 6 10.5 8v2H8v3.5h2.5V20H14v-6.5h2.5L17 10h-3V8.6c0-.4.2-.6.6-.6z" fill="#fff" stroke="none" /></svg>;
  if (id === 'telegram') return <svg {...p}><path d="M20.5 4.5 3.5 11l5 2 2 5.5 2.7-3.3 4.3 3.3z" /><path d="M8.5 13l8-5.5" /></svg>;
  return <svg {...p}><path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z" /><path d="M9.2 9c.3 2.4 2.4 4.5 4.8 4.8l1.2-1.2-1.8-1-.8.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.8-1-1.8z" fill="#fff" stroke="none" /></svg>;
}

// variante: 'claro' (sobre fundo escuro) ou 'escuro' (sobre fundo claro)
export default function Redes({ variante = 'claro', titulo }) {
  return (
    <div className={`${s.caixa} ${variante === 'escuro' ? s.escuro : ''}`}>
      {titulo && <span className={s.titulo}>{titulo}</span>}
      <ul className={s.lista}>
        {REDES.map((r) => (
          <li key={r.id}>
            {r.url ? (
              <a className={s.bt} href={r.url} target="_blank" rel="noopener noreferrer" aria-label={r.nome} style={{ '--c': r.cor }}>
                <span className={s.ic}><Icone id={r.id} /></span><span>{r.nome}</span>
              </a>
            ) : (
              <span className={`${s.bt} ${s.breve}`} aria-label={`${r.nome} em breve`} style={{ '--c': r.cor }}>
                <span className={s.ic}><Icone id={r.id} /></span><span>{r.nome}</span><small>em breve</small>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
