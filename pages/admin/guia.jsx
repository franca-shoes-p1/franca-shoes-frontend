// Guia ponta a ponta para captar fábricas: passo a passo com pontos, fila de hoje e lista de fábricas.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { FASES, PASSOS, TOTAL_PONTOS } from '../../lib/guiaFornecedores';
import { STATUS_LEAD, MENSAGENS, mensagemDo, linkZap } from '../../lib/leadsFornecedores';

const CSS = `
.gd-barra{height:14px;border-radius:99px;background:var(--bd);overflow:hidden;margin-top:8px}
.gd-barra i{display:block;height:100%;background:var(--ok)}
.gd-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.gd-tabs button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.gd-tabs button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.gd-fase{margin:18px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--mu);font-weight:700}
.gd-p{display:flex;gap:12px;align-items:flex-start;padding:12px;border:1px solid var(--bd);border-radius:12px;background:var(--cd);margin-bottom:8px}
.gd-n{flex:none;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;background:var(--ac);color:#fff}
.gd-t{font-weight:700}
.gd-sinal{flex:none;margin-left:auto;font-weight:800;font-size:15px;white-space:nowrap}
.gd-p.pend .gd-sinal{color:var(--er)}
.gd-p.feito{opacity:.55;background:transparent}
.gd-p.feito .gd-n{background:#94a3b8}
.gd-p.feito .gd-t,.gd-p.feito .gd-n,.gd-p.feito .gd-como{text-decoration:line-through;color:var(--mu)}
.gd-p.feito .gd-sinal{color:var(--ok);opacity:1}
.gd-p.atual{border:2px solid var(--ac)}
.gd-pts{display:inline-block;font-size:12px;background:var(--bd);border-radius:99px;padding:1px 8px;margin-left:8px;font-weight:600}
.gd-ia{background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:10px;margin-top:8px;white-space:pre-wrap}
.gd-msg{width:100%;min-height:110px;font-size:14px}
.ea a.ea-btn{color:#fff}.ea a.ea-btn2{color:var(--ac)}
`;
const data = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');

