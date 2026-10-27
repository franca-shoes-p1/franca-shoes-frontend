import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import s from '../styles/festa.module.css';

/* Faixa de festa da home: fogos de artifício, bandeirinhas e confete caindo. Anima só quando está visível e some com "reduzir movimento". */
const MEDALHAS = [
  { e: '🎁', t: 'Calçado ou acessório' },
  { e: '🌐', t: 'Página de vendas grátis' },
  { e: '🧩', t: '20% no Ateliê' },
  { e: '🥬', t: 'Alimentos (em breve)' },
  { e: '🏆', t: 'Níveis de fidelidade' },
];
const CORES = ['#ffd400', '#ff5d73', '#5ee7ff', '#9d7bff', '#7dff9a', '#ff9f1c'];
const BANDEIRAS = Array.from({ length: 22 }, (_, i) => ({ cor: CORES[i % CORES.length], atraso: -((i * 0.37) % 3) }));
const CONFETES = Array.from({ length: 30 }, (_, i) => ({
  esq: (i * 37) % 100,
  atraso: -((i * 1.3) % 11),
  dur: 7 + ((i * 5) % 6),
  tam: 8 + ((i * 3) % 9),
  cor: CORES[(i * 2) % CORES.length],
  bandeira: i % 4 === 0,
  gira: i % 2 ? 1 : -1,
}));

export default function FestaBanner() {
  const raiz = useRef(null);
  const tela = useRef(null);

  useEffect(() => {
    const cv = tela.current;
    if (!cv || typeof window === 'undefined') return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = cv.getContext('2d');
    if (!ctx) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, ultimo = 0, proximo = 0, visivel = true;
    const foguetes = [];
    const fagulhas = [];

    function medir() {
      const r = cv.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function lancar() {
      foguetes.push({ x: w * (0.08 + Math.random() * 0.84), y: h, vy: -(3 + Math.random() * 2.5) * (h / 420), alvo: h * (0.12 + Math.random() * 0.38), cor: CORES[Math.floor(Math.random() * CORES.length)] });
    }
    function explodir(f) {
      const n = w < 600 ? 26 : 44;
      const ang0 = Math.random() * 6.28;
      for (let i = 0; i < n; i += 1) {
        const a = ang0 + (6.2832 * i) / n;
        const v = 1.2 + Math.random() * 2.6;
        fagulhas.push({ x: f.x, y: f.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, cor: Math.random() < 0.25 ? '#ffffff' : f.cor });
      }
    }
    function quadro(t) {
      raf = window.requestAnimationFrame(quadro);
      if (!visivel || document.hidden) { ultimo = t; return; }
      const dt = Math.min(34, t - ultimo || 16) / 16;
      ultimo = t;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      if (t > proximo) { lancar(); proximo = t + 450 + Math.random() * 900; }
      for (let i = foguetes.length - 1; i >= 0; i -= 1) {
        const f = foguetes[i];
        f.y += f.vy * dt;
        ctx.fillStyle = '#fff';
        ctx.fillRect(f.x - 1, f.y, 2, 6);
        if (f.y <= f.alvo) { explodir(f); foguetes.splice(i, 1); }
      }
      for (let i = fagulhas.length - 1; i >= 0; i -= 1) {
        const p = fagulhas[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 0.035 * dt; p.vx *= 0.985; p.vida -= 0.011 * dt;
        if (p.vida <= 0) { fagulhas.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.vida);
        ctx.fillStyle = p.cor;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    medir();
    window.addEventListener('resize', medir);
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((e) => { visivel = e[0].isIntersecting; }, { threshold: 0.05 }) : null;
    if (io && raiz.current) io.observe(raiz.current);
    raf = window.requestAnimationFrame(quadro);
    return () => { window.cancelAnimationFrame(raf); window.removeEventListener('resize', medir); if (io) io.disconnect(); };
  }, []);

  return (
    <section id="fidelidade" ref={raiz} className={s.faixa} aria-label="Clube de Fidelidade">
      <canvas ref={tela} className={s.fogos} aria-hidden="true" />
      <div className={s.bandeiras} aria-hidden="true">
        {BANDEIRAS.map((b, i) => <i key={i} style={{ '--c': b.cor, animationDelay: `${b.atraso}s` }} />)}
      </div>
      <div className={s.chuva} aria-hidden="true">
        {CONFETES.map((c, i) => (
          <i
            key={i}
            className={c.bandeira ? s.mini : s.pedaco}
            style={{ left: `${c.esq}%`, width: c.tam, height: c.bandeira ? c.tam : c.tam * 0.5, background: c.bandeira ? undefined : c.cor, '--c': c.cor, animationDuration: `${c.dur}s`, animationDelay: `${c.atraso}s`, '--g': c.gira }}
          />
        ))}
      </div>

      <div className={s.dentro}>
        <span className={s.pilula}>🎉 Super promoção de fidelidade</span>
        <h2 className={s.titulo}>Quanto mais você participa, <em>mais você ganha</em></h2>
        <p className={s.texto}>
          Junte pontos fazendo tarefas, contratando ou indicando e troque por brindes, descontos e até uma página de vendas grátis.
          Todo produto ou projeto novo que entrar no site ganha recompensas no Clube, para quem continua com a gente.
        </p>
        <ul className={s.medalhas}>
          {MEDALHAS.map((m) => (
            <li key={m.t}><span className={s.bola}>{m.e}</span><b>{m.t}</b></li>
          ))}
        </ul>
        <div className={s.acoes}>
          <Link href="/fidelidade" className={`${s.botao} ${s.principal}`}>Ver todas as recompensas</Link>
          <Link href="/oficina#cadastro" className={`${s.botao} ${s.contorno}`}>Começar a juntar pontos</Link>
        </div>
        <p className={s.nota}>
          Regras abertas: pontos não são dinheiro nem participação, valem 12 meses, e qualquer mudança é avisada com 30 dias de antecedência.
          Não prometemos ganhos.
        </p>
      </div>
    </section>
  );
}
