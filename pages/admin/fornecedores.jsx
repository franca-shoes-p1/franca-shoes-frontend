// Painel do dono: fornecedores de Franca (aprovar, revisar modelos, coletar e enviar pedidos, acertar a comissão).
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { SITE_PUBLICO } from '../../lib/pontos';
import { brl } from '../../lib/varejo';
import { STATUS_EMPRESA, STATUS_PEDIDO, REVISAO } from '../../lib/fornecedores';

const CSS = `
.fa-tag{display:inline-block;color:#fff;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:700}
.fa-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.fa-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.fa-tabs button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.fa-tabs button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.fa-th{width:64px;height:64px;border-radius:8px;overflow:hidden;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:26px;flex:none}
.fa-th img{width:100%;height:100%;object-fit:cover}
.fa-in{width:120px}
.ea a.ea-btn{color:#fff}.ea a.ea-btn2{color:var(--ac)}
`;
const data = (s) => (s ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '');
const zap = (tel, texto) => `https://wa.me/${String(tel || '').replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;

export default function AdminFornecedores() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('fornecedores');
  const [pct, setPct] = useState({});
  const [env, setEnv] = useState({});
  const [canc, setCanc] = useState({});

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/fornecedores')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function post(corpo, ok) {
    setOcupado(true); setMsg(null);
    try { setD(await api('/api/admin/fornecedores', { method: 'POST', body: corpo })); if (ok) setMsg({ tipo: 'ok', texto: ok }); return true; }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); return false; }
    finally { setOcupado(false); }
  }
  const entrar = async (ev) => { ev.preventDefault(); setOcupado(true); try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); } setOcupado(false); };

  const empresas = d ? d.empresas : [];
  const nome = (id) => (empresas.find((e) => e.id === id) || {}).nome_fantasia || '—';
  const empresa = (id) => empresas.find((e) => e.id === id) || {};
  const pendentesProd = d ? d.produtos.filter((p) => p.revisao === 'pendente') : [];
  const pedAbertos = d ? d.pedidos.filter((p) => ['pronto_coleta', 'coletado'].includes(p.status)) : [];
  const pendentesEmp = empresas.filter((e) => e.status === 'pendente');

  return (
    <div className="ea">
      <Head><title>Fornecedores · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>Fornecedores de Franca</h1>
        <div className="ea-mu">Os fornecedores cadastram os modelos e recebem o pagamento. Você aprova, coleta, envia pelos Correios e recebe a comissão no acerto semanal.</div>
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
          <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o arquivo <b>supabase-fornecedores.sql</b> no Supabase (SQL Editor) e recarregue esta página.</p></div>
        )}

        {fase === 'pronto' && d && !d.semSql && (
          <>
            <div className="fa-row">
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">Fornecedores a aprovar</div><b style={{ fontSize: 26 }}>{pendentesEmp.length}</b></div>
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">Modelos a conferir</div><b style={{ fontSize: 26 }}>{pendentesProd.length}</b></div>
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">Pedidos para coletar/enviar</div><b style={{ fontSize: 26 }}>{pedAbertos.length}</b></div>
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">A receber (acertos)</div><b style={{ fontSize: 26 }}>{brl(d.acertos.reduce((s, a) => s + a.total, 0))}</b></div>
            </div>
            <div className="fa-tabs">
              {[['fornecedores', '🏭 Fornecedores'], ['modelos', '👟 Modelos'], ['pedidos', '📦 Pedidos'], ['acertos', '💰 Acertos']].map(([k, t]) => <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{t}</button>)}
            </div>

            {aba === 'fornecedores' && (
              <>
                <div className="ea-card"><b>Link para convidar fornecedores:</b> <span style={{ wordBreak: 'break-all' }}>{SITE_PUBLICO}/fornecedor</span></div>
                {empresas.length === 0 && <div className="ea-card">Ainda não há fornecedores cadastrados.</div>}
                {empresas.map((e) => {
                  const st = STATUS_EMPRESA[e.status] || ['', '#64748b'];
                  const link = `${SITE_PUBLICO}/fornecedor/${e.token}`;
                  return (
                    <div key={e.id} className="ea-card">
                      <div className="fa-row" style={{ justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0 }}>{e.nome_fantasia}</h3><span className="fa-tag" style={{ background: st[1] }}>{st[0]}</span>
                      </div>
                      <div className="ea-mu">{e.responsavel} · WhatsApp {e.whatsapp} · {e.documento ? `Documento ${e.documento}` : 'sem CNPJ/CPF'} · {e.emite_nota ? 'emite nota' : 'não informou nota'} · PIX {e.pix_chave ? 'cadastrado' : 'falta cadastrar'}</div>
                      {e.endereco_coleta && <div className="ea-mu">Coleta: {e.endereco_coleta}</div>}
                      <div className="fa-row" style={{ marginTop: 10 }}>
                        <label style={{ margin: 0 }}>Comissão %</label>
                        <input className="fa-in" value={pct[e.id] ?? String(e.comissao_pct).replace('.', ',')} onChange={(ev) => setPct({ ...pct, [e.id]: ev.target.value })} inputMode="decimal" />
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => post({ acao: 'empresa_comissao', id: e.id, pct: pct[e.id] ?? e.comissao_pct }, 'Comissão atualizada e preços recalculados.')}>Salvar</button>
                      </div>
                      <div className="fa-row" style={{ marginTop: 10 }}>
                        {e.status !== 'ativo' && <button className="ea-btn" disabled={ocupado} onClick={() => post({ acao: 'empresa_estado', id: e.id, estado: 'ativo' }, 'Fornecedor aprovado. Envie o link do painel a ele.')}>Aprovar</button>}
                        {e.status === 'ativo' && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => post({ acao: 'empresa_estado', id: e.id, estado: 'pausado' }, 'Fornecedor pausado: os modelos saíram do site.')}>Pausar</button>}
                        {e.status !== 'recusado' && <button className="ea-btn ea-btn2 ea-btn-er" disabled={ocupado} onClick={() => { if (window.confirm('Recusar este fornecedor? Os modelos dele saem do site.')) post({ acao: 'empresa_estado', id: e.id, estado: 'recusado' }); }}>Recusar</button>}
                        {e.status === 'ativo' && <a className="ea-btn ea-btn2" href={zap(e.whatsapp, `Olá, ${e.responsavel}! Seu cadastro no Franca Calçados foi aprovado. Este é o link do seu painel (guarde, é só seu): ${link}`)} target="_blank" rel="noopener noreferrer">Enviar link do painel no WhatsApp</a>}
                        {e.status === 'ativo' && <a className="ea-btn ea-btn2" href={link} target="_blank" rel="noopener noreferrer">Abrir painel dele</a>}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {aba === 'modelos' && (
              <>
                {d.produtos.length === 0 && <div className="ea-card">Nenhum modelo de fornecedor ainda.</div>}
                {[...d.produtos].sort((a, b) => (a.revisao === 'pendente' ? -1 : 0) - (b.revisao === 'pendente' ? -1 : 0)).map((p) => {
                  const rv = REVISAO[p.revisao] || REVISAO.pendente;
                  return (
                    <div key={p.id} className="ea-card fa-row" style={{ alignItems: 'flex-start' }}>
                      <div className="fa-th">{p.foto_url ? <img src={p.foto_url} alt="" /> : '👟'}</div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <b>{p.titulo_publico}</b> <span className="fa-tag" style={{ background: rv[1] }}>{rv[0]}</span>
                        <div className="ea-mu">{nome(p.fornecedor_id)} · {p.categoria || 'sem tipo'} · nº {p.tamanhos || '—'} · fornecedor {brl(p.preco_fornecedor)} → cliente {brl(p.preco_venda_sugerido)}</div>
                        {p.descricao && <div className="ea-mu">{p.descricao.slice(0, 160)}</div>}
                        <div className="fa-row" style={{ marginTop: 8 }}>
                          {p.revisao !== 'aprovado' && <button className="ea-btn" disabled={ocupado} onClick={() => post({ acao: 'produto_revisao', id: p.id, decisao: 'aprovar' }, 'Modelo aprovado e publicado na vitrine.')}>Aprovar e publicar</button>}
                          {p.revisao !== 'reprovado' && <button className="ea-btn ea-btn2 ea-btn-er" disabled={ocupado} onClick={() => post({ acao: 'produto_revisao', id: p.id, decisao: 'reprovar' }, 'Modelo reprovado e fora do site.')}>{p.revisao === 'aprovado' ? 'Tirar do site' : 'Reprovar'}</button>}
                          <a className="ea-btn ea-btn2" href={`/calcados/${p.id}`} target="_blank" rel="noopener noreferrer">Ver no site</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {aba === 'pedidos' && (
              <>
                {d.pedidos.length === 0 && <div className="ea-card">Ainda não há pedidos de fornecedores.</div>}
                {d.pedidos.map((p) => {
                  const st = STATUS_PEDIDO[p.status] || [p.status, '#64748b'];
                  const e = empresa(p.fornecedor_id);
                  const x = env[p.id] || { rastreio: '', custo: '' };
                  return (
                    <div key={p.id} className="ea-card">
                      <div className="fa-row" style={{ justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0 }}>Pedido nº {p.numero} · {nome(p.fornecedor_id)}</h3><span className="fa-tag" style={{ background: st[1] }}>{st[0]}</span>
                      </div>
                      <div className="ea-mu">{data(p.criado_em)} · cliente {p.cliente_nome} ({p.whatsapp}) · {p.cidade}/{p.estado}</div>
                      <div>{(p.itens || []).map((i, k) => <div key={k}>{i.quantidade}× {i.titulo}{i.tamanho ? ` (nº ${i.tamanho})` : ''}</div>)}</div>
                      <div className="ea-mu">Total do cliente {brl(p.total)} · fornecedor recebe {brl(Number(p.preco_fornecedor_total) + Number(p.frete))} · <b>sua comissão {brl(p.comissao_total)}</b>{p.custo_postagem != null ? ` · postagem ${brl(p.custo_postagem)}` : ''}{p.comissao_acertada_em ? ' · ✓ acertado' : ''}</div>
                      <div className="ea-mu">Endereço: {p.rua}, {p.numero_casa}{p.complemento ? ` ${p.complemento}` : ''}, {p.bairro}, {p.cidade}/{p.estado}, CEP {p.cep}</div>
                      {e.endereco_coleta && ['pronto_coleta', 'coletado'].includes(p.status) && <div className="ea-mu">Coletar em: {e.endereco_coleta}</div>}
                      {p.codigo_rastreio && <div>Rastreio: <b>{p.codigo_rastreio}</b></div>}
                      <div className="fa-row" style={{ marginTop: 8 }}>
                        {p.status === 'pronto_coleta' && <button className="ea-btn" disabled={ocupado} onClick={() => post({ acao: 'pedido', id: p.id, passo: 'coletado' }, 'Marcado como coletado.')}>Coletei com o fornecedor</button>}
                        {p.status === 'enviado' && <button className="ea-btn" disabled={ocupado} onClick={() => post({ acao: 'pedido', id: p.id, passo: 'entregue' }, 'Marcado como entregue.')}>Cliente recebeu</button>}
                        {e.whatsapp && ['aguardando_pagamento', 'cliente_pagou', 'pago', 'pronto_coleta'].includes(p.status) && <a className="ea-btn ea-btn2" href={zap(e.whatsapp, `Olá! Pedido nº ${p.numero} no Franca Calçados. Situação: ${st[0]}.`)} target="_blank" rel="noopener noreferrer">Falar com o fornecedor</a>}
                        <a className="ea-btn ea-btn2" href={zap(p.whatsapp, `Olá, ${p.cliente_nome}! Sobre o seu pedido nº ${p.numero} no Franca Calçados.`)} target="_blank" rel="noopener noreferrer">Falar com o cliente</a>
                      </div>
                      {['pronto_coleta', 'coletado'].includes(p.status) && (
                        <div className="fa-row" style={{ marginTop: 10 }}>
                          <input placeholder="Rastreio dos Correios" value={x.rastreio} onChange={(ev) => setEnv({ ...env, [p.id]: { ...x, rastreio: ev.target.value } })} style={{ maxWidth: 220 }} />
                          <input placeholder="Custo da postagem (R$)" value={x.custo} onChange={(ev) => setEnv({ ...env, [p.id]: { ...x, custo: ev.target.value } })} style={{ maxWidth: 240 }} inputMode="decimal" />
                          <button className="ea-btn" disabled={ocupado} onClick={() => post({ acao: 'pedido', id: p.id, passo: 'enviado', rastreio: x.rastreio, custo: x.custo }, 'Pedido marcado como enviado.')}>Enviei pelos Correios</button>
                        </div>
                      )}
                      {['aguardando_pagamento', 'cliente_pagou', 'pago', 'pronto_coleta', 'coletado', 'enviado'].includes(p.status) && (
                        <div style={{ marginTop: 8 }}>
                          {canc[p.id] === undefined ? <button className="ea-btn ea-btn2 ea-btn-er" onClick={() => setCanc({ ...canc, [p.id]: '' })}>Cancelar pedido</button> : (
                            <div className="fa-row"><input placeholder="Motivo" value={canc[p.id]} onChange={(ev) => setCanc({ ...canc, [p.id]: ev.target.value })} style={{ maxWidth: 320 }} /><button className="ea-btn ea-btn-er" disabled={ocupado} onClick={async () => { if (await post({ acao: 'pedido', id: p.id, passo: 'cancelar', motivo: canc[p.id] }, 'Pedido cancelado.')) setCanc({ ...canc, [p.id]: undefined }); }}>Confirmar</button><button className="ea-btn ea-btn2" onClick={() => setCanc({ ...canc, [p.id]: undefined })}>Voltar</button></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {aba === 'acertos' && (
              <>
                <div className="ea-card ea-mu">Acerto semanal: cada fornecedor paga por PIX a sua comissão mais o custo real dos Correios dos pedidos já enviados. Depois que o PIX cair, clique em “Marcar como acertado”.</div>
                {d.acertos.length === 0 && <div className="ea-card">Nenhum acerto em aberto.</div>}
                {d.acertos.map((a) => {
                  const e = empresa(a.fornecedor_id);
                  return (
                    <div key={a.fornecedor_id} className="ea-card">
                      <h3 style={{ margin: 0 }}>{e.nome_fantasia}</h3>
                      <div>{a.pedidos} pedido(s) · comissão {brl(a.comissao)} + postagem {brl(a.postagem)} = <b>{brl(a.total)}</b></div>
                      {a.semCusto > 0 && <div className="ea-msg er">{a.semCusto} pedido(s) sem custo de postagem informado.</div>}
                      <div className="fa-row" style={{ marginTop: 8 }}>
                        <a className="ea-btn ea-btn2" href={zap(e.whatsapp, `Olá! Acerto semanal do Franca Calçados: comissão ${brl(a.comissao)} + postagem ${brl(a.postagem)} = ${brl(a.total)} (${a.pedidos} pedido(s)). Vou enviar a chave PIX para o pagamento.`)} target="_blank" rel="noopener noreferrer">Cobrar pelo WhatsApp</a>
                        <button className="ea-btn" disabled={ocupado} onClick={() => { if (window.confirm(`Confirma que ${e.nome_fantasia} já pagou ${brl(a.total)}?`)) post({ acao: 'acertar', id: a.fornecedor_id }, 'Acerto registrado.'); }}>Marcar como acertado</button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
