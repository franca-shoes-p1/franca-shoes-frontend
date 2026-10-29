import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { CATEGORIAS, QUOTA_CONVITES, META_POR_CIDADE, somaDias } from '../../lib/semanaCaptacao';
import { PRIMEIRA_FASE } from '../../lib/pontos';

const CSS = `
.cp-barra{height:12px;border-radius:99px;background:var(--bd);overflow:hidden;margin-top:6px}
.cp-barra i{display:block;height:100%;background:var(--ac)}
.cp-t{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--bd)}
.cp-t:first-of-type{border-top:0}
.cp-t.ok .cp-ti{text-decoration:line-through;opacity:.55}
.cp-ti{font-weight:600}
.cp-tag{display:inline-block;font-size:12px;padding:2px 8px;border-radius:99px;background:var(--bd);margin-right:6px}
.cp-tab{width:100%;border-collapse:collapse;font-size:14px}
.cp-tab th,.cp-tab td{padding:6px 8px;border-bottom:1px solid var(--bd);text-align:center}
.cp-tab th:first-child,.cp-tab td:first-child{text-align:left}
.cp-wrap{overflow-x:auto}
.cp-big{font-size:34px;font-weight:800;line-height:1}
.ea a.ea-btn{color:#fff}
`;
const fmt = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });

