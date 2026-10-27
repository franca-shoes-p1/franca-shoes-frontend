import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ASSUNTOS, linkWhats } from '../lib/atendimento';
import { REDES } from '../lib/redes';
import s from '../styles/contato.module.css';

const ZAP = (REDES.find((r) => r.id === 'whatsapp') || {}).url || '';
const TELEGRAM = (REDES.find((r) => r.id === 'telegram') || {}).url || '';
const NUM_ZAP = (ZAP.match(/wa\.me\/(\d+)/) || [])[1] || '';

export default function Contato() {
  const router = useRouter();
  const origem = typeof router.query.de === 'string' ? router.query.de : '';
  const [f, setF] = useState({ nome: '', whatsapp: '', email: '', assunto: ASSUNTOS[0], mensagem: '', aceito: false, site: '' });
  const [estado, setEstado] = useState('form'); // form | enviando | ok
  const [erro, setErro] = useState('');
  const [numero, setNumero] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(ev) {
    ev.preventDefault();
    setErro('');
    setEstado('enviando');
    try {
      const r = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, pagina: origem || 'contato' }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.erro || 'Não foi possível enviar agora.');
      setNumero(d.numero || null);
      setEstado('ok');
    } catch (e) {
      setErro(e.message);
      setEstado('form');
    }
  }

  // Se o envio falhar, a pessoa ainda consegue falar com você direto no WhatsApp.
  const textoZap = `Olá! Meu nome é ${f.nome || '...'}. Assunto: ${f.assunto}. ${f.mensagem}`.trim();
  const zapDireto = linkWhats(NUM_ZAP, textoZap) || ZAP;

  return (
    <div className={s.pagina}>
      <Head>
        <title>Fale conosco | Igreja Eco</title>
        <meta name="description" content="Tire dúvidas, peça um orçamento ou fale com a nossa equipe." />
      </Head>
      <main className={s.caixa}>
        <Link href="/" className={s.voltar}>← Voltar ao início</Link>
        <h1>Fale conosco</h1>
        <p className={s.lead}>Escreva a sua dúvida ou pedido. Respondemos pelo WhatsApp ou pelo e-mail que você informar.</p>

        {estado === 'ok' ? (
          <div className={s.ok} role="status">
            <h2>Mensagem recebida{numero ? ` (nº ${numero})` : ''}</h2>
            <p>Obrigado! Vamos responder assim que possível, em horário comercial. Se for urgente, chame direto:</p>
            <div className={s.acoes}>
              <a className={s.bt} href={zapDireto} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
              {TELEGRAM && <a className={`${s.bt} ${s.bt2}`} href={TELEGRAM} target="_blank" rel="noopener noreferrer">Telegram</a>}
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} className={s.form} noValidate>
            <label>Seu nome
              <input value={f.nome} onChange={set('nome')} maxLength={120} autoComplete="name" required />
            </label>
            <div className={s.dois}>
              <label>WhatsApp com DDD
                <input value={f.whatsapp} onChange={set('whatsapp')} maxLength={30} inputMode="tel" autoComplete="tel" placeholder="(16) 99999-9999" />
              </label>
              <label>ou e-mail
                <input type="email" value={f.email} onChange={set('email')} maxLength={160} autoComplete="email" placeholder="voce@exemplo.com" />
              </label>
            </div>
            <p className={s.dica}>Preencha pelo menos um dos dois, para podermos responder.</p>
            <label>Assunto
              <select value={f.assunto} onChange={set('assunto')}>
                {ASSUNTOS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label>Mensagem
              <textarea value={f.mensagem} onChange={set('mensagem')} maxLength={1500} rows={5} required />
            </label>
            {/* campo-isca: pessoas não veem, robôs preenchem */}
            <div className={s.isca} aria-hidden="true">
              <label>Site<input tabIndex={-1} autoComplete="off" value={f.site} onChange={set('site')} /></label>
            </div>
            <label className={s.aceite}>
              <input type="checkbox" checked={f.aceito} onChange={set('aceito')} />
              <span>Aceito receber a resposta por WhatsApp ou e-mail. Usamos seus dados só para responder esta mensagem.</span>
            </label>
            {erro && <div className={s.erro} role="alert">{erro}</div>}
            <button className={s.bt} disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar mensagem'}</button>
            <p className={s.dica}>Prefere conversar agora? <a href={zapDireto} target="_blank" rel="noopener noreferrer">Chame no WhatsApp</a>.</p>
          </form>
        )}
      </main>
    </div>
  );
}
