import React, { useState } from 'react';
import s from '../styles/radar.module.css';
import { PERGUNTAS, responder, WHATS_RADAR } from './radarAssistente';

/* Assistente do Radar: perguntas prontas e campo de texto. Sem IA paga e sem enviar nada para fora. */
export default function RadarAssistente({ compacto = false }) {
  const [conversa, setConversa] = useState([]);
  const [texto, setTexto] = useState('');
  const lista = compacto ? PERGUNTAS.slice(0, 4) : PERGUNTAS;

  const perguntar = (q, p) => {
    const resp = p ? p.r : 'Não achei essa resposta pronta. Chame no WhatsApp que respondemos por lá, sem compromisso.';
    setConversa((c) => [...c, { q, r: resp, sem: !p }]);
  };
  const enviar = (ev) => {
    ev.preventDefault();
    const q = texto.trim();
    if (!q) return;
    perguntar(q, responder(q));
    setTexto('');
  };
  const ultimas = compacto ? conversa.slice(-1) : conversa;

  return (
    <div className={`${s.assist} ${compacto ? s.assistCompacto : ''}`} id={compacto ? undefined : 'assistente'}>
      <div className={s.assistTopo}>
        <span className={s.avatar} aria-hidden="true">🤖</span>
        <div><b>Assistente do Radar</b><small>Respostas prontas, sem enviar seus dados</small></div>
      </div>
      <div className={s.chips} role="group" aria-label="Perguntas frequentes">
        {lista.map((p) => (
          <button key={p.id} type="button" className={s.chip} onClick={() => perguntar(p.q, p)}>{p.q}</button>
        ))}
      </div>
      <div className={s.conversa} aria-live="polite">
        {ultimas.length === 0 && (
          <div className={s.balaoR}><span className={s.digitando}><i /><i /><i /></span> Toque numa pergunta ou escreva a sua.</div>
        )}
        {ultimas.map((m, i) => (
          <React.Fragment key={i}>
            <div className={s.balaoQ}>{m.q}</div>
            <div className={s.balaoR}>
              {m.r}
              {m.sem && <> <a href={WHATS_RADAR} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a></>}
            </div>
          </React.Fragment>
        ))}
      </div>
      <form className={s.assistForm} onSubmit={enviar}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva a sua dúvida…" aria-label="Escreva a sua dúvida" maxLength={140} />
        <button type="submit">Perguntar</button>
      </form>
    </div>
  );
}
