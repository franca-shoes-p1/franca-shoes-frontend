import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import { FONTES, NOME_STATUS, linkWhats } from '../../lib/atendimento';

const CSS = `
.at-filtros{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.at-f{padding:7px 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--tx);font:inherit;cursor:pointer}
.at-f.on{background:var(--ac);border-color:var(--ac);color:#fff}
.at-topo{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between}
.at-txt{margin-top:8px;white-space:pre-wrap;word-break:break-word}
.at-lin{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}
.at-lin select{width:auto}
.at-nota{margin-top:10px}
.at-nota textarea{min-height:60px}
`;

const quando = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};
const corStatus = (fonte, st) => (FONTES[fonte].fechados.includes(st) ? 'ok' : st === FONTES[fonte].novo ? 'er' : 'am');

export default function AdminAtendimento() {
  const [fase, setFase] = useState('carregando');
  const [itens, setItens] = useState([]);
  const [faltando, setFaltando] = useState([]);
  const [filtro, setFiltro] = useState('abertos'); // abertos | todos
  const [fonte, setFonte] = useState('todas');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [notas, setNotas] = useState({}); // rascunhos de nota por item

  const carregar = useCallback(async () => {
    try {
      const d = await api('/api/admin/atendimento');
      setItens(d.itens || []);
      setFaltando(d.faltando || []);
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); }
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => {
    if (fase !== 'pronto') return undefined;
    const t = setInterval(carregar, 60000); // atualiza sozinho a cada minuto
    return () => clearInterval(t);
  }, [fase, carregar]);

  async function entrar(ev) {
    ev.preventDefault();
    setOcupado(true); setMsg(null);
    try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }
  async function sair() {
    await api('/api/admin/logout', { method: 'POST', body: {} });
    setItens([]); setFase('login');
  }
  async function salvar(it, mudanca, okTexto) {
    setOcupado(true); setMsg(null);
    try {
      await api('/api/admin/atendimento', { method: 'PATCH', body: { fonte: it.fonte, id: it.id, ...mudanca } });
      if (okTexto) setMsg({ tipo: 'ok', texto: okTexto });
      await carregar();
    } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }

  const aberto = (it) => !FONTES[it.fonte].fechados.includes(it.status);
  const novos = itens.filter((it) => it.status === FONTES[it.fonte].novo).length;
  const lista = itens.filter((it) => (filtro === 'todos' || aberto(it)) && (fonte === 'todas' || it.fonte === fonte));

  return (
    <div className="ea">
      <Head><title>Atendimento · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <div className="at-topo">
          <div>
            <h1>Atendimento</h1>
            <div className="ea-mu">Tudo que chega pelo site, numa lista só: mensagens, pedidos do Ateliê e candidatos. {novos > 0 ? <b>{novos} novo(s) sem resposta.</b> : 'Nada novo agora.'}</div>
          </div>
          <div className="ea-row">
            <Link href="/admin/operadores" className="ea-btn ea-btn2">Operadores</Link>
            {fase === 'pronto' && <button className="ea-btn ea-btn2" onClick={carregar}>Atualizar</button>}
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
            {faltando.length > 0 && (
              <div className="ea-msg er">
                Não consegui ler: {faltando.join(', ')}. Provavelmente falta rodar o arquivo SQL correspondente no Supabase (veja o GUIA-ATENDIMENTO.md).
              </div>
            )}

            <div className="at-filtros">
              <button className={`at-f ${filtro === 'abertos' ? 'on' : ''}`} onClick={() => setFiltro('abertos')}>Em aberto</button>
              <button className={`at-f ${filtro === 'todos' ? 'on' : ''}`} onClick={() => setFiltro('todos')}>Todos</button>
              <span style={{ width: 12 }} />
              <button className={`at-f ${fonte === 'todas' ? 'on' : ''}`} onClick={() => setFonte('todas')}>Todos os tipos</button>
              {Object.keys(FONTES).map((k) => (
                <button key={k} className={`at-f ${fonte === k ? 'on' : ''}`} onClick={() => setFonte(k)}>{FONTES[k].rotulo}</button>
              ))}
            </div>

            {lista.length === 0 && <div className="ea-card ea-mu">Nada por aqui.</div>}

            {lista.map((it) => {
              const chave = `${it.fonte}:${it.id}`;
              const zap = linkWhats(it.whatsapp, `Olá, ${it.nome}! Aqui é da Igreja Eco, recebemos a sua mensagem pelo site.`);
              const nota = notas[chave] !== undefined ? notas[chave] : it.nota_interna;
              return (
                <div className="ea-card" key={chave}>
                  <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ margin: 0 }}>{it.nome}{it.numero ? ` · nº ${it.numero}` : ''}</h2>
                      <div className="ea-mu">{FONTES[it.fonte].rotulo} · {quando(it.criado_em)}</div>
                    </div>
                    <span className={`ea-tag ${corStatus(it.fonte, it.status)}`}>{NOME_STATUS[it.status] || it.status}</span>
                  </div>
                  <div style={{ marginTop: 8 }}><b>{it.titulo}</b></div>
                  {it.texto && <div className="at-txt">{it.texto}</div>}
                  {it.extra && <div className="ea-mu" style={{ marginTop: 6 }}>{it.extra}</div>}

                  <div className="at-lin">
                    {zap && <a className="ea-btn ea-btn-ok" href={zap} target="_blank" rel="noopener noreferrer">Responder no WhatsApp</a>}
                    {it.email && <a className="ea-btn ea-btn2" href={`mailto:${it.email}?subject=${encodeURIComponent('Re: ' + it.titulo)}`}>Responder por e-mail</a>}
                    <select value={it.status} disabled={ocupado} onChange={(e) => salvar(it, { status: e.target.value })} aria-label="Status">
                      {FONTES[it.fonte].status.map((st) => <option key={st} value={st}>{NOME_STATUS[st] || st}</option>)}
                    </select>
                  </div>

                  <div className="at-nota">
                    <label>Nota interna (só você vê)</label>
                    <textarea value={nota} maxLength={1000} onChange={(e) => setNotas({ ...notas, [chave]: e.target.value })} />
                    {notas[chave] !== undefined && notas[chave] !== it.nota_interna && (
                      <div style={{ marginTop: 8 }}>
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={async () => { await salvar(it, { nota_interna: notas[chave] }, 'Nota salva.'); setNotas((n) => { const c = { ...n }; delete c[chave]; return c; }); }}>Salvar nota</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
