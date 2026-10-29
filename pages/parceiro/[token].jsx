// Painel do Ponto Parceiro: o dono do negócio monta a própria vitrine (marca, logotipo, contatos).
// O acesso é pelo link secreto do convite. Tudo o que ele salva passa por revisão antes de aparecer no site.
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../../styles/radar.module.css';
import { reduzirFoto } from '../../lib/reduzirFoto';
import { PERFIL_STATUS } from '../../lib/parceiro';
import { SITE_PUBLICO } from '../../lib/pontos';

const VAZIO = { slogan: '', descricao: '', logo: '', whatsapp: '', instagram: '', site: '', horario: '', endereco: '' };
const chamar = async (url, opts) => {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
  return j;
};
const doPonto = (p) => ({ slogan: p.perfil_slogan || '', descricao: p.perfil_descricao || '', logo: p.perfil_logo || '', whatsapp: (p.perfil_whatsapp || '').replace(/^55/, ''), instagram: p.perfil_instagram || '', site: p.perfil_site || '', horario: p.perfil_horario || '', endereco: p.perfil_endereco || '' });

export default function PainelParceiro({ token }) {
  const [ponto, setPonto] = useState(null);
  const [f, setF] = useState(VAZIO);
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [fim, setFim] = useState(false);
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    if (!token) return;
    chamar('/api/parceiro/perfil?token=' + token)
      .then((j) => { setPonto(j.ponto); setF(doPonto(j.ponto)); })
      .catch((e) => setMsg({ t: 'er', x: e.message }))
      .finally(() => setCarregou(true));
  }, [token]);

  const muda = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function enviarLogo(ev) {
    const arq = ev.target.files && ev.target.files[0];
    if (!arq) return;
    setOcupado(true); setMsg(null);
    try {
      const imagem = await reduzirFoto(arq);
      const j = await chamar('/api/parceiro/logo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, imagem }) });
      setF((x) => ({ ...x, logo: j.url }));
      setMsg({ t: 'ok', x: 'Logotipo enviado. Falta clicar em "Salvar e enviar para análise".' });
    } catch (e) { setMsg({ t: 'er', x: e.message }); }
    setOcupado(false); ev.target.value = '';
  }
  async function salvar(ev) {
    ev.preventDefault();
    setOcupado(true); setMsg(null);
    try {
      const j = await chamar('/api/parceiro/perfil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, perfil: f }) });
      setPonto(j.ponto);
      setMsg({ t: 'ok', x: 'Recebido! Vamos conferir e publicar em breve.' });
    } catch (e) { setMsg({ t: 'er', x: e.message }); }
    setOcupado(false);
  }
  async function sair() {
    setOcupado(true);
    try { await chamar('/api/parceiro/perfil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, acao: 'sair' }) }); setFim(true); }
    catch (e) { setMsg({ t: 'er', x: e.message }); }
    setOcupado(false);
  }

  const st = ponto ? PERFIL_STATUS[ponto.perfil_status] || PERFIL_STATUS.rascunho : null;
  const linkPublico = ponto ? `${SITE_PUBLICO}/ponto/${ponto.codigo}` : '';

  return (
    <div className={s.pagina}>
      <Head><title>Painel do Ponto Parceiro</title><meta name="robots" content="noindex" /></Head>
      <div className={s.barra}><Link href="/radar">← O que é o Radar</Link><span>Painel do parceiro</span></div>

      {!carregou && <div className={s.painelP}><div className={s.cartao}>Carregando…</div></div>}
      {carregou && !ponto && <div className={s.painelP} style={{ gridTemplateColumns: 'minmax(0,1fr)' }}><div className={s.cartao}><h3>Link não disponível</h3><p>{msg ? msg.x : 'Confira o link recebido.'}</p></div></div>}
      {fim && <div className={s.painelP} style={{ gridTemplateColumns: 'minmax(0,1fr)' }}><div className={s.cartao}><h3>Tudo certo</h3><p>Você saiu do programa. O seu local não aparece mais no site e não enviaremos novas mensagens.</p></div></div>}

      {ponto && !fim && (
        <div className={s.painelP}>
          <form className={s.cartao} onSubmit={salvar}>
            <h2 style={{ margin: 0 }}>Monte a vitrine de {ponto.nome}</h2>
            <p style={{ margin: '6px 0 0' }}>Estas informações aparecem na página do seu local e na Vitrine dos Parceiros, no site. É grátis.</p>
            <p style={{ margin: '8px 0 0' }}>Situação: <span className={s.status} style={{ background: st[1] }}>{st[0]}</span></p>
            {ponto.perfil_status === 'reprovado' && <div className={`${s.aviso} ${s.er}`}>Pedimos um ajuste. Revise os textos e a imagem e envie de novo.</div>}
            {msg && <div className={`${s.aviso} ${msg.t === 'ok' ? s.ok : s.er}`} role="status">{msg.x}</div>}

            <label>Logotipo ou foto da fachada</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={enviarLogo} disabled={ocupado} />
            <small className={s.dica}>Envie só imagens que são suas. Quadrada fica melhor.</small>
            <label>Frase curta (até 80 letras)</label>
            <input value={f.slogan} onChange={muda('slogan')} maxLength={80} placeholder="Ex.: Pães quentinhos desde 1998" />
            <label>Sobre o seu negócio (até 400 letras)</label>
            <textarea value={f.descricao} onChange={muda('descricao')} maxLength={400} placeholder="Conte o que você vende ou faz." />
            <label>Horário de funcionamento</label>
            <input value={f.horario} onChange={muda('horario')} maxLength={120} placeholder="Seg a sáb, 7h às 19h" />
            <label>Endereço para o público</label>
            <input value={f.endereco} onChange={muda('endereco')} maxLength={160} placeholder="Rua, número, bairro" />
            <label>WhatsApp do negócio (com DDD)</label>
            <input value={f.whatsapp} onChange={muda('whatsapp')} inputMode="tel" placeholder="31 99999-9999" />
            <label>Instagram (só o nome de usuário)</label>
            <input value={f.instagram} onChange={muda('instagram')} placeholder="@meunegocio" />
            <label>Site (opcional)</label>
            <input value={f.site} onChange={muda('site')} placeholder="https://" />
            <div style={{ marginTop: 18 }}><button className={`${s.botao} ${s.principal}`} disabled={ocupado}>Salvar e enviar para análise</button></div>
            <p className={s.rodape} style={{ padding: '12px 0 0' }}>Conferimos antes de publicar. Você pode mudar quando quiser. Só aparece o que você escrever aqui: o seu contato interno não é divulgado.</p>
          </form>

          <div className={s.sticky}>
            <div className={s.previa}>
              <small className={s.local}>Assim vai aparecer</small>
              <div className={s.logoBox} style={{ marginTop: 10 }}>{f.logo ? <img src={f.logo} alt="Logotipo" /> : '🏪'}</div>
              <span className={s.local}>Ponto Parceiro · {ponto.cidade}/{ponto.uf}</span>
              <h3>{ponto.nome}</h3>
              {f.slogan && <p><b>{f.slogan}</b></p>}
              {f.descricao && <p>{f.descricao}</p>}
              {f.horario && <p>🕒 {f.horario}</p>}
              {f.endereco && <p>📍 {f.endereco}</p>}
              <div className={s.cta}><span className={`${s.botao} ${s.principal}`}>👟 Ver os calçados de fábrica</span></div>
            </div>
            <div className={s.cartao} style={{ marginTop: 14 }}>
              <b>Página do seu local</b>
              <p style={{ wordBreak: 'break-all', margin: '4px 0' }}>{linkPublico}</p>
              <p style={{ margin: 0, fontSize: 14 }}>É para onde o QR do cartaz leva. Depois de publicada, você pode divulgar este link.</p>
              <div style={{ marginTop: 14 }}>
                {!saindo ? <button type="button" className={s.ghost} onClick={() => setSaindo(true)}>Quero sair do programa</button> : (
                  <p style={{ margin: 0 }}>Tem certeza? O seu local sai do site e do mapa. <button type="button" className={s.ghost} onClick={sair} disabled={ocupado}>Sim, sair</button> · <button type="button" className={s.ghost} style={{ color: '#5b3718' }} onClick={() => setSaindo(false)}>Voltar</button></p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store');
  const token = String(params.token || '');
  if (!/^[0-9a-f]{24}$/.test(token)) return { notFound: true };
  return { props: { token } };
}
