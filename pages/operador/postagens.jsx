import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, ADMIN_CSS } from '../../lib/adminClient';
import { desenharArte, arteParaBlob } from '../../lib/arteCanvas';
import { REDES as PERFIS } from '../../lib/redes';

const SITE = 'https://www.igreja.eco.br';
const REDE = {
  facebook: { nome: 'Facebook', cor: '#1877f2', perfil: 'facebook' },
  instagram: { nome: 'Instagram', cor: '#e1306c', perfil: 'instagram' },
  telegram: { nome: 'Telegram', cor: '#2aabee', perfil: 'telegram' },
  email: { nome: 'E-mail marketing', cor: '#b45309' },
};

const CSS = `
.pp-tabs{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.pp-t{padding:8px 14px;border-radius:999px;border:1px solid var(--bd);background:transparent;color:var(--tx);font:inherit;cursor:pointer}
.pp-t.on{background:var(--ac);border-color:var(--ac);color:#fff}
.pp-dia{margin:22px 0 0;font-size:15px;color:var(--mu);text-transform:uppercase;letter-spacing:.06em}
.pp-rede{display:inline-block;color:#fff;font-weight:700;font-size:13px;padding:3px 10px;border-radius:999px}
.pp-hora{font:700 20px ui-monospace,Menlo,Consolas,monospace}
.pp-arte{display:block;width:100%;max-width:340px;aspect-ratio:1/1;object-fit:cover;border-radius:12px;border:1px solid var(--bd);background:var(--bg)}
.pp-texto{margin-top:10px;padding:12px;border-radius:8px;background:var(--bg);border:1px solid var(--bd);white-space:pre-wrap;word-break:break-word;font-size:15px;max-height:260px;overflow:auto}
.pp-bar{height:10px;border-radius:999px;background:var(--bd);overflow:hidden;margin-top:8px}
.pp-bar>i{display:block;height:100%;background:var(--ok)}
.pp-acoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.pp-passos{margin:10px 0 0;padding-left:20px;font-size:14px;color:var(--mu)}
`;

const pad = (n) => String(n).padStart(2, '0');
const chaveDia = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hora = (iso) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
function rotuloDia(chave) {
  const hoje = new Date();
  const amanha = new Date(Date.now() + 24 * 3600 * 1000);
  if (chave === chaveDia(hoje)) return 'Hoje';
  if (chave === chaveDia(amanha)) return 'Amanhã';
  const [a, m, d] = chave.split('-');
  return `${d}/${m}`;
}

// Monta o texto final que o operador cola na rede.
function textoCompleto(p) {
  const partes = [p.texto.trim()];
  if (p.link_destino && !p.texto.includes(p.link_destino)) partes.push(p.link_destino);
  if (p.hashtags && p.rede !== 'telegram' && p.rede !== 'email') partes.push(p.hashtags.trim());
  return partes.join('\n\n');
}

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (e) {
    const t = document.createElement('textarea');
    t.value = texto;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    document.body.removeChild(t);
    return ok;
  }
}

