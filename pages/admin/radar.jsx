import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import { TIPOS, STATUS, CIDADES, SITE_PUBLICO, textoConvite, textoLembrete, assuntoEmail } from '../../lib/pontos';
import AdminNav from '../../lib/AdminNav';
import { CANAIS } from '../../lib/trocas';
import AddContato from '../../lib/AddContato';

const CSS = `
.rd-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:16px}
.rd-t{background:var(--cd);border:1px solid var(--bd);border-radius:12px;padding:12px;text-align:center}
.rd-t b{display:block;font-size:28px;line-height:1.1}
.rd-t span{font-size:13px;color:var(--mu)}
.rd-prox{margin-top:16px;padding:14px 16px;border-radius:12px;background:var(--ac);color:#fff;font-weight:600}
.rd-prox a{color:#fff;text-decoration:underline}
@media (prefers-color-scheme: dark){.rd-prox,.rd-prox a,.rd-n{color:#0b1220}}
.rd-n{display:inline-flex;width:26px;height:26px;border-radius:50%;background:var(--ac);color:#fff;align-items:center;justify-content:center;font-size:14px;margin-right:8px}
.rd-foco{border:2px solid var(--ac);border-radius:12px;padding:14px;margin-top:12px;background:var(--bg)}
.rd-foco h3{margin:0 0 4px;font-size:20px}
.rd-acoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.rd-lin{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--bd)}
.rd-lin:first-child{border-top:0}
.ea a.ea-btn{color:#fff}.ea a.ea-btn2{color:var(--ac)}
.rd-sm{padding:6px 12px;font-size:13px}
`;

const NUM_OK = (v) => /^\d{11}$/.test(String(v || ''));
const dias = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null);

