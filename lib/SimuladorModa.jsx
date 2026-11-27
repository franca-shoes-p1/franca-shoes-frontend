import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import s from '../styles/simulador.module.css';

/* Simulação da Loja de Moda e Lembranças: o visitante percorre as etapas e termina no WhatsApp.
   Nada é salvo nem enviado pelo site: a mensagem só sai se a própria pessoa tocar em enviar no WhatsApp. */
const WHATSAPP = '5516991543663';

const ETAPAS = ['Plano', 'Live', 'Pagamento', 'Entrega', 'Contato'];
const PLANOS = [
  { id: 'abastecida', e: '🏬', t: 'Loja Abastecida', d: 'Tenho ou quero ter a minha loja',
    entrega: 'Eu guardo o estoque e entrego ao seu cliente.', rota: ['🛍️', '📦', '🏠'], fim: 'Seu cliente' },
  { id: 'revenda', e: '🔁', t: 'Revenda', d: 'Quero comprar para revender',
    entrega: 'Os produtos passam a ser seus. A forma de entrega será informada antes da adesão.', rota: ['🛍️', '📦', '🤝'], fim: 'Você revende' },
  { id: 'membro', e: '🙏', t: 'Membro', d: 'Uso próprio, no grupo da igreja',
    entrega: 'Previsto: retirada em rodoviárias das cidades atendidas, ou Correios com frete pago por você.', rota: ['🛍️', '🚌', '🙋'], fim: 'Você' },
];
const PRODUTOS = [
  { id: 'roupas', e: '👕', t: 'Roupas' },
  { id: 'calcados', e: '👟', t: 'Calçados' },
  { id: 'acessorios', e: '👜', t: 'Acessórios' },
  { id: 'suvenires', e: '🎁', t: 'Suvenires' },
];

