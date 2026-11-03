// Central de Anúncios da Entrega em Casa: gera textos com IA (canais gratuitos), guarda a biblioteca, agenda, cria a arte e mostra o resultado por canal.
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import AdminNav from '../../lib/AdminNav';
import { CANAIS_ANUNCIO, ANGULOS, SITE } from '../../lib/anuncios';

const CSS = `
.an-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.an-tabs button,.an-chips button{border:1px solid var(--bd);background:var(--cd);color:var(--tx);border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
.an-tabs button.on,.an-chips button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.an-chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.an-chips button{padding:5px 12px;font-size:13px}
.an-cx{display:flex;gap:8px;flex-wrap:wrap}
.an-cx label{display:flex;align-items:center;gap:6px;margin:0;padding:6px 12px;border:1px solid var(--bd);border-radius:999px;color:var(--tx);cursor:pointer;font-size:14px}
.an-cx input{width:auto}
.an-it{border-top:1px solid var(--bd);padding:14px 0}
.an-it:first-child{border-top:0}
.an-top{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px}
.an-av{margin:6px 0;padding:8px 12px;border-radius:8px;border:1px solid var(--am);color:var(--am);font-size:13px}
.an-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:8px}
.an-link{font-size:12px;word-break:break-all;color:var(--mu);margin-top:6px}
.an-tab table{width:100%;border-collapse:collapse}
.an-tab th,.an-tab td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--bd);font-size:14px}
`;
const STATUS = { rascunho: { t: 'Rascunho', c: 'am' }, aprovado: { t: 'Aprovado', c: 'ok' }, publicado: { t: 'Publicado', c: '' } };
const CIDADES = ['Belo Horizonte', 'Rio de Janeiro', 'Goiânia', 'Curitiba', 'Campo Grande', 'Vitória', 'Salvador', 'Florianópolis', 'São Paulo'];
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const UF_DA = { 'Belo Horizonte': 'MG', 'Rio de Janeiro': 'RJ', 'Goiânia': 'GO', 'Curitiba': 'PR', 'Campo Grande': 'MS', 'Vitória': 'ES', 'Salvador': 'BA', 'Florianópolis': 'SC', 'São Paulo': 'SP' };

function quebrar(x, texto, larg) {
  const palavras = String(texto).split(/\s+/); const linhas = []; let atual = '';
  palavras.forEach((p) => { const t = atual ? atual + ' ' + p : p; if (x.measureText(t).width > larg && atual) { linhas.push(atual); atual = p; } else atual = t; });
  if (atual) linhas.push(atual);
  return linhas;
}

// Arte quadrada (1080x1080) desenhada no navegador, com o título do anúncio e um QR code do link.
async function baixarArte(a) {
  const QR = (await import('qrcode')).default;
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 1080, 1080); g.addColorStop(0, '#042925'); g.addColorStop(0.55, '#07463d'); g.addColorStop(1, '#0d6b5c');
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
  x.fillStyle = 'rgba(255,176,32,0.16)'; x.beginPath(); x.arc(930, 150, 260, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#ffb020'; x.font = '700 38px "Segoe UI", Arial, sans-serif'; x.fillText('ENTREGA EM CASA', 80, 120);
  x.fillStyle = '#fff'; x.font = '800 92px "Segoe UI", Arial, sans-serif';
  const linhas = quebrar(x, a.titulo || ANGULOS[a.angulo].titulo, 900).slice(0, 4);
  linhas.forEach((l, i) => x.fillText(l, 80, 270 + i * 106));
  x.fillStyle = '#ffc15a'; x.font = '700 46px "Segoe UI", Arial, sans-serif';
  x.fillText('Peça o que quiser. Pedir é grátis.', 80, 270 + linhas.length * 106 + 40);
  const qr = document.createElement('canvas');
  await QR.toCanvas(qr, a.link, { width: 250, margin: 1, color: { dark: '#042925', light: '#ffffff' } });
  x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(770, 740, 270, 270, 24) : x.rect(770, 740, 270, 270); x.fill();
  x.drawImage(qr, 780, 750, 250, 250);
  x.fillStyle = '#cdeee3'; x.font = '600 38px "Segoe UI", Arial, sans-serif';
  x.fillText(a.cidade ? `${a.cidade}${a.uf ? '-' + a.uf : ''}` : 'Todo o Brasil', 80, 930);
  x.font = '600 32px "Segoe UI", Arial, sans-serif'; x.fillStyle = '#9fd8c7'; x.fillText('igreja.eco.br/encomendar', 80, 980);
  const url = c.toDataURL('image/png');
  const l = document.createElement('a'); l.href = url; l.download = `arte-${a.campanha}-${a.canal}.png`; l.click();
}

async function copiar(texto) { try { await navigator.clipboard.writeText(texto); return true; } catch (e) { return false; } }