export default function Radar() {
  const [fase, setFase] = useState('carregando');
  const [pontos, setPontos] = useState([]);
  const [cidade, setCidade] = useState('Belo Horizonte');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [puladas, setPuladas] = useState([]);
  const [abriu, setAbriu] = useState(false); // abriu WhatsApp/e-mail do ponto em foco
  const [divs, setDivs] = useState({ divulgacoes: [], trocas: [] });

  const carregar = useCallback(async () => {
    try {
      const d = await api('/api/admin/pontos');
      setPontos(d.pontos || []);
      api('/api/admin/pontos/divulgacoes').then((x) => setDivs({ divulgacoes: x.divulgacoes || [], trocas: x.trocas || [] })).catch(() => {});
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else { setMsg({ tipo: 'er', texto: e.message }); setFase('pronto'); }
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { await fn(); if (ok) setMsg({ tipo: 'ok', texto: ok }); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/admin/login', { method: 'POST', body: { senha } }); setSenha(''); }); };
  const sair = async () => { await api('/api/admin/logout', { method: 'POST', body: {} }); setPontos([]); setFase('login'); };
  const mudar = (p, status, ok) => rodar(() => api(`/api/admin/pontos/${p.id}`, { method: 'PATCH', body: { status } }), ok);

  const cidades = Array.from(new Set([...Object.keys(CIDADES), ...pontos.map((p) => p.cidade)]));
  const da = pontos.filter((p) => p.cidade === cidade);
  const por = (s) => da.filter((p) => p.status === s);
  const comContato = (p) => NUM_OK(p.contato_whatsapp) || p.contato_email;

  const fila = por('mapeado').filter(comContato).filter((p) => !puladas.includes(p.id)).sort((a, b) => b.nota - a.nota);
  const semContato = por('mapeado').filter((p) => !comContato(p));
  const foco = fila[0];
  const autorizados = por('autorizado');
  const convidados = por('convidado').sort((a, b) => new Date(a.convidado_em || 0) - new Date(b.convidado_em || 0));
  const pendentes = da.filter((p) => p.perfil_status === 'pendente');
  const ativos = por('ativo').sort((a, b) => (b.pedidos - a.pedidos) || (b.visitas - a.visitas));
  const totalPedidos = da.reduce((s, p) => s + (p.pedidos || 0), 0);
  const totalVisitas = da.reduce((s, p) => s + (p.visitas || 0), 0);

  let proximo;
  if (da.length === 0) proximo = <>Comece buscando locais da cidade em <Link href="/admin/pontos">Radar de Pontos</Link>.</>;
  else if (divs.divulgacoes.length) proximo = <>Há {divs.divulgacoes.length} comprovação(ões) de divulgação esperando a sua conferência (passo 6).</>;
  else if (pendentes.length) proximo = <>Há {pendentes.length} perfil(is) de parceiro esperando a sua revisão (passo 5).</>;
  else if (autorizados.length) proximo = <>Você tem {autorizados.length} ponto(s) autorizado(s): imprima os cartazes e cole (passo 2).</>;
  else if (foco) proximo = <>Convide o próximo local (passo 1): {fila.length} na fila com contato.</>;
  else if (convidados.length) proximo = <>Aguarde as respostas ({convidados.length} convite(s) enviado(s)) e acompanhe no passo 3.</>;
  else proximo = <>A fila acabou. Busque mais locais em <Link href="/admin/pontos">Radar de Pontos</Link>.</>;

  const linkWpp = (p) => `https://wa.me/55${p.contato_whatsapp}?text=${encodeURIComponent(textoConvite({ nome: p.nome, cidade: p.cidade, link: `${SITE_PUBLICO}/convite/${p.token_convite}` }))}`;
  const linkMail = (p) => {
    const corpo = textoConvite({ nome: p.nome, cidade: p.cidade, link: `${SITE_PUBLICO}/convite/${p.token_convite}` });
    return `mailto:${p.contato_email}?subject=${encodeURIComponent(assuntoEmail({ cidade: p.cidade }))}&body=${encodeURIComponent(corpo)}`;
  };
  const nomeDe = (id) => (pontos.find((x) => x.id === id) || {}).nome || 'Parceiro';
  const decidirDiv = (x, decisao, ok) => rodar(() => api('/api/admin/pontos/divulgacoes', { method: 'POST', body: { id: x.id, decisao } }), ok);
  const decidir = (p, decisao, ok) => rodar(() => api('/api/admin/pontos/perfil', { method: 'POST', body: { id: p.id, decisao } }), ok);
  const linkLembrete = (p) => `https://wa.me/55${p.contato_whatsapp}?text=${encodeURIComponent(textoLembrete({ nome: p.nome, link: `${SITE_PUBLICO}/convite/${p.token_convite}` }))}`;
  const jaEnviei = () => { const p = foco; setAbriu(false); mudar(p, 'convidado', `"${p.nome}" marcado como convidado.`); };
  const pular = () => { setAbriu(false); setPuladas([...puladas, foco.id]); };

  return (
    <div className="ea">
      <Head><title>Painel do dia · Radar</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in">
        <AdminNav />
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Painel do dia</h1>
            <div className="ea-mu">Siga os passos de cima para baixo. O painel mostra só o que precisa de você agora.</div>
          </div>
          <div className="ea-row">
            <Link href="/admin/pontos" className="ea-btn ea-btn2">Mapa e todos os pontos</Link>
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
              <label>Cidade de trabalho</label>
              <select value={cidade} onChange={(e) => { setCidade(e.target.value); setPuladas([]); setAbriu(false); }}>
                {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="rd-tiles">
                {['mapeado', 'convidado', 'autorizado', 'ativo', 'recusado'].map((s) => (
                  <div className="rd-t" key={s}><b style={{ color: STATUS[s][1] }}>{por(s).length}</b><span>{STATUS[s][0]}</span></div>
                ))}
                <div className="rd-t"><b>{totalVisitas}</b><span>visitas pelos QR</span></div>
                <div className="rd-t"><b>{totalPedidos}</b><span>pedidos</span></div>
              </div>
              <div className="rd-prox">Próximo passo: {proximo}</div>
            </div>

            <div className="ea-card">
              <h2><span className="rd-n">1</span>Convidar ({fila.length} na fila)</h2>
              {!foco && <div className="ea-mu">Ninguém na fila com WhatsApp ou e-mail. {semContato.length > 0 && `${semContato.length} local(is) sem contato ficam para depois (veja a observação de cada um no Radar de Pontos).`}</div>}
              {semContato.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div><b>Sem contato ({semContato.length})</b> <span className="ea-mu">· achou o WhatsApp ou o e-mail (por exemplo no Google Maps)? Adicione e o local entra na fila.</span></div>
                  {semContato.slice(0, 8).map((p) => (
                    <div className="rd-lin" key={p.id} style={{ flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                        <b>{p.nome}</b>
                        <div className="ea-mu">{TIPOS[p.tipo] || p.tipo} · movimento {p.nota}/5{p.endereco ? ' · ' + p.endereco : ''}</div>
                        {p.observacao && <div className="ea-mu">{p.observacao}</div>}
                      </div>
                      <AddContato ponto={p} pequeno onSalvo={carregar} />
                    </div>
                  ))}
                  {semContato.length > 8 && <div className="ea-mu" style={{ marginTop: 6 }}>Mostrando 8 de {semContato.length}. Os demais estão em Mapa e pontos.</div>}
                </div>
              )}
              {foco && (
                <div className="rd-foco">
                  <h3>{foco.nome}</h3>
                  <div className="ea-mu">{TIPOS[foco.tipo] || foco.tipo} · movimento {foco.nota}/5{foco.endereco ? ' · ' + foco.endereco : ''}</div>
                  <div className="ea-mu" style={{ marginTop: 6 }}>
                    {NUM_OK(foco.contato_whatsapp) && <>WhatsApp: {foco.contato_whatsapp} </>}
                    {foco.contato_email && <>E-mail: {foco.contato_email}</>}
                  </div>
                  <div className="rd-acoes">
                    {NUM_OK(foco.contato_whatsapp) && <a className="ea-btn" href={linkWpp(foco)} target="_blank" rel="noopener noreferrer" onClick={() => setAbriu(true)}>Abrir WhatsApp com a mensagem pronta</a>}
                    {foco.contato_email && <a className="ea-btn ea-btn2" href={linkMail(foco)} onClick={() => setAbriu(true)}>Abrir e-mail com a mensagem pronta</a>}
                  </div>
                  <div className="rd-acoes">
                    <button className="ea-btn ea-btn-ok" disabled={ocupado || !abriu} onClick={jaEnviei}>Já enviei: marcar como convidado e ir ao próximo</button>
                    <button className="ea-btn ea-btn2" disabled={ocupado} onClick={pular}>Pular</button>
                  </div>
                  {!abriu && <div className="ea-mu" style={{ marginTop: 8 }}>Clique em abrir, confira a mensagem e envie. O botão verde libera depois.</div>}
                </div>
              )}
            </div>

            <div className="ea-card">
              <h2><span className="rd-n">2</span>Imprimir e colar ({autorizados.length} autorizados)</h2>
              {autorizados.length === 0 && <div className="ea-mu">Quando um local disser "sim", ele aparece aqui.</div>}
              {autorizados.map((p) => (
                <div className="rd-lin" key={p.id}>
                  <div><b>{p.nome}</b><div className="ea-mu">{TIPOS[p.tipo] || p.tipo} · código {p.codigo}{p.origem === 'inscricao' ? ' · inscrição própria' : ''}</div>{p.origem === 'inscricao' && <div className="ea-mu">Local para o cartaz: {p.endereco || 'não informado'} · contato: {[p.contato_whatsapp, p.contato_email].filter(Boolean).join(' / ')}</div>}</div>
                  <div className="ea-row">
                    <Link className="ea-btn rd-sm" href={`/admin/cartaz/${p.id}?v=4`} target="_blank">Cartaz com QR</Link>
                    <button className="ea-btn ea-btn2 rd-sm" onClick={() => { try { navigator.clipboard.writeText(`${SITE_PUBLICO}/parceiro/${p.token_convite}`); setMsg({ tipo: 'ok', texto: 'Link do painel do parceiro copiado. Envie a ele pelo WhatsApp.' }); } catch (e) {} }}>Copiar link do painel dele</button>
                    <button className="ea-btn ea-btn-ok rd-sm" disabled={ocupado} onClick={() => mudar(p, 'ativo', `"${p.nome}" marcado como ativo.`)}>Já colei</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ea-card">
              <h2><span className="rd-n">3</span>Aguardar respostas ({convidados.length})</h2>
              {convidados.length === 0 && <div className="ea-mu">Nenhum convite esperando resposta.</div>}
              {convidados.map((p) => {
                const d = dias(p.convidado_em);
                return (
                  <div className="rd-lin" key={p.id}>
                    <div>
                      <b>{p.nome}</b>
                      <div className="ea-mu">{d === null ? 'convidado' : d === 0 ? 'convidado hoje' : `convidado há ${d} dia(s)`}{d !== null && d >= 5 ? ' · sem resposta' : ''}</div>
                    </div>
                    <div className="ea-row">
                      {d !== null && d >= 5 && NUM_OK(p.contato_whatsapp) && <a className="ea-btn ea-btn2 rd-sm" href={linkLembrete(p)} target="_blank" rel="noopener noreferrer">Lembrete (1 vez)</a>}
                      <button className="ea-btn rd-sm" disabled={ocupado} onClick={() => mudar(p, 'autorizado', `"${p.nome}" autorizado.`)}>Disse sim</button>
                      <button className="ea-btn ea-btn-er rd-sm" disabled={ocupado} onClick={() => mudar(p, 'recusado', `"${p.nome}" recusou.`)}>Disse não</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ea-card">
              <h2><span className="rd-n">4</span>Resultados dos cartazes ativos</h2>
              {ativos.length === 0 && <div className="ea-mu">Quando houver cartazes ativos, mostro aqui visitas e pedidos de cada um.</div>}
              {ativos.map((p) => (
                <div className="rd-lin" key={p.id}>
                  <div><b>{p.nome}</b><div className="ea-mu">código {p.codigo}</div></div>
                  <div className="ea-mu">{p.visitas} visitas · {p.pedidos} pedidos</div>
                </div>
              ))}
            </div>

            <div className="ea-card">
              <h2><span className="rd-n">5</span>Revisar perfis dos parceiros ({pendentes.length})</h2>
              {pendentes.length === 0 && <div className="ea-mu">Quando um parceiro enviar a vitrine do negócio, ela aparece aqui para você aprovar.</div>}
              {pendentes.map((p) => (
                <div className="rd-lin" key={p.id} style={{ alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, minWidth: 0, flex: '1 1 260px' }}>
                    {p.perfil_logo ? <img src={p.perfil_logo} alt="" width={64} height={64} style={{ objectFit: 'contain', borderRadius: 10, border: '1px solid var(--bd)', background: '#fff' }} /> : <div style={{ width: 64, height: 64, display: 'grid', placeItems: 'center', fontSize: 26 }}>🏪</div>}
                    <div style={{ minWidth: 0 }}>
                      <b>{p.nome}</b>
                      {p.perfil_slogan && <div>{p.perfil_slogan}</div>}
                      {p.perfil_descricao && <div className="ea-mu">{p.perfil_descricao}</div>}
                      <div className="ea-mu">{[p.perfil_horario, p.perfil_endereco, p.perfil_whatsapp && 'WhatsApp ' + p.perfil_whatsapp, p.perfil_instagram && '@' + p.perfil_instagram, p.perfil_site].filter(Boolean).join(' · ')}</div>
                    </div>
                  </div>
                  <div className="ea-row">
                    <button className="ea-btn ea-btn-ok rd-sm" disabled={ocupado} onClick={() => decidir(p, 'aprovar', `Perfil de "${p.nome}" publicado.`)}>Aprovar</button>
                    <button className="ea-btn ea-btn-er rd-sm" disabled={ocupado} onClick={() => decidir(p, 'reprovar', `Perfil de "${p.nome}" devolvido para ajuste.`)}>Pedir ajuste</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="ea-card">
              <h2><span className="rd-n">6</span>Conferir divulgações digitais ({divs.divulgacoes.length})</h2>
              {divs.divulgacoes.length === 0 && <div className="ea-mu">Quando um parceiro comprovar uma publicação semanal, ela aparece aqui. Abra o link, confira que o QR ou o link do site está lá e aprove.</div>}
              {divs.divulgacoes.map((x) => (
                <div className="rd-lin" key={x.id}>
                  <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                    <b>{nomeDe(x.ponto_id)}</b> <span className="ea-mu">· {CANAIS[x.canal] || x.canal} · semana {x.semana}</span>
                    {x.link && <div><a href={x.link} target="_blank" rel="noopener noreferrer nofollow" style={{ wordBreak: 'break-all' }}>{x.link}</a></div>}
                    {x.obs && <div className="ea-mu">{x.obs}</div>}
                  </div>
                  <div className="ea-row">
                    <button className="ea-btn ea-btn-ok rd-sm" disabled={ocupado} onClick={() => decidirDiv(x, 'aprovar', 'Divulgação aprovada.')}>Aprovar</button>
                    <button className="ea-btn ea-btn-er rd-sm" disabled={ocupado} onClick={() => decidirDiv(x, 'reprovar', 'Divulgação não aprovada.')}>Não aprovar</button>
                  </div>
                </div>
              ))}
              {divs.trocas.length > 0 && <div className="ea-mu" style={{ marginTop: 10 }}>Trocas combinadas entre parceiros: {divs.trocas.length}. {divs.trocas.slice(0, 5).map((t) => `${nomeDe(t.de_id)} ↔ ${nomeDe(t.para_id)}`).join(' · ')}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
