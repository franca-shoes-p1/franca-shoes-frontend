// Pedidos da loja e lotes de retirada na rodoviária: ver, mudar a situação, rastreio, custo de fábrica e avisar o cliente.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { STATUS_PEDIDO, LISTA_STATUS, STATUS_LOTE, rotuloStatus } from '../../lib/pedidosStatus';

const CSS = `
.pd-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.pd-tabs button,.pd-chips button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.pd-tabs button.on,.pd-chips button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.pd-chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.pd-chips button{padding:5px 12px;font-size:13px}
.pd-it{border-top:1px solid var(--bd);padding:12px 0}
.pd-it:first-child{border-top:0}
.pd-top{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;cursor:pointer}
.pd-tit{font-weight:700}
.pd-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:10px}
.pd-li{font-size:14px;margin:2px 0}
.pd-det{margin-top:10px;padding:12px;background:var(--bg);border:1px solid var(--bd);border-radius:10px}
`;
const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const dt = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') + ' ' + new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
const zapNum = (w) => { const d = String(w || '').replace(/\D/g, ''); return d.startsWith('55') ? d : '55' + d; };
const zapLink = (w, t) => `https://wa.me/${zapNum(w)}?text=${encodeURIComponent(t)}`;
const dataBR = (d) => (d ? d.split('-').reverse().join('/') : '');

function msgPedido(p, lote) {
  const base = `Olá, ${p.cliente_nome.split(' ')[0]}! Aqui é da Franca Calçados, sobre o seu pedido nº ${p.numero}. `;
  if (p.status === 'pago') return base + 'Recebemos o seu pagamento. Já vamos separar o seu pedido na fábrica.';
  if (p.status === 'em_compra_fabrica') return base + 'Estamos comprando o seu pedido na fábrica. Avisamos assim que sair.';
  if (p.status === 'enviado' && p.entrega === 'rodoviaria') return base + `Seu pedido está a caminho de ${p.cidade}. ${lote && lote.data_saida ? 'Data prevista da saída: ' + dataBR(lote.data_saida) + '. ' : ''}Combinamos o local e o horário da retirada por aqui. Leve um documento com foto.`;
  if (p.status === 'enviado') return base + `Seu pedido foi postado nos Correios.${p.codigo_rastreio ? ' Código de rastreio: ' + p.codigo_rastreio + '.' : ''}`;
  if (p.status === 'entregue') return base + 'Seu pedido consta como entregue. Está tudo certo com o produto? Se precisar de troca, é só falar.';
  if (p.status === 'aguardando_pagamento') return base + 'Vimos que o pagamento ainda não foi concluído. Posso ajudar?';
  return base + 'Posso ajudar em algo?';
}

