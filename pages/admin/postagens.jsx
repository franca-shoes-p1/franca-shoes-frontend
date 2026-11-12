import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';

const REDES = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['telegram', 'Telegram'], ['email', 'E-mail']];
const TEMAS = [['azul', 'Azul'], ['verde', 'Verde'], ['terra', 'Terra'], ['noite', 'Noite']];
const STATUS = {
  agendada: ['Agendada', ''],
  em_andamento: ['Operador fazendo', 'am'],
  postada: ['Postada', 'ok'],
  pulada: ['Não feita', 'er'],
  cancelada: ['Cancelada', 'er'],
};
const EXEMPLO = `[
  {
    "rede": "facebook",
    "titulo": "Exemplo: dica da semana",
    "texto": "Texto completo da publicação aqui.",
    "hashtags": "#igrejaeco #agroecologia",
    "link_destino": "https://www.igreja.eco.br",
    "arte_titulo": "Frase curta da arte",
    "arte_subtitulo": "Linha de apoio",
    "arte_tema": "verde",
    "agendada_para": "2026-10-29T10:00:00-03:00"
  }
]`;

const pad = (n) => String(n).padStart(2, '0');
const paraInput = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const agoraInput = (h) => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(h, 0, 0, 0); return paraInput(d.toISOString()); };

const CSS = `
.ap-tabs{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.ap-t{padding:8px 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--tx);font:inherit;cursor:pointer}
.ap-t.on{background:var(--ac);border-color:var(--ac);color:#fff}
.ap-tx{margin-top:6px;padding:10px;border-radius:8px;background:var(--bg);border:1px solid var(--bd);white-space:pre-wrap;word-break:break-word;font-size:14px;max-height:160px;overflow:auto}
.ap-code{font:13px ui-monospace,Menlo,Consolas,monospace;min-height:220px}
`;

