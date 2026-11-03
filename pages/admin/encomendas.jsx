// Encomendas da Entrega em Casa: ver cada pedido, cotar, mudar a situação, avisar o cliente e acompanhar as cidades.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import {
  STATUS_ENC, LISTA_STATUS_ENC, rotuloEnc, MIN_CIDADE, CONFIRMADOS, ENCERRADOS, CATEGORIA_ROTULO, PACOTE_ROTULO,
} from '../../lib/encomendas';

const CSS = `
.en-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.en-tabs button,.en-chips button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.en-tabs button.on,.en-chips button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.en-chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.en-chips button{padding:5px 12px;font-size:13px}
.en-it{border-top:1px solid var(--bd);padding:12px 0}
.en-it:first-child{border-top:0}
.en-top{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;cursor:pointer}
.en-tit{font-weight:700}
.en-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:10px}
.en-det{margin-top:10px;padding:12px;background:var(--bg);border:1px solid var(--bd);border-radius:10px}
.en-li{font-size:14px;margin:3px 0}
.en-bar{height:10px;border-radius:999px;background:var(--bd);overflow:hidden;margin-top:6px}
.en-bar i{display:block;height:100%;background:var(--ok)}
`;
const dt = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') + ' ' + new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const zapNum = (w) => { const d = String(w || '').replace(/\D/g, ''); return d.startsWith('55') ? d : '55' + d; };
const zapLink = (w, t) => `https://wa.me/${zapNum(w)}?text=${encodeURIComponent(t)}`;
const HORARIO = { qualquer: 'qualquer horário', manha: 'manhã', tarde: 'tarde', noite: 'noite' };

function mensagem(e) {
  const nome = e.nome.split(' ')[0];
  const base = `Olá, ${nome}! Aqui é da Entrega em Casa, sobre a sua encomenda ${e.codigo}. `;
  if (e.status === 'aguardando_cotacao') return base + 'Estamos procurando o melhor preço para o seu pedido e já avisamos.';
  if (e.status === 'cotado') {
    return base + (e.preco_cotado ? `O preço ficou em ${brl(e.preco_cotado)} por unidade, pago em dinheiro só na visita, depois de provar. ` : '') + 'Para seguir, confirme em https://www.igreja.eco.br/minha-encomenda?c=' + e.codigo + ' (ou responda aqui). Você pode desistir quando quiser.';
  }
  if (e.status === 'aguardando_lote') return base + 'Seu pedido está na fila do lote mínimo da fábrica. Assim que fechar, avisamos por aqui.';
  if (e.status === 'lote_fechado' || e.status === 'comprado') return base + 'O lote fechou e a compra está andando. Em breve combinamos a rota e o horário da visita.';
  if (e.status === 'rota_agendada' || e.status === 'visita_confirmada') return base + `A rota da sua cidade está marcada. Vamos combinar o horário da visita (você prefere ${HORARIO[e.melhor_horario] || 'qualquer horário'}).`;
  if (e.status === 'entregue') return base + 'Obrigado por provar o produto! Está tudo certo? Se precisar de troca, é só falar.';
  return base + 'Posso ajudar em algo?';
}

