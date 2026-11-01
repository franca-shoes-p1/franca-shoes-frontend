// Departamento Vitrine: achados da IA para validar, fila de divulgação e fontes de busca.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';

const CSS = `
.vt-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.vt-tabs button,.vt-chips button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.vt-tabs button.on,.vt-chips button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.vt-chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.vt-chips button{padding:5px 12px;font-size:13px}
.vt-ac{padding:14px 0;border-top:1px solid var(--bd)}
.vt-ac:first-child{border-top:0}
.vt-tit{font-weight:700}
.vt-lk{word-break:break-all;font-size:13px}
.vt-txt{white-space:pre-wrap;background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:10px;margin:8px 0;font-size:14px}
.vt-g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:8px}
`;
const STATUS = { novo: 'Novo', em_validacao: 'Em validação', validado: 'Validado', aprovado: 'Aprovado', rejeitado: 'Rejeitado' };
const COR = { novo: 'am', em_validacao: 'am', validado: 'ok', aprovado: 'ok', rejeitado: 'er' };
const brl = (n) => (n == null ? '' : 'R$ ' + Number(n).toFixed(2).replace('.', ','));

export default function AdminVitrine() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('achados');
  const [filtro, setFiltro] = useState('');
  const [campos, setCampos] = useState({});
  const [novo, setNovo] = useState({ url: '', titulo: '', preco_visto: '' });
  const [fonte, setFonte] = useState({ tipo: 'busca', valor: '', categoria: '' });

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/vitrine')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const enviar = async (corpo, okTexto) => {
    setOcupado(true); setMsg(null);
    try {
      const j = await api('/api/admin/vitrine', { method: 'POST', body: corpo });
      setD(j);
      setMsg({ tipo: 'ok', texto: j.aviso || okTexto || 'Pronto.' });
    } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const entrar = async (ev) => {
    ev.preventDefault(); setOcupado(true);
    try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const setC = (id, k, v) => setCampos((c) => ({ ...c, [id]: { ...(c[id] || {}), [k]: v } }));
  const copiar = async (t) => { try { await navigator.clipboard.writeText(t); setMsg({ tipo: 'ok', texto: 'Texto copiado.' }); } catch (e) { setMsg({ tipo: 'er', texto: 'Não consegui copiar. Selecione o texto e copie à mão.' }); } };

  const achados = d && d.achados ? d.achados.filter((a) => !filtro || a.status === filtro) : [];
  const nStatus = (s) => (d && d.achados ? d.achados.filter((a) => a.status === s).length : 0);

  return (
    <>
      <Head><title>Vitrine | Painel</title><meta name="robots" content="noindex" /></Head>
      <div className="ea">
        <style>{ADMIN_CSS}{CSS}</style>
        <div className="ea-in">
          <AdminNav />
          <h1>Vitrine de produtos físicos</h1>
          <div className="ea-mu">A IA procura e sugere. Uma pessoa valida com o fornecedor. Você aprova. Nada vai para a loja sem a sua decisão.</div>

          {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
          {fase === 'login' && (
            <form className="ea-card" onSubmit={entrar}>
              <h2>Entrar</h2><label>Senha do painel</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
              <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Entrar</button></div>
            </form>
          )}
          {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}

          {fase === 'pronto' && d && d.semSql && (
            <div className="ea-card"><h2>Falta uma etapa</h2><p>Rode uma vez o SQL <b>supabase-vitrine.sql</b> no Supabase e recarregue esta página.</p></div>
          )}

          {fase === 'pronto' && d && !d.semSql && (
            <>
              <div className="ea-card">
                <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                  <div className="ea-row">
                    <span className="ea-tag am">{nStatus('novo')} novos</span>
                    <span className="ea-tag">{nStatus('em_validacao')} em validação</span>
                    <span className="ea-tag ok">{nStatus('validado')} validados</span>
                    <span className="ea-tag">{d.divulgacoes.length} textos esperando post</span>
                    {d.leads7 !== null && <span className="ea-tag ok">{d.leads7} leads em 7 dias</span>}
                  </div>
                  <div className="ea-row">
                    <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => enviar({ acao: 'rodar_garimpo' })}>Rodar garimpo agora</button>
                    <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => enviar({ acao: 'rodar_divulgacao' })}>Criar divulgação agora</button>
                  </div>
                </div>
              </div>

              <div className="vt-tabs">
                {[['achados', 'Achados'], ['divulgacao', 'Divulgação'], ['fontes', 'Fontes de busca'], ['como', 'Como funciona']].map(([k, t]) => (
                  <button key={k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{t}</button>
                ))}
              </div>

              {aba === 'achados' && (
                <div className="ea-card">
                  <h2>Produtos encontrados</h2>
                  <div className="vt-chips">
                    <button className={!filtro ? 'on' : ''} onClick={() => setFiltro('')}>Todos</button>
                    {Object.entries(STATUS).map(([k, t]) => <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{t}</button>)}
                  </div>
                  {achados.length === 0 && <p className="ea-mu">Nada por aqui ainda. Rode o garimpo ou cadastre um achado abaixo.</p>}
                  {achados.map((a) => {
                    const c = campos[a.id] || {};
                    return (
                      <div className="vt-ac" key={a.id}>
                        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                          <div className="vt-tit">{a.titulo || 'Sem título'}</div>
                          <span className={`ea-tag ${COR[a.status]}`}>{STATUS[a.status]}</span>
                        </div>
                        <div className="ea-mu">{[a.categoria, a.fornecedor, a.preco_visto ? `preço visto (só pista): ${brl(a.preco_visto)}` : '', a.origem === 'manual' ? 'cadastrado à mão' : 'achado pela IA'].filter(Boolean).join(' · ')}</div>
                        <div className="vt-lk"><a href={a.url} target="_blank" rel="noopener noreferrer">{a.url}</a></div>
                        {a.descricao && <div className="ea-mu" style={{ marginTop: 4 }}>{a.descricao}</div>}
                        {a.notas && <div className="ea-mu" style={{ marginTop: 4 }}>📝 {a.notas}</div>}
                        {a.status !== 'aprovado' && (
                          <div className="ea-row" style={{ marginTop: 8 }}>
                            {a.status === 'novo' && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => enviar({ acao: 'achado_status', id: a.id, status: 'em_validacao' })}>Liberar para validar</button>}
                            {['novo', 'em_validacao'].includes(a.status) && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => enviar({ acao: 'achado_status', id: a.id, status: 'validado' })}>Marcar como validado</button>}
                            {a.status !== 'rejeitado' && <button className="ea-btn ea-btn2 ea-btn-er" disabled={ocupado} onClick={() => enviar({ acao: 'achado_status', id: a.id, status: 'rejeitado' })}>Rejeitar</button>}
                          </div>
                        )}
                        {a.status === 'validado' && (
                          <div>
                            <div className="vt-g2">
                              <div><label>Custo confirmado pelo fornecedor (R$)</label><input inputMode="decimal" value={c.custo || ''} onChange={(e) => setC(a.id, 'custo', e.target.value)} /></div>
                              <div><label>Preço de venda (R$), opcional</label><input inputMode="decimal" value={c.venda || ''} onChange={(e) => setC(a.id, 'venda', e.target.value)} /></div>
                            </div>
                            <div style={{ marginTop: 8 }}><button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => enviar({ acao: 'achado_aprovar', id: a.id, custo: c.custo, preco_venda: c.venda })}>Aprovar e criar rascunho no catálogo</button></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <h2 style={{ marginTop: 22 }}>Cadastrar um achado à mão</h2>
                  <div className="vt-g2">
                    <div><label>Endereço da página (https://…)</label><input value={novo.url} onChange={(e) => setNovo({ ...novo, url: e.target.value })} /></div>
                    <div><label>Nome do produto</label><input value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} /></div>
                    <div><label>Preço visto (R$)</label><input inputMode="decimal" value={novo.preco_visto} onChange={(e) => setNovo({ ...novo, preco_visto: e.target.value })} /></div>
                  </div>
                  <div style={{ marginTop: 8 }}><button className="ea-btn" disabled={ocupado} onClick={async () => { await enviar({ acao: 'achado_add', ...novo }, 'Achado cadastrado.'); setNovo({ url: '', titulo: '', preco_visto: '' }); }}>Cadastrar achado</button></div>
                </div>
              )}

              {aba === 'divulgacao' && (
                <div className="ea-card">
                  <h2>Textos esperando alguém postar</h2>
                  <div className="ea-mu">O canal do Telegram é automático. Os demais viram tarefa: copie o texto, publique onde a divulgação é permitida e marque como feito.</div>
                  {d.divulgacoes.length === 0 && <p className="ea-mu">Nada pendente. Use “Criar divulgação agora” depois de publicar modelos no catálogo.</p>}
                  {d.divulgacoes.map((x) => (
                    <div className="vt-ac" key={x.id}>
                      <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                        <div className="vt-tit">{x.produto}</div>
                        <span className="ea-tag">{(d.canais.find((c) => c.slug === x.canal) || {}).nome || x.canal}</span>
                      </div>
                      <div className="vt-txt">{x.texto}</div>
                      <div className="ea-row">
                        <button className="ea-btn ea-btn2" onClick={() => copiar(x.texto)}>Copiar texto</button>
                        <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => enviar({ acao: 'divulgacao_marcar', id: x.id, status: 'feito' })}>Já postei</button>
                        <button className="ea-btn ea-btn2 ea-btn-er" disabled={ocupado} onClick={() => enviar({ acao: 'divulgacao_marcar', id: x.id, status: 'pulado' })}>Pular</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {aba === 'fontes' && (
                <div className="ea-card">
                  <h2>De onde a IA procura</h2>
                  <div className="ea-mu">“Página” é o endereço de um fornecedor. “Busca” é uma frase que a IA pesquisa na internet (poucas por dia, por causa da cota gratuita).</div>
                  {d.fontes.map((f) => (
                    <div className="ea-item" key={f.id}>
                      <div><div className="vt-tit">{f.tipo === 'pagina' ? '🔗 Página' : '🔎 Busca'}{f.categoria ? ` · ${f.categoria}` : ''}</div><div className="vt-lk">{f.valor}</div></div>
                      <div className="ea-row">
                        <button className={`ea-btn ea-btn2 ${f.ativo ? '' : 'ea-btn-er'}`} disabled={ocupado} onClick={() => enviar({ acao: 'fonte_toggle', id: f.id, ativo: !f.ativo })}>{f.ativo ? 'Ativa' : 'Pausada'}</button>
                        <button className="ea-btn ea-btn2 ea-btn-er" disabled={ocupado} onClick={() => { if (confirm('Remover esta fonte?')) enviar({ acao: 'fonte_del', id: f.id }); }}>Remover</button>
                      </div>
                    </div>
                  ))}
                  <h2 style={{ marginTop: 22 }}>Acrescentar fonte</h2>
                  <div className="vt-g2">
                    <div><label>Tipo</label><select value={fonte.tipo} onChange={(e) => setFonte({ ...fonte, tipo: e.target.value })}><option value="busca">Frase de busca</option><option value="pagina">Página de fornecedor</option></select></div>
                    <div><label>{fonte.tipo === 'pagina' ? 'Endereço (https://…)' : 'Frase de busca'}</label><input value={fonte.valor} onChange={(e) => setFonte({ ...fonte, valor: e.target.value })} /></div>
                    <div><label>Categoria (opcional)</label><input value={fonte.categoria} onChange={(e) => setFonte({ ...fonte, categoria: e.target.value })} placeholder="Masculino, Feminino, Acessórios" /></div>
                  </div>
                  <div style={{ marginTop: 8 }}><button className="ea-btn" disabled={ocupado} onClick={async () => { await enviar({ acao: 'fonte_add', ...fonte }, 'Fonte acrescentada.'); setFonte({ tipo: fonte.tipo, valor: '', categoria: '' }); }}>Acrescentar</button></div>
                </div>
              )}

              {aba === 'como' && (
                <div className="ea-card">
                  <h2>Como o departamento funciona</h2>
                  <ol>
                    <li><b>IA garimpa</b> todo dia: lê as páginas de fornecedores cadastradas e pesquisa as frases de busca. Resultado: novos <b>achados</b>.</li>
                    <li>Você <b>libera</b> um achado e uma pessoa do setor Vitrine o <b>valida</b> com o fornecedor (cartão V1): preço de revenda, pedido mínimo, prazo e autorização das fotos.</li>
                    <li>Com o custo confirmado, você <b>aprova</b>: nasce um <b>rascunho escondido</b> no catálogo. Foto e preço final são conferidos em /admin/calcados.</li>
                    <li>Modelo publicado → a IA <b>escreve os textos</b> de divulgação e o canal do Telegram recebe o post sozinho. Os outros canais viram tarefas (cartão V4).</li>
                    <li>Cada link leva um código de origem. Os interessados que deixam o WhatsApp na vitrine aparecem como <b>leads</b>.</li>
                  </ol>
                  <p className="ea-mu">Regras: a IA nunca confirma preço nem autorização de foto; não lê sites que proíbem robôs (marketplaces e redes sociais); ninguém recebe mensagem em massa sem ter pedido.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
