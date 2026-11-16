// Central de Projetos: todos os projetos, duas pistas (manual e automática) e geração de plano + página.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { TIPOS, STATUS } from '../../lib/centralModelos';

const CSS = `
.ce-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin:12px 0}
.ce-p{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:14px;cursor:pointer}
.ce-p.on{border:2px solid var(--ac)}
.ce-t{font-weight:800;font-size:17px}
.ce-b{height:8px;border-radius:99px;background:var(--bd);overflow:hidden;margin:6px 0}
.ce-b i{display:block;height:100%}
.ce-m{background:var(--ac)}.ce-a{background:#7c3aed}
.ce-sm{font-size:12px;color:var(--mu)}
.ce-tag{display:inline-block;font-size:11px;font-weight:700;border:1px solid var(--bd);border-radius:99px;padding:1px 9px;margin-left:6px}
.ce-pistas{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:760px){.ce-pistas{grid-template-columns:1fr}}
.ce-pista{background:var(--cd);border:1px solid var(--bd);border-radius:14px;padding:12px}
.ce-pista h3{margin:0 0 8px;font-size:16px}
.ce-et{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--mu);font-weight:700;margin:12px 0 4px}
.ce-tr{display:flex;gap:8px;align-items:flex-start;padding:8px;border:1px solid var(--bd);border-radius:10px;margin-bottom:6px}
.ce-tr button.st{flex:none;width:30px;height:30px;border-radius:50%;border:2px solid var(--bd);background:transparent;color:var(--tx);cursor:pointer;font-weight:800}
.ce-tr.fazendo button.st{border-color:var(--am);color:var(--am)}
.ce-tr.feita{opacity:.55}.ce-tr.feita button.st{background:var(--ok);border-color:var(--ok);color:#fff}
.ce-tr.feita .tt{text-decoration:line-through}
.ce-x{margin-left:auto;background:none;border:none;color:var(--mu);cursor:pointer;font-size:16px}
.ce-add{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.ce-add input{flex:1 1 240px;width:auto;min-width:0}.ce-add select,.ce-row select{width:auto}.ce-row input{width:auto}
`;
const ROT = { a_fazer: '', fazendo: '…', feita: '✓' };
const PROX = { a_fazer: 'fazendo', fazendo: 'feita', feita: 'a_fazer' };

