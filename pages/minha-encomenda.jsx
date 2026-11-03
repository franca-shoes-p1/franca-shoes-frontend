import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import s from '../styles/entrega.module.css';

/* O cliente acompanha a encomenda, confirma a cotação ou sai da fila, sozinho.
   Precisa do código da encomenda e do WhatsApp usado no pedido. */
const WHATS = (t) => 'https://wa.me/5516991543663?text=' + encodeURIComponent(t);
const ETAPAS = ['Pedido recebido', 'Cotação enviada', 'Na fila do lote mínimo', 'Lote fechado e comprado', 'Rota da sua cidade marcada', 'Visita confirmada', 'Entregue'];
const ETAPA_DO_STATUS = { aguardando_cotacao: 0, cotado: 1, aguardando_lote: 2, lote_fechado: 3, comprado: 3, rota_agendada: 4, visita_confirmada: 5, entregue: 6 };
const ROTULO = {
  aguardando_cotacao: 'Aguardando cotação', cotado: 'Cotação pronta: falta a sua confirmação', aguardando_lote: 'Na fila do lote mínimo',
  lote_fechado: 'Lote fechado', comprado: 'Comprado em Franca', rota_agendada: 'Rota marcada', visita_confirmada: 'Visita confirmada',
  entregue: 'Entregue', recusou: 'Recusado na visita', desistiu: 'Você saiu da fila',
};
const HORARIO = { qualquer: 'qualquer horário', manha: 'manhã', tarde: 'tarde', noite: 'noite' };
const brl = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');

const TEXTO_STATUS = {
  aguardando_cotacao: 'Estamos procurando o melhor preço para o seu pedido. Você recebe a cotação pelo WhatsApp.',
  cotado: 'A cotação já está pronta. Confirme abaixo se quer seguir. Nada é cobrado agora.',
  aguardando_lote: 'Você está na fila do lote mínimo da fábrica. Avisamos pelo WhatsApp quando fechar.',
  lote_fechado: 'O lote fechou! A compra está sendo feita em Franca.',
  comprado: 'O seu produto já foi comprado em Franca. Falta montar a rota da sua cidade.',
  rota_agendada: 'A rota da sua cidade está marcada. Vamos combinar o horário da visita pelo WhatsApp.',
  visita_confirmada: 'Visita confirmada. Prove o produto em casa e pague em dinheiro só se gostar.',
  entregue: 'Encomenda entregue. Obrigado por provar! Se precisar de troca, chame no WhatsApp.',
  recusou: 'Você recusou o produto na visita e não pagou nada.',
  desistiu: 'Você saiu da fila. Se mudar de ideia, é só fazer uma nova encomenda.',
};

