import React, { useState } from 'react';
import s from '../styles/atendente.module.css';
import { CONFIGS, responder, SEM_RESPOSTA, WHATS_ATENDENTE } from './atendente';

/* Motor do assistente: recebe uma configuração (nome, saudação, perguntas prontas) e conversa.
   Demonstração com dados de exemplo: não usa IA paga e não envia nada para fora. */
function Conversa({ config, compacto }) {
  const [conversa, setConversa] = useState([]);
  const [texto, setTexto] = useState('');

  const perguntar = (q, p) => {
    setConversa((c) => [...c, { q, r: p ? p.r : SEM_RESPOSTA, aviso: p ? p.aviso : null, sem: !p }]);
  };
  const enviar = (ev) => {
    ev.preventDefault();
    const q = texto.trim();
    if (!q) return;
    perguntar(q, responder(config, q));
    setTexto('');
  };
  const vistas = compacto ? conversa.slice(-2) : conversa;

  return (
    <>
      <div className={s.chips} role="group" aria-label="Perguntas de exemplo">
        {config.perguntas.map((p) => (
          <button key={p.id} type="button" className={s.chip} onClick={() => perguntar(p.q, p)}>{p.q}</button>
        ))}
      </div>
      <div className={s.conversa} aria-live="polite">
        <div className={s.balaoR}>{config.saudacao}</div>
        {vistas.map((m, i) => (
          <React.Fragment key={i}>
            <div className={s.balaoQ}>{m.q}</div>
            <div className={s.balaoR}>
              {m.r}
              {m.sem && <> <a href={WHATS_ATENDENTE} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a></>}
            </div>
            {m.aviso && <div className={s.aviso}><b>📲 Aviso simulado ao dono (Telegram)</b>{m.aviso}</div>}
          </React.Fragment>
        ))}
      </div>
      <form className={s.form} onSubmit={enviar}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva como o cliente escreveria…" aria-label="Escreva a mensagem" maxLength={140} />
        <button type="submit">Enviar</button>
      </form>
      <p className={s.avisoDemo}>Demonstração com dados de exemplo. Não digite dados pessoais.</p>
    </>
  );
}

export default function AtendenteMotor({ compacto = false, inicial = 'calcados', id }) {
  const [aba, setAba] = useState(inicial);
  const config = CONFIGS.find((c) => c.id === aba) || CONFIGS[0];
  return (
    <div className={`${s.motor} ${compacto ? s.motorCompacto : ''}`} id={id}>
      <div className={s.abas} role="tablist" aria-label="Escolha o tipo de negócio">
        {CONFIGS.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={c.id === aba} className={`${s.aba} ${c.id === aba ? s.abaAtiva : ''}`} onClick={() => setAba(c.id)}>{c.rotulo}</button>
        ))}
      </div>
      <div className={s.motorTopo}>
        <span className={s.avatar} aria-hidden="true">{config.avatar}</span>
        <div><b>{config.nome}</b><small>demonstração · online</small></div>
      </div>
      <Conversa key={config.id} config={config} compacto={compacto} />
    </div>
  );
}
