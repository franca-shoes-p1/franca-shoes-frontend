// Painel do dono: revendedores (aprovar, assinatura), PIX 2 e repasses da margem, pedidos de loja própria e o seu PIX.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { SITE_PUBLICO } from '../../lib/pontos';
import { brl } from '../../lib/varejo';
import { STATUS_REV, PACOTES, statusAssinatura } from '../../lib/revendedores';
import { PIX_TIPOS } from '../../lib/fornecedores';

const CSS = `
.ra-tag{display:inline-block;color:#fff;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:700}
.ra-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.ra-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.ra-tabs button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.ra-tabs button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.ea a.ea-btn{color:#fff}.ea a.ea-btn2{color:var(--ac)}
`;
const data = (s) => (s ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '');
const zap = (tel, texto) => `https://wa.me/${String(tel || '').replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
const ASS = { ok: 'em dia', tolerancia: 'vencida (tolerância)', vencida: 'vencida', nunca: 'nunca pagou' };

export default function AdminRevendedores() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('revendedores');
  const [cfg, setCfg] = useState({ pix_tipo: 'cpf', pix_chave: '', pix_nome: '' });
  const [notas, setNotas] = useState({});

  const carregar = useCallback(async () => {
    try { const j = await api('/api/admin/revendedores'); setD(j); if (j.config && j.config.pix_chave) setCfg({ pix_tipo: j.config.pix_tipo || 'cpf', pix_chave: j.config.pix_chave, pix_nome: j.config.pix_nome || '' }); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function post(corpo, ok) {
    setOcupado(true); setMsg(null);
    try { setD(await api('/api/admin/revendedores', { method: 'POST', body: corpo })); if (ok) setMsg({ tipo: 'ok', texto: ok }); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    finally { setOcupado(false); }
  }
  const entrar = async (ev) => { ev.preventDefault(); setOcupado(true); try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); } setOcupado(false); };

  const revs = d ? d.revendedores : [];
  const rev = (id) => revs.find((r) => r.id === id) || {};
  const forn = (id) => ((d && d.fornecedores) || []).find((f) => f.id === id) || {};
  const pedRev = d ? d.pedidos : [];
  const pix2Aberto = pedRev.filter((p) => !p.pix2_pago_em && Number(p.total) - Number(p.preco_fornecedor_total) > 0);
  const repasseAberto = pedRev.filter((p) => p.revendedor_id && p.status === 'entregue' && p.pix2_pago_em && !p.repassado_em);
  const totalRepasse = repasseAberto.reduce((s, p) => s + Number(p.margem_revendedor_total || 0), 0);

  return (
    <div className="ea">
      <Head><title>Revendedores · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>Revendedores</h1>
        <div className="ea-mu">Aprove revendedores, registre a assinatura, confirme o PIX 2 e repasse a margem depois da entrega.</div>
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
          <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o arquivo <b>supabase-revendedores.sql</b> no Supabase (SQL Editor) e recarregue esta página.</p></div>
        )}

        {fase === 'pronto' && d && !d.semSql && (
          <>
            {!(d.config && d.config.pix_chave) && <div className="ea-card"><b>Primeiro passo:</b> cadastre o seu PIX na aba “Meu PIX”. É nele que cai o PIX 2 dos clientes e a assinatura dos revendedores.</div>}
            <div className="ra-row">
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">Revendedores a aprovar</div><b style={{ fontSize: 26 }}>{revs.filter((r) => r.status === 'pendente').length}</b></div>
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">PIX 2 a confirmar</div><b style={{ fontSize: 26 }}>{pix2Aberto.length}</b></div>
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">Margem a repassar</div><b style={{ fontSize: 26 }}>{brl(totalRepasse)}</b></div>
              <div className="ea-card" style={{ flex: '1 1 150px' }}><div className="ea-mu">Pedidos de loja</div><b style={{ fontSize: 26 }}>{d.lojas.filter((l) => l.status === 'novo').length}</b></div>
            </div>
            <div className="ra-tabs">
              {[['revendedores', '🤝 Revendedores'], ['pix2', '💸 PIX 2 e repasses'], ['lojas', '🏪 Lojas'], ['pix', '🔑 Meu PIX']].map(([k, t]) => <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{t}</button>)}
            </div>

            {aba === 'revendedores' && (
              <>
                {revs.length === 0 && <div className="ea-card">Nenhum revendedor ainda. A página de cadastro é {SITE_PUBLICO}/revendedor</div>}
                {revs.map((r) => {
                  const [nome, cor] = STATUS_REV[r.status] || [r.status, '#64748b'];
                  const painel = `${SITE_PUBLICO}/revendedor/${r.token}`;
                  const vendas = `${SITE_PUBLICO}/calcados?rev=${r.codigo}`;
                  return (
                    <div key={r.id} className="ea-card">
                      <div className="ra-row" style={{ justifyContent: 'space-between' }}>
                        <b>{r.nome} · {r.cidade}/{r.estado}</b>
                        <span className="ra-tag" style={{ background: cor }}>{nome}</span>
                      </div>
                      <div className="ea-mu">WhatsApp {r.whatsapp} · margem {String(r.margem_pct).replace('.', ',')}% · assinatura {ASS[statusAssinatura(r.assinatura_ate)]}{r.assinatura_ate ? ` até ${r.assinatura_ate.split('-').reverse().join('/')}` : ''} · código {r.codigo}</div>
                      <div className="ea-mu">Local de entrega: {r.local_entrega || '—'}</div>
                      <div className="ra-row" style={{ marginTop: 10 }}>
                        {r.status !== 'ativo' && <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => post({ acao: 'rev_estado', id: r.id, estado: 'ativo' }, 'Revendedor ativado.')}>Ativar</button>}
                        {r.status === 'ativo' && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => post({ acao: 'rev_estado', id: r.id, estado: 'pausado' }, 'Revendedor pausado.')}>Pausar</button>}
                        {r.status === 'pendente' && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => { if (window.confirm('Recusar este cadastro?')) post({ acao: 'rev_estado', id: r.id, estado: 'recusado' }, 'Cadastro recusado.'); }}>Recusar</button>}
                        <button className="ea-btn" disabled={ocupado} onClick={() => { if (window.confirm(`Confirma o pagamento da assinatura de ${r.nome} (+30 dias)?`)) post({ acao: 'assinatura', id: r.id }, 'Assinatura registrada (+30 dias).'); }}>Registrar assinatura paga</button>
                        <a className="ea-btn ea-btn2" href={zap(r.whatsapp, `Olá, ${r.nome}! Seu painel de revendedor está liberado: ${painel}\nSeu link de vendas: ${vendas}\nGuarde o link do painel, ele é só seu.`)} target="_blank" rel="noopener noreferrer">Enviar links pelo WhatsApp</a>
                      </div>
                      <div className="ra-row" style={{ marginTop: 10 }}>
                        <input style={{ flex: '1 1 240px' }} placeholder="Observação interna" value={notas[r.id] ?? r.observacao_interna ?? ''} onChange={(e) => setNotas({ ...notas, [r.id]: e.target.value })} />
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => post({ acao: 'rev_nota', id: r.id, texto: notas[r.id] ?? r.observacao_interna ?? '' }, 'Observação salva.')}>Salvar</button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {aba === 'pix2' && (
              <>
                <div className="ea-card ea-mu">O PIX 2 é o que o cliente paga a você (comissão + margem do revendedor + frete). Confirme quando cair. A margem só pode ser repassada depois da entrega confirmada e do PIX 2 recebido.</div>
                {d.pedidos.length === 0 && <div className="ea-card">Nenhum pedido pago ainda.</div>}
                {d.pedidos.map((p) => {
                  const v2 = Number(p.total) - Number(p.preco_fornecedor_total);
                  const r = p.revendedor_id ? rev(p.revendedor_id) : null;
                  return (
                    <div key={p.id} className="ea-card">
                      <b>Pedido {p.numero} · {p.cliente_nome}</b> <span className="ea-mu">{data(p.criado_em)} · {forn(p.fornecedor_id).nome_fantasia || ''} · {p.status}</span>
                      <div>PIX 2: <b>{brl(v2)}</b> {p.pix2_pago_em ? `· ✓ recebido ${data(p.pix2_pago_em)}` : '· a confirmar'}</div>
                      <div className="ea-mu">{r ? `Revendedor: ${r.nome} · margem ${brl(p.margem_revendedor_total)}${p.repassado_em ? ` · ✓ repassada ${data(p.repassado_em)}` : ''}` : 'Sem revendedor (venda direta)'}</div>
                      <div className="ra-row" style={{ marginTop: 8 }}>
                        {!p.pix2_pago_em
                          ? <button className="ea-btn" disabled={ocupado} onClick={() => post({ acao: 'pix2', id: p.id }, 'PIX 2 confirmado.')}>Marcar PIX 2 recebido</button>
                          : <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => post({ acao: 'pix2', id: p.id, desfazer: true }, 'Confirmação desfeita.')}>Desfazer PIX 2</button>}
                        {r && !p.repassado_em && p.status === 'entregue' && p.pix2_pago_em && (
                          <>
                            <a className="ea-btn ea-btn2" href={zap(r.whatsapp, `Olá, ${r.nome}! Entrega do pedido ${p.numero} confirmada. Vou repassar a sua margem de ${brl(p.margem_revendedor_total)}.`)} target="_blank" rel="noopener noreferrer">Avisar pelo WhatsApp</a>
                            <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => { if (window.confirm(`Confirma que repassou ${brl(p.margem_revendedor_total)} para ${r.nome}?`)) post({ acao: 'repasse', id: p.id }, 'Repasse registrado.'); }}>Marcar como repassado</button>
                          </>
                        )}
                        {r && p.repassado_em && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => post({ acao: 'repasse', id: p.id, desfazer: true }, 'Repasse desfeito.')}>Desfazer repasse</button>}
                      </div>
                      {r && r.pix_chave && <div className="ea-mu">PIX do revendedor: {r.pix_chave} ({r.pix_nome || ''})</div>}
                    </div>
                  );
                })}
              </>
            )}

            {aba === 'lojas' && (
              <>
                {d.lojas.length === 0 && <div className="ea-card">Nenhum pedido de loja própria ainda.</div>}
                {d.lojas.map((l) => {
                  const r = rev(l.revendedor_id);
                  const pk = PACOTES.find((x) => x.id === l.pacote);
                  return (
                    <div key={l.id} className="ea-card">
                      <b>{r.nome || 'Revendedor'}</b> quer a <b>{pk ? pk.nome : l.pacote}</b> <span className="ea-mu">· {data(l.criado_em)} · {l.status}</span>
                      {l.mensagem && <div className="ea-mu">“{l.mensagem}”</div>}
                      <div className="ra-row" style={{ marginTop: 8 }}>
                        {r.whatsapp && <a className="ea-btn ea-btn2" href={zap(r.whatsapp, `Olá, ${r.nome}! Sobre a ${pk ? pk.nome : 'loja própria'}:`)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>}
                        {['novo', 'em_conversa', 'fechado', 'cancelado'].filter((s) => s !== l.status).map((s) => <button key={s} className="ea-btn ea-btn2" disabled={ocupado} onClick={() => post({ acao: 'loja_status', id: l.id, estado: s }, 'Status atualizado.')}>{s.replace('_', ' ')}</button>)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {aba === 'pix' && (
              <form className="ea-card" onSubmit={(e) => { e.preventDefault(); post({ acao: 'config', ...cfg }, 'PIX salvo.'); }}>
                <h2>Meu PIX</h2>
                <p className="ea-mu">Recebe o PIX 2 de cada pedido (comissão, margem do revendedor e frete) e a assinatura dos revendedores.</p>
                <label>Tipo da chave</label>
                <select value={cfg.pix_tipo} onChange={(e) => setCfg({ ...cfg, pix_tipo: e.target.value })}>{PIX_TIPOS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
                <label style={{ marginTop: 10 }}>Chave PIX</label>
                <input value={cfg.pix_chave} onChange={(e) => setCfg({ ...cfg, pix_chave: e.target.value })} />
                <label style={{ marginTop: 10 }}>Seu nome como aparece no banco (até 25 letras)</label>
                <input value={cfg.pix_nome} onChange={(e) => setCfg({ ...cfg, pix_nome: e.target.value })} maxLength={25} />
                <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Salvar</button></div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