export default function AdminPedidos() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('pedidos');
  const [filtro, setFiltro] = useState('');
  const [aberto, setAberto] = useState('');
  const [ed, setEd] = useState({});
  const [fab, setFab] = useState(null); // fábrica em edição (objeto) ou null
  const [cfgA, setCfgA] = useState(null); // preço do passe e taxa em edição
  const [ramoEd, setRamoEd] = useState({}); // ramos em edição por slug
  const [conceder, setConceder] = useState({ email: '', dias: 30 });

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/pedidos')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const entrar = async (ev) => {
    ev.preventDefault(); setOcupado(true);
    try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const enviar = async (corpo) => {
    setOcupado(true); setMsg(null);
    try { const j = await api('/api/admin/pedidos', { method: 'POST', body: corpo }); setD(j); setEd({}); setMsg({ tipo: 'ok', texto: j.aviso || 'Pronto.' }); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const campo = (id, k, v) => setEd((e) => ({ ...e, [id]: { ...(e[id] || {}), [k]: v } }));
  const val = (p, k) => (ed[p.id] && ed[p.id][k] !== undefined ? ed[p.id][k] : p[k] ?? '');

  const pedidos = d && d.pedidos ? d.pedidos.filter((p) => !filtro || p.status === filtro) : [];
  const n = (s) => (d && d.pedidos ? d.pedidos.filter((p) => p.status === s).length : 0);
  const lotePorId = (id) => (d && d.lotes ? d.lotes.find((l) => l.id === id) : null);
  const faturamento = d && d.pedidos ? d.pedidos.filter((p) => ['pago', 'em_compra_fabrica', 'enviado', 'entregue'].includes(p.status)).reduce((s, p) => s + Number(p.total || 0), 0) : 0;

  return (
    <>
      <Head><title>Pedidos | Painel</title><meta name="robots" content="noindex" /></Head>
      <div className="ea">
        <style>{ADMIN_CSS}{CSS}</style>
        <div className="ea-in">
          <AdminNav />
          <h1>Pedidos e lotes</h1>
          <div className="ea-mu">Veja cada pedido da loja, mude a situação, anote o rastreio e o custo de fábrica e avise o cliente pelo WhatsApp.</div>

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
                  <span className="ea-tag am">{n('aguardando_pagamento')} aguardando pagamento</span>
                  <span className="ea-tag ok">{n('pago')} pagos (a comprar na fábrica)</span>
                  <span className="ea-tag">{n('em_compra_fabrica')} na fábrica</span>
                  <span className="ea-tag">{n('enviado')} enviados</span>
                  <span className="ea-tag ok">{n('entregue')} entregues</span>
                  <span className="ea-tag">Vendas confirmadas: {brl(faturamento)}</span>
                </div>
              </div>

              <div className="pd-tabs">
                <button className={aba === 'pedidos' ? 'on' : ''} onClick={() => setAba('pedidos')}>Pedidos ({d.pedidos.length})</button>
                <button className={aba === 'lotes' ? 'on' : ''} onClick={() => setAba('lotes')}>Lotes da rodoviária ({d.lotes.length})</button>
                <button className={aba === 'fabricas' ? 'on' : ''} onClick={() => setAba('fabricas')}>Fábricas e regras ({(d.fabricas || []).length})</button>
                <button className={aba === 'assin' ? 'on' : ''} onClick={() => setAba('assin')}>Assinantes e descontos ({((d.assin && d.assin.membros) || []).length})</button>
              </div>

              {aba === 'pedidos' && d.fila && d.fila.length > 0 && (
                <div className="ea-card">
                  <h2>Fila de compra por fábrica</h2>
                  <div className="ea-mu">Pedidos pagos que ainda não foram comprados, somados em pares. Quando a fábrica pede lote mínimo, só compre ao atingir.</div>
                  {d.fila.map((f) => (
                    <div key={f.fabrica_id || 'sem'} className="pd-it">
                      <div className="pd-top" style={{ cursor: 'default' }}>
                        <div><span className="pd-tit">{f.nome_interno}</span>{' '}
                          <span className={`ea-tag ${f.pronto ? 'ok' : 'am'}`}>{f.pares} de {f.minimo} par(es){f.pronto ? ' · pode comprar' : ' · juntando'}</span></div>
                        <div className="ea-mu">Pedidos: {f.pedidos.map((x) => '#' + x).join(', ')}</div>
                      </div>
                      {f.mistos.length > 0 && <div className="ea-mu">Pedidos com mais de uma fábrica ({f.mistos.map((x) => '#' + x).join(', ')}) você marca à mão.</div>}
                      {f.pronto && (
                        <div style={{ marginTop: 8 }}>
                          <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => enviar({ acao: 'fila_comprar', fabrica_id: f.fabrica_id })}>Marcar estes pedidos como "Comprando na fábrica"</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {aba === 'pedidos' && (
                <div className="ea-card">
                  <div className="pd-chips">
                    <button className={!filtro ? 'on' : ''} onClick={() => setFiltro('')}>Todos</button>
                    {LISTA_STATUS.map((s) => <button key={s} className={filtro === s ? 'on' : ''} onClick={() => setFiltro(s)}>{rotuloStatus(s)}</button>)}
                  </div>
                  {pedidos.length === 0 && <p className="ea-mu">Nenhum pedido aqui ainda.</p>}
                  {pedidos.map((p) => {
                    const lote = p.lote_id ? lotePorId(p.lote_id) : null;
                    const st = STATUS_PEDIDO[p.status] || { rotulo: p.status, cor: '' };
                    return (
                      <div key={p.id} className="pd-it">
                        <div className="pd-top" onClick={() => setAberto(aberto === p.id ? '' : p.id)}>
                          <div>
                            <span className="pd-tit">#{p.numero} · {p.cliente_nome}</span>{' '}
                            <span className={`ea-tag ${st.cor}`}>{st.rotulo}</span>{' '}
                            {p.tipo === 'passe' ? <span className="ea-tag">🎟️ Passe de assinante</span> : <span className="ea-tag">{p.entrega === 'rodoviaria' ? `🚌 ${p.cidade}-${p.estado}` : `📮 ${p.cidade}-${p.estado}`}</span>}
                          </div>
                          <div className="ea-mu">{dt(p.criado_em)} · <b>{brl(p.total)}</b></div>
                        </div>
                        {aberto === p.id && (
                          <div className="pd-det">
                            {(p.itens || []).map((i, k) => <div key={k} className="pd-li">{i.quantidade}× {i.titulo} (nº {i.tamanho}) · {brl(i.preco)}</div>)}
                            <div className="pd-li ea-mu">Produtos {brl(p.subtotal)} · Frete {brl(p.frete)} · Total {brl(p.total)}</div>
                            <div className="pd-li">📧 {p.email} · 📱 {p.whatsapp}</div>
                            {p.entrega === 'rodoviaria'
                              ? <div className="pd-li">Retirada na rodoviária de <b>{p.cidade}-{p.estado}</b>{lote ? ` · lote #${lote.id}: ${lote.pedidos}/${lote.minimo} pedidos (${STATUS_LOTE[lote.status] || lote.status})${lote.data_saida ? ' · saída ' + dataBR(lote.data_saida) : ''}` : p.status === 'pago' || p.status === 'em_compra_fabrica' ? ' · ainda sem lote (confira o SQL dos lotes)' : ''}</div>
                              : <div className="pd-li">{p.rua}, {p.numero_casa}{p.complemento ? ' ' + p.complemento : ''} · {p.bairro} · {p.cidade}-{p.estado} · CEP {p.cep}</div>}
                            {p.observacao && <div className="pd-li ea-mu">Obs.: {p.observacao}</div>}
                            <div className="pd-g">
                              <div><label>Situação</label>
                                <select value={val(p, 'status')} onChange={(e) => campo(p.id, 'status', e.target.value)}>
                                  {LISTA_STATUS.map((s) => <option key={s} value={s}>{rotuloStatus(s)}</option>)}
                                </select></div>
                              {p.entrega !== 'rodoviaria' && (
                                <div><label>Código de rastreio (Correios)</label>
                                  <input value={val(p, 'codigo_rastreio')} onChange={(e) => campo(p.id, 'codigo_rastreio', e.target.value)} placeholder="AA123456789BR" /></div>
                              )}
                              <div><label>Custo de fábrica (R$) — só você vê</label>
                                <input inputMode="decimal" value={val(p, 'custo_fabrica')} onChange={(e) => campo(p.id, 'custo_fabrica', e.target.value)} placeholder="163,12" /></div>
                              <div><label>Nota interna</label>
                                <input value={val(p, 'nota_interna')} onChange={(e) => campo(p.id, 'nota_interna', e.target.value)} /></div>
                            </div>
                            <div className="ea-row" style={{ marginTop: 12 }}>
                              <button className="ea-btn" disabled={ocupado || !ed[p.id]} onClick={() => enviar({ acao: 'pedido', id: p.id, ...ed[p.id] })}>Salvar</button>
                              <a className="ea-btn ea-btn2" href={zapLink(p.whatsapp, msgPedido({ ...p, ...(ed[p.id] || {}) }, lote))} target="_blank" rel="noopener noreferrer">Avisar no WhatsApp</a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {aba === 'lotes' && (
                <div className="ea-card">
                  {d.semLotes && <p className="ea-mu">Os lotes ainda não existem no banco. Rode o SQL <b>supabase-cal-lotes-portal.sql</b> no Supabase.</p>}
                  {!d.semLotes && d.lotes.length === 0 && <p className="ea-mu">Nenhum lote ainda. O primeiro nasce quando um pedido de retirada na rodoviária for pago.</p>}
                  {d.lotes.map((l) => {
                    const ps = d.pedidos.filter((p) => p.lote_id === l.id);
                    const k = 'l' + l.id;
                    return (
                      <div key={l.id} className="pd-it">
                        <div className="pd-top" style={{ cursor: 'default' }}>
                          <div><span className="pd-tit">Lote #{l.id} · {l.cidade}-{l.estado}</span>{' '}
                            <span className={`ea-tag ${l.status === 'aberto' ? 'am' : 'ok'}`}>{STATUS_LOTE[l.status] || l.status}</span></div>
                          <div className="ea-mu"><b>{l.pedidos}</b> de {l.minimo} pedidos{l.data_saida ? ' · saída ' + dataBR(l.data_saida) : ''}</div>
                        </div>
                        <div className="pd-g">
                          <div><label>Situação do lote</label>
                            <select value={(ed[k] && ed[k].status) || l.status} onChange={(e) => campo(k, 'status', e.target.value)}>
                              {Object.keys(STATUS_LOTE).map((s) => <option key={s} value={s}>{STATUS_LOTE[s]}</option>)}
                            </select></div>
                          <div><label>Data de saída da viagem</label>
                            <input type="date" value={(ed[k] && ed[k].data_saida !== undefined ? ed[k].data_saida : l.data_saida) || ''} onChange={(e) => campo(k, 'data_saida', e.target.value)} /></div>
                          <div><label>Nota interna</label>
                            <input value={(ed[k] && ed[k].nota_interna !== undefined ? ed[k].nota_interna : l.nota_interna) || ''} onChange={(e) => campo(k, 'nota_interna', e.target.value)} /></div>
                        </div>
                        <div className="ea-row" style={{ marginTop: 10 }}>
                          <button className="ea-btn" disabled={ocupado || !ed[k]} onClick={() => enviar({ acao: 'lote', id: l.id, ...ed[k] })}>Salvar lote</button>
                          <span className="ea-mu">“Em rota” e “Entregue” atualizam também a situação dos pedidos do lote.</span>
                        </div>
                        {ps.length > 0 && (
                          <div className="pd-det">
                            {ps.map((p) => (
                              <div key={p.id} className="pd-li">
                                #{p.numero} {p.cliente_nome} · {rotuloStatus(p.status)} ·{' '}
                                <a href={zapLink(p.whatsapp, msgPedido({ ...p, status: l.status === 'em_rota' ? 'enviado' : p.status }, { ...l, data_saida: (ed[k] && ed[k].data_saida) || l.data_saida }))} target="_blank" rel="noopener noreferrer">avisar no WhatsApp</a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {aba === 'fabricas' && (
                <div className="ea-card">
                  {d.semFabricas && <p className="ea-mu">As fábricas ainda não existem no banco. Rode o SQL <b>supabase-fabricas-regras.sql</b> no Supabase e recarregue.</p>}
                  {!d.semFabricas && (
                    <>
                      <h2>Regras de cada fábrica</h2>
                      <div className="ea-mu">Cada fábrica tem o seu jeito. Estas regras aparecem na página de cada modelo, sem o nome da fábrica. Ligue o modelo à fábrica em Calçados.</div>
                      {(d.fabricas || []).map((f) => (
                        <div key={f.id} className="pd-it">
                          <div className="pd-top" style={{ cursor: 'default' }}>
                            <div><span className="pd-tit">{f.nome_interno}</span>{' '}
                              <span className="ea-tag">lote mínimo {f.lote_minimo_pares} par(es)</span>{' '}
                              <span className="ea-tag">defeito {f.troca_defeito_dias} dias</span>{' '}
                              <span className={`ea-tag ${f.troca_numeracao ? 'ok' : 'er'}`}>{f.troca_numeracao ? 'troca de número: sim' : 'troca de número: não'}</span>
                              {!f.ativo && <span className="ea-tag er">pausada</span>}</div>
                            <button className="ea-btn ea-btn2" onClick={() => setFab({ ...f })}>Editar</button>
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 12 }}>
                        {!fab && <button className="ea-btn" onClick={() => setFab({ nome_interno: '', lote_minimo_pares: 1, prazo_preparo: '', troca_defeito_dias: 30, troca_numeracao: true, troca_obs: '', ativo: true })}>+ Nova fábrica</button>}
                      </div>
                      {fab && (
                        <div className="pd-det">
                          <h2>{fab.id ? 'Editar fábrica' : 'Nova fábrica'}</h2>
                          <div className="pd-g">
                            <div><label>Nome (só você vê)</label><input value={fab.nome_interno} onChange={(e) => setFab({ ...fab, nome_interno: e.target.value })} /></div>
                            <div><label>Lote mínimo (pares) para comprar</label><input type="number" min="1" max="500" value={fab.lote_minimo_pares} onChange={(e) => setFab({ ...fab, lote_minimo_pares: e.target.value })} /></div>
                            <div><label>Prazo depois do lote</label><input value={fab.prazo_preparo || ''} onChange={(e) => setFab({ ...fab, prazo_preparo: e.target.value })} placeholder="Ex.: 3 a 5 dias úteis" /></div>
                            <div><label>Prazo para avisar defeito (dias)</label><input type="number" min="30" max="365" value={fab.troca_defeito_dias} onChange={(e) => setFab({ ...fab, troca_defeito_dias: e.target.value })} /></div>
                            <div><label>Aceita troca de numeração?</label>
                              <select value={fab.troca_numeracao ? 'sim' : 'nao'} onChange={(e) => setFab({ ...fab, troca_numeracao: e.target.value === 'sim' })}>
                                <option value="sim">Sim</option><option value="nao">Não</option>
                              </select></div>
                            <div><label>Situação</label>
                              <select value={fab.ativo ? 'sim' : 'nao'} onChange={(e) => setFab({ ...fab, ativo: e.target.value === 'sim' })}>
                                <option value="sim">Ativa</option><option value="nao">Pausada</option>
                              </select></div>
                          </div>
                          <div style={{ marginTop: 10 }}><label>Observação para o cliente (opcional, sem nome da fábrica)</label>
                            <input value={fab.troca_obs || ''} onChange={(e) => setFab({ ...fab, troca_obs: e.target.value })} placeholder="Ex.: modelos sob encomenda não têm troca de cor." /></div>
                          <div className="ea-row" style={{ marginTop: 12 }}>
                            <button className="ea-btn" disabled={ocupado} onClick={async () => { await enviar({ acao: 'fabrica_salvar', ...fab }); setFab(null); }}>Salvar fábrica</button>
                            <button className="ea-btn ea-btn2" onClick={() => setFab(null)}>Cancelar</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {aba === 'assin' && (
                <div className="ea-card">
                  {!(d.assin && d.assin.pronto) && <p className="ea-mu">O SQL da assinatura ainda não rodou: valem os padrões (passe R$ 29,90). Rode <b>supabase-assinatura.sql</b> no Supabase e recarregue para poder alterar.</p>}
                  {d.assin && d.assin.config && (
                    <>
                      <h2>Passe e taxa</h2>
                      <div className="pd-g">
                        <div><label>Preço do passe de 30 dias (R$)</label><input inputMode="decimal" value={cfgA ? cfgA.preco_passe : String(d.assin.config.preco_passe).replace('.', ',')} onChange={(e) => setCfgA({ preco_passe: e.target.value, taxa_mp_pct: cfgA ? cfgA.taxa_mp_pct : String(d.assin.config.taxa_mp_pct).replace('.', ',') })} /></div>
                        <div><label>Taxa do Mercado Pago usada no cálculo (%)</label><input inputMode="decimal" value={cfgA ? cfgA.taxa_mp_pct : String(d.assin.config.taxa_mp_pct).replace('.', ',')} onChange={(e) => setCfgA({ preco_passe: cfgA ? cfgA.preco_passe : String(d.assin.config.preco_passe).replace('.', ','), taxa_mp_pct: e.target.value })} /></div>
                        <div><label>Fundo dos operadores (%) — vem da aba Vitrine</label><input value={d.assin.config.fundo_pct} disabled /></div>
                      </div>
                      <div style={{ marginTop: 10 }}><button className="ea-btn" disabled={ocupado || !cfgA || !d.assin.pronto} onClick={() => enviar({ acao: 'assin_config', ...cfgA }).then(() => setCfgA(null))}>Salvar passe e taxa</button></div>

                      <h2 style={{ marginTop: 20 }}>Desconto por ramo</h2>
                      <div className="ea-mu">O desconto é o <b>menor</b> entre o que a margem permite (sem mexer no fundo dos operadores, que é sobre o preço geral) e o teto do ramo. “Margem” não tem teto fixo. Só os ramos marcados como automáticos aplicam desconto sozinhos no checkout.</div>
                      {d.assin.ramos.map((r) => {
                        const e = ramoEd[r.slug] || {};
                        const v = (k) => (e[k] !== undefined ? e[k] : k === 'teto_pct' ? (r.teto_pct == null ? '' : String(r.teto_pct)) : r[k]);
                        return (
                          <div key={r.slug} className="pd-it">
                            <div className="pd-tit">{r.nome}</div>
                            <div className="pd-g">
                              <div><label>Critério</label>
                                <select value={v('modo')} onChange={(ev) => setRamoEd({ ...ramoEd, [r.slug]: { ...e, modo: ev.target.value } })}>
                                  <option value="margem">Só pela margem</option><option value="teto">Teto percentual</option>
                                </select></div>
                              <div><label>Teto (%)</label><input inputMode="decimal" value={v('teto_pct')} onChange={(ev) => setRamoEd({ ...ramoEd, [r.slug]: { ...e, teto_pct: ev.target.value } })} /></div>
                              <div><label>Aplicar sozinho no checkout?</label>
                                <select value={v('automatico') ? 'sim' : 'nao'} onChange={(ev) => setRamoEd({ ...ramoEd, [r.slug]: { ...e, automatico: ev.target.value === 'sim' } })}>
                                  <option value="sim">Sim</option><option value="nao">Não (combinado pelo WhatsApp)</option>
                                </select></div>
                            </div>
                            <div style={{ marginTop: 8 }}><button className="ea-btn ea-btn2" disabled={ocupado || !ramoEd[r.slug]} onClick={() => enviar({ acao: 'ramo_salvar', slug: r.slug, modo: v('modo'), teto_pct: v('teto_pct'), automatico: v('automatico'), ativo: r.ativo }).then(() => setRamoEd({ ...ramoEd, [r.slug]: undefined }))}>Salvar ramo</button></div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <h2 style={{ marginTop: 20 }}>Assinantes</h2>
                  {d.assin && d.assin.membros.length === 0 && <p className="ea-mu">Nenhum assinante ainda. O passe nasce quando um pedido de produto ou de passe é pago.</p>}
                  {d.assin && d.assin.membros.map((m) => {
                    const ativo = Date.parse(m.expira_em) > Date.now();
                    return (
                      <div key={m.chave} className="pd-it">
                        <div className="pd-top" style={{ cursor: 'default' }}>
                          <div><span className="pd-tit">{m.nome || m.chave}</span> <span className={`ea-tag ${ativo ? 'ok' : 'er'}`}>{ativo ? 'ativo' : 'vencido'}</span></div>
                          <div className="ea-mu">{m.chave} · até {new Date(m.expira_em).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pd-det" style={{ marginTop: 12 }}>
                    <b>Liberar acesso à mão</b> <span className="ea-mu">(cortesia ou ajuste)</span>
                    <div className="pd-g">
                      <div><label>E-mail</label><input value={conceder.email} onChange={(e) => setConceder({ ...conceder, email: e.target.value })} /></div>
                      <div><label>Dias</label><input type="number" min="1" max="365" value={conceder.dias} onChange={(e) => setConceder({ ...conceder, dias: e.target.value })} /></div>
                    </div>
                    <div style={{ marginTop: 8 }}><button className="ea-btn" disabled={ocupado || !conceder.email} onClick={() => enviar({ acao: 'membro_conceder', ...conceder }).then(() => setConceder({ email: '', dias: 30 }))}>Liberar</button></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
