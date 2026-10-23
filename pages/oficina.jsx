import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../lib/adminClient';

export default function Oficina() {
  const [f, setF] = useState({ nome: '', whatsapp: '', cidade: '', interesse: '', aceito: false, site: '' });
  const [msg, setMsg] = useState(null);
  const [ok, setOk] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(ev) {
    ev.preventDefault();
    setOcupado(true); setMsg(null);
    try {
      const origem = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('origem') || '' : '';
      await api('/api/oficina/candidatar', { method: 'POST', body: { ...f, origem } });
      setOk(true);
    } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }

  return (
    <div className="ea">
      <Head><title>Oficina Digital · tarefas online para quem quer começar</title><meta name="description" content="Tarefas curtas, com passo a passo e ajuda de IA, feitas pelo celular. Sem experiência. Você escolhe quando trabalhar." /></Head>
      <style>{ADMIN_CSS}</style>
      <div className="ea-in" style={{ maxWidth: 640 }}>
        <h1>Oficina Digital</h1>
        <p>Tarefas curtas feitas pelo celular, cada uma com <b>passo a passo, checklist e uma IA para tirar dúvidas</b>. Não precisa de experiência nem de curso: você aprende fazendo a primeira tarefa.</p>
        <div className="ea-card">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Você escolhe quando trabalhar. Sem horário fixo.</li>
            <li>Tarefas aprovadas geram <b>Pontos Oficina</b> (benefícios) e, em algumas, pagamento em reais.</li>
            <li>Sem promessa de renda. O valor de cada tarefa aparece antes de você começar.</li>
            <li>Você trabalha como prestador autônomo.</li>
          </ul>
        </div>
        {ok ? (
          <div className="ea-card"><h2>Recebemos seu cadastro.</h2><p>Em breve a coordenação chama você no WhatsApp com o seu código de acesso.</p></div>
        ) : (
          <form className="ea-card" onSubmit={enviar}>
            <h2 style={{ marginTop: 0 }}>Quero participar</h2>
            {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
            <label>Seu nome</label><input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required />
            <label>WhatsApp com DDD</label><input value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} inputMode="tel" required />
            <label>Cidade</label><input value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} />
            <label>O que você gostaria de fazer? (opcional)</label><textarea value={f.interesse} onChange={(e) => setF({ ...f, interesse: e.target.value })} />
            <input name="site" tabIndex={-1} autoComplete="off" value={f.site} onChange={(e) => setF({ ...f, site: e.target.value })} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} aria-hidden="true" />
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--tx)' }}>
              <input type="checkbox" style={{ width: 'auto', marginTop: 4 }} checked={f.aceito} onChange={(e) => setF({ ...f, aceito: e.target.checked })} />
              <span>Aceito receber contato por WhatsApp sobre a Oficina Digital. Usaremos seus dados só para isso.</span>
            </label>
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado || !f.aceito}>{ocupado ? 'Enviando…' : 'Enviar cadastro'}</button></div>
          </form>
        )}
        <p className="ea-mu">Quer ver o que estamos construindo? <Link href="/vitrine">Vitrine de projetos</Link></p>
      </div>
    </div>
  );
}
