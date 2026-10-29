// Inscrição aberta: qualquer pessoa pode participar do Radar de Pontos.
import { useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../../styles/radar.module.css';
import { TIPOS, CIDADES } from '../../lib/pontos';
import { WHATS_RADAR } from '../../lib/radarAssistente';

const TIPOS_FORM = ['pessoa', 'comercio', 'grupo', 'condominio', 'igreja', 'universidade', 'mural_publico', 'outro'];
const VAZIO = { nome: '', cidade: '', uf: '', tipo: 'pessoa', local: '', whatsapp: '', email: '', aceite: false };

export default function Participar() {
  const [f, setF] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [ok, setOk] = useState(null);
  const aberto = useRef(Date.now()); // robôs enviam em menos de 3 segundos
  const muda = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const cidades = Object.keys(CIDADES);

  async function enviar(ev) {
    ev.preventDefault();
    setOcupado(true); setErro('');
    try {
      const r = await fetch('/api/ponto/participar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, tempo: Date.now() - aberto.current }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || 'Erro ' + r.status);
      if (!j.token) throw new Error('Não foi possível concluir. Recarregue a página e tente de novo.');
      setOk(j);
    } catch (e) { setErro(e.message); }
    setOcupado(false);
  }

  return (
    <div className={s.pagina}>
      <Head>
        <title>Quero participar · Radar de Pontos</title>
        <meta name="description" content="Qualquer pessoa pode participar do Radar de Pontos: divulgue o seu trabalho na Vitrine dos Parceiros ou ceda um espaço para o cartaz. Troca de divulgação, sem custo." />
      </Head>
      <div className={s.barra}><Link href="/radar">← O que é o Radar</Link><a href={WHATS_RADAR} target="_blank" rel="noopener noreferrer">Dúvidas? WhatsApp</a></div>
      <div className={s.perfilPag} style={{ maxWidth: 720 }}>
        <p className={s.rotulo}>Quero participar</p>
        <h1 className={s.h2}>Qualquer pessoa pode fazer parte</h1>
        <p className={s.sub}>Tem um negócio, um serviço ou um projeto? Ganha uma vitrine grátis no site. Tem um espaço, como um mural, condomínio, igreja ou escola? Pode ceder um cantinho para o cartaz. Não tem espaço físico? Divulgue pelo celular, com imagem pronta toda semana. É uma troca de divulgação, sem custo e sem contrato.</p>

        {ok ? (
          <div className={s.cartao}>
            <h3>Cadastro recebido!</h3>
            <p>Agora monte a sua vitrine: logotipo, frase e contatos. Depois de conferirmos, ela aparece no site.</p>
            <p><b>Guarde o link do seu painel</b>: é a sua chave de acesso e não tem senha.</p>
            <div className={s.cta} style={{ justifyContent: 'flex-start' }}>
              <Link href={`/parceiro/${ok.token}`} className={`${s.botao} ${s.principal}`}>Montar a minha vitrine</Link>
            </div>
          </div>
        ) : (
          <form className={`${s.cartao} ${s.painelP}`} style={{ display: 'block', padding: 22, maxWidth: 'none' }} onSubmit={enviar}>
            <label>Seu nome ou o nome do seu negócio</label>
            <input value={f.nome} onChange={muda('nome')} maxLength={120} required />
            <label>Cidade</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 90px', gap: 10 }}>
              <input list="cidades" value={f.cidade} onChange={muda('cidade')} maxLength={80} required />
              <input value={f.uf} onChange={muda('uf')} maxLength={2} placeholder="UF" required aria-label="Estado (UF)" />
            </div>
            <datalist id="cidades">{cidades.map((c) => <option key={c} value={c} />)}</datalist>
            <small className={s.dica}>Estamos abrindo as capitais do Brasil, uma por vez. Se a sua cidade ainda não está ativa, entramos na lista de espera.</small>
            <label>Quem é você?</label>
            <select value={f.tipo} onChange={muda('tipo')} style={{ width: '100%', font: 'inherit', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(138,84,41,.4)', background: '#fff' }}>
              {TIPOS_FORM.map((t) => <option key={t} value={t}>{TIPOS[t]}</option>)}
            </select>
            <label>Onde poderia ficar o cartaz? (opcional)</label>
            <input value={f.local} onChange={muda('local')} maxLength={200} placeholder="Ex.: mural do meu condomínio, recepção da igreja" />
            <small className={s.dica}>Só indique um lugar onde você tem permissão para deixar o cartaz. Não tem espaço? Deixe em branco: você divulga pelo celular (status, stories, grupos) com a imagem e a legenda prontas que o painel entrega.</small>
            <label>WhatsApp (com DDD)</label>
            <input value={f.whatsapp} onChange={muda('whatsapp')} inputMode="tel" placeholder="31 99999-9999" />
            <label>E-mail</label>
            <input type="email" value={f.email} onChange={muda('email')} maxLength={120} />
            <small className={s.dica}>Informe pelo menos um dos dois contatos.</small>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: 600 }}>
              <input type="checkbox" checked={f.aceite} onChange={muda('aceite')} style={{ width: 20, marginTop: 3 }} />
              <span>Autorizo o uso do meu contato apenas para falar sobre o Radar e que o meu nome e a minha vitrine apareçam no site depois de aprovados. Posso sair quando quiser.</span>
            </label>
            {erro && <div className={`${s.aviso} ${s.er}`} role="alert">{erro}</div>}
            <div style={{ marginTop: 16 }}><button className={`${s.botao} ${s.principal}`} disabled={ocupado}>Quero participar</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
