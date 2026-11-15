import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import s from '../../styles/escola.module.css';
import EscolaLayout from '../../lib/EscolaLayout';
import { chamar } from '../../lib/escola';

export default function EscolaEntrar() {
  const router = useRouter();
  const [modo, setModo] = useState('entrar');
  const [f, setF] = useState({ nome: '', email: '', whatsapp: '', senha: '', aceite: false });
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => { if (router.isReady && router.query.novo) setModo('cadastrar'); }, [router.isReady, router.query.novo]);

  const destino = () => {
    const d = router.query.volta;
    return typeof d === 'string' && /^\/escola(\/[a-z0-9-]+){0,2}$/.test(d) ? d : '/escola';
  };

  async function enviar(ev) {
    ev.preventDefault();
    setErro(''); setOcupado(true);
    try {
      if (modo === 'cadastrar') await chamar('/api/escola/cadastro', { method: 'POST', body: f });
      else await chamar('/api/escola/entrar', { method: 'POST', body: { email: f.email, senha: f.senha } });
      router.push(destino());
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  }
  const mudar = (campo) => (e) => setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <EscolaLayout titulo={modo === 'entrar' ? 'Entrar' : 'Cadastro'}>
      <main className={`${s.contido} ${s.estreito}`}>
        <div className={s.abas}>
          <button type="button" className={`${s.aba} ${modo === 'entrar' ? s.on : ''}`} onClick={() => { setModo('entrar'); setErro(''); }}>Já tenho cadastro</button>
          <button type="button" className={`${s.aba} ${modo === 'cadastrar' ? s.on : ''}`} onClick={() => { setModo('cadastrar'); setErro(''); }}>Quero me cadastrar</button>
        </div>
        <form className={s.form} onSubmit={enviar}>
          {modo === 'cadastrar' && (
            <label>Seu nome<input type="text" value={f.nome} onChange={mudar('nome')} required maxLength={80} autoComplete="name" /></label>
          )}
          <label>E-mail<input type="email" value={f.email} onChange={mudar('email')} required maxLength={120} autoComplete="email" /></label>
          {modo === 'cadastrar' && (
            <label>WhatsApp (opcional)<input type="tel" value={f.whatsapp} onChange={mudar('whatsapp')} placeholder="(16) 90000-0000" autoComplete="tel" /></label>
          )}
          <label>Senha{modo === 'cadastrar' ? ' (mínimo 8 caracteres)' : ''}
            <input type="password" value={f.senha} onChange={mudar('senha')} required minLength={modo === 'cadastrar' ? 8 : 1} maxLength={100} autoComplete={modo === 'cadastrar' ? 'new-password' : 'current-password'} />
          </label>
          {modo === 'cadastrar' && (
            <label className={s.check}><input type="checkbox" checked={f.aceite} onChange={mudar('aceite')} /> Concordo em receber avisos sobre a escola e novas aulas. Uso seus dados só para isso.</label>
          )}
          {erro && <div className={s.erro} role="alert">{erro}</div>}
          <button className={`${s.btn} ${s.btnVerde}`} disabled={ocupado}>{ocupado ? 'Aguarde…' : modo === 'cadastrar' ? 'Cadastrar e entrar' : 'Entrar'}</button>
          {modo === 'entrar' && <p className={s.meta} style={{ margin: 0 }}>Esqueceu a senha? Fale com a gente pelo WhatsApp do site que enviamos uma nova.</p>}
        </form>
      </main>
    </EscolaLayout>
  );
}
