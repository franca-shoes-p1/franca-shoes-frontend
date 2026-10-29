// Área "Divulgação e trocas" do painel do parceiro: cartaz digital, calendário semanal, comprovação e troca entre parceiros.
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import s from '../styles/radar.module.css';
import { CANAIS, SELOS, seloDe, semanaDe, temaDa, legenda, textoTroca } from './trocas';
import { SITE_PUBLICO } from './pontos';

const chamar = async (url, opts) => {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
  return j;
};
const post = (token, corpo) => chamar('/api/parceiro/trocas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, ...corpo }) });
const ST = { pendente: ['Em análise', '#d97706'], aprovado: ['Aprovada', '#16a34a'], reprovado: ['Não aprovada', '#dc2626'], proposta: ['Aguardando resposta', '#d97706'], aceita: ['Troca combinada', '#16a34a'], recusada: ['Recusada', '#64748b'] };

function quebra(ctx, texto, x, y, larg, alt) {
  const palavras = String(texto).split(' '); let linha = '';
  for (const w of palavras) {
    const t = linha ? linha + ' ' + w : w;
    if (ctx.measureText(t).width > larg && linha) { ctx.fillText(linha, x, y); y += alt; linha = w; } else linha = t;
  }
  if (linha) { ctx.fillText(linha, x, y); y += alt; }
  return y;
}

async function desenhar(canvas, { nome, cidade, codigo }, tema, formato) {
  const W = 1080, H = formato === 'story' ? 1920 : 1350;
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d');
  c.fillStyle = '#f3e3c9'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#8a5429'; c.fillRect(0, 0, W, 190); c.fillRect(0, H - 150, W, 150);
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '800 56px system-ui, sans-serif';
  c.fillText('📍 PONTO PARCEIRO', W / 2, 118);
  c.fillStyle = '#3b2412'; c.font = '800 78px system-ui, sans-serif';
  let y = quebra(c, tema.t, W / 2, 330, W - 160, 92);
  c.font = '600 46px system-ui, sans-serif'; c.fillStyle = '#55391f';
  y = quebra(c, `${nome} · ${cidade}`, W / 2, y + 20, W - 160, 58);
  const qr = await QRCode.toDataURL(`${SITE_PUBLICO}/p/${codigo}`, { margin: 1, width: 560, color: { dark: '#3b2412', light: '#ffffff' } });
  const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = qr; });
  const qy = Math.max(y + 40, formato === 'story' ? 640 : 520);
  c.fillStyle = '#fff'; c.fillRect(W / 2 - 320, qy - 30, 640, 640);
  c.drawImage(img, W / 2 - 280, qy, 560, 560);
  c.fillStyle = '#3b2412'; c.font = '800 54px system-ui, sans-serif';
  c.fillText('Aponte a câmera e conheça', W / 2, qy + 700);
  c.font = '600 40px system-ui, sans-serif';
  c.fillText('calçados de fábrica com entrega marcada', W / 2, qy + 760);
  c.fillStyle = '#fff'; c.font = '700 40px system-ui, sans-serif';
  c.fillText('igreja.eco.br/radar', W / 2, H - 62);
}