export default function AdminAnuncios() {
  const [fase, setFase] = useState('carregando');
  const [d, setD] = useState(null);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aba, setAba] = useState('gerar');
  const [filtro, setFiltro] = useState('');
  const [ed, setEd] = useState({});
  const [f, setF] = useState({ cidade: '', uf: '', angulo: 'prova', canais: ['feed', 'story', 'reels', 'whatsapp', 'grupo'] });

  const carregar = useCallback(async () => {
    try { setD(await api('/api/admin/anuncios')); setFase('pronto'); }
    catch (e) { if (e.status === 401) setFase('login'); else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); } }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const entrar = async (ev) => {
    ev.preventDefault(); setOcupado(true);
    try { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); await carregar(); } catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const enviar = async (corpo, depois) => {
    setOcupado(true); setMsg(null);
    try { const j = await api('/api/admin/anuncios', { method: 'POST', body: corpo }); setD(j); setMsg({ tipo: 'ok', texto: j.aviso || 'Pronto.' }); if (depois) depois(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  };
  const campo = (id, k, v) => setEd((x) => ({ ...x, [id]: { ...(x[id] || {}), [k]: v } }));
  const val = (a, k) => (ed[a.id] && ed[a.id][k] !== undefined ? ed[a.id][k] : (a[k] ?? ''));
  const marcarCanal = (k) => setF((x) => ({ ...x, canais: x.canais.includes(k) ? x.canais.filter((i) => i !== k) : [...x.canais, k] }));
  const avisoCopia = async (t, rotulo) => { const ok = await copiar(t); setMsg({ tipo: ok ? 'ok' : 'er', texto: ok ? `${rotulo} copiado.` : 'Não consegui copiar. Selecione e copie à mão.' }); };

  const lista = d ? d.anuncios : [];
  const visiveis = filtro ? lista.filter((a) => a.status === filtro) : lista;
  const n = (s) => lista.filter((a) => a.status === s).length;
  const totVis = d ? d.resultados.reduce((s, r) => s + r.visitas, 0) : 0;
  const totPed = d ? d.resultados.reduce((s, r) => s + r.pedidos, 0) : 0;

  return (
    <>
      <Head><title>Anúncios | Painel</title><meta name="robots" content="noindex" /></Head>
      <div className="ea">
        <style>{ADMIN_CSS}{CSS}</style>
        <div className="ea-in an-tab">
          <AdminNav />
          <h1>Central de Anúncios</h1>
          <div className="ea-mu">Gera anúncios gratuitos da Entrega em Casa com IA, guarda a biblioteca, agenda os posts e mostra quantas visitas e pedidos cada canal trouxe. A IA escreve; você confere e posta.</div>

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
                  <span className="ea-tag am">{n('rascunho')} rascunho(s)</span>
                  <span className="ea-tag ok">{n('aprovado')} aprovado(s) para postar</span>
                  <span className="ea-tag">{n('publicado')} publicado(s)</span>
                  <span className="ea-tag">{totVis} visitas e {totPed} pedidos em 30 dias</span>
                </div>
              </div>
              <div className="an-tabs">
                <button className={aba === 'gerar' ? 'on' : ''} onClick={() => setAba('gerar')}>✨ Gerar</button>
                <button className={aba === 'biblioteca' ? 'on' : ''} onClick={() => setAba('biblioteca')}>📚 Biblioteca ({lista.length})</button>
                <button className={aba === 'resultados' ? 'on' : ''} onClick={() => setAba('resultados')}>📊 Resultados</button>
              </div>

              {aba === 'gerar' && (
                <div className="ea-card">
                  <h2>Gerar anúncios</h2>
                  <div className="an-g">
                    <div><label>Cidade-alvo (opcional)</label>
                      <input list="an-cidades" value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value, uf: UF_DA[e.target.value] || f.uf })} placeholder="Ex.: Belo Horizonte" />
                      <datalist id="an-cidades">{CIDADES.map((c) => <option key={c} value={c} />)}</datalist></div>
                    <div><label>Estado</label>
                      <select value={f.uf} onChange={(e) => setF({ ...f, uf: e.target.value })}><option value="">—</option>{UFS.map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
                    <div><label>Ângulo da mensagem</label>
                      <select value={f.angulo} onChange={(e) => setF({ ...f, angulo: e.target.value })}>{Object.entries(ANGULOS).map(([k, a]) => <option key={k} value={k}>{a.nome}</option>)}</select></div>
                  </div>
                  <div style={{ marginTop: 12 }}><label>Canais (todos gratuitos)</label>
                    <div className="an-cx">{Object.entries(CANAIS_ANUNCIO).map(([k, c]) => (
                      <label key={k}><input type="checkbox" checked={f.canais.includes(k)} onChange={() => marcarCanal(k)} />{c.emoji} {c.nome}</label>
                    ))}</div></div>
                  <div style={{ marginTop: 14 }}>
                    <button className="ea-btn" disabled={ocupado || !f.canais.length} onClick={() => enviar({ acao: 'gerar', ...f }, () => setAba('biblioteca'))}>{ocupado ? 'Gerando…' : 'Gerar anúncios'}</button>
                  </div>
                  <p className="ea-mu" style={{ marginTop: 12 }}>Cada anúncio sai com um link rastreado (canal e campanha), uma conferência automática do texto (sem promessa de data, ganho ou urgência falsa) e uma ideia de arte. Se a cota do Gemini acabar, o sistema usa textos-modelo.</p>
                </div>
              )}

              {aba === 'biblioteca' && (
                <div className="ea-card">
                  <div className="an-chips">
                    <button className={filtro === '' ? 'on' : ''} onClick={() => setFiltro('')}>Todos</button>
                    {Object.entries(STATUS).map(([k, s]) => <button key={k} className={filtro === k ? 'on' : ''} onClick={() => setFiltro(k)}>{s.t} ({n(k)})</button>)}
                  </div>
                  {!visiveis.length && <div className="ea-mu">Nenhum anúncio aqui ainda. Gere na aba Gerar.</div>}
                  {visiveis.map((a) => {
                    const canal = CANAIS_ANUNCIO[a.canal] || { nome: a.canal, emoji: '📣', dica: '' };
                    const st = STATUS[a.status] || { t: a.status, c: '' };
                    return (
                      <div key={a.id} className="an-it">
                        <div className="an-top">
                          <b>{canal.emoji} {canal.nome}</b>
                          <span className={`ea-tag ${st.c}`}>{st.t}</span>
                          <span className="ea-tag">{(ANGULOS[a.angulo] || {}).nome || a.angulo}</span>
                          {a.cidade && <span className="ea-tag">📍 {a.cidade}{a.uf ? '-' + a.uf : ''}</span>}
                          <span className="ea-tag">{a.gerado_por === 'ia' ? '🤖 IA' : '📄 modelo'}</span>
                        </div>
                        {(a.avisos || []).map((v) => <div key={v} className="an-av">⚠️ {v}</div>)}
                        <label>Título da arte</label>
                        <input value={val(a, 'titulo')} onChange={(e) => campo(a.id, 'titulo', e.target.value)} />
                        <label style={{ marginTop: 8 }}>Texto</label>
                        <textarea value={val(a, 'texto')} onChange={(e) => campo(a.id, 'texto', e.target.value)} />
                        {a.arte && <div className="ea-mu" style={{ marginTop: 6 }}>🎨 Ideia de arte: {a.arte}</div>}
                        <div className="ea-mu">💡 {canal.dica}</div>
                        <div className="an-link">🔗 {a.link}</div>
                        <div className="an-g">
                          <div><label>Situação</label>
                            <select value={val(a, 'status')} onChange={(e) => campo(a.id, 'status', e.target.value)}>
                              {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.t}</option>)}</select></div>
                          <div><label>Postar em</label>
                            <input type="date" value={val(a, 'agendado_para') || ''} onChange={(e) => campo(a.id, 'agendado_para', e.target.value)} /></div>
                        </div>
                        <div className="ea-row" style={{ marginTop: 10 }}>
                          <button className="ea-btn" disabled={ocupado || !ed[a.id] || !Object.keys(ed[a.id]).length} onClick={() => enviar({ acao: 'atualizar', id: a.id, ...(ed[a.id] || {}) }, () => setEd((x) => ({ ...x, [a.id]: {} })))}>Salvar</button>
                          <button className="ea-btn ea-btn2" onClick={() => avisoCopia(val(a, 'texto'), 'Texto')}>Copiar texto</button>
                          <button className="ea-btn ea-btn2" onClick={() => avisoCopia(a.link, 'Link')}>Copiar link</button>
                          {['feed', 'story', 'facebook', 'whatsapp', 'grupo', 'telegram'].includes(a.canal) && <button className="ea-btn ea-btn2" onClick={() => baixarArte({ ...a, titulo: val(a, 'titulo') })}>Baixar arte</button>}
                          <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => { if (window.confirm('Excluir este anúncio?')) enviar({ acao: 'excluir', id: a.id }); }}>Excluir</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {aba === 'resultados' && (
                <div className="ea-card">
                  <h2>Resultado por canal e campanha (30 dias)</h2>
                  <div className="ea-mu">Visitas contam só quem entrou por um link rastreado da Central; pedidos são as encomendas feitas depois dessa visita. O que traz pedido merece mais anúncios.</div>
                  {!d.resultados.length && <div className="ea-mu" style={{ marginTop: 10 }}>Ainda sem visitas. Poste um anúncio aprovado e volte aqui.</div>}
                  {d.resultados.length > 0 && (
                    <table style={{ marginTop: 10 }}>
                      <thead><tr><th>Canal</th><th>Campanha</th><th>Visitas</th><th>Pedidos</th><th>Pedidos por visita</th></tr></thead>
                      <tbody>{d.resultados.map((r) => (
                        <tr key={r.canal + r.campanha}>
                          <td>{(CANAIS_ANUNCIO[r.canal] || { nome: r.canal }).nome}</td><td>{r.campanha}</td><td>{r.visitas}</td><td>{r.pedidos}</td>
                          <td>{r.visitas ? Math.round((r.pedidos / r.visitas) * 100) + '%' : '—'}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
          <div className="ea-mu" style={{ marginTop: 16 }}>Os links apontam para {SITE}/encomendar. O lembrete diário no Telegram usa o fluxo n8n/anuncios-hoje-7h.json.</div>
        </div>
      </div>
    </>
  );
}