export default function GuiaFornecedores() {
  const [fase, setFase] = useState('carregando');
  const [g, setG] = useState(null);
  const [L, setL] = useState({ leads: [], fila: [] });
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('guia');
  const [pergunta, setPergunta] = useState('');
  const [ia, setIa] = useState('');
  const [lote, setLote] = useState('');
  const [txt, setTxt] = useState({});
  const [filtro, setFiltro] = useState('todos');

  const carregar = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api('/api/admin/guia'), api('/api/admin/leads')]);
      setG(a); setL(b); setFase('pronto');
    } catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function agirGuia(corpo, ok) {
    setOcupado(true); setMsg(null);
    try { setG(await api('/api/admin/guia', { method: 'POST', body: corpo })); setIa(''); setPergunta(''); if (ok) setMsg({ tipo: 'ok', texto: ok }); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    finally { setOcupado(false); }
  }
  async function agirLeads(corpo, ok) {
    setOcupado(true); setMsg(null);
    try {
      const j = await api('/api/admin/leads', { method: 'POST', body: corpo });
      setL(j);
      if (j.mapa) setMsg(j.mapa.erro ? { tipo: 'er', texto: j.mapa.erro } : { tipo: 'ok', texto: `Mapa: ${j.mapa.encontrados} encontrada(s), ${j.mapa.novos} nova(s) na lista.` });
      else if (ok) setMsg({ tipo: 'ok', texto: ok });
      setG(await api('/api/admin/guia'));
      return true;
    } catch (e) { setMsg({ tipo: 'er', texto: e.message }); return false; }
    finally { setOcupado(false); }
  }
  async function perguntar(passo) {
    setOcupado(true); setMsg(null); setIa('');
    try { const j = await api('/api/admin/guia', { method: 'POST', body: { acao: 'ia', passo, pergunta } }); setIa(j.resposta || ''); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    finally { setOcupado(false); }
  }
  const entrar = async (ev) => { ev.preventDefault(); setOcupado(true); try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); } setOcupado(false); };

  const pronto = fase === 'pronto' && g && !g.semSql;
  const feito = (p) => !!(g && ((g.manual && g.manual[p.id]) || (p.auto && g.auto && g.auto[p.auto])));
  const atual = pronto ? PASSOS.find((p) => !feito(p)) : null;
  const ganhos = pronto ? PASSOS.filter(feito).reduce((s, p) => s + p.pontos, 0) : 0;
  const nFeitos = pronto ? PASSOS.filter(feito).length : 0;
  const ultimoManual = pronto ? [...PASSOS].reverse().find((p) => g.manual && g.manual[p.id]) : null;
  const leads = L.leads || [];
  const lista = filtro === 'todos' ? leads : leads.filter((l) => l.status === filtro);

  return (
    <div className="ea">
      <Head><title>Guia de fornecedores · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>Guia de fornecedores</h1>
        <div className="ea-mu">Do primeiro contato ao primeiro pedido entregue. O sistema marca sozinho o que já foi cumprido.</div>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2><label>Senha do painel</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Entrar</button></div>
          </form>
        )}
        {fase === 'pronto' && g && g.semSql && (
          <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o SQL do guia no Supabase (arquivo <b>supabase-leads-guia.sql</b>) e recarregue esta página.</p></div>
        )}

        {pronto && (
          <>
            <div className="ea-card">
              <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                <div><b style={{ fontSize: 28 }}>{ganhos}</b> <span className="ea-mu">de {TOTAL_PONTOS} pontos</span></div>
                <div className="ea-mu">{nFeitos} de {PASSOS.length} passos cumpridos</div>
              </div>
              <div className="gd-barra"><i style={{ width: `${Math.round((ganhos / TOTAL_PONTOS) * 100)}%` }} /></div>
              {!atual && <p style={{ margin: '10px 0 0' }}><b>🎉 Todos os passos cumpridos.</b> Agora é manter o relacionamento com as fábricas.</p>}
            </div>

            <div className="gd-tabs">
              {[['guia', '🧭 Passo a passo'], ['fila', `📅 Fila de hoje (${(L.fila || []).length})`], ['fabricas', `🏭 Fábricas (${leads.length})`]].map(([k, t]) => <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{t}</button>)}
            </div>

            {aba === 'guia' && FASES.map((f) => (
              <div key={f.id}>
                <div className="gd-fase">{f.nome}</div>
                {PASSOS.filter((p) => p.fase === f.id).map((p) => {
                  const n = PASSOS.indexOf(p) + 1;
                  const ok = feito(p);
                  const cur = atual && atual.id === p.id;
                  return (
                    <div key={p.id} className={`gd-p ${ok ? 'feito' : 'pend'} ${cur ? 'atual' : ''}`}>
                      <div className="gd-n">{n}</div>
                      <div style={{ flex: 1 }}>
                        <div className="gd-t">{p.titulo}<span className="gd-pts">{p.pontos} pts</span></div>
                        {(cur || !ok) && <div className="gd-como ea-mu" style={{ marginTop: 4 }}>{p.como}</div>}
                        {ok && <div className="ea-mu" style={{ marginTop: 2 }}>{g.manual && g.manual[p.id] ? `Marcado em ${data(g.manual[p.id])}` : 'Cumprido (verificado pelo sistema)'}</div>}
                        {cur && (
                          <div style={{ marginTop: 8 }}>
                            <div className="ea-row">
                              {p.link && <Link href={p.link} className="ea-btn ea-btn2">Abrir</Link>}
                              <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => agirGuia({ acao: 'marcar', passo: p.id }, 'Passo cumprido!')}>Marcar como cumprido</button>
                            </div>
                            <div className="ea-row" style={{ marginTop: 10 }}>
                              <input style={{ flex: '1 1 240px' }} placeholder="Dúvida sobre este passo? (opcional)" value={pergunta} onChange={(e) => setPergunta(e.target.value)} maxLength={500} />
                              <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => perguntar(p.id)}>🤖 Perguntar à IA</button>
                            </div>
                            {ia && <div className="gd-ia">{ia}</div>}
                          </div>
                        )}
                        {ok && ultimoManual && ultimoManual.id === p.id && <div style={{ marginTop: 6 }}><button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => agirGuia({ acao: 'desfazer', passo: p.id }, 'Passo reaberto.')}>Desfazer</button></div>}
                      </div>
                      <div className="gd-sinal">{ok ? '✔ +' : '✖ −'}</div>
                    </div>
                  );
                })}
              </div>
            ))}

            {aba === 'fila' && (
              <>
                <div className="ea-card ea-mu">Até 15 por dia, para o WhatsApp não bloquear o seu número. Toque em “Abrir WhatsApp”, envie a mensagem pronta e depois marque “Enviei”. Quem não responde em 3 dias volta aqui com o texto de retorno.</div>
                {(L.fila || []).length === 0 && <div className="ea-card">Fila vazia. Cadastre fábricas com WhatsApp na aba “Fábricas”.</div>}
                {(L.fila || []).map((l) => {
                  const m = txt[l.id] ?? mensagemDo(l);
                  return (
                    <div key={l.id} className="ea-card">
                      <b>{l.nome}</b> <span className="ea-mu">· nota {l.nota}/10 · {l.abordagens ? `retorno nº ${l.abordagens}` : 'primeiro contato'}{l.instagram ? ` · ${l.instagram}` : ''}</span>
                      <textarea className="gd-msg" style={{ marginTop: 8 }} value={m} onChange={(e) => setTxt({ ...txt, [l.id]: e.target.value })} />
                      <div className="ea-row" style={{ marginTop: 8 }}>
                        <a className="ea-btn" href={linkZap(l.whatsapp, m)} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
                        <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => agirLeads({ acao: 'abordei', id: l.id }, 'Registrado. Retorno em 3 dias.')}>Enviei</button>
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => agirLeads({ acao: 'estado', id: l.id, estado: 'descartado' }, 'Descartada.')}>Descartar</button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {aba === 'fabricas' && (
              <>
                <div className="ea-card">
                  <h2>Adicionar fábricas</h2>
                  <p className="ea-mu">Uma por linha: <b>Nome; WhatsApp; Instagram; E-mail</b> (só o nome é obrigatório). Fábricas repetidas são ignoradas.</p>
                  <textarea value={lote} onChange={(e) => setLote(e.target.value)} placeholder={'Calçados Exemplo; 16 99999-9999; @exemplo\nOutra Fábrica; 16 98888-7777'} />
                  <div className="ea-row" style={{ marginTop: 10 }}>
                    <button className="ea-btn" disabled={ocupado || !lote.trim()} onClick={async () => { if (await agirLeads({ acao: 'lote', texto: lote }, 'Fábricas adicionadas.')) setLote(''); }}>Adicionar</button>
                    <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => agirLeads({ acao: 'mapa' })}>🗺️ Buscar no mapa (Franca)</button>
                  </div>
                </div>
                <div className="gd-tabs">
                  {['todos', ...Object.keys(STATUS_LEAD)].map((k) => <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{k === 'todos' ? 'Todas' : STATUS_LEAD[k][0]}</button>)}
                </div>
                {lista.length === 0 && <div className="ea-card">Nenhuma fábrica nesta lista.</div>}
                {lista.map((l) => (
                  <div key={l.id} className="ea-card">
                    <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                      <b>{l.nome}</b>
                      <select style={{ width: 150 }} value={l.status} onChange={(e) => agirLeads({ acao: 'estado', id: l.id, estado: e.target.value }, 'Status atualizado.')}>
                        {Object.entries(STATUS_LEAD).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
                      </select>
                    </div>
                    <div className="ea-mu">nota {l.nota}/10 · {l.origem}{l.whatsapp ? ` · WhatsApp ${l.whatsapp}` : ' · sem WhatsApp'}{l.instagram ? ` · ${l.instagram}` : ''}{l.email ? ` · ${l.email}` : ''}{l.endereco ? ` · ${l.endereco}` : ''}{l.abordagens ? ` · ${l.abordagens} abordagem(ns)` : ''}</div>
                    <div className="ea-row" style={{ marginTop: 8 }}>
                      {l.whatsapp && <a className="ea-btn ea-btn2" href={linkZap(l.whatsapp, MENSAGENS.completo(l.nome))} target="_blank" rel="noopener noreferrer">WhatsApp: explicação completa</a>}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