export default function AdminEncomendas() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('encomendas');
  const [filtro, setFiltro] = useState('');
  const [aberto, setAberto] = useState('');
  const [ed, setEd] = useState({});

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/encomendas')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const entrar = async (ev) => {
    ev.preventDefault(); setOcupado(true);
    try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const salvar = async (id) => {
    setOcupado(true); setMsg(null);
    try { const j = await api('/api/admin/encomendas', { method: 'POST', body: { acao: 'atualizar', id, ...(ed[id] || {}) } }); setD(j); setEd((x) => ({ ...x, [id]: {} })); setMsg({ tipo: 'ok', texto: j.aviso || 'Salvo.' }); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const campo = (id, k, v) => setEd((x) => ({ ...x, [id]: { ...(x[id] || {}), [k]: v } }));
  const val = (e, k) => (ed[e.id] && ed[e.id][k] !== undefined ? ed[e.id][k] : (e[k] ?? ''));

  const lista = d ? d.encomendas : [];
  const n = (s) => lista.filter((e) => e.status === s).length;
  const visiveis = filtro ? lista.filter((e) => e.status === filtro) : lista;

  const cidades = {};
  lista.filter((e) => !ENCERRADOS.includes(e.status)).forEach((e) => {
    const k = `${e.uf}|${e.cidade.trim().toLowerCase()}`;
    const c = cidades[k] || (cidades[k] = { cidade: e.cidade, uf: e.uf, ativos: 0, confirmados: 0, pares: 0 });
    c.ativos += 1; c.pares += e.quantidade || 0;
    if (CONFIRMADOS.includes(e.status)) c.confirmados += 1;
  });
  const listaCidades = Object.values(cidades).sort((a, b) => b.confirmados - a.confirmados || b.ativos - a.ativos);

  return (
    <>
      <Head><title>Encomendas | Painel</title><meta name="robots" content="noindex" /></Head>
      <div className="ea">
        <style>{ADMIN_CSS}{CSS}</style>
        <div className="ea-in">
          <AdminNav />
          <h1>Encomendas da Entrega em Casa</h1>
          <div className="ea-mu">Veja cada encomenda do formulário /encomendar, anote a cotação, mude a situação e avise o cliente pelo WhatsApp. A aba Cidades mostra quais já chegaram ao mínimo para entrar na rota.</div>

          {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
          {fase === 'login' && (
            <form className="ea-card" onSubmit={entrar}>
              <h2>Entrar</h2><label>Senha do painel</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
              <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Entrar</button></div>
            </form>
          )}
          {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

          {fase === 'pronto' && d && (
            <>
              <div className="ea-card">
                <div className="ea-row">
                  <span className="ea-tag am">{n('aguardando_cotacao')} aguardando cotação</span>
                  <span className="ea-tag am">{n('aguardando_lote')} aguardando lote</span>
                  <span className="ea-tag ok">{n('lote_fechado') + n('comprado')} lote fechado ou comprado</span>
                  <span className="ea-tag ok">{n('rota_agendada') + n('visita_confirmada')} com rota</span>
                  <span className="ea-tag">{lista.length} no total</span>
                </div>
              </div>

              <div className="en-tabs">
                <button className={aba === 'encomendas' ? 'on' : ''} onClick={() => setAba('encomendas')}>📝 Encomendas</button>
                <button className={aba === 'cidades' ? 'on' : ''} onClick={() => setAba('cidades')}>🗺️ Cidades</button>
              </div>

              {aba === 'encomendas' && (
                <div className="ea-card">
                  <div className="en-chips">
                    <button className={filtro === '' ? 'on' : ''} onClick={() => setFiltro('')}>Todas</button>
                    {LISTA_STATUS_ENC.map((s) => <button key={s} className={filtro === s ? 'on' : ''} onClick={() => setFiltro(s)}>{rotuloEnc(s)} ({n(s)})</button>)}
                  </div>
                  {!visiveis.length && <div className="ea-mu">Nenhuma encomenda aqui ainda.</div>}
                  {visiveis.map((e) => {
                    const st = STATUS_ENC[e.status] || { rotulo: e.status, cor: '' };
                    return (
                      <div key={e.id} className="en-it">
                        <div className="en-top" onClick={() => setAberto(aberto === e.id ? '' : e.id)}>
                          <div>
                            <span className="en-tit">{e.codigo} · {e.nome}</span>{' '}
                            <span className={`ea-tag ${st.cor}`}>{st.rotulo}</span>{' '}
                            <span className="ea-tag">📍 {e.cidade}-{e.uf}</span>
                          </div>
                          <div className="ea-mu">{dt(e.criado_em)} · {e.quantidade}x {String(e.produto).slice(0, 40)}</div>
                        </div>
                        {aberto === e.id && (
                          <div className="en-det">
                            <div className="en-li"><b>{CATEGORIA_ROTULO[e.categoria] || e.categoria}:</b> {e.produto}</div>
                            <div className="en-li">Numeração: {e.numeracao || 'não informada'} · Quantidade: {e.quantidade}</div>
                            {e.referencia && <div className="en-li">Referência: {/^https:\/\//i.test(e.referencia) ? <a href={e.referencia} target="_blank" rel="noopener noreferrer">{e.referencia}</a> : e.referencia}</div>}
                            <div className="en-li">📱 {e.whatsapp}{e.email ? ` · 📧 ${e.email}` : ''}</div>
                            <div className="en-li">🏠 {e.endereco}{e.bairro ? ` · ${e.bairro}` : ''} · {e.cidade}-{e.uf} · prefere {HORARIO[e.melhor_horario] || e.melhor_horario}</div>
                            {(e.interesse_pacote || []).length > 0 && <div className="en-li">🧰 Quer saber do pacote: {e.interesse_pacote.map((p) => PACOTE_ROTULO[p] || p).join(', ')}</div>}
                            <div className="en-g">
                              <div><label>Situação</label>
                                <select value={val(e, 'status')} onChange={(ev) => campo(e.id, 'status', ev.target.value)}>
                                  {LISTA_STATUS_ENC.map((s) => <option key={s} value={s}>{rotuloEnc(s)}</option>)}
                                </select></div>
                              <div><label>Preço cotado por unidade (R$)</label>
                                <input inputMode="decimal" value={val(e, 'preco_cotado')} onChange={(ev) => campo(e.id, 'preco_cotado', ev.target.value)} /></div>
                              <div><label>Empresa sugerida (Franca)</label>
                                <input value={val(e, 'empresa_sugerida')} onChange={(ev) => campo(e.id, 'empresa_sugerida', ev.target.value)} /></div>
                            </div>
                            <div style={{ marginTop: 10 }}><label>Observação interna</label>
                              <textarea style={{ minHeight: 70 }} value={val(e, 'observacao')} onChange={(ev) => campo(e.id, 'observacao', ev.target.value)} /></div>
                            <div className="ea-row" style={{ marginTop: 10 }}>
                              <button className="ea-btn" disabled={ocupado || !ed[e.id] || !Object.keys(ed[e.id]).length} onClick={() => salvar(e.id)}>Salvar</button>
                              <a className="ea-btn ea-btn2" href={zapLink(e.whatsapp, mensagem({ ...e, ...(ed[e.id] || {}) }))} target="_blank" rel="noopener noreferrer">Avisar pelo WhatsApp</a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {aba === 'cidades' && (
                <div className="ea-card">
                  <h2>Cidades e mínimo para a rota</h2>
                  <div className="ea-mu">Uma cidade entra na rota com {MIN_CIDADE} visitas confirmadas (quem aceitou a cotação, pelo site ou pelo WhatsApp, e segue na fila). Valor inicial, para ajustar depois da primeira rota.</div>
                  {!listaCidades.length && <div className="ea-mu" style={{ marginTop: 10 }}>Ainda não há encomendas ativas.</div>}
                  {listaCidades.map((c) => (
                    <div key={c.uf + c.cidade} className="en-it">
                      <div className="en-top" style={{ cursor: 'default' }}>
                        <div><span className="en-tit">{c.cidade}-{c.uf}</span>{' '}
                          <span className={`ea-tag ${c.confirmados >= MIN_CIDADE ? 'ok' : 'am'}`}>{c.confirmados >= MIN_CIDADE ? 'Pronta para a rota' : 'Juntando pedidos'}</span></div>
                        <div className="ea-mu"><b>{c.confirmados}</b> de {MIN_CIDADE} confirmadas · {c.ativos} ativas · {c.pares} pares</div>
                      </div>
                      <div className="en-bar"><i style={{ width: Math.min(100, Math.round((c.confirmados / MIN_CIDADE) * 100)) + '%' }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