export default function Captacao() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [inicio, setInicio] = useState('');
  const [nova, setNova] = useState({ titulo: '', cidade: '', categoria: 'geral' });
  const [verTudo, setVerTudo] = useState(false);

  const carregar = useCallback(async () => {
    try { const x = await api('/api/admin/captacao'); setD(x); setInicio((v) => v || x.hoje); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { await fn(); if (ok) setMsg({ tipo: 'ok', texto: ok }); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); }); };
  const post = (corpo, ok) => rodar(() => api('/api/admin/captacao', { method: 'POST', body: corpo }), ok);

  const tarefas = d ? d.tarefas : [];
  const hoje = d ? d.hoje : '';
  const deHoje = tarefas.filter((t) => t.data_prevista === hoje);
  const atrasadas = tarefas.filter((t) => t.data_prevista < hoje && t.status === 'pendente');
  const Linha = ({ t }) => (
    <div className={`cp-t ${t.status === 'feito' ? 'ok' : ''}`}>
      <input type="checkbox" style={{ width: 22, height: 22, marginTop: 2 }} checked={t.status === 'feito'} disabled={ocupado} onChange={(e) => post({ acao: 'estado', id: t.id, status: e.target.checked ? 'feito' : 'pendente' })} aria-label="Marcar como feito" />
      <div style={{ flex: 1 }}>
        <div className="cp-ti"><span className="cp-tag">{CATEGORIAS[t.categoria] || 'Geral'}</span>{t.titulo}</div>
        {t.detalhe && <div className="ea-mu">{t.detalhe}</div>}
        <div className="ea-mu">{fmt(t.data_prevista)}{t.cidade ? ` · ${t.cidade}` : ''}</div>
      </div>
      {t.origem === 'manual' && <button className="ea-btn ea-btn2 ea-btn-er" disabled={ocupado} onClick={() => post({ acao: 'apagar', id: t.id })}>Apagar</button>}
    </div>
  );

  return (
    <div className="ea">
      <Head><title>Captação · Radar</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>Captação: semana de parceiros</h1>
        <div className="ea-mu">Meta: formar a primeira lista de parceiros nas capitais da primeira fase em 7 dias, sem arriscar o seu WhatsApp. Depois vem a viagem.</div>
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
          <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode o arquivo <b>supabase-captacao.sql</b> no Supabase (SQL Editor, New query, cole, Run) e recarregue esta página. O manual traz o passo a passo.</p></div>
        )}
        {fase === 'pronto' && d && !d.semSql && (
          <>
            {!d.inicio && (
              <div className="ea-card">
                <h2>Iniciar a semana de captação</h2>
                <p className="ea-mu">Cria as tarefas dos 7 dias para as 9 cidades: {PRIMEIRA_FASE.join(', ')}. Convites em rampa: {QUOTA_CONVITES.slice(1).join(', ')} por dia.</p>
                <label>Dia 1</label>
                <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado} onClick={() => post({ acao: 'iniciar', inicio }, 'Semana criada. As tarefas de hoje estão abaixo.')}>Criar as tarefas da semana</button></div>
              </div>
            )}
            {d.inicio && (
              <div className="ea-card">
                <h2>{d.dia >= 1 && d.dia <= 7 ? `Hoje é o dia ${d.dia} de 7` : d.dia < 1 ? `A semana começa em ${fmt(d.inicio)}` : 'A semana de captação terminou'}</h2>
                {d.dia >= 1 && (
                  <>
                    <div className="cp-big">{d.convitesHoje} <span style={{ fontSize: 18, fontWeight: 500 }}>de {d.quota} convites hoje</span></div>
                    <div className="cp-barra"><i style={{ width: `${d.quota ? Math.min(100, (d.convitesHoje / d.quota) * 100) : 0}%` }} /></div>
                    <div className="ea-mu" style={{ marginTop: 8 }}>
                      {d.quota === 0 ? 'Hoje é dia de montar a lista; não envie convites ainda.' : d.convitesHoje >= d.quota ? 'Meta de hoje batida. Pare por aqui e volte amanhã.' : 'Envie um por vez, com o texto pronto do Painel do dia. Se alguém reclamar ou o WhatsApp avisar de bloqueio, pare e volte a 10 por dia.'}
                    </div>
                  </>
                )}
                <div className="rd-acoes ea-row" style={{ marginTop: 12 }}>
                  <Link href="/admin/radar" className="ea-btn">Abrir o Painel do dia</Link>
                  <Link href="/admin/pontos" className="ea-btn ea-btn2">Mapa e pontos</Link>
                </div>
              </div>
            )}
            {d.inicio && (
              <div className="ea-card">
                <h2>Tarefas de hoje ({fmt(hoje)})</h2>
                {atrasadas.length > 0 && <div className="ea-msg er">Atrasadas: {atrasadas.length}. Estão no fim desta lista de hoje.</div>}
                {deHoje.length === 0 && atrasadas.length === 0 && <div className="ea-mu">Nada marcado para hoje.</div>}
                {[...deHoje, ...atrasadas].map((t) => <Linha key={t.id} t={t} />)}
              </div>
            )}

            <div className="ea-card">
              <h2>Funil por cidade</h2>
              <div className="ea-mu">Meta ao fim da semana: {META_POR_CIDADE} locais com WhatsApp ou e-mail em cada cidade.</div>
              <div className="cp-wrap"><table className="cp-tab">
                <thead><tr><th>Cidade</th><th>Locais</th><th>Com contato</th><th>Convidados</th><th>Autorizados</th><th>Ativos</th><th>Recusaram</th></tr></thead>
                <tbody>{d.funil.map((f) => (
                  <tr key={f.cidade}><td>{f.cidade}</td><td>{f.total}</td><td style={{ fontWeight: 700, color: f.comContato >= META_POR_CIDADE ? '#16a34a' : undefined }}>{f.comContato}</td><td>{f.convidado}</td><td>{f.autorizado}</td><td>{f.ativo}</td><td>{f.recusado}</td></tr>
                ))}</tbody>
              </table></div>
            </div>

            {d.inicio && (
              <div className="ea-card">
                <h2>A semana inteira</h2>
                <button className="ea-btn ea-btn2" onClick={() => setVerTudo(!verTudo)}>{verTudo ? 'Esconder' : 'Mostrar todas as tarefas'}</button>
                {verTudo && Array.from({ length: 7 }, (_, i) => somaDias(d.inicio, i)).map((dia, i) => (
                  <div key={dia} style={{ marginTop: 12 }}>
                    <b>Dia {i + 1} · {fmt(dia)}</b>
                    {tarefas.filter((t) => t.data_prevista === dia).map((t) => <Linha key={t.id} t={t} />)}
                  </div>
                ))}
                <div className="ea-mu" style={{ marginTop: 12 }}>Quer recomeçar com outra data? <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => { if (window.confirm('Apaga as tarefas ainda pendentes do plano e cria tudo de novo. As já feitas ficam. Continuar?')) post({ acao: 'iniciar', inicio: inicio || hoje }, 'Plano recriado.'); }}>Recriar a partir de</button> <input type="date" style={{ width: 'auto' }} value={inicio} onChange={(e) => setInicio(e.target.value)} /></div>
              </div>
            )}

            <div className="ea-card">
              <h2>Nova tarefa</h2>
              <label>O que precisa ser feito?</label>
              <input value={nova.titulo} onChange={(e) => setNova({ ...nova, titulo: e.target.value })} maxLength={160} />
              <div className="ea-row" style={{ marginTop: 8 }}>
                <select value={nova.categoria} onChange={(e) => setNova({ ...nova, categoria: e.target.value })} style={{ width: 'auto' }}>
                  {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={nova.cidade} onChange={(e) => setNova({ ...nova, cidade: e.target.value })} style={{ width: 'auto' }}>
                  <option value="">Todas as cidades</option>
                  {PRIMEIRA_FASE.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="ea-btn" disabled={ocupado || !nova.titulo.trim()} onClick={() => post({ acao: 'nova', ...nova }, 'Tarefa criada para hoje.').then(() => setNova({ titulo: '', cidade: '', categoria: 'geral' }))}>Adicionar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
