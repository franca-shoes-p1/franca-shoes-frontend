// Painel de membros da igreja: quem se cadastrou, quem já foi acolhido e quem entrou em grupo.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';

const ST = { novo: 'Novo', acolhido: 'Acolhido', em_grupo: 'Em grupo', inativo: 'Inativo' };
const CSS = `
.mb-f{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.mb-f button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:7px 14px;font:inherit;font-weight:600;cursor:pointer}
.mb-f button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.mb-c{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:14px;margin-bottom:10px}
.mb-c.novo{border-left:5px solid var(--am)}
.mb-t{font-weight:800}.mb-s{font-size:13px;color:var(--mu)}
.mb-a{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}
.mb-a select,.mb-a input{width:auto}.mb-a input{flex:1 1 220px}
`;
const data = (s) => (s ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '');
const soNum = (s) => String(s || '').replace(/\D/g, '');

export default function Membros() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/membros')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function agir(corpo) {
    setOcupado(true); setMsg(null);
    try { setD(await api('/api/admin/membros', { method: 'POST', body: corpo })); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    finally { setOcupado(false); }
  }
  const entrar = async (ev) => { ev.preventDefault(); setOcupado(true); try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); } setOcupado(false); };

  const pronto = fase === 'pronto' && d && !d.semSql;
  const todos = pronto ? d.membros : [];
  const lista = filtro === 'todos' ? todos : todos.filter((m) => m.status === filtro);

  return (
    <div className="ea">
      <Head><title>Membros · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>Membros da igreja</h1>
        <div className="ea-mu">Cadastros feitos em /seja-membro. O acolhimento responde em até 48 horas, pelo nome.</div>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2><label>Senha do painel</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Entrar</button></div>
          </form>
        )}
        {fase === 'pronto' && d && d.semSql && (<div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o SQL dos membros no Supabase (arquivo <b>supabase-membros.sql</b>) e recarregue esta página.</p></div>)}
        {pronto && (
          <>
            <div className="mb-f">
              {[['todos', `Todos (${todos.length})`], ...Object.entries(ST).map(([k, v]) => [k, `${v} (${todos.filter((m) => m.status === k).length})`])].map(([k, t]) => <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{t}</button>)}
            </div>
            {!lista.length && <div className="ea-card">Nenhum cadastro aqui ainda.</div>}
            {lista.map((m) => (
              <div key={m.id} className={`mb-c ${m.status}`}>
                <div className="mb-t">#{m.numero} {m.nome} <span className="ea-mu">· {ST[m.status]}</span></div>
                <div className="mb-s">{data(m.criado_em)} · {m.cidade || 'cidade não informada'} · conheceu: {m.conheceu || '—'}</div>
                <div style={{ marginTop: 6 }}>Servir: {m.servir || 'a definir'}<br />Grupos: {m.grupos || 'a definir'}{m.horario ? <><br />Melhor horário: {m.horario}</> : null}{m.obs ? <><br />Obs: {m.obs}</> : null}</div>
                {m.responsavel_menor && <div className="ea-msg er" style={{ marginTop: 6 }}>Responsável por menor de 18 anos: confirme a autorização e o acompanhamento.</div>}
                <div className="mb-a">
                  <a className="ea-btn" href={`https://wa.me/55${soNum(m.whatsapp).replace(/^55/, '')}?text=${encodeURIComponent(`Olá, ${m.nome.split(' ')[0]}! Aqui é da Igreja Evangelho dos Pobres dos Alimentos Sagrados. Recebemos o seu cadastro de membro. Seja bem-vindo(a)!`)}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
                  <select value={m.status} disabled={ocupado} onChange={(e) => agir({ id: m.id, status: e.target.value })}>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                  <input defaultValue={m.nota_interna || ''} placeholder="Anotação interna" onBlur={(e) => e.target.value !== (m.nota_interna || '') && agir({ id: m.id, nota_interna: e.target.value })} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
