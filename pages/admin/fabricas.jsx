// Painel da vitrine "Fábricas de Franca": cadastrar empresas, ver cliques e conferir compras registradas.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { SEGMENTOS } from '../../lib/fabricasFranca';

const CSS = `
.fa-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.fa-tabs button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.fa-tabs button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.fa-lin{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--bd)}
.fa-lin:last-child{border-bottom:0}
.fa-chk{display:flex;gap:8px;align-items:center}
.fa-chk input{width:auto}
`;
const VAZIO = { id: '', nome: '', site_url: 'https://', segmento: 'calcados', cidade: 'Franca, SP', descricao: '', cnpj: '', patrocinada: false, patrocinio_ate: '', patrocinio_obs: '', ordem: 100, ativo: true };
const dataBR = (s) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');

export default function AdminFabricas() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [aba, setAba] = useState('empresas');
  const [form, setForm] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [dias, setDias] = useState('');
  const [motivo, setMotivo] = useState({});

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/fabricas')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { if (d && d.bonus_dias !== undefined && dias === '') setDias(String(d.bonus_dias)); }, [d, dias]);

  async function agir(corpo, ok) {
    setOcupado(true); setMsg(null);
    try {
      const j = await api('/api/admin/fabricas', { method: 'POST', body: corpo });
      setD(j);
      setMsg({ tipo: 'ok', texto: j.aviso || ok || 'Pronto.' });
      return true;
    } catch (e) { setMsg({ tipo: 'er', texto: e.message }); return false; }
    finally { setOcupado(false); }
  }
  const entrar = async (ev) => { ev.preventDefault(); setOcupado(true); try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); } setOcupado(false); };
  const salvar = async (ev) => { ev.preventDefault(); if (await agir({ acao: 'salvar', ...form })) setForm(null); };
  const mud = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const pronto = fase === 'pronto' && d && !d.semSql;
  const pendentes = pronto ? d.comprovantes.filter((c) => c.status === 'pendente') : [];

  return (
    <div className="ea">
      <Head><title>Fábricas de Franca · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <h1>Vitrine de fábricas</h1>
        <div className="ea-mu">Empresas de Franca listadas em <Link href="/fabricas">/fabricas</Link>. A compra acontece no site de cada empresa.</div>
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
          <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o SQL <b>supabase-fabricas-franca.sql</b> no Supabase e recarregue esta página.</p></div>
        )}

        {pronto && (
          <>
            <div className="fa-tabs">
              {[['empresas', `🏭 Empresas (${d.lojas.length})`], ['compras', `🧾 Compras registradas${pendentes.length ? ` (${pendentes.length} novas)` : ''}`], ['cliques', '📈 Cliques']].map(([k, t]) => (
                <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{t}</button>
              ))}
            </div>

            {aba === 'empresas' && (
              <>
                {!form && <div className="ea-row"><button className="ea-btn" onClick={() => setForm({ ...VAZIO })}>+ Adicionar empresa</button></div>}
                {form && (
                  <form className="ea-card" onSubmit={salvar}>
                    <h2>{form.id ? 'Editar empresa' : 'Nova empresa'}</h2>
                    <div className="ea-grid">
                      <div><label>Nome da empresa *</label><input value={form.nome} onChange={mud('nome')} required /></div>
                      <div><label>Site onde se compra * (https://)</label><input value={form.site_url} onChange={mud('site_url')} required inputMode="url" /></div>
                      <div><label>Segmento</label><select value={form.segmento} onChange={mud('segmento')}>{Object.entries(SEGMENTOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                      <div><label>Cidade</label><input value={form.cidade} onChange={mud('cidade')} /></div>
                      <div><label>CNPJ (só números; ajuda a conferir a nota)</label><input value={form.cnpj || ''} onChange={mud('cnpj')} inputMode="numeric" /></div>
                      <div><label>Ordem (menor aparece primeiro)</label><input type="number" value={form.ordem} onChange={mud('ordem')} /></div>
                    </div>
                    <div style={{ marginTop: 10 }}><label>Descrição (até 400 letras, escreva com as suas palavras)</label><textarea value={form.descricao || ''} onChange={mud('descricao')} maxLength={400} style={{ minHeight: 80 }} /></div>
                    <div className="ea-card" style={{ marginTop: 12 }}>
                      <label className="fa-chk"><input type="checkbox" checked={!!form.patrocinada} onChange={mud('patrocinada')} /> <b>Destaque patrocinado</b> (aparece no topo, com a etiqueta “Publicidade”)</label>
                      <div className="ea-grid" style={{ marginTop: 10 }}>
                        <div><label>Patrocínio vale até</label><input type="date" value={form.patrocinio_ate || ''} onChange={mud('patrocinio_ate')} /></div>
                        <div><label>Anotação privada (valor combinado, contato)</label><input value={form.patrocinio_obs || ''} onChange={mud('patrocinio_obs')} /></div>
                      </div>
                      <div className="ea-mu" style={{ marginTop: 6 }}>Só marque como patrocinada se houver acordo e pagamento. Sem isso, a empresa aparece como as outras.</div>
                    </div>
                    <label className="fa-chk" style={{ marginTop: 10 }}><input type="checkbox" checked={form.ativo !== false} onChange={mud('ativo')} /> Publicada na página</label>
                    <div className="ea-row" style={{ marginTop: 12 }}>
                      <button className="ea-btn" disabled={ocupado}>Salvar</button>
                      <button type="button" className="ea-btn ea-btn2" onClick={() => setForm(null)}>Cancelar</button>
                    </div>
                  </form>
                )}
                <div className="ea-card">
                  {d.lojas.length === 0 && <div className="ea-mu">Nenhuma empresa ainda. Adicione a primeira.</div>}
                  {d.lojas.map((l) => (
                    <div className="fa-lin" key={l.id}>
                      <div>
                        <b>{l.nome}</b> <span className="ea-tag">{SEGMENTOS[l.segmento]}</span>{' '}
                        {l.patrocinada && <span className="ea-tag am">Patrocinada{l.patrocinio_ate ? ` até ${dataBR(l.patrocinio_ate)}` : ''}</span>}{' '}
                        {!l.ativo && <span className="ea-tag er">Oculta</span>}
                        <div className="ea-mu">{l.site_url} · cliques: {(d.cont[l.id] || { d7: 0 }).d7} (7 dias)</div>
                      </div>
                      <div className="ea-row">
                        <button className="ea-btn ea-btn2" onClick={() => setForm({ ...VAZIO, ...l, cnpj: l.cnpj || '', patrocinio_ate: l.patrocinio_ate || '' })}>Editar</button>
                        <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => agir({ acao: 'ativo', id: l.id, ativo: !l.ativo })}>{l.ativo ? 'Ocultar' : 'Publicar'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {aba === 'compras' && (
              <>
                <div className="ea-card">
                  <h2>Bônus de passe</h2>
                  <p className="ea-mu">Dias de passe que o cliente ganha quando você aprova uma compra registrada. Zero desliga o bônus.</p>
                  <div className="ea-row">
                    <input type="number" min="0" max="365" value={dias} onChange={(e) => setDias(e.target.value)} style={{ width: 110 }} />
                    <button className="ea-btn" disabled={ocupado} onClick={() => agir({ acao: 'bonus', dias })}>Salvar</button>
                  </div>
                </div>
                <div className="ea-card">
                  <h2>Compras registradas</h2>
                  <p className="ea-mu">O site confere o formato da chave da nota, o CNPJ da empresa e se a nota já foi usada. Ele não consulta a Receita: para ter certeza, cole a chave em <b>nfe.fazenda.gov.br</b> (consulta completa) antes de aprovar.</p>
                  {d.comprovantes.length === 0 && <div className="ea-mu">Nenhuma compra registrada ainda.</div>}
                  {d.comprovantes.map((c) => (
                    <div className="fa-lin" key={c.id} style={{ alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <b>#{c.numero} · {c.nome}</b> <span className={`ea-tag ${c.status === 'aprovado' ? 'ok' : c.status === 'recusado' ? 'er' : 'am'}`}>{c.status}</span>
                        <div className="ea-mu">{c.loja || 'Empresa removida'} · {c.email} · {c.whatsapp} · {dataBR(c.criado_em)}</div>
                        {c.chave_nfe && <div className="ea-mu" style={{ wordBreak: 'break-all' }}>Chave: {c.chave_nfe}</div>}
                        {c.pedido_ref && <div className="ea-mu">Pedido na loja: {c.pedido_ref}</div>}
                        {c.verificacao && <div className="ea-mu">Conferência automática: {c.verificacao}</div>}
                        {c.status === 'aprovado' && <div className="ea-mu">{c.bonus_dias} dias de passe liberados.</div>}
                        {c.status === 'recusado' && c.motivo && <div className="ea-mu">Motivo: {c.motivo}</div>}
                      </div>
                      {c.status === 'pendente' && (
                        <div className="ea-row">
                          <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => agir({ acao: 'aprovar', id: c.id })}>Aprovar</button>
                          <input placeholder="Motivo da recusa" value={motivo[c.id] || ''} onChange={(e) => setMotivo({ ...motivo, [c.id]: e.target.value })} style={{ width: 180 }} />
                          <button className="ea-btn ea-btn-er" disabled={ocupado} onClick={() => agir({ acao: 'recusar', id: c.id, motivo: motivo[c.id] })}>Recusar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {aba === 'cliques' && (
              <div className="ea-card">
                <h2>Cliques no botão “Ir para o site da empresa”</h2>
                <p className="ea-mu">Use estes números para mostrar resultado a quem quiser patrocinar. Cada pessoa conta uma vez por dia por empresa.</p>
                {d.lojas.map((l) => {
                  const c = d.cont[l.id] || { d7: 0, d30: 0 };
                  return <div className="fa-lin" key={l.id}><span><b>{l.nome}</b></span><span className="ea-mu">7 dias: <b>{c.d7}</b> · 30 dias: <b>{c.d30}</b></span></div>;
                })}
                {d.lojas.length === 0 && <div className="ea-mu">Sem empresas ainda.</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