function linkAbrir(p) {
  if (p.rede === 'telegram') {
    return `https://t.me/share/url?url=${encodeURIComponent(p.link_destino || SITE)}&text=${encodeURIComponent(textoCompleto(p))}`;
  }
  if (p.rede === 'email') {
    const base = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(p.email_assunto || p.titulo)}`;
    const corpo = textoCompleto(p);
    return corpo.length < 1200 ? `${base}&body=${encodeURIComponent(corpo)}` : base;
  }
  const perfil = PERFIS.find((r) => r.id === p.rede);
  return (perfil && perfil.url) || SITE;
}

function Arte({ p }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!p.imagem_url && ref.current) {
      desenharArte(ref.current, { titulo: p.arte_titulo || p.titulo, subtitulo: p.arte_subtitulo, tema: p.arte_tema, rotulo: p.projeto });
    }
  }, [p]);
  if (p.imagem_url) return <img className="pp-arte" src={p.imagem_url} alt={`Arte: ${p.titulo}`} />;
  return <canvas className="pp-arte" ref={ref} aria-label={`Arte: ${p.titulo}`} />;
}

function Cartao({ p, agora, ocupado, acao, aviso, copiarTexto, baixarArte, compartilhar, podeCompartilhar }) {
  const [link, setLink] = useState('');
  const r = REDE[p.rede] || { nome: p.rede, cor: '#555' };
  const atrasada = new Date(p.agendada_para).getTime() < agora;
  const deOutro = p.status === 'em_andamento' && !p.minha;
  const visual = p.rede !== 'email';
  return (
    <div className="ea-card" key={p.id}>
      <div className="ea-row" style={{ justifyContent: 'space-between' }}>
        <div className="ea-row">
          <span className="pp-hora">{hora(p.agendada_para)}</span>
          <span className="pp-rede" style={{ background: r.cor }}>{r.nome}</span>
          {atrasada && <span className="ea-tag er">no horário ou atrasada</span>}
          {p.status === 'em_andamento' && <span className="ea-tag am">{p.minha ? 'você está fazendo' : 'outro operador está fazendo'}</span>}
        </div>
        <span className="ea-mu">#{p.numero}</span>
      </div>
      <h2 style={{ margin: '10px 0 0' }}>{p.titulo}</h2>

      {deOutro ? (
        <p className="ea-mu">Outro operador já assumiu esta postagem.</p>
      ) : (
        <>
          {p.rede === 'email' && (
            <div style={{ marginTop: 10 }}>
              <label>Assunto do e-mail</label>
              <div className="pp-texto" style={{ maxHeight: 'none' }}>{p.email_assunto || p.titulo}</div>
              <div className="pp-acoes"><button className="ea-btn ea-btn2" onClick={() => aviso(copiar(p.email_assunto || p.titulo), 'Assunto copiado.', 'Não consegui copiar.')}>Copiar assunto</button></div>
            </div>
          )}
          {visual && <div style={{ marginTop: 12 }}><Arte p={p} /></div>}
          <div className="pp-texto">{textoCompleto(p)}</div>

          <div className="pp-acoes">
            <button className="ea-btn" onClick={() => copiarTexto(p)}>Copiar texto</button>
            {visual && <button className="ea-btn" onClick={() => baixarArte(p)}>Baixar arte</button>}
            {visual && podeCompartilhar && <button className="ea-btn ea-btn2" onClick={() => compartilhar(p)}>Compartilhar (celular)</button>}
            <a className="ea-btn ea-btn2" href={linkAbrir(p)} target="_blank" rel="noopener noreferrer">{p.rede === 'email' ? 'Abrir Gmail' : `Abrir ${r.nome}`}</a>
          </div>
          <ol className="pp-passos">
            {visual ? (
              <>
                <li>Toque em <b>Copiar texto</b> e em <b>Baixar arte</b>.</li>
                <li>Abra {r.nome}, crie a publicação com a arte e cole o texto.</li>
                <li>Publique e volte aqui para tocar em <b>Já postei</b>.</li>
              </>
            ) : (
              <>
                <li>Copie o assunto e o texto.</li>
                <li>Abra o Gmail, cole e confira os destinatários (use cópia oculta) antes de enviar.</li>
                <li>Envie e volte aqui para tocar em <b>Já postei</b>.</li>
              </>
            )}
          </ol>

          <div style={{ marginTop: 12 }}>
            <label>Link da publicação (opcional)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" inputMode="url" />
          </div>
          <div className="pp-acoes">
            <button className="ea-btn ea-btn-ok" disabled={ocupado} onClick={() => acao(p, 'postada', { link }, 'Marcada como postada. Bom trabalho!')}>Já postei ✔</button>
            {p.status === 'agendada' && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => acao(p, 'assumir', {}, 'Postagem assumida por você.')}>Vou fazer esta</button>}
            {p.status === 'em_andamento' && p.minha && <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => acao(p, 'devolver', {}, 'Devolvida para a fila.')}>Devolver à fila</button>}
            <button className="ea-btn ea-btn2" disabled={ocupado} onClick={() => {
              const motivo = window.prompt('Por que esta postagem não foi feita? (ex.: rede fora do ar)');
              if (motivo) acao(p, 'pular', { observacao: motivo }, 'Postagem registrada como não feita.');
            }}>Não consegui postar</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function OperadorPostagens() {
  const [fase, setFase] = useState('carregando'); // carregando | login | semacesso | pronto
  const [dados, setDados] = useState(null);
  const [aba, setAba] = useState('fila');
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [semAcessoMsg, setSemAcessoMsg] = useState('');

  const carregar = useCallback(async () => {
    try {
      setDados(await api('/api/operador/postagens'));
      setFase('pronto');
    } catch (e) {
      if (e.status === 401) setFase('login');
      else if (e.status === 403) { setSemAcessoMsg(e.message); setFase('semacesso'); }
      else { setMsg({ tipo: 'er', texto: e.message }); setFase((f) => (f === 'carregando' ? 'login' : f)); }
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') carregar(); }, 60000);
    return () => clearInterval(t);
  }, [carregar]);

  async function rodar(fn, ok) {
    setOcupado(true); setMsg(null);
    try { await fn(); if (ok) setMsg({ tipo: 'ok', texto: ok }); await carregar(); }
    catch (e) { setMsg({ tipo: 'er', texto: e.message }); }
    setOcupado(false);
  }
  const entrar = (ev) => { ev.preventDefault(); rodar(async () => { await api('/api/operador/login', { method: 'POST', body: { codigo } }); setCodigo(''); }); };
  const acao = (p, a, extra = {}, ok) => rodar(() => api(`/api/operador/postagens/${p.id}`, { method: 'POST', body: { acao: a, ...extra } }), ok);

  async function aviso(promessa, ok, erro) {
    try { const r = await promessa; setMsg(r === false ? { tipo: 'er', texto: erro } : { tipo: 'ok', texto: ok }); }
    catch (e) { setMsg({ tipo: 'er', texto: erro }); }
  }
  const copiarTexto = (p) => aviso(copiar(textoCompleto(p)), 'Texto copiado. É só colar na publicação.', 'Não consegui copiar. Selecione o texto e copie à mão.');

  async function baixarArte(p) {
    try {
      let blob;
      if (p.imagem_url) {
        const r = await fetch(p.imagem_url);
        if (!r.ok) throw new Error('img');
        blob = await r.blob();
      } else {
        blob = await arteParaBlob({ titulo: p.arte_titulo || p.titulo, subtitulo: p.arte_subtitulo, tema: p.arte_tema, rotulo: p.projeto });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `postagem-${p.numero}-${p.rede}.${blob.type === 'image/jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setMsg({ tipo: 'ok', texto: 'Arte baixada. Anexe na publicação.' });
    } catch (e) {
      if (p.imagem_url) window.open(p.imagem_url, '_blank', 'noopener');
      else setMsg({ tipo: 'er', texto: 'Não foi possível gerar a arte.' });
    }
  }

  // No celular: abre direto o menu "Compartilhar" com a arte e o texto (funciona bem para Instagram, Facebook e Telegram).
  async function compartilhar(p) {
    try {
      let blob = null;
      if (p.imagem_url) { const r = await fetch(p.imagem_url); blob = r.ok ? await r.blob() : null; }
      else blob = await arteParaBlob({ titulo: p.arte_titulo || p.titulo, subtitulo: p.arte_subtitulo, tema: p.arte_tema, rotulo: p.projeto });
      const arquivo = blob ? new File([blob], `postagem-${p.numero}.${blob.type === 'image/jpeg' ? 'jpg' : 'png'}`, { type: blob.type }) : null;
      const pacote = { text: textoCompleto(p), ...(arquivo ? { files: [arquivo] } : {}) };
      if (navigator.canShare && !navigator.canShare(pacote)) delete pacote.files;
      await copiar(textoCompleto(p));
      await navigator.share(pacote);
    } catch (e) {
      if (e && e.name !== 'AbortError') setMsg({ tipo: 'er', texto: 'Este aparelho não abriu o menu de compartilhar. Use "Baixar arte" e "Copiar texto".' });
    }
  }
  const podeCompartilhar = typeof navigator !== 'undefined' && !!navigator.share;

  const agora = Date.now();
  const fila = (dados && dados.fila) || [];
  const feitas = (dados && dados.feitas) || [];
  const hojeChave = chaveDia(new Date());
  const doDia = fila.filter((p) => chaveDia(new Date(p.agendada_para)) <= hojeChave);
  const feitasHoje = feitas.filter((p) => p.status === 'postada' && p.postada_em && chaveDia(new Date(p.postada_em)) === hojeChave).length;
  const totalHoje = doDia.length + feitasHoje;
  const pct = totalHoje ? Math.round((feitasHoje / totalHoje) * 100) : 0;

  const grupos = {};
  fila.forEach((p) => {
    const k = chaveDia(new Date(p.agendada_para)) < hojeChave ? hojeChave : chaveDia(new Date(p.agendada_para)); // atrasadas entram em "Hoje"
    (grupos[k] = grupos[k] || []).push(p);
  });
  const dias = Object.keys(grupos).sort();

  return (
    <div className="ea">
      <Head><title>Postagens do dia</title><meta name="robots" content="noindex" /></Head>
      <style>{ADMIN_CSS}{CSS}</style>
      <div className="ea-in" style={{ maxWidth: 760 }}>
        <div className="ea-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1>Postagens do dia</h1>
            {dados && dados.operador && <div className="ea-mu">{dados.operador.nome} · divulgação do igreja.eco.br</div>}
          </div>
          <Link href="/operador" className="ea-btn ea-btn2">Minhas tarefas</Link>
        </div>

        {msg && <div className={`ea-msg ${msg.tipo}`}>{msg.texto}</div>}
        {fase === 'carregando' && <div className="ea-card">Carregando…</div>}

        {fase === 'login' && (
          <form className="ea-card" onSubmit={entrar}>
            <h2>Entrar</h2>
            <label>Seu código de acesso</label>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="XXXXX-XXXXX" autoCapitalize="characters" autoFocus required />
            <p className="ea-mu">O código foi enviado a você pela equipe.</p>
            <button className="ea-btn" disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</button>
          </form>
        )}

        {fase === 'semacesso' && (
          <div className="ea-card">
            <h2>Acesso ainda não liberado</h2>
            <p>{semAcessoMsg}</p>
            <p className="ea-mu">Se for a regra de trabalho, aceite em "Minhas tarefas". Se for a permissão, peça à coordenação para liberar as postagens no seu cadastro.</p>
            <Link href="/operador" className="ea-btn">Ir para Minhas tarefas</Link>
          </div>
        )}

        {fase === 'pronto' && (
          <>
            <div className="ea-card">
              <div className="ea-row" style={{ justifyContent: 'space-between' }}>
                <b>Hoje: {feitasHoje} de {totalHoje} postadas</b>
                <button className="ea-btn ea-btn2" onClick={carregar} disabled={ocupado}>Atualizar</button>
              </div>
              <div className="pp-bar"><i style={{ width: `${pct}%` }} /></div>
              {totalHoje > 0 && feitasHoje === totalHoje && <p style={{ margin: '10px 0 0' }}>🎉 Rotina de hoje completa.</p>}
            </div>

            <div className="pp-tabs">
              <button className={`pp-t ${aba === 'fila' ? 'on' : ''}`} onClick={() => setAba('fila')}>A postar ({fila.length})</button>
              <button className={`pp-t ${aba === 'feitas' ? 'on' : ''}`} onClick={() => setAba('feitas')}>Já feitas ({feitas.length})</button>
            </div>

            {aba === 'fila' && (
              <>
                {fila.length === 0 && <div className="ea-card ea-mu">Nada para postar agora. As postagens novas chegam sozinhas da IA e aparecem aqui.</div>}
                {dias.map((d) => (
                  <div key={d}>
                    <h3 className="pp-dia">{rotuloDia(d)}</h3>
                    {grupos[d].map((p) => <Cartao key={p.id} p={p} agora={agora} ocupado={ocupado} acao={acao} aviso={aviso} copiarTexto={copiarTexto} baixarArte={baixarArte} compartilhar={compartilhar} podeCompartilhar={podeCompartilhar} />)}
                  </div>
                ))}
              </>
            )}

            {aba === 'feitas' && (
              <div className="ea-card">
                {feitas.length === 0 && <span className="ea-mu">Ainda não há postagens feitas por você.</span>}
                {feitas.map((p) => (
                  <div className="ea-item" key={p.id}>
                    <div>
                      <b>{p.titulo}</b>{' '}
                      <span className={`ea-tag ${p.status === 'postada' ? 'ok' : 'er'}`}>{p.status === 'postada' ? 'postada' : 'não feita'}</span>
                      <div className="ea-mu">{(REDE[p.rede] || {}).nome || p.rede} · {p.postada_em ? new Date(p.postada_em).toLocaleString('pt-BR') : ''}{p.observacao_operador ? ` · ${p.observacao_operador}` : ''}</div>
                    </div>
                    {p.link_postagem && <a href={p.link_postagem} target="_blank" rel="noopener noreferrer">ver</a>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
