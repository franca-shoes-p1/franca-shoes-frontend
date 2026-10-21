import React, { useState } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../lib/adminClient';

export default function Entrar() {
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'criar'
  const [f, setF] = useState({ nome: '', whatsapp: '', email: '', senha: '', lgpd: false });
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setOcupado(true);
    setMsg(null);
    try {
      if (modo === 'entrar') {
        const r = await api('/api/op/login', { method: 'POST', body: { email: f.email, senha: f.senha } });
        if (r.papel === 'dono') window.location.href = '/painel';
        else if (r.papel) window.location.href = '/operador';
        else setMsg({ tipo: 'er', texto: 'Sua conta existe, mas ainda não tem perfil neste sistema. Crie a conta pela aba "Criar conta".' });
      } else {
        const r = await api('/api/op/cadastro', { method: 'POST', body: f });
        if (r.logado) window.location.href = '/operador';
        else setMsg({ tipo: 'ok', texto: 'Conta criada! Confirme o e-mail que enviamos e depois entre aqui.' });
      }
    } catch (err) {
      setMsg({ tipo: 'er', texto: err.message });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="ea">
      <Head>
        <title>Entrar | Equipe</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in" style={{ maxWidth: 460 }}>
        <h1>Equipe de produção</h1>
        <p className="ea-mu">Entre para ver suas missões, ou crie sua conta de operador. Novas contas são liberadas após aprovação.</p>
        <div className="ea-row" style={{ marginTop: 12 }}>
          <button type="button" className={`ea-btn ${modo === 'entrar' ? '' : 'ea-btn2'}`} onClick={() => setModo('entrar')}>Entrar</button>
          <button type="button" className={`ea-btn ${modo === 'criar' ? '' : 'ea-btn2'}`} onClick={() => setModo('criar')}>Criar conta</button>
        </div>
        <form className="ea-card" onSubmit={enviar}>
          {modo === 'criar' && (
            <>
              <label>Seu nome</label>
              <input value={f.nome} onChange={mudar('nome')} required autoComplete="name" />
              <label style={{ marginTop: 10 }}>WhatsApp (com DDD)</label>
              <input value={f.whatsapp} onChange={mudar('whatsapp')} inputMode="tel" autoComplete="tel" />
            </>
          )}
          <label style={{ marginTop: 10 }}>E-mail</label>
          <input type="email" value={f.email} onChange={mudar('email')} required autoComplete="email" />
          <label style={{ marginTop: 10 }}>Senha {modo === 'criar' && '(mínimo 8 caracteres)'}</label>
          <input type="password" value={f.senha} onChange={mudar('senha')} required minLength={modo === 'criar' ? 8 : 1} autoComplete={modo === 'criar' ? 'new-password' : 'current-password'} />
          {modo === 'criar' && (
            <label style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input type="checkbox" checked={f.lgpd} onChange={mudar('lgpd')} style={{ width: 'auto', marginTop: 3 }} />
              <span>Concordo que meus dados (nome, WhatsApp e e-mail) sejam usados para organizar o trabalho e os pagamentos da equipe.</span>
            </label>
          )}
          <div style={{ marginTop: 16 }}>
            <button className="ea-btn" disabled={ocupado}>{ocupado ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}</button>
          </div>
          {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        </form>
        <p className="ea-mu" style={{ marginTop: 16 }}>
          Aqui não existe taxa de entrada. Você só recebe por tarefa entregue e aprovada.
        </p>
      </div>
    </div>
  );
}