export default function MinhaEncomenda() {
  const { query, isReady } = useRouter();
  const [codigo, setCodigo] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [enc, setEnc] = useState(null);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => { if (isReady && query.c) setCodigo(String(query.c).toUpperCase()); }, [isReady, query.c]);

  async function chamar(acao) {
    setOcupado(true); setErro(''); setAviso('');
    try {
      const r = await fetch('/api/encomenda/acompanhar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, whatsapp, acao }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErro(j.erro || 'Não foi possível consultar agora.'); return; }
      setEnc(j.encomenda);
      if (acao === 'confirmar') setAviso('Confirmado! Você está na fila do lote. Avisamos pelo WhatsApp a cada passo.');
      if (acao === 'desistir') setAviso('Tudo certo, você saiu da fila. Nada foi cobrado.');
    } catch (e) {
      setErro('Sem conexão. Tente de novo ou chame no WhatsApp.');
    } finally {
      setOcupado(false);
    }
  }

  const etapa = enc ? ETAPA_DO_STATUS[enc.status] : -1;
  const encerrada = enc && (enc.status === 'recusou' || enc.status === 'desistiu');
  const podeSair = enc && !['entregue', 'recusou', 'desistiu'].includes(enc.status);

  return (
    <div className={s.pagina}>
      <Head>
        <title>Acompanhe a sua encomenda · Entrega em Casa</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={s.topo}>
        <Link href="/">← Voltar ao site</Link>
        <Link href="/entrega-em-casa">Como funciona o projeto</Link>
      </div>
      <header className={s.hero}>
        <div className={s.dentro} style={{ gridTemplateColumns: 'minmax(0, 1fr)', paddingBottom: 70 }}>
          <div className={s.esq}>
            <span className={s.pilula}><i />Minha encomenda</span>
            <h1 className={s.titulo}>Acompanhe o seu pedido, <em>confirme ou saia da fila</em></h1>
            <p className={s.texto}>Use o código que você recebeu ao fazer a encomenda e o WhatsApp do pedido.</p>
          </div>
        </div>
      </header>

      <main className={s.acomp}>
        <div className={s.heroForm}>
          {!enc && (
            <form onSubmit={(e) => { e.preventDefault(); chamar('consultar'); }}>
              <h2>Consultar encomenda</h2>
              <label className={s.campo}><span>Código da encomenda</span>
                <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="EN1A2B3C" autoCapitalize="characters" autoComplete="off" />
              </label>
              <label className={s.campo}><span>WhatsApp usado no pedido</span>
                <input type="tel" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(16) 99999-9999" autoComplete="tel" />
              </label>
              {erro && <div className={s.erro} role="alert">{erro}</div>}
              <div className={s.botoes}><button className={`${s.botao} ${s.verde}`} disabled={ocupado}>{ocupado ? 'Consultando...' : 'Ver minha encomenda'}</button></div>
              <p style={{ margin: '14px 0 0', fontSize: 13.5, color: '#4a7468' }}>Perdeu o código? <a href={WHATS('Olá! Perdi o código da minha encomenda e quero acompanhar.')} target="_blank" rel="noopener noreferrer">Chame no WhatsApp</a>.</p>
            </form>
          )}

          {enc && (
            <div>
              <div className={s.codigo}>{enc.codigo}</div>
              <h2 style={{ margin: '4px 0' }}>{enc.quantidade}x {enc.produto}</h2>
              <p style={{ margin: 0, color: '#3f635a', fontSize: 14.5 }}>
                {enc.numeracao ? `Numeração ${enc.numeracao} · ` : ''}Visita em {enc.cidade}-{enc.uf} · prefere {HORARIO[enc.melhor_horario] || 'qualquer horário'}
              </p>
              <p style={{ margin: '12px 0 0' }}><span className={`${s.etiqueta} ${encerrada ? s.fim : ''}`}>{ROTULO[enc.status] || enc.status}</span></p>
              <p style={{ margin: '10px 0 0' }}>{TEXTO_STATUS[enc.status] || ''}</p>
              {enc.preco_cotado ? <div className={s.resumo}><b>Preço cotado:</b> {brl(enc.preco_cotado)} por unidade, em dinheiro, só na visita e só se você gostar.</div> : null}
              {aviso && <div className={s.resumo} role="status">{aviso}</div>}
              {erro && <div className={s.erro} role="alert">{erro}</div>}

              {!encerrada && (
                <ol className={s.linhaTempo}>
                  {ETAPAS.map((t, i) => <li key={t} className={i < etapa ? s.feito : i === etapa ? s.agora : ''}>{t}</li>)}
                </ol>
              )}

              <div className={s.botoes} style={{ flexDirection: 'column' }}>
                {enc.status === 'cotado' && (
                  <button className={`${s.botao} ${s.verde}`} disabled={ocupado} onClick={() => chamar('confirmar')}>Confirmar e seguir com a encomenda</button>
                )}
                {podeSair && (
                  <button className={`${s.botao} ${s.perigo}`} disabled={ocupado}
                    onClick={() => { if (window.confirm('Quer mesmo sair da fila? Nada será cobrado.')) chamar('desistir'); }}>Sair da fila</button>
                )}
                <a className={`${s.botao} ${s.claro}`} href={WHATS(`Olá! Sobre a minha encomenda ${enc.codigo}.`)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
                <button className={`${s.botao} ${s.claro}`} onClick={() => { setEnc(null); setAviso(''); setErro(''); }}>Consultar outra</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
