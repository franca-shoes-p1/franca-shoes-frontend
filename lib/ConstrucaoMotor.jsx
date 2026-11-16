import React, { useState, useMemo } from 'react';
import s from '../styles/construcao.module.css';
import { TIPOS, PAGINAS, ESTILOS, CORES, gerarScript } from './construcao';
import { LinhasDigitadas } from './construcaoFx';

/* Motor de demonstração: o visitante escolhe o tipo de negócio e vê o site e o script do pedido se montarem ao vivo.
   Sem IA paga e sem enviar nada: o pedido real é feito em /monte-seu-negocio. */
export default function ConstrucaoMotor() {
  const [tipo, setTipo] = useState('comercio');
  const [paginas, setPaginas] = useState(TIPOS[0].padrao);
  const [estilo, setEstilo] = useState(ESTILOS[1]);
  const [cor, setCor] = useState(0);
  const [atendente, setAtendente] = useState(true);
  const [rajada, setRajada] = useState(0);

  const t = TIPOS.find((x) => x.id === tipo);
  const c = CORES[cor];

  const escolherTipo = (id) => {
    setTipo(id);
    setPaginas(TIPOS.find((x) => x.id === id).padrao);
    setRajada((n) => n + 1);
  };
  const alternar = (id) => setPaginas((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const linhas = useMemo(() => gerarScript({ tipo, paginas, estilo, cor, atendente }), [tipo, paginas, estilo, cor, atendente]);
  const chaveScript = `${tipo}|${paginas.join(',')}|${estilo}|${cor}|${atendente}`;
  const confete = useMemo(() => Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2, d = 90 + (i % 5) * 28;
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - 30, dr: (i * 73) % 360, cor: ['#ffd400', '#25d366', '#b18cff', '#ff8fb1'][i % 4] };
  }), []);

  const cls = [s.site, estilo === ESTILOS[0] ? s.estiloSimples : '', estilo === ESTILOS[2] ? s.estiloEscuro : ''].join(' ');
  const url = t.exemplo.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '').slice(0, 22) || 'meunegocio';

  return (
    <div className={s.demo}>
      <div className={s.demoEsq}>
        <span className={s.rotuloMini} style={{ marginTop: 0 }}>1 · Que negócio é o seu?</span>
        <div className={s.tipos}>
          {TIPOS.map((x) => (
            <button key={x.id} type="button" onClick={() => escolherTipo(x.id)} className={`${s.tipo} ${tipo === x.id ? s.tipoOn : ''}`}>
              <span aria-hidden="true">{x.e}</span>{x.nome}
            </button>
          ))}
        </div>
        <span className={s.rotuloMini}>2 · O que o site precisa ter?</span>
        <div className={s.chips}>
          {PAGINAS.map((p) => (
            <button key={p.id} type="button" onClick={() => alternar(p.id)} className={`${s.chipB} ${paginas.includes(p.id) ? s.chipBOn : ''}`}>{p.e} {p.nome}</button>
          ))}
        </div>
        <span className={s.rotuloMini}>3 · A cara do negócio</span>
        <div className={s.chips}>
          {ESTILOS.map((e) => (
            <button key={e} type="button" onClick={() => setEstilo(e)} className={`${s.chipB} ${estilo === e ? s.chipBOn : ''}`}>{e}</button>
          ))}
        </div>
        <div className={s.cores} style={{ marginTop: 12 }}>
          {CORES.map((x, i) => (
            <button key={x.v} type="button" aria-label={x.v} title={x.v} onClick={() => setCor(i)} className={`${s.cor} ${cor === i ? s.corOn : ''}`} style={{ background: `linear-gradient(135deg,${x.a},${x.b})` }} />
          ))}
        </div>
        <label className={`${s.alterna} ${atendente ? s.alternaOn : ''}`}>
          <input type="checkbox" checked={atendente} onChange={(e) => setAtendente(e.target.checked)} style={{ position: 'absolute', opacity: 0 }} />
          <i /> Quero o Atendente WhatsApp junto
        </label>
        <div className={s.acoes} style={{ marginTop: 22 }}>
          <a href="/monte-seu-negocio" className={`${s.botao} ${s.principal} ${s.magnetico}`}>Fazer o meu pedido de verdade →</a>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div className={s.nav}>
          <div className={s.navBarra}><i /><i /><i /><span className={s.navUrl}>🔒 {url}.com.br</span></div>
          <div className={cls} style={{ '--p': c.a, '--p2': c.b }} key={`${tipo}-${cor}-${estilo}`}>
            <div className={s.siteTopo}>{t.e} {t.exemplo}<span>Início · Contato</span></div>
            <div className={s.siteCapa}>
              <h4>{t.titulo}</h4>
              <p>{t.vende}</p>
              <span className={s.siteBtn}>Falar no WhatsApp</span>
            </div>
            <div className={s.siteGrade}>
              {PAGINAS.filter((p) => paginas.includes(p.id)).map((p, i) => (
                <div key={p.id} className={s.sitePag} style={{ animationDelay: `${i * 70}ms` }}><b>{p.e}</b>{p.nome}</div>
              ))}
            </div>
            {atendente && <span className={s.siteWhats} aria-hidden="true">💬</span>}
          </div>
        </div>
        <div className={s.confete} key={rajada} aria-hidden="true">
          {rajada > 0 && confete.map((q, i) => (<i key={i} style={{ background: q.cor, '--dx': `${q.dx}px`, '--dy': `${q.dy}px`, '--dr': `${q.dr}deg` }} />))}
        </div>

        <div className={s.scriptCx}>
          <div className={s.scriptTopo}>📋 Script do pedido, como chega até nós <em>exemplo</em></div>
          <LinhasDigitadas key={chaveScript} linhas={linhas} className={s.scriptPre} />
        </div>
      </div>
    </div>
  );
}
