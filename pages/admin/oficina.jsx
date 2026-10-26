import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import { TIPOS_REGRA } from '../../lib/preavaliacao';

const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
const CSS = `
.po-tabs{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.po-t{padding:8px 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--tx);font:inherit;cursor:pointer}
.po-t.on{background:var(--ac);border-color:var(--ac);color:#fff}
.po-ent{margin-top:8px;padding:10px;border-radius:8px;background:var(--bg);border:1px solid var(--bd);white-space:pre-wrap;word-break:break-word;font-size:14px}
.po-ln{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}
.po-ln>*{flex:1 1 130px;min-width:0}
.po-cod{font:700 22px ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px;word-break:break-all}
.po-img{width:96px;height:96px;object-fit:cover;border-radius:8px;border:1px solid var(--bd)}
`;
const CAT = [['digital', 'Digital'], ['comercial', 'Comercial'], ['industrial', 'Industrial'], ['tangivel', 'Tangível']];
const STE = [['ideia', 'Ideia'], ['planejando', 'Planejando'], ['construindo', 'Construindo'], ['operando', 'Operando']];

export default function AdminOficina() {
  const [fase, setFase] = useState('carregando');
  const [aba, setAba] = useState('entregas');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [com, setCom] = useState({});
  const [cod, setCod] = useState(null);
  const [ce, setCe] = useState({});
  const [rg, setRg] = useState({});
  const [ne, setNe] = useState({ nome: '', categoria: 'digital', resumo: '' });
  const [ex, setEx] = useState({});
  const [po, setPo] = useState({});

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/oficina')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { const r = await fn(); if (ok) setMsg({ tipo: 'ok', texto: ok }); await carregar(); return r; }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    finally { setOcupado(false); }
  }
  const acao = (body, ok) => rodar(() => api('/api/admin/oficina/acao', { method: 'POST', body }), ok);
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); }); };

  async function converter(k) {
    const r = await acao({ tipo: 'candidato', id: k.id, acao: 'converter' });
    if (r && r.codigo) setCod({ nome: r.nome, codigo: r.codigo, whatsapp: r.whatsapp });
  }

  const e = d ? d.entregas : [];
  const emAnalise = e.filter((x) => x.status === 'entregue');
  const aprov = e.filter((x) => x.status === 'aprovada' && Number(x.valor) > 0);

  return (
    <div className="ea">
      <Head><title>Oficina · painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS + CSS}</style>
      <div className="ea-in" style={{ maxWidth: 880 }}>
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <h1>Oficina Digital</h1>
          <Link href="/admin/operadores" className="ea-btn ea-btn2">Ordens e operadores</Link>
        </div>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2><label>Senha do painel</label>
            <input type="password" value={senha} onChange={(x) => setSenha(x.target.value)} required />
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Entrar</button></div>
          </form>
        )}

        {fase === 'pronto' && d && (
          <>
            {cod && (
              <div className="ea-card">
                <h2>Código de {cod.nome}</h2>
                <div className="po-cod">{cod.codigo}</div>
                <p className="ea-mu">Aparece só agora. Envie por WhatsApp{cod.whatsapp ? ` (${cod.whatsapp})` : ''} com o endereço <b>/operador</b>.</p>
                <button className="ea-btn ea-btn2" onClick={() => setCod(null)}>Já copiei</button>
              </div>
            )}
            <div className="ea-mu">Pontos em circulação: <b>{d.total_pontos}</b> · Em análise: <b>{emAnalise.length}</b> · Candidatos novos: <b>{d.candidatos.filter((c) => c.status === 'novo').length}</b></div>
            <div className="po-tabs">
              {[['entregas', `Entregas (${emAnalise.length})`], ['pagar', `A pagar (${aprov.length})`], ['pedidos', `Pedidos (${(d.pedidos || []).length})`], ['candidatos', `Candidatos (${d.candidatos.length})`], ['resgates', `Resgates (${d.resgates.length})`], ['chamados', `Chamados (${(d.chamados || []).length})`], ['cartoes', 'Cartões'], ['vitrine', 'Vitrine']].map(([k, r]) => (
                <button key={k} className={'po-t' + (aba === k ? ' on' : '')} onClick={() => setAba(k)}>{r}</button>
              ))}
            </div>

            {aba === 'entregas' && (
              <div style={{ marginTop: 12 }}>
                {emAnalise.length === 0 && <div className="ea-card ea-mu">Nenhuma entrega esperando análise.</div>}
                {emAnalise.map((x) => (
                  <div className="ea-card" key={x.id}>
                    <b>{x.cartao && x.cartao.codigo} · {x.cartao && x.cartao.titulo}</b>
                    <div className="ea-mu">{x.operario && x.operario.nome} ({x.operario && x.operario.nivel}) · {new Date(x.entregue_em).toLocaleString('pt-BR')}</div>
                    {x.cartao && <div className="po-ent"><b>Checklist:</b>{'\n'}{x.cartao.checklist.map((t, i) => `${x.checklist[i] ? '✔ Sim' : '✘ Não'}  ${t}`).join('\n')}</div>}
                    {Object.entries(x.respostas || {}).map(([k, v]) => <div className="po-ent" key={k}><b>{(x.cartao && (x.cartao.campos.find((c) => c.id === k) || {}).rotulo) || k}:</b>{'\n'}{v}</div>)}
                    {x.observacoes && <div className="po-ent"><b>Observações:</b>{'\n'}{x.observacoes}</div>}
                    {x.anexos && x.anexos.length > 0 && <div className="ea-row" style={{ marginTop: 8 }}>{x.anexos.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" className="po-img" /></a>)}</div>}
                    {x.sugestao && (
                      <div className={'ea-msg ' + (x.sugestao.nivel === 'ok' ? 'ok' : 'er')} style={{ marginTop: 8 }}>
                        <b>Pré-avaliação da IA (só sugestão): {x.sugestao.nivel === 'ok' ? 'parece ok' : 'atenção'}</b>
                        {x.sugestao.itens.map((i, n) => <div key={n}>{i.ok ? '✔' : '⚠'} {i.t}</div>)}
                      </div>
                    )}
                    <label>Comentário (obrigatório para pedir ajuste)</label>
                    <input value={com[x.id] || ''} onChange={(ev) => setCom({ ...com, [x.id]: ev.target.value })} />
                    <div className="ea-row" style={{ marginTop: 10 }}>
                      <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => acao({ tipo: 'entrega', id: x.id, acao: 'aprovar' }, `Aprovada. +${x.pontos} pontos.`)}>Aprovar</button>
                      <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => acao({ tipo: 'entrega', id: x.id, acao: 'ajuste', comentario: com[x.id] })}>Pedir ajuste</button>
                      <button className="ea-btn ea-btn-er" disabled={ocupado} onClick={() => confirm('Recusar esta entrega?') && acao({ tipo: 'entrega', id: x.id, acao: 'recusar', comentario: com[x.id] })}>Recusar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aba === 'pagar' && (
              <div style={{ marginTop: 12 }}>
                {aprov.length === 0 && <div className="ea-card ea-mu">Nada aprovado esperando pagamento.</div>}
                {aprov.map((x) => (
                  <div className="ea-card" key={x.id}>
                    <b>{x.operario && x.operario.nome}</b> · {x.cartao && x.cartao.codigo} · <b>{brl(x.valor)}</b>
                    <div className="ea-mu">Faça o Pix no seu banco e depois marque como paga. Só pague depois que o cliente pagou.</div>
                    <div style={{ marginTop: 8 }}><button className="ea-btn" disabled={ocupado} onClick={() => acao({ tipo: 'entrega', id: x.id, acao: 'pagar' }, 'Marcada como paga.')}>Marcar como paga</button></div>
                  </div>
                ))}
              </div>
            )}

            {aba === 'pedidos' && (
              <div style={{ marginTop: 12 }}>
                <div className="ea-card ea-mu">Pedidos de clientes vindos do site. Depois de combinar com o cliente por WhatsApp, escolha os cartões e crie a ordem. Em seguida, em <b>Ordens e operadores</b>, escolha o operador, confirme a entrada e acompanhe.</div>
                {(d.pedidos || []).length === 0 && <div className="ea-card ea-mu">Nenhum pedido novo.</div>}
                {(d.pedidos || []).map((p) => {
                  const f = po[p.id] || { cartoes: [], valor_total: '', prazo: '' };
                  const set = (x) => setPo({ ...po, [p.id]: { ...f, ...x } });
                  return (
                    <div className="ea-card" key={p.id}>
                      <b>#{p.numero} · {p.nome}</b> <span className="ea-tag">{p.status}</span>
                      <div className="ea-mu">{p.whatsapp} · {p.servico}{p.prazo ? ` · prazo: ${p.prazo}` : ''} · {new Date(p.criado_em).toLocaleString('pt-BR')}</div>
                      {p.descricao && <div className="po-ent">{p.descricao}</div>}
                      <label>Cartões desta ordem</label>
                      <div>
                        {d.cartoes.filter((c) => c.ativo).map((c) => (
                          <label key={c.id} style={{ display: 'block' }}>
                            <input type="checkbox" checked={f.cartoes.includes(c.id)} onChange={(ev) => set({ cartoes: ev.target.checked ? [...f.cartoes, c.id] : f.cartoes.filter((x) => x !== c.id) })} /> {c.codigo} · {c.titulo}
                          </label>
                        ))}
                      </div>
                      <div className="po-ln" style={{ marginTop: 8 }}>
                        <div><label>Valor do pedido R$ (o que o cliente paga)</label><input value={f.valor_total} onChange={(ev) => set({ valor_total: ev.target.value })} /></div>
                        <div><label>Prazo</label><input type="date" value={f.prazo} onChange={(ev) => set({ prazo: ev.target.value })} /></div>
                      </div>
                      <div className="ea-row" style={{ marginTop: 10 }}>
                        <a className="ea-btn ea-btn2" target="_blank" rel="noreferrer" href={`https://wa.me/55${String(p.whatsapp).replace(/\D/g, '').replace(/^55/, '')}`}>Chamar no WhatsApp</a>
                        <button className="ea-btn" disabled={ocupado || !f.cartoes.length} onClick={() => acao({ tipo: 'pedido', id: p.id, acao: 'criar_ordem', cartoes: f.cartoes, valor_total: f.valor_total, prazo: f.prazo }, 'Ordem criada. Agora abra Ordens e operadores para escolher o operador.')}>Criar ordem com cartões</button>
                        <button className="ea-btn ea-btn-er" disabled={ocupado} onClick={() => acao({ tipo: 'pedido', id: p.id, acao: 'cancelar' })}>Cancelar pedido</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {aba === 'candidatos' && (
              <div style={{ marginTop: 12 }}>
                {d.candidatos.length === 0 && <div className="ea-card ea-mu">Nenhum candidato novo.</div>}
                {d.candidatos.map((k) => (
                  <div className="ea-card" key={k.id}>
                    <b>{k.nome}</b> <span className="ea-tag">{k.status}</span>
                    <div className="ea-mu">{k.whatsapp}{k.cidade ? ` · ${k.cidade}` : ''}{k.origem ? ` · origem: ${k.origem}` : ''}</div>
                    {k.interesse && <div className="po-ent">{k.interesse}</div>}
                    <div className="ea-row" style={{ marginTop: 10 }}>
                      {k.whatsapp && <a className="ea-btn ea-btn2" target="_blank" rel="noreferrer" href={`https://wa.me/55${k.whatsapp.replace(/\D/g, '').replace(/^55/, '')}`}>Chamar no WhatsApp</a>}
                      <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => acao({ tipo: 'candidato', id: k.id, acao: 'chamado' })}>Marcar chamado</button>
                      <button className="ea-btn" disabled={ocupado} onClick={() => converter(k)}>Criar operador e gerar código</button>
                      <button className="ea-btn ea-btn-er" disabled={ocupado} onClick={() => acao({ tipo: 'candidato', id: k.id, acao: 'descartar' })}>Descartar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aba === 'resgates' && (
              <div style={{ marginTop: 12 }}>
                {d.resgates.length === 0 && <div className="ea-card ea-mu">Nenhum pedido de benefício.</div>}
                {d.resgates.map((r) => (
                  <div className="ea-card" key={r.id}>
                    <b>{r.operario && r.operario.nome}</b> quer <b>{r.beneficio && r.beneficio.nome}</b> ({r.pontos} pts)
                    <div className="ea-row" style={{ marginTop: 8 }}>
                      <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => acao({ tipo: 'resgate', id: r.id, acao: 'aprovar' }, 'Aprovado. Os pontos foram descontados; entregue o benefício.')}>Aprovar</button>
                      <button className="ea-btn ea-btn-er" disabled={ocupado} onClick={() => acao({ tipo: 'resgate', id: r.id, acao: 'recusar' })}>Recusar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aba === 'chamados' && (
              <div style={{ marginTop: 12 }}>
                {(d.chamados || []).length === 0 && <div className="ea-card ea-mu">Nenhuma dúvida sem resposta da IA.</div>}
                {(d.chamados || []).map((c) => (
                  <div className="ea-card" key={c.id}>
                    <b>{c.operario && c.operario.nome}</b> <span className="ea-mu">· {new Date(c.criado_em).toLocaleString('pt-BR')}</span>
                    <div className="po-ent">{c.texto}</div>
                    <div className="ea-row" style={{ marginTop: 8 }}>
                      <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => acao({ tipo: 'chamado', id: c.id, acao: 'resolver' }, 'Chamado resolvido.')}>Marcar como resolvido</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aba === 'cartoes' && (
              <div style={{ marginTop: 12 }}>
                <div className="ea-card ea-mu">Defina aqui o valor em reais (deixe vazio para "sem pagamento em dinheiro") e os pontos de cada cartão. Vale para as próximas entregas.</div>
                {d.cartoes.map((c) => {
                  const f = ce[c.id] || { valor: c.valor ?? '', pontos: c.pontos };
                  return (
                    <div className="ea-card" key={c.id}>
                      <b>{c.codigo} · {c.titulo}</b> {!c.ativo && <span className="ea-tag er">desligado</span>}
                      <div className="po-ln">
                        <div><label>Valor R$</label><input value={f.valor} onChange={(ev) => setCe({ ...ce, [c.id]: { ...f, valor: ev.target.value } })} /></div>
                        <div><label>Pontos</label><input value={f.pontos} onChange={(ev) => setCe({ ...ce, [c.id]: { ...f, pontos: ev.target.value } })} /></div>
                        <button className="ea-btn" disabled={ocupado} onClick={() => acao({ tipo: 'cartao', id: c.id, valor: f.valor, pontos: f.pontos }, 'Cartão salvo.')}>Salvar</button>
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => acao({ tipo: 'cartao', id: c.id, ativo: !c.ativo })}>{c.ativo ? 'Desligar' : 'Ligar'}</button>
                      </div>
                      <details style={{ marginTop: 10 }}>
                        <summary><b>Regras de conferência</b> ({(rg[c.id] || c.regras || []).length})</summary>
                        <div className="ea-mu" style={{ margin: '6px 0' }}>Cada regra vira um ✔ ou ⚠ na sugestão que você vê ao abrir a entrega. A conferência só sugere; quem aprova é você. Sem regras, vale a conferência padrão.</div>
                        {(rg[c.id] || c.regras || []).map((r, i) => {
                          const lista = rg[c.id] || c.regras || [];
                          const mud = (p) => setRg({ ...rg, [c.id]: lista.map((x, j) => (j === i ? { ...x, ...p } : x)) });
                          return (
                            <div className="po-ln" key={i} style={{ marginBottom: 6 }}>
                              <select value={r.tipo} onChange={(ev) => mud({ tipo: ev.target.value })}>{TIPOS_REGRA.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
                              {r.tipo !== 'anexo' && <select value={r.campo} onChange={(ev) => mud({ campo: ev.target.value })}><option value="">Campo…</option>{(c.campos || []).map((k) => <option key={k.id} value={k.id}>{k.rotulo || k.id}</option>)}</select>}
                              {['min_caracteres', 'contem', 'nao_contem', 'min_linhas'].includes(r.tipo) && <input placeholder="Texto ou número" value={r.valor} onChange={(ev) => mud({ valor: ev.target.value })} />}
                              {r.tipo === 'min_linhas' && <input placeholder="Mínimo de linhas" value={r.minimo} onChange={(ev) => mud({ minimo: ev.target.value })} />}
                              <input placeholder="Mensagem (ex.: Aviso obrigatório presente)" value={r.msg} onChange={(ev) => mud({ msg: ev.target.value })} />
                              <button className="ea-btn ea-btn2" onClick={() => setRg({ ...rg, [c.id]: lista.filter((_, j) => j !== i) })}>Tirar</button>
                            </div>
                          );
                        })}
                        <div className="po-ln">
                          <button className="ea-btn ea-btn2" onClick={() => setRg({ ...rg, [c.id]: [...(rg[c.id] || c.regras || []), { tipo: 'contem', campo: '', valor: '', minimo: 0, msg: '' }] })}>+ Nova regra</button>
                          <button className="ea-btn" disabled={ocupado} onClick={() => acao({ tipo: 'cartao', id: c.id, regras: rg[c.id] || c.regras || [] }, 'Regras salvas.')}>Salvar regras</button>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}

            {aba === 'vitrine' && (
              <div style={{ marginTop: 12 }}>
                <div className="ea-card ea-mu">Só aparece em <b>/vitrine</b> o que você marcar como público. Escreva sem prometer retorno, lucro ou participação. Participação é convite seu, com contrato feito por advogado.</div>
                <form className="ea-card" onSubmit={(ev) => { ev.preventDefault(); acao({ tipo: 'empreendimento', acao: 'criar', ...ne }, 'Empreendimento criado (privado).').then(() => setNe({ nome: '', categoria: 'digital', resumo: '' })); }}>
                  <h2 style={{ marginTop: 0 }}>Novo empreendimento</h2>
                  <div className="po-ln">
                    <input placeholder="Nome" value={ne.nome} onChange={(ev) => setNe({ ...ne, nome: ev.target.value })} required />
                    <select value={ne.categoria} onChange={(ev) => setNe({ ...ne, categoria: ev.target.value })}>{CAT.map(([k, r]) => <option key={k} value={k}>{r}</option>)}</select>
                  </div>
                  <textarea placeholder="Resumo (o que é, em que etapa está)" value={ne.resumo} onChange={(ev) => setNe({ ...ne, resumo: ev.target.value })} />
                  <div style={{ marginTop: 10 }}><button className="ea-btn" disabled={ocupado}>Criar</button></div>
                </form>
                {d.empreendimentos.map((p) => {
                  const f = ex[p.id] || {};
                  return (
                    <div className="ea-card" key={p.id}>
                      <b>{p.nome}</b> <span className="ea-tag">{p.categoria}</span> <span className={`ea-tag ${p.publico ? 'ok' : ''}`}>{p.publico ? 'público' : 'privado'}</span>
                      <div className="po-ln">
                        <select value={p.status} onChange={(ev) => acao({ tipo: 'empreendimento', id: p.id, acao: 'editar', status: ev.target.value })}>{STE.map(([k, r]) => <option key={k} value={k}>{r}</option>)}</select>
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => acao({ tipo: 'empreendimento', id: p.id, acao: 'editar', publico: !p.publico })}>{p.publico ? 'Tornar privado' : 'Publicar na vitrine'}</button>
                      </div>
                      <div className="po-ln">
                        <input placeholder="Novo marco" value={f.marco || ''} onChange={(ev) => setEx({ ...ex, [p.id]: { ...f, marco: ev.target.value } })} />
                        <button className="ea-btn ea-btn2 po-n" disabled={ocupado || !f.marco} onClick={() => acao({ tipo: 'empreendimento', id: p.id, acao: 'marco', titulo: f.marco }, 'Marco adicionado.').then(() => setEx({ ...ex, [p.id]: { ...f, marco: '' } }))}>Adicionar</button>
                      </div>
                      <div className="po-ln">
                        <input placeholder="Atualização do projeto" value={f.upd || ''} onChange={(ev) => setEx({ ...ex, [p.id]: { ...f, upd: ev.target.value } })} />
                        <button className="ea-btn ea-btn2 po-n" disabled={ocupado || !f.upd} onClick={() => acao({ tipo: 'empreendimento', id: p.id, acao: 'atualizacao', texto: f.upd }, 'Atualização publicada.').then(() => setEx({ ...ex, [p.id]: { ...f, upd: '' } }))}>Publicar</button>
                      </div>
                      <div className="po-ln">
                        <input placeholder="Vaga de tarefa neste projeto" value={f.vaga || ''} onChange={(ev) => setEx({ ...ex, [p.id]: { ...f, vaga: ev.target.value } })} />
                        <button className="ea-btn ea-btn2 po-n" disabled={ocupado || !f.vaga} onClick={() => acao({ tipo: 'empreendimento', id: p.id, acao: 'vaga', titulo: f.vaga }, 'Vaga aberta.').then(() => setEx({ ...ex, [p.id]: { ...f, vaga: '' } }))}>Abrir vaga</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
