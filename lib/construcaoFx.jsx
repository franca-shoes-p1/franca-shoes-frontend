import React, { useEffect, useRef, useState, useCallback } from 'react';
import s from '../styles/construcao.module.css';

/* Efeitos da capa do Pedido de Construção. Tudo respeita prefers-reduced-motion (o CSS desliga as animações). */

export function useVisto(limiar = 0.2) {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setVisto(true); return undefined; }
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setVisto(true); io.disconnect(); } }, { threshold: limiar });
    io.observe(el);
    return () => io.disconnect();
  }, [limiar]);
  return [ref, visto];
}

/* Aparece subindo quando entra na tela */
export function Revela({ as: Tag = 'div', atraso = 0, className = '', children, ...resto }) {
  const [ref, visto] = useVisto(0.15);
  return (
    <Tag ref={ref} className={`${s.revela} ${visto ? s.visto : ''} ${className}`} style={{ transitionDelay: `${atraso}ms` }} {...resto}>
      {children}
    </Tag>
  );
}

/* Cartão que inclina em 3D seguindo o mouse e acende um brilho onde o cursor passa */
export function Inclina({ className = '', children, ...resto }) {
  const ref = useRef(null);
  const mover = useCallback((ev) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - y) * 10).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((x - 0.5) * 12).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  }, []);
  const sair = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
  }, []);
  return <div ref={ref} className={`${s.inclina} ${className}`} onMouseMove={mover} onMouseLeave={sair} {...resto}>{children}</div>;
}

/* Número que sobe até o valor quando aparece */
export function Contador({ ate, sufixo = '' }) {
  const [ref, visto] = useVisto(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!visto) return undefined;
    let raf; const ini = performance.now(), dur = 1200;
    const passo = (t) => { const p = Math.min(1, (t - ini) / dur); setN(Math.round(ate * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(passo); };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [visto, ate]);
  return <span ref={ref}>{n}{sufixo}</span>;
}

/* Palavra que é digitada e apagada em ciclo */
export function PalavraDigitada({ palavras }) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState('');
  const [apaga, setApaga] = useState(false);
  useEffect(() => {
    const alvo = palavras[i % palavras.length];
    let t;
    if (!apaga && txt === alvo) t = setTimeout(() => setApaga(true), 1500);
    else if (apaga && txt === '') { setApaga(false); setI((v) => v + 1); }
    else t = setTimeout(() => setTxt(apaga ? alvo.slice(0, txt.length - 1) : alvo.slice(0, txt.length + 1)), apaga ? 45 : 85);
    return () => clearTimeout(t);
  }, [txt, apaga, i, palavras]);
  return <span className={s.digitada}>{txt}<i className={s.caret} aria-hidden="true" /></span>;
}

/* Linhas que aparecem uma a uma quando o bloco entra na tela */
export function LinhasDigitadas({ linhas, className = '' }) {
  const [ref, visto] = useVisto(0.3);
  return (
    <pre ref={ref} className={className}>
      {linhas.map((l, k) => (<span key={k} className={`${s.linha} ${visto ? s.linhaOn : ''}`} style={{ animationDelay: `${k * 90}ms` }}>{l || ' '}{'\n'}</span>))}
    </pre>
  );
}

/* Botão que é levemente atraído pelo cursor */
export function Magnetico({ href, className = '', children, ...resto }) {
  const ref = useRef(null);
  const mover = (ev) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${((ev.clientX - (r.left + r.width / 2)) * 0.18).toFixed(1)}px, ${((ev.clientY - (r.top + r.height / 2)) * 0.28).toFixed(1)}px)`;
  };
  const soltar = () => { if (ref.current) ref.current.style.transform = ''; };
  return <a ref={ref} href={href} className={`${s.magnetico} ${className}`} onMouseMove={mover} onMouseLeave={soltar} {...resto}>{children}</a>;
}

/* Fundo com brilho que segue o cursor */
export function Holofote({ className = '', children }) {
  const ref = useRef(null);
  const mover = (ev) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--hx', `${ev.clientX - r.left}px`);
    el.style.setProperty('--hy', `${ev.clientY - r.top}px`);
  };
  return <div ref={ref} className={`${s.holofote} ${className}`} onMouseMove={mover}>{children}</div>;
}
