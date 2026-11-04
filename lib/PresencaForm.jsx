import React, { useEffect, useState } from 'react';
import s from '../styles/presenca.module.css';

// Formulário de captação da Máquina de Presença. Grava em /api/presenca/captar.
export default function PresencaForm({ segmento, cidade, titulo, interesses, cta, fone }) {
  const [f, setF] = useState({ nome: '', empresa: '', telefone: '', email: '', interesse: interesses[0] || '', consentimento: false, site: '' });
  const [canal, setCanal] = useState('site_igreja_eco');
  const [ref, setRef] = useState('');
  const [estado, setEstado] = useState('pronto'); // pronto | enviando | ok
  const [erro, setErro] = useState('');

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const c = (q.get('canal') || q.get('utm_source') || '').toLowerCase();
      if (/^[a-z0-9_]{2,40}$/.test(c)) setCanal(c);
      const r = q.get('ref');
      if (r && /^[a-z0-9]{6,12}$/i.test(r)) setRef(r.toLowerCase());
    } catch (e) { /* sem rastreio, o formulário funciona igual */ }
  }, []);

  const muda = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEstado('enviando');
    try {
      const r = await fetch('/api/presenca/captar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, segmento, cidade, canal, ref, pagina: window.location.pathname }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErro(j.erro || 'Não foi possível enviar agora.'); setEstado('pronto'); return; }
      setEstado('ok');
    } catch (err) {
      setErro('Sem conexão. Tente de novo ou chame no WhatsApp.');
      setEstado('pronto');
    }
  }

  if (estado === 'ok') {
    const msg = encodeURIComponent(`Olá! Acabei de pedir pelo site (${f.interesse}). Meu nome é ${f.nome}.`);
    return (
      <div className={s.form} id="formulario">
        <h2 className={s.formTitulo}>✅ Recebemos o seu pedido!</h2>
        <p className={s.formTexto}>Entramos em contato em breve. Se preferir, adiante o papo agora:</p>
        <a className={s.botao} href={`https://wa.me/${fone}?text=${msg}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
      </div>
    );
  }

  return (
    <form className={s.form} id="formulario" onSubmit={enviar}>
      <h2 className={s.formTitulo}>{titulo}</h2>
      <label className={s.campo}>Seu nome
        <input value={f.nome} onChange={muda('nome')} required maxLength={80} autoComplete="name" />
      </label>
      <label className={s.campo}>Nome do negócio (se tiver)
        <input value={f.empresa} onChange={muda('empresa')} maxLength={120} autoComplete="organization" />
      </label>
      <label className={s.campo}>WhatsApp com DDD
        <input value={f.telefone} onChange={muda('telefone')} required inputMode="tel" maxLength={30} placeholder="(16) 99999-9999" autoComplete="tel" />
      </label>
      <label className={s.campo}>E-mail (opcional)
        <input type="email" value={f.email} onChange={muda('email')} maxLength={120} autoComplete="email" />
      </label>
      <label className={s.campo}>O que você procura
        <select value={f.interesse} onChange={muda('interesse')}>
          {interesses.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </label>
      <input className={s.armadilha} tabIndex={-1} autoComplete="off" aria-hidden="true" name="site" value={f.site} onChange={muda('site')} />
      <label className={s.aceite}>
        <input type="checkbox" checked={f.consentimento} onChange={muda('consentimento')} required />
        <span>Autorizo receber contato por WhatsApp, e-mail ou telefone sobre este pedido. Posso pedir para sair a qualquer momento.</span>
      </label>
      {erro && <p className={s.erro} role="alert">{erro}</p>}
      <button className={s.botao} type="submit" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : cta}</button>
    </form>
  );
}