export default function Central() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [sel, setSel] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [novo, setNovo] = useState({ nome: '', tipo: 'livro', resumo: '' });
  const [nt, setNt] = useState({ pista: 'manual', titulo: '' });

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/central')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function agir(corpo, ok) {
    setOcupado(true); setMsg(null);
    try { setD(await api('/api/admin/central', { method: 'POST', body: corpo })); if (ok) setMsg({ tipo: 'ok', texto: ok }); return true; }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); return false; }
    finally { setOcupado(false); }
  }
  const entrar = async (ev) => { ev.preventDefault(); setOcupado(true); try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); } setOcupado(false); };

  const pronto = fase === 'pronto' && d && !d.semSql;
  const projetos = pronto ? d.projetos : [];
  const atual = projetos.find((p) => p.id === sel) || null;
  const pct = (p, pista) => { const ts = p.tarefas.filter((t) => t.pista === pista); return ts.length ? Math.round((ts.filter((t) => t.status === 'feita').length / ts.length) * 100) : 0; };

  const Pista = ({ p, pista, titulo }) => {
    const ts = p.tarefas.filter((t) => t.pista === pista);
    const etapas = [...new Set(ts.map((t) => t.etapa))];
    return (
      <div className="ce-pista">
        <h3>{titulo} <span className="ce-sm">{ts.filter((t) => t.status === 'feita').length}/{ts.length}</span></h3>
        {!ts.length && <div className="ea-mu">Nenhuma tarefa nesta pista.</div>}
        {etapas.map((e) => (
          <div key={e}>
            <div className="ce-et">{e}</div>
            {ts.filter((t) => t.etapa === e).map((t) => (
              <div key={t.id} className={`ce-tr ${t.status === 'fazendo' ? 'fazendo' : t.status === 'feita' ? 'feita' : ''}`}>
                <button className="st" disabled={ocupado} onClick={() => agir({ acao: 'tarefa_status', id: t.id, status: PROX[t.status] })} title="Mudar status">{ROT[t.status]}</button>
                <span className="tt">{t.titulo}</span>
                <button className="ce-x" onClick={() => agir({ acao: 'tarefa_del', id: t.id })} title="Apagar" aria-label="Apagar">×</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="ea">
      <Head><title>Central de Projetos · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>Central de Projetos</h1>
        <div className="ea-mu">Todos os projetos num lugar só, cada um com duas pistas: o que você faz (manual) e o que o n8n e a IA fazem (automática).</div>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2><label>Senha do painel</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Entrar</button></div>
          </form>
        )}
        {fase === 'pronto' && d && d.semSql && (
          <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o SQL da central no Supabase (arquivo <b>supabase-central.sql</b>) e recarregue esta página.</p></div>
        )}

        {pronto && (
          <>
            <div className="ea-card">
              <h2>Novo projeto com um clique</h2>
              <div className="ea-mu" style={{ marginBottom: 8 }}>Escolha o tipo: o sistema monta as etapas, as tarefas nas duas pistas e o rascunho da página do projeto.</div>
              <div className="ea-row ce-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <input placeholder="Nome do projeto" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} style={{ flex: '1 1 200px' }} />
                <select value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.e} {v.nome}</option>)}</select>
                <input placeholder="Resumo em uma frase" value={novo.resumo} onChange={(e) => setNovo({ ...novo, resumo: e.target.value })} style={{ flex: '2 1 260px' }} />
                <button className="ea-btn" disabled={ocupado} onClick={async () => { if (await agir({ acao: 'criar', ...novo }, 'Projeto criado com o plano pronto.')) setNovo({ ...novo, nome: '', resumo: '' }); }}>Gerar plano</button>
              </div>
              <div style={{ marginTop: 10 }}><button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => agir({ acao: 'semear' }, 'Projetos das conversas carregados (os que já existiam foram mantidos).')}>📥 Carregar projetos das conversas (Livros, Pedido de Construção, Atendente)</button></div>
            </div>

            {!projetos.length && <div className="ea-card">Nenhum projeto ainda. Use o botão acima para carregar os das conversas ou crie um novo.</div>}
            <div className="ce-grade">
              {projetos.map((p) => (
                <div key={p.id} className={`ce-p ${sel === p.id ? 'on' : ''}`} onClick={() => setSel(sel === p.id ? null : p.id)}>
                  <div className="ce-t">{p.emoji} {p.nome}<span className="ce-tag">{STATUS[p.status]}</span></div>
                  <div className="ce-sm">{p.resumo}</div>
                  <div className="ce-sm" style={{ marginTop: 6 }}>✋ Manual {pct(p, 'manual')}%</div><div className="ce-b"><i className="ce-m" style={{ width: `${pct(p, 'manual')}%` }} /></div>
                  <div className="ce-sm">🤖 Automática {pct(p, 'auto')}%</div><div className="ce-b"><i className="ce-a" style={{ width: `${pct(p, 'auto')}%` }} /></div>
                  {p.proximo_passo && <div style={{ fontSize: 13, marginTop: 6 }}><b>Próximo:</b> {p.proximo_passo}</div>}
                </div>
              ))}
            </div>

            {atual && (
              <div className="ea-card">
                <div className="ea-row" style={{ justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0 }}>{atual.emoji} {atual.nome}</h2>
                  <div className="ea-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <select value={atual.status} onChange={(e) => agir({ acao: 'projeto_editar', id: atual.id, status: e.target.value })}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    {atual.link_site && <a className="ea-btn ea-btn2" href={atual.link_site} target="_blank" rel="noopener noreferrer">Ver no site</a>}
                  </div>
                </div>
                <label style={{ marginTop: 10 }}>Próximo passo</label>
                <input defaultValue={atual.proximo_passo || ''} key={atual.id + (atual.atualizado_em || '')} onBlur={(e) => e.target.value !== (atual.proximo_passo || '') && agir({ acao: 'projeto_editar', id: atual.id, proximo_passo: e.target.value })} style={{ width: '100%' }} />

                <div className="ce-pistas" style={{ marginTop: 14 }}>
                  <Pista p={atual} pista="manual" titulo="✋ Pista manual (você faz)" />
                  <Pista p={atual} pista="auto" titulo="🤖 Pista automática (n8n e IA)" />
                </div>
                <div className="ce-add">
                  <select value={nt.pista} onChange={(e) => setNt({ ...nt, pista: e.target.value })}><option value="manual">Manual</option><option value="auto">Automática</option></select>
                  <input placeholder="Nova tarefa" value={nt.titulo} onChange={(e) => setNt({ ...nt, titulo: e.target.value })} />
                  <button className="ea-btn" disabled={ocupado} onClick={async () => { if (await agir({ acao: 'tarefa_add', projeto: atual.id, ...nt })) setNt({ ...nt, titulo: '' }); }}>Adicionar</button>
                </div>

                <h3 style={{ marginTop: 18 }}>Página do projeto no site</h3>
                <div className="ea-mu">Rascunho gerado pelo modelo. Só fica visível quando você publicar, e sempre sem indexação no Google.</div>
                <div className="ea-row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => agir({ acao: 'gerar_pagina', id: atual.id }, 'Rascunho da página gerado de novo.')}>Gerar a página de novo</button>
                  <button className="ea-btn" disabled={ocupado} onClick={() => agir({ acao: 'projeto_editar', id: atual.id, publicado: !atual.publicado }, atual.publicado ? 'Página despublicada.' : 'Página publicada.')}>{atual.publicado ? 'Despublicar' : 'Publicar a página'}</button>
                  {atual.publicado && <a className="ea-btn ea-btn2" href={`/projeto/${atual.slug}`} target="_blank" rel="noopener noreferrer">Abrir /projeto/{atual.slug}</a>}
                  <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => { if (window.confirm('Apagar este projeto e as tarefas?')) { setSel(null); agir({ acao: 'projeto_del', id: atual.id }, 'Projeto apagado.'); } }}>Apagar projeto</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
