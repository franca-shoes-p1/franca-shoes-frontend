import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';

const CSS = `
.es-tabs{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.es-t{padding:8px 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--tx);font:inherit;cursor:pointer}
.es-t.on{background:var(--ac);border-color:var(--ac);color:#fff}
.es-ln{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-top:8px}
.es-ln>*{flex:1 1 160px;min-width:0}
.es-tab{width:100%;border-collapse:collapse;font-size:14px}
.es-tab th,.es-tab td{padding:6px 8px;border-bottom:1px solid var(--bd);text-align:left;vertical-align:top}
.es-cod{font:700 22px ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px}
.ea .es-chk{display:flex;align-items:center;gap:6px;flex:0 0 auto}
.ea .es-chk input{width:auto}
`;
const ABAS = [['aulas', 'Aulas'], ['trilhas', 'Trilhas'], ['alunos', 'Alunos']];
const AULA0 = { id: '', trilha_id: '', titulo: '', slug: '', resumo: '', conteudo: '', video_url: '', duracao_min: '', ordem: '0', ativo: true };
const TRILHA0 = { id: '', titulo: '', slug: '', descricao: '', icone: '🌱', ordem: '0', ativo: true };

export default function AdminEscola() {
  const [fase, setFase] = useState('carregando');
  const [aba, setAba] = useState('aulas');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aula, setAula] = useState(AULA0);
  const [trilha, setTrilha] = useState(TRILHA0);
  const [temp, setTemp] = useState(null);

  const carregar = useCallback(async () => {
    try { const x = await api('/api/admin/escola'); setD(x); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ er: 1, t: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { const r = await fn(); if (ok) setMsg({ t: ok }); await carregar(); return r; } catch (e) { setMsg({ er: 1, t: e.message }); }
    finally { setOcupado(false); }
  }
  const acao = (corpo, ok) => rodar(() => api('/api/admin/escola', { method: 'POST', body: corpo }), ok);
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); }); };

  const nomeTrilha = (id) => ((d && d.trilhas) || []).find((t) => t.id === id)?.titulo || '—';
  const salvarAula = async (ev) => {
    ev.preventDefault();
    const r = await acao({ acao: 'salvar_aula', ...aula }, 'Aula salva.');
    if (r) setAula(AULA0);
  };
  const salvarTrilha = async (ev) => {
    ev.preventDefault();
    const r = await acao({ acao: 'salvar_trilha', ...trilha }, 'Trilha salva.');
    if (r) setTrilha(TRILHA0);
  };
  const editarAula = (a) => { setAula({ ...AULA0, ...a, video_url: a.video_url || '', duracao_min: a.duracao_min ?? '', resumo: a.resumo || '', conteudo: a.conteudo || '', ordem: String(a.ordem ?? 0) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const editarTrilha = (t) => { setTrilha({ ...TRILHA0, ...t, descricao: t.descricao || '', ordem: String(t.ordem ?? 0) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="ea">
      <Head><title>Escola | Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS + CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>🌿 Escola de Agropecuária Ecológica</h1>
        <p className="ea-mu">Cadastre trilhas e aulas, cole o link do vídeo do YouTube e acompanhe os alunos. Página pública: <a href="/escola" target="_blank" rel="noopener noreferrer">/escola</a></p>
        {msg && <div className={'ea-card'} style={{ borderColor: msg.er ? 'var(--er)' : 'var(--ok)' }}>{msg.t}</div>}

        {fase === 'carregando' && <p className="ea-mu">Carregando…</p>}
        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar no painel</h2>
            <label htmlFor="es-senha">Senha do painel</label>
            <input id="es-senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
            <p><button className="ea-btn" disabled={ocupado}>Entrar</button></p>
          </form>
        )}

        {fase === 'pronto' && d && d.pronto === false && <div className="ea-card"><b>Falta um passo:</b> {d.motivo}</div>}

        {fase === 'pronto' && d && d.pronto && (
          <>
            <div className="es-tabs">
              {ABAS.map(([k, t]) => <button key={k} className={'es-t' + (aba === k ? ' on' : '')} onClick={() => setAba(k)}>{t}</button>)}
            </div>

            {aba === 'aulas' && (
              <>
                <form className="ea-card" onSubmit={salvarAula}>
                  <h2>{aula.id ? 'Editar aula' : 'Nova aula'}</h2>
                  <div className="es-ln">
                    <div><label>Trilha</label>
                      <select value={aula.trilha_id} onChange={(e) => setAula({ ...aula, trilha_id: e.target.value })} required>
                        <option value="">Escolha…</option>
                        {d.trilhas.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                      </select></div>
                    <div><label>Título</label><input value={aula.titulo} onChange={(e) => setAula({ ...aula, titulo: e.target.value })} maxLength={140} required /></div>
                    <div><label>Ordem (1, 2, 3…)</label><input type="number" min="0" value={aula.ordem} onChange={(e) => setAula({ ...aula, ordem: e.target.value })} /></div>
                    <div><label>Minutos</label><input type="number" min="0" value={aula.duracao_min} onChange={(e) => setAula({ ...aula, duracao_min: e.target.value })} /></div>
                  </div>
                  <div className="es-ln">
                    <div><label>Link do vídeo no YouTube (opcional)</label><input value={aula.video_url} onChange={(e) => setAula({ ...aula, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" /></div>
                    <div><label>Resumo curto</label><input value={aula.resumo} onChange={(e) => setAula({ ...aula, resumo: e.target.value })} maxLength={300} /></div>
                  </div>
                  <label style={{ marginTop: 8 }}>Texto da aula (use “## ” para subtítulo e “- ” para lista)</label>
                  <textarea style={{ minHeight: 220 }} value={aula.conteudo} onChange={(e) => setAula({ ...aula, conteudo: e.target.value })} />
                  <div className="es-ln">
                    <label className="es-chk"><input type="checkbox" checked={aula.ativo} onChange={(e) => setAula({ ...aula, ativo: e.target.checked })} /> Publicada (aparece para os alunos)</label>
                    <span><button className="ea-btn" disabled={ocupado}>Salvar aula</button>{' '}
                      {aula.id && <button type="button" className="ea-btn ea-btn2" onClick={() => setAula(AULA0)}>Cancelar</button>}</span>
                  </div>
                </form>
                <div className="ea-card">
                  <h2>Aulas ({d.aulas.length})</h2>
                  <table className="es-tab"><thead><tr><th>Trilha</th><th>#</th><th>Título</th><th>Vídeo</th><th></th></tr></thead>
                    <tbody>{d.aulas.map((a) => (
                      <tr key={a.id}>
                        <td>{nomeTrilha(a.trilha_id)}</td><td>{a.ordem}</td>
                        <td>{a.titulo} {!a.ativo && <span className="ea-tag er">oculta</span>}</td>
                        <td>{a.video_url ? <span className="ea-tag ok">sim</span> : <span className="ea-tag">sem vídeo</span>}</td>
                        <td><button className="ea-btn ea-btn2" onClick={() => editarAula(a)}>Editar</button></td>
                      </tr>))}</tbody></table>
                </div>
              </>
            )}

            {aba === 'trilhas' && (
              <>
                <form className="ea-card" onSubmit={salvarTrilha}>
                  <h2>{trilha.id ? 'Editar trilha' : 'Nova trilha'}</h2>
                  <div className="es-ln">
                    <div><label>Título</label><input value={trilha.titulo} onChange={(e) => setTrilha({ ...trilha, titulo: e.target.value })} maxLength={100} required /></div>
                    <div><label>Ícone (emoji)</label><input value={trilha.icone} onChange={(e) => setTrilha({ ...trilha, icone: e.target.value })} maxLength={8} /></div>
                    <div><label>Ordem</label><input type="number" min="0" value={trilha.ordem} onChange={(e) => setTrilha({ ...trilha, ordem: e.target.value })} /></div>
                  </div>
                  <label style={{ marginTop: 8 }}>Descrição</label>
                  <textarea style={{ minHeight: 70 }} value={trilha.descricao} onChange={(e) => setTrilha({ ...trilha, descricao: e.target.value })} maxLength={400} />
                  <div className="es-ln">
                    <label className="es-chk"><input type="checkbox" checked={trilha.ativo} onChange={(e) => setTrilha({ ...trilha, ativo: e.target.checked })} /> Publicada</label>
                    <span><button className="ea-btn" disabled={ocupado}>Salvar trilha</button>{' '}
                      {trilha.id && <button type="button" className="ea-btn ea-btn2" onClick={() => setTrilha(TRILHA0)}>Cancelar</button>}</span>
                  </div>
                </form>
                <div className="ea-card">
                  <table className="es-tab"><thead><tr><th>#</th><th>Trilha</th><th>Aulas</th><th></th></tr></thead>
                    <tbody>{d.trilhas.map((t) => (
                      <tr key={t.id}><td>{t.ordem}</td><td>{t.icone} {t.titulo} {!t.ativo && <span className="ea-tag er">oculta</span>}</td>
                        <td>{d.aulas.filter((a) => a.trilha_id === t.id).length}</td>
                        <td><button className="ea-btn ea-btn2" onClick={() => editarTrilha(t)}>Editar</button></td></tr>))}</tbody></table>
                </div>
              </>
            )}

            {aba === 'alunos' && (
              <div className="ea-card">
                <h2>Alunos ({d.alunos.length})</h2>
                {temp && <p>Nova senha temporária de <b>{temp.nome}</b>: <span className="es-cod">{temp.senha}</span><br /><span className="ea-mu">Envie pelo WhatsApp. Ela não aparece de novo.</span></p>}
                <table className="es-tab"><thead><tr><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Aulas feitas</th><th></th></tr></thead>
                  <tbody>{d.alunos.map((a) => (
                    <tr key={a.id}>
                      <td>{a.nome} {!a.ativo && <span className="ea-tag er">bloqueado</span>}</td>
                      <td>{a.email}</td>
                      <td>{a.whatsapp ? <a href={`https://wa.me/55${a.whatsapp.replace(/^55/, '')}`} target="_blank" rel="noopener noreferrer">{a.whatsapp}</a> : '—'}</td>
                      <td>{a.aulas_feitas}</td>
                      <td>
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={async () => { const r = await acao({ acao: 'aluno_senha', id: a.id }); if (r && r.senha) setTemp({ nome: a.nome, senha: r.senha }); }}>Nova senha</button>{' '}
                        <button className={'ea-btn ea-btn2' + (a.ativo ? ' ea-btn-er' : '')} disabled={ocupado} onClick={() => acao({ acao: 'aluno_ativo', id: a.id, ativo: !a.ativo })}>{a.ativo ? 'Bloquear' : 'Liberar'}</button>
                      </td>
                    </tr>))}</tbody></table>
                {!d.alunos.length && <p className="ea-mu">Ainda não há alunos cadastrados.</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