export default function AdminPostagens() {
  const [fase, setFase] = useState('carregando');
  const [aba, setAba] = useState('agenda');
  const [filtro, setFiltro] = useState('');
  const [lista, setLista] = useState([]);
  const [cont, setCont] = useState({});
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [lote, setLote] = useState('');
  const [novo, setNovo] = useState({ rede: 'facebook', titulo: '', texto: '', hashtags: '', link_destino: 'https://www.igreja.eco.br', arte_titulo: '', arte_subtitulo: '', arte_tema: 'azul', email_assunto: '', agendada_para: agoraInput(10) });
  const [quando, setQuando] = useState({});

  const carregar = useCallback(async () => {
    try {
      const d = await api(`/api/admin/postagens${filtro ? `?status=${filtro}` : ''}`);
      setLista(d.postagens || []);
      setCont(d.contagem || {});
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); }
    }
  }, [filtro]);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { await fn(); if (ok) setMsg({ tipo: 'ok', texto: ok }); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); }); };
  const sair = async () => { await api('/api/admin/logout', { method: 'POST', body: {} }); setLista([]); setFase('login'); };
  const patch = (id, corpo, ok) => rodar(() => api(`/api/admin/postagens/${id}`, { method: 'PATCH', body: corpo }), ok);
  const apagar = (id) => window.confirm('Excluir esta postagem de vez?') && rodar(() => api(`/api/admin/postagens/${id}`, { method: 'DELETE' }), 'Postagem excluída.');

  const criar = (ev) => {
    ev.preventDefault();
    rodar(async () => {
      const corpo = { ...novo, agendada_para: new Date(novo.agendada_para).toISOString() };
      await api('/api/admin/postagens', { method: 'POST', body: { postagem: corpo } });
      setNovo({ ...novo, titulo: '', texto: '', arte_titulo: '', arte_subtitulo: '', email_assunto: '' });
      setAba('agenda');
    }, 'Postagem agendada. Ela já aparece na fila do operador.');
  };
  const importar = (ev) => {
    ev.preventDefault();
    let lista2;
    try {
      const j = JSON.parse(lote);
      lista2 = Array.isArray(j) ? j : j.postagens;
      if (!Array.isArray(lista2)) throw new Error('x');
    } catch (e) {
      setMsg({ tipo: 'er', texto: 'O texto colado não é um lote válido. Cole a lista inteira, começando com [ e terminando com ].' });
      return;
    }
    rodar(async () => {
      const r = await api('/api/admin/postagens', { method: 'POST', body: { postagens: lista2, origem: 'lote' } });
      setLote('');
      setAba('agenda');
      setMsg({ tipo: r.erros && r.erros.length ? 'er' : 'ok', texto: `${r.criadas} postagem(ns) criada(s), ${r.ignoradas} repetida(s)${r.erros && r.erros.length ? `. Com erro: ${r.erros.slice(0, 3).map((e) => `#${e.indice + 1} ${e.erro}`).join(' | ')}` : '.'}` });
    });
  };

  const ver = (k, v) => setNovo({ ...novo, [k]: v });

  return (
    <div className="ea">
      <Head><title>Postagens · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Postagens da divulgação</h1>
            <div className="ea-mu">A IA gera e envia sozinha; o operador publica em <b>/operador/postagens</b>. Aqui você acompanha, ajusta e cria.</div>
          </div>
          <div className="ea-row">
            <Link href="/admin/operadores" className="ea-btn ea-btn2">Operadores</Link>
            {fase === 'pronto' && <button className="ea-btn ea-btn2" onClick={sair}>Sair</button>}
          </div>
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}

        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2>
            <label>Senha do painel</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus required />
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</button></div>
          </form>
        )}

        {fase === 'pronto' && (
          <>
            <div className="ap-tabs">
              <button className={`ap-t ${aba === 'agenda' ? 'on' : ''}`} onClick={() => setAba('agenda')}>Agenda</button>
              <button className={`ap-t ${aba === 'nova' ? 'on' : ''}`} onClick={() => setAba('nova')}>Nova postagem</button>
              <button className={`ap-t ${aba === 'lote' ? 'on' : ''}`} onClick={() => setAba('lote')}>Colar lote da IA</button>
            </div>

            {aba === 'agenda' && (
              <div className="ea-card">
                <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                  <div className="ea-row">
                    {Object.keys(STATUS).map((s) => (
                      <button key={s} className={`ap-t ${filtro === s ? 'on' : ''}`} onClick={() => setFiltro(filtro === s ? '' : s)}>{STATUS[s][0]}{cont[s] ? ` (${cont[s]})` : ''}</button>
                    ))}
                  </div>
                  <button className="ea-btn ea-btn2" onClick={carregar}>Atualizar</button>
                </div>
                <p className="ea-mu" style={{ margin: '8px 0 0' }}>Contagem dos status considera de ontem em diante.</p>
                {lista.length === 0 && <p className="ea-mu">Nenhuma postagem{filtro ? ' com este status' : ''}.</p>}
                {lista.map((p) => {
                  const [rot, cor] = STATUS[p.status] || [p.status, ''];
                  const v = quando[p.id] ?? paraInput(p.agendada_para);
                  const aberta = ['agendada', 'em_andamento'].includes(p.status);
                  return (
                    <div className="ea-item" key={p.id} style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
                      <div className="ea-row" style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div>
                          <b>{p.titulo}</b> <span className="ea-tag">{(REDES.find((r) => r[0] === p.rede) || [])[1]}</span> <span className={`ea-tag ${cor}`}>{rot}</span>{' '}
                          <span className="ea-tag">{p.origem === 'ia' ? 'IA automática' : p.origem === 'lote' ? 'lote colado' : 'manual'}</span>
                          <div className="ea-mu">{new Date(p.agendada_para).toLocaleString('pt-BR')}{p.operador && p.operador.nome ? ` · operador: ${p.operador.nome}` : ''}{p.postada_em ? ` · feita em ${new Date(p.postada_em).toLocaleString('pt-BR')}` : ''}</div>
                          {p.observacao_operador && <div className="ea-mu">Obs. do operador: {p.observacao_operador}</div>}
                          {p.link_postagem && <div className="ea-mu"><a href={p.link_postagem} target="_blank" rel="noopener noreferrer">ver publicação</a></div>}
                        </div>
                        <div className="ea-row">
                          {aberta && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => patch(p.id, { status: 'cancelada' }, 'Postagem cancelada.')}>Cancelar</button>}
                          {!aberta && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => patch(p.id, { status: 'agendada' }, 'Postagem reaberta na fila.')}>Reabrir</button>}
                          <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => apagar(p.id)}>Excluir</button>
                        </div>
                      </div>
                      <div className="ap-tx" style={{ width: '100%', boxSizing: 'border-box' }}>{p.texto}</div>
                      {aberta && (
                        <div className="ea-row">
                          <input type="datetime-local" style={{ width: 'auto' }} value={v} onChange={(e) => setQuando({ ...quando, [p.id]: e.target.value })} />
                          <button className="ea-btn ea-btn2" disabled={ocupado || !quando[p.id]} onClick={() => patch(p.id, { agendada_para: new Date(quando[p.id]).toISOString() }, 'Horário alterado.')}>Reagendar</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {aba === 'nova' && (
              <form className="ea-card" onSubmit={criar}>
                <h2>Nova postagem manual</h2>
                <div className="ea-grid">
                  <div><label>Rede</label><select value={novo.rede} onChange={(e) => ver('rede', e.target.value)}>{REDES.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></div>
                  <div><label>Dia e hora</label><input type="datetime-local" value={novo.agendada_para} onChange={(e) => ver('agendada_para', e.target.value)} required /></div>
                </div>
                <label style={{ marginTop: 10 }}>Título interno (só para identificar na fila)</label>
                <input value={novo.titulo} onChange={(e) => ver('titulo', e.target.value)} required minLength={3} />
                {novo.rede === 'email' && (<><label style={{ marginTop: 10 }}>Assunto do e-mail</label><input value={novo.email_assunto} onChange={(e) => ver('email_assunto', e.target.value)} /></>)}
                <label style={{ marginTop: 10 }}>Texto da publicação</label>
                <textarea value={novo.texto} onChange={(e) => ver('texto', e.target.value)} required />
                <div className="ea-grid" style={{ marginTop: 10 }}>
                  <div><label>Hashtags</label><input value={novo.hashtags} onChange={(e) => ver('hashtags', e.target.value)} /></div>
                  <div><label>Link (https)</label><input value={novo.link_destino} onChange={(e) => ver('link_destino', e.target.value)} /></div>
                </div>
                {novo.rede !== 'email' && (
                  <div className="ea-grid" style={{ marginTop: 10 }}>
                    <div><label>Frase grande da arte</label><input value={novo.arte_titulo} onChange={(e) => ver('arte_titulo', e.target.value)} maxLength={90} /></div>
                    <div><label>Linha de apoio da arte</label><input value={novo.arte_subtitulo} onChange={(e) => ver('arte_subtitulo', e.target.value)} maxLength={160} /></div>
                    <div><label>Cor da arte</label><select value={novo.arte_tema} onChange={(e) => ver('arte_tema', e.target.value)}>{TEMAS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></div>
                  </div>
                )}
                <div style={{ marginTop: 14 }}><button className="ea-btn" disabled={ocupado}>{ocupado ? 'Salvando…' : 'Agendar'}</button></div>
              </form>
            )}

            {aba === 'lote' && (
              <form className="ea-card" onSubmit={importar}>
                <h2>Colar um lote gerado pela IA</h2>
                <p className="ea-mu" style={{ marginTop: 0 }}>Use quando o n8n estiver parado ou quando você pedir ao Claude no chat uma semana de postagens. Cole a lista inteira no formato abaixo. Repetidas não duplicam se tiverem o campo <code>chave</code>.</p>
                <textarea className="ap-code" value={lote} onChange={(e) => setLote(e.target.value)} placeholder={EXEMPLO} spellCheck={false} />
                <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado || !lote.trim()}>{ocupado ? 'Importando…' : 'Importar lote'}</button></div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