export function linkWhats({ plano, itens, cidade }) {
  const linhas = [
    'Olá! Fiz a simulação da Loja de Moda e Lembranças no site.',
    `Plano: ${plano}`,
    `Tenho interesse em: ${itens.join(', ')}`,
  ];
  if (cidade.trim()) linhas.push(`Cidade: ${cidade.trim()}`);
  linhas.push('Quero saber como participar.');
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(linhas.join('\n'))}`;
}

export default function SimuladorModa() {
  const { 0: passo, 1: setPasso } = useState(0); // 0 = abertura
  const { 0: plano, 1: setPlano } = useState(null);
  const { 0: escolhas, 1: setEscolhas } = useState([]);
  const { 0: cidade, 1: setCidade } = useState('');
  const { 0: vez, 1: setVez } = useState(0);
  const { 0: pago, 1: setPago } = useState(false);

  // vitrine girando na abertura e na live
  useEffect(() => {
    if (passo > 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setVez((v) => (v + 1) % PRODUTOS.length), 1800);
    return () => clearInterval(t);
  }, [passo]);

  const p = PLANOS.find((x) => x.id === plano);
  const itens = PRODUTOS.filter((x) => escolhas.includes(x.id));
  const alternar = (id) => { setPago(false); setEscolhas((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])); };
  const recomecar = () => { setPasso(0); setPlano(null); setEscolhas([]); setCidade(''); setPago(false); };

  return (
    <div className={s.caixa} aria-label="Simulação do negócio">
      <div className={s.topo}>
        <span className={s.vivo}><i />Simulação</span>
        <span>{passo === 0 ? 'Teste em 1 minuto' : `Etapa ${passo} de 5 · ${ETAPAS[passo - 1]}`}</span>
      </div>
      <div className={s.barra}><span style={{ width: `${passo * 20}%` }} /></div>

      <div className={s.tela} key={passo} aria-live="polite">
        {passo === 0 && (
          <>
            <div className={s.palco} aria-hidden="true">
              <span className={s.selo}>● AO VIVO</span>
              <span key={vez} className={s.destaque}>{PRODUTOS[vez].e}</span>
              <b>{PRODUTOS[vez].t}</b>
              <span className={`${s.voa} ${s.v1}`}>🛍️</span>
              <span className={`${s.voa} ${s.v2}`}>📦</span>
              <span className={`${s.voa} ${s.v3}`}>🚚</span>
            </div>
            <h3>Do Brás até você, sem sair de casa</h3>
            <p>Veja na prática como seria escolher, pagar e receber.</p>
            <button type="button" className={s.principal} onClick={() => setPasso(1)}>▶ Testar agora</button>
          </>
        )}

        {passo === 1 && (
          <>
            <h3>Como você quer participar?</h3>
            {PLANOS.map((x) => (
              <button key={x.id} type="button" className={`${s.opcao} ${plano === x.id ? s.marcada : ''}`} onClick={() => { setPlano(x.id); setPasso(2); }}>
                <span aria-hidden="true">{x.e}</span><span><b>{x.t}</b><small>{x.d}</small></span>
              </button>
            ))}
          </>
        )}

        {passo === 2 && (
          <>
            <div className={s.faixaLive} aria-hidden="true">
              <span className={s.selo}>● AO VIVO</span> No Brás: mostrando {PRODUTOS[vez].t.toLowerCase()} {PRODUTOS[vez].e}
            </div>
            <h3>Toque no que você quer ver</h3>
            <div className={s.produtos}>
              {PRODUTOS.map((x) => (
                <button key={x.id} type="button" aria-pressed={escolhas.includes(x.id)} className={`${s.produto} ${escolhas.includes(x.id) ? s.marcada : ''}`} onClick={() => alternar(x.id)}>
                  <span aria-hidden="true">{x.e}</span>{x.t}
                </button>
              ))}
            </div>
            <button type="button" className={s.principal} disabled={!itens.length} onClick={() => setPasso(3)}>
              {itens.length ? `Continuar com ${itens.length} →` : 'Escolha pelo menos um'}
            </button>
          </>
        )}

        {passo === 3 && p && (
          <>
            <h3>Pausa da live: hora de pagar</h3>
            <ul className={s.lista}>{itens.map((x) => <li key={x.id}><span aria-hidden="true">{x.e}</span> {x.t}<b>✓ na lista</b></li>)}</ul>
            <p>O pagamento é feito até o fim da pausa, no horário avisado na live. Depois a lista fecha.</p>
            {!pago ? (
              <button type="button" className={s.principal} onClick={() => setPago(true)}>Simular pagamento</button>
            ) : (
              <>
                <p className={s.ok}>✅ Pagamento simulado. Nada foi cobrado.</p>
                <button type="button" className={s.principal} onClick={() => setPasso(4)}>Ver a entrega →</button>
              </>
            )}
          </>
        )}

        {passo === 4 && p && (
          <>
            <h3>Compra, conferência e entrega</h3>
            <div className={s.rota} aria-hidden="true">
              {p.rota.map((e, i) => <span key={e} style={{ animationDelay: `${i * 0.5}s` }}>{e}</span>)}
              <i />
            </div>
            <div className={s.legendas}><span>Eu compro</span><span>Eu confiro</span><span>{p.fim}</span></div>
            <p>{p.entrega}</p>
            <button type="button" className={s.principal} onClick={() => setPasso(5)}>Quero participar →</button>
          </>
        )}

        {passo === 5 && p && (
          <>
            <div className={s.confete} aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ left: `${(i * 7) + 2}%`, animationDelay: `${(i % 5) * 0.12}s` }} />)}</div>
            <h3>🎉 Simulação concluída!</h3>
            <p className={s.resumo}><b>{p.t}</b><br />{itens.map((x) => x.t).join(', ')}</p>
            <label className={s.campo}>Sua cidade (opcional)
              <input value={cidade} maxLength={60} onChange={(e) => setCidade(e.target.value)} placeholder="Ex.: Franca - SP" />
            </label>
            <a className={s.whats} href={linkWhats({ plano: p.t, itens: itens.map((x) => x.t), cidade })} target="_blank" rel="noopener noreferrer">💬 Falar no WhatsApp</a>
            <p className={s.miudo}>O WhatsApp abre com a mensagem pronta; você decide se envia.</p>
          </>
        )}
      </div>

      <div className={s.pe}>
        {passo > 0 && <button type="button" onClick={() => setPasso(passo - 1)}>← Voltar</button>}
        {passo > 1 && <button type="button" onClick={recomecar}>Recomeçar</button>}
        <span>Pré-lançamento: sem vendas nem cobranças. <Link href="/moda/condicoes">Condições</Link></span>
      </div>
    </div>
  );
}