export default function ParceiroTrocas({ token, ponto }) {
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [formato, setFormato] = useState('story');
  const [canal, setCanal] = useState('whatsapp');
  const [link, setLink] = useState('');
  const [obs, setObs] = useState('');
  const [ramo, setRamo] = useState('');
  const [copiou, setCopiou] = useState('');
  const tela = useRef(null);
  const { n } = semanaDe();
  const tema = temaDa(n);
  const meuLink = `${SITE_PUBLICO}/p/${ponto.codigo}`;

  useEffect(() => {
    chamar('/api/parceiro/trocas?token=' + token).then((j) => { setD(j); setRamo(j.ponto.ramo || ''); }).catch((e) => setMsg({ t: 'er', x: e.message }));
  }, [token]);
  useEffect(() => { if (tela.current) desenhar(tela.current, ponto, tema, formato).catch(() => {}); }, [formato, n, ponto.codigo, !!d]); // eslint-disable-line

  async function agir(corpo, ok) {
    setOcupado(true); setMsg(null);
    try { const j = await post(token, corpo); setD(j); if (ok) setMsg({ t: 'ok', x: ok }); return true; }
    catch (e) { setMsg({ t: 'er', x: e.message }); return false; }
    finally { setOcupado(false); }
  }
  const baixar = () => { const a = document.createElement('a'); a.download = `cartaz-${ponto.codigo}-${formato}.png`; a.href = tela.current.toDataURL('image/png'); a.click(); };
  const copiar = async (txt, k) => { try { await navigator.clipboard.writeText(txt); setCopiou(k); setTimeout(() => setCopiou(''), 2000); } catch (e) { setMsg({ t: 'er', x: 'Não consegui copiar. Selecione o texto e copie.' }); } };
  async function comprovar(ev) {
    ev.preventDefault();
    if (await agir({ acao: 'comprovar', canal, link, obs }, 'Recebido! Vamos conferir.')) { setLink(''); setObs(''); }
  }

  const selo = d ? seloDe(d.aprovadas) : null;
  const proximoSelo = d ? [...SELOS].reverse().find((x) => d.aprovadas < x[0]) : null;
  const esta = d && d.divulgacoes.filter((x) => x.semana === d.semana);
  const texto = legenda(ponto, meuLink, n);

  return (
    <div className={s.cartao} style={{ margin: '0 auto', maxWidth: 1000 }}>
      <h2 style={{ margin: 0 }}>Divulgação e trocas</h2>
      <p style={{ margin: '6px 0 0' }}>Divulgue o Radar nos seus canais e apareça mais na vitrine. É uma troca: você ajuda a loja a ser encontrada e o site ajuda o seu negócio. Sem custo e sem promessa de vendas.</p>
      {msg && <div className={`${s.aviso} ${msg.t === 'ok' ? s.ok : s.er}`} role="status">{msg.x}</div>}
      {!d && !msg && <p>Carregando…</p>}

      {d && (
        <>
          <p style={{ margin: '14px 0 0' }}>
            {selo ? <span className={s.status} style={{ background: selo.cor }}>{selo.nome}</span> : <span className={s.status} style={{ background: '#64748b' }}>Sem selo ainda</span>}{' '}
            {d.aprovadas} publicação(ões) aprovada(s){proximoSelo ? ` · faltam ${proximoSelo[0] - d.aprovadas} para o selo ${proximoSelo[1]}` : ''}
          </p>

          <h3>1 · Publicação desta semana: {tema.t}</h3>
          <p style={{ margin: 0 }}>Toda semana o tema muda, para você não repetir a mesma publicação. Publique, e depois comprove no passo 3.</p>
          <div style={{ display: 'flex', gap: 8, margin: '10px 0', flexWrap: 'wrap' }}>
            <button type="button" className={s.ghost} onClick={() => setFormato('story')} style={formato === 'story' ? { fontWeight: 800 } : null}>Story / status (vertical)</button>
            <button type="button" className={s.ghost} onClick={() => setFormato('feed')} style={formato === 'feed' ? { fontWeight: 800 } : null}>Post (feed)</button>
          </div>
          <canvas ref={tela} style={{ width: '100%', maxWidth: 300, border: '1px solid rgba(138,84,41,.3)', borderRadius: 12, display: 'block' }} />
          <div style={{ margin: '10px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className={`${s.botao} ${s.principal}`} onClick={baixar}>Baixar imagem</button>
            <button type="button" className={`${s.botao} ${s.contorno}`} onClick={() => copiar(texto, 'leg')}>{copiou === 'leg' ? 'Copiado!' : 'Copiar legenda'}</button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff8ec', border: '1px solid rgba(138,84,41,.25)', borderRadius: 10, padding: 12, margin: 0, fontFamily: 'inherit', fontSize: 14.5 }}>{texto}</pre>
          <small className={s.dica}>O QR leva à loja marcando o seu ponto como origem. Cada pedido feito por ele aparece nos resultados.</small>

          <h3>2 · Calendário</h3>
          <p style={{ margin: 0 }}>Uma publicação por semana já basta. Temas das próximas semanas: {[1, 2, 3].map((i) => temaDa(n + i).t).join(' · ')}.</p>

          <h3>3 · Comprovar a publicação</h3>
          <form onSubmit={comprovar}>
            <label>Onde você publicou?</label>
            <select value={canal} onChange={(e) => setCanal(e.target.value)}>{Object.entries(CANAIS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <label>Link da publicação (se tiver)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
            <label>Observação (status some em 24h; conte o que fez)</label>
            <input value={obs} onChange={(e) => setObs(e.target.value)} maxLength={200} placeholder="Ex.: postei no status e em 2 grupos" />
            <div style={{ marginTop: 12 }}><button className={`${s.botao} ${s.principal}`} disabled={ocupado}>Enviar comprovação</button></div>
          </form>
          {esta && esta.length > 0 && <p style={{ margin: '10px 0 0' }}>Desta semana: {esta.map((x) => <span key={x.id} className={s.status} style={{ background: ST[x.status][1], marginRight: 6 }}>{CANAIS[x.canal]} · {ST[x.status][0]}</span>)}</p>}

          <h3>4 · Troca com outros parceiros</h3>
          {!d.ponto.troca_aberta ? (
            <>
              <p style={{ margin: 0 }}>Você divulga um parceiro da sua cidade e ele divulga você. Só aparece para troca quem ligar esta opção, e só depois da vitrine aprovada.</p>
              <label>Seu ramo (ex.: padaria, salão, igreja)</label>
              <input value={ramo} onChange={(e) => setRamo(e.target.value)} maxLength={60} />
              <div style={{ marginTop: 10 }}><button type="button" className={`${s.botao} ${s.principal}`} disabled={ocupado || d.ponto.perfil_status !== 'aprovado'} onClick={() => agir({ acao: 'config', aberta: true, ramo }, 'Pronto! Você aparece para trocas.')}>Quero trocar divulgação</button></div>
              {d.ponto.perfil_status !== 'aprovado' && <small className={s.dica}>Disponível depois que a sua vitrine for publicada.</small>}
            </>
          ) : (
            <>
              <p style={{ margin: 0 }}>Você está aberto a trocas. <button type="button" className={s.ghost} onClick={() => agir({ acao: 'config', aberta: false, ramo: d.ponto.ramo }, 'Você saiu da lista de trocas.')}>Desligar</button></p>
              {d.trocas.map((t) => (
                <div key={t.id} style={{ borderTop: '1px solid rgba(138,84,41,.2)', marginTop: 10, paddingTop: 10 }}>
                  <b>{t.outro.nome}</b>{t.outro.ramo ? ` · ${t.outro.ramo}` : ''} <span className={s.status} style={{ background: ST[t.status][1] }}>{t.status === 'proposta' && t.quem === 'ele' ? 'Quer trocar com você' : ST[t.status][0]}</span>
                  {t.status === 'proposta' && t.quem === 'ele' && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className={`${s.botao} ${s.principal}`} disabled={ocupado} onClick={() => agir({ acao: 'responder', id: t.id, aceitar: true }, 'Troca combinada!')}>Aceitar</button>
                      <button type="button" className={`${s.botao} ${s.contorno}`} disabled={ocupado} onClick={() => agir({ acao: 'responder', id: t.id, aceitar: false })}>Recusar</button>
                    </div>
                  )}
                  {t.status === 'aceita' && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ margin: 0 }}>Combinem pelo contato dele e divulguem um ao outro, no seu ritmo:</p>
                      <p style={{ margin: '4px 0', wordBreak: 'break-all' }}>{t.contato && t.contato.whatsapp ? <a href={`https://wa.me/${t.contato.whatsapp}?text=${encodeURIComponent(textoTroca(ponto.nome, t.outro.nome, `${SITE_PUBLICO}/ponto/${ponto.codigo}`))}`} target="_blank" rel="noopener noreferrer">WhatsApp dele</a> : 'Sem WhatsApp na vitrine dele.'}{t.contato && t.contato.instagram ? <> · Instagram @{t.contato.instagram}</> : null} · <a href={`${SITE_PUBLICO}/ponto/${t.outro.codigo}`} target="_blank" rel="noopener noreferrer">página dele</a></p>
                    </div>
                  )}
                </div>
              ))}
              <h4 style={{ margin: '14px 0 4px' }}>Parceiros disponíveis em {ponto.cidade}</h4>
              {d.sugestoes.length === 0 && <p style={{ margin: 0 }}>Ninguém disponível agora. Quando outro parceiro ligar a opção, ele aparece aqui.</p>}
              {d.sugestoes.map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: '6px 0' }}>
                  <span><b>{o.nome}</b>{o.ramo ? ` · ${o.ramo}` : ''}{o.perfil_slogan ? ` — ${o.perfil_slogan}` : ''}</span>
                  <button type="button" className={s.ghost} disabled={ocupado} onClick={() => agir({ acao: 'propor', para: o.id }, 'Proposta enviada. Ele vê no painel dele.')}>Propor troca</button>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
