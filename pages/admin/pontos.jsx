import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import { TIPOS, STATUS, CIDADES, SEMENTE_BH, SITE_PUBLICO, textoConvite } from '../../lib/pontos';
import { GRUPOS } from '../../lib/mapeador';
import AdminNav from '../../lib/AdminNav';

const CSS = `
.pt-mapa{height:420px;border-radius:12px;border:1px solid var(--bd);margin-top:12px;z-index:0}
.pt-lin{border-top:1px solid var(--bd);padding:12px 0}
.pt-lin:first-child{border-top:0}
.pt-bol{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px}
.pt-ac{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.pt-ac .ea-btn{padding:6px 12px;font-size:13px}
.pt-txt{white-space:pre-wrap;font-size:13px;background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px;margin-top:8px}
.ea a.ea-btn{color:#fff}.ea a.ea-btn2{color:var(--ac)}
.pt-leg{display:flex;gap:12px;flex-wrap:wrap;font-size:13px;margin-top:8px}
`;

const VAZIO = { nome: '', tipo: 'comercio', endereco: '', lat: '', lng: '', contato_email: '', contato_whatsapp: '', observacao: '' };

export default function AdminPontos() {
  const [fase, setFase] = useState('carregando');
  const [pontos, setPontos] = useState([]);
  const [cidade, setCidade] = useState('Belo Horizonte');
  const [uf, setUf] = useState('MG');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [f, setF] = useState(VAZIO);
  const [texto, setTexto] = useState(null); // {id, conteudo}
  const [grupos, setGrupos] = useState(['comercio', 'academia']);
  const [quantos, setQuantos] = useState(40);
  const [filtro, setFiltro] = useState('todos');
  const [limite, setLimite] = useState(30);
  const mapaEl = useRef(null);
  const mapa = useRef(null);
  const camada = useRef(null);
  const [leafletOk, setLeafletOk] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const d = await api('/api/admin/pontos');
      setPontos(d.pontos || []);
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); }
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, okTexto) {
    setOcupado(true); setMsg(null);
    try { await fn(); if (okTexto) setMsg({ tipo: 'ok', texto: okTexto }); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }

  // Leaflet (mapa gratuito do OpenStreetMap), carregado só quando o painel abre
  useEffect(() => {
    if (fase !== 'pronto') return;
    let vivo = true;
    import('leaflet').then((m) => {
      window.L = m.default || m;
      if (vivo) setLeafletOk(true);
    });
    return () => { vivo = false; };
  }, [fase]);

  const daCidade = pontos.filter((p) => p.cidade === cidade);
  const visiveis = daCidade.filter((p) => filtro === 'todos' || p.status === filtro);
  const cidades = Array.from(new Set([...Object.keys(CIDADES), ...pontos.map((p) => p.cidade)]));

  useEffect(() => {
    if (!leafletOk || !mapaEl.current) return;
    const L = window.L;
    if (!mapa.current) {
      const c = CIDADES[cidade] || { lat: -15.78, lng: -47.93 };
      mapa.current = L.map(mapaEl.current).setView([c.lat, c.lng], CIDADES[cidade] ? 12 : 4);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapa.current);
      camada.current = L.layerGroup().addTo(mapa.current);
      mapa.current.on('click', (ev) => {
        setF((p) => ({ ...p, lat: ev.latlng.lat.toFixed(6), lng: ev.latlng.lng.toFixed(6) }));
      });
    }
    camada.current.clearLayers();
    const com = daCidade.filter((p) => p.lat != null && p.lng != null);
    com.forEach((p) => {
      const cor = (STATUS[p.status] || [])[1] || '#64748b';
      L.circleMarker([p.lat, p.lng], { radius: 6 + p.nota * 1.5, color: cor, fillColor: cor, fillOpacity: 0.6, weight: 2 })
        .bindPopup(`<b>${String(p.nome).replace(/</g, '&lt;')}</b><br>${(STATUS[p.status] || [p.status])[0]} · movimento ${p.nota}/5`)
        .addTo(camada.current);
    });
    if (com.length) mapa.current.fitBounds(com.map((p) => [p.lat, p.lng]), { padding: [30, 30], maxZoom: 14 });
    else if (CIDADES[cidade]) mapa.current.setView([CIDADES[cidade].lat, CIDADES[cidade].lng], 12);
    setTimeout(() => mapa.current && mapa.current.invalidateSize(), 50);
  }, [leafletOk, pontos, cidade, fase]);

  const entrar = (ev) => {
    ev.preventDefault();
    rodar(async () => { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); });
  };
  const sair = async () => { await api('/api/admin/logout', { method: 'POST', body: {} }); mapa.current = null; setPontos([]); setFase('login'); };
  const salvar = (ev) => {
    ev.preventDefault();
    rodar(async () => {
      await api('/api/admin/pontos', { method: 'POST', body: { ...f, cidade, uf } });
      setF(VAZIO);
    }, 'Ponto cadastrado.');
  };
  const mapear = () =>
    rodar(async () => {
      const d = await api('/api/admin/pontos/mapear', { method: 'POST', body: { cidade, uf, grupos, quantos } });
      setMsg({ tipo: 'ok', texto: `Achei ${d.encontrados} locais no mapa, ${d.novos} ainda não cadastrados. Cadastrei ${d.cadastrados} como "Mapeado". Rode de novo para trazer os próximos.` });
    });
  const semente = () => rodar(() => api('/api/admin/pontos', { method: 'POST', body: { lote: SEMENTE_BH } }), 'Locais de exemplo de Belo Horizonte adicionados. Confira as posições no mapa.');
  const patch = (id, corpo, ok) => rodar(() => api(`/api/admin/pontos/${id}`, { method: 'PATCH', body: corpo }), ok);
  const apagar = (p) => { if (window.confirm(`Apagar "${p.nome}"?`)) rodar(() => api(`/api/admin/pontos/${p.id}`, { method: 'DELETE' }), 'Ponto apagado.'); };
  const verTexto = (p) => setTexto({ id: p.id, conteudo: textoConvite({ nome: p.nome, cidade: p.cidade, link: `${SITE_PUBLICO}/convite/${p.token_convite}` }) });
  const copiar = async (t) => { try { await navigator.clipboard.writeText(t); setMsg({ tipo: 'ok', texto: 'Copiado.' }); } catch (e) { setMsg({ tipo: 'er', texto: 'Não consegui copiar; selecione o texto e copie.' }); } };

  const cont = (s) => daCidade.filter((p) => p.status === s).length;

  return (
    <div className="ea">
      <Head><title>Radar de Pontos · Painel</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Radar de Pontos</h1>
            <div className="ea-mu">Onde colocar cartazes com QR Code, por cidade. Só com autorização do local.</div>
          </div>
          <div className="ea-row">
            <Link href="/admin/radar" className="ea-btn">Painel do dia</Link>
            <Link href="/admin/calcados" className="ea-btn ea-btn2">Calçados</Link>
            {fase === 'pronto' && <button className="ea-btn ea-btn2" onClick={sair}>Sair</button>}
          </div>
        </div>
        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}
        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2>
            <label>Senha do painel</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
            <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Entrar</button></div>
          </form>
        )}
        {fase === 'pronto' && (
          <>
            <div className="ea-card">
              <div className="ea-row">
                <div style={{ flex: '1 1 220px' }}>
                  <label>Cidade</label>
                  <select value={cidade} onChange={(e) => { setCidade(e.target.value); const c = CIDADES[e.target.value]; if (c) setUf(c.uf); else { const p = pontos.find((x) => x.cidade === e.target.value); if (p) setUf(p.uf); } }}>
                    {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label>Outra cidade (nome e UF)</label>
                  <div className="ea-row">
                    <input placeholder="Ex.: Goiânia" style={{ flex: 3 }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v) { setCidade(v); e.target.value = ''; } } }} />
                    <input placeholder="UF" maxLength={2} style={{ flex: 1 }} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} />
                  </div>
                </div>
              </div>
              <div className="pt-leg">
                {Object.entries(STATUS).map(([k, [nome, cor]]) => (
                  <span key={k}><span className="pt-bol" style={{ background: cor }} />{nome}: {cont(k)}</span>
                ))}
              </div>
              <div ref={mapaEl} className="pt-mapa" />
              <div className="ea-mu" style={{ marginTop: 8 }}>Clique no mapa para preencher a posição do novo ponto. O tamanho da bolinha mostra o movimento (1 a 5).</div>
            </div>

            {daCidade.length === 0 && cidade === 'Belo Horizonte' && (
              <div className="ea-card">
                <h2>Começar por Belo Horizonte</h2>
                <p className="ea-mu">Adiciona 8 locais públicos de grande movimento (rodoviária, mercados, faculdades, praças). Eles entram como "Mapeado": nenhum contato é inventado e as posições são aproximadas.</p>
                <button className="ea-btn" disabled={ocupado} onClick={semente}>Adicionar locais de exemplo</button>
              </div>
            )}

            <div className="ea-card">
              <h2>Buscar locais automaticamente em {cidade}</h2>
              <p className="ea-mu">Procura no mapa aberto (OpenStreetMap) e cadastra como "Mapeado", com telefone ou e-mail quando o local tiver publicado. Os que têm contato vêm primeiro. Rode de novo para trazer os próximos.</p>
              <div className="ea-row">
                {Object.entries(GRUPOS).map(([k, g]) => (
                  <label key={k} style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0 }}>
                    <input type="checkbox" style={{ width: 'auto' }} checked={grupos.includes(k)} onChange={(e) => setGrupos(e.target.checked ? [...grupos, k] : grupos.filter((x) => x !== k))} />
                    {g.nome}
                  </label>
                ))}
              </div>
              <div className="ea-row" style={{ marginTop: 12 }}>
                <div style={{ flex: '0 0 140px' }}><label>Quantos por vez</label><input type="number" min="5" max="100" value={quantos} onChange={(e) => setQuantos(e.target.value)} /></div>
                <button className="ea-btn" disabled={ocupado || grupos.length === 0} onClick={mapear} style={{ alignSelf: 'flex-end' }}>{ocupado ? 'Buscando… pode levar até 40 segundos' : 'Buscar locais'}</button>
              </div>
            </div>

            <form className="ea-card" onSubmit={salvar}>
              <h2>Novo ponto em {cidade}</h2>
              <div className="ea-grid">
                <div><label>Nome do local</label><input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required /></div>
                <div><label>Tipo</label><select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><label>Endereço</label><input value={f.endereco} onChange={(e) => setF({ ...f, endereco: e.target.value })} /></div>
                <div><label>Latitude (clique no mapa)</label><input value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} inputMode="decimal" /></div>
                <div><label>Longitude</label><input value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} inputMode="decimal" /></div>
                <div><label>E-mail do local</label><input type="email" value={f.contato_email} onChange={(e) => setF({ ...f, contato_email: e.target.value })} /></div>
                <div><label>WhatsApp do local</label><input value={f.contato_whatsapp} onChange={(e) => setF({ ...f, contato_whatsapp: e.target.value })} /></div>
                <div><label>Observação</label><input value={f.observacao} onChange={(e) => setF({ ...f, observacao: e.target.value })} /></div>
              </div>
              <div style={{ marginTop: 12 }}><button className="ea-btn" disabled={ocupado}>Cadastrar ponto</button></div>
            </form>

            <div className="ea-card">
              <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                <h2>Pontos de {cidade} ({visiveis.length})</h2>
                <select value={filtro} onChange={(e) => { setFiltro(e.target.value); setLimite(30); }} style={{ width: 'auto' }}>
                  <option value="todos">Todos</option>
                  {Object.entries(STATUS).map(([k, [n]]) => <option key={k} value={k}>{n}</option>)}
                </select>
              </div>
              {daCidade.length === 0 && <div className="ea-mu">Nenhum ponto ainda.</div>}
              {visiveis.slice(0, limite).map((p) => {
                const [nomeSt, cor] = STATUS[p.status] || [p.status, '#64748b'];
                return (
                  <div className="pt-lin" key={p.id}>
                    <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                      <div>
                        <b>{p.nome}</b> <span className="ea-tag">{TIPOS[p.tipo] || p.tipo}</span>{' '}
                        <span className="ea-tag" style={{ color: cor, borderColor: cor }}>{nomeSt}</span>
                        <div className="ea-mu">Movimento {p.nota}/5 · código <b>{p.codigo}</b> · {p.visitas} visitas · {p.pedidos} pedidos{p.endereco ? ' · ' + p.endereco : ''}</div>
                        {p.observacao && <div className="ea-mu">{p.observacao}</div>}
                      </div>
                      <select value={p.status} disabled={ocupado} onChange={(e) => patch(p.id, { status: e.target.value })} style={{ width: 'auto' }}>
                        {Object.entries(STATUS).map(([k, [n]]) => <option key={k} value={k}>{n}</option>)}
                      </select>
                    </div>
                    <div className="pt-ac">
                      <button className="ea-btn ea-btn2" onClick={() => verTexto(p)}>Texto do convite</button>
                      <Link className="ea-btn" href={`/admin/cartaz/${p.id}`} target="_blank">Cartaz com QR</Link>
                      <button className="ea-btn ea-btn2" onClick={() => copiar(`${SITE_PUBLICO}/p/${p.codigo}`)}>Copiar link do QR</button>
                      {['autorizado', 'ativo'].includes(p.status) && <button className="ea-btn ea-btn2" onClick={() => copiar(`${SITE_PUBLICO}/parceiro/${p.token_convite}`)}>Copiar link do painel do parceiro</button>}
                      <button className="ea-btn ea-btn-er" onClick={() => apagar(p)}>Apagar</button>
                    </div>
                    {texto && texto.id === p.id && (
                      <>
                        <div className="pt-txt">{texto.conteudo}</div>
                        <div className="pt-ac">
                          <button className="ea-btn" onClick={() => copiar(texto.conteudo)}>Copiar texto</button>
                          <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => { patch(p.id, { status: 'convidado' }, 'Marcado como convidado.'); setTexto(null); }}>Marcar como convidado</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {visiveis.length > limite && <div style={{ marginTop: 12 }}><button className="ea-btn ea-btn2" onClick={() => setLimite(limite + 30)}>Mostrar mais ({visiveis.length - limite})</button></div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
