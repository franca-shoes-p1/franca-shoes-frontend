import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import s from '../styles/construcao.module.css';
import { Barra, AvisoCanal } from '../lib/AtendenteSecoes';
import ConstrucaoMotor from '../lib/ConstrucaoMotor';
import ConstrucaoPlanta from '../lib/ConstrucaoPlanta';
import { Revela, Inclina, Contador, PalavraDigitada, Magnetico, Holofote } from '../lib/construcaoFx';
import { TIPOS, JORNADA, NIVEIS, FAQ, WHATS_CONSTRUCAO } from '../lib/construcao';

const CAMADAS = [
  { e: '🧭', t: 'Pedido público', d: 'O assistente conversa com o visitante, adapta as perguntas ao tipo de negócio e desenha o site ao vivo.', tag: 'No ar' },
  { e: '📋', t: 'Script do pedido', d: 'As respostas viram um briefing padronizado, com pendências, e o dono é avisado no Telegram.', tag: 'No ar' },
  { e: '🛠️', t: 'Painel e produção', d: 'Fila de pedidos, status e ordem de produção para o dono. Depois, a área do cliente.', tag: 'Em construção' },
];

function Jornada() {
  const ref = useRef(null);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const f = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      setPct(Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height)));
    };
    f(); window.addEventListener('scroll', f, { passive: true }); window.addEventListener('resize', f);
    return () => { window.removeEventListener('scroll', f); window.removeEventListener('resize', f); };
  }, []);
  return (
    <div className={s.jornada} ref={ref}>
      <div className={s.trilho}><span className={s.trilhoCheio} style={{ height: `${pct * 100}%` }} /></div>
      {JORNADA.map((p, i) => (
        <Revela key={p.n} atraso={i * 60} className={`${s.passo} ${pct * JORNADA.length > i + 0.25 ? s.passoOn : ''}`}>
          <span className={s.passoNum}>{p.n}</span>
          <div className={s.passoCx}>
            <h3>{p.t}<span className={`${s.tag} ${p.tag !== 'Já disponível' ? s.tagBreve : ''}`}>{p.tag}</span></h3>
            <p>{p.d}</p>
          </div>
        </Revela>
      ))}
    </div>
  );
}

export default function Construcao() {
  const faixa = [...TIPOS.map((t) => `${t.e} ${t.nome}`), '🧱 Projeto sob medida', '📋 Script pronto', '💬 Atendente WhatsApp'];
  return (
    <div className={s.pagina}>
      <Head>
        <title>Monte o seu negócio · Pedido de Construção | Igreja Eco</title>
        <meta name="description" content="Descreva o seu negócio, veja o site se desenhando e envie o pedido pronto. Opcionalmente com Atendente WhatsApp. Valores combinados caso a caso." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Barra />

      <header className={s.heroi}>
        <div className={s.grade} /><div className={`${s.aura} ${s.aura1}`} /><div className={`${s.aura} ${s.aura2}`} />
        <Holofote>
          <div className={s.wrap}>
            <div className={s.heroiDentro}>
              <div>
                <span className={s.pilula}><b />Pedido de Construção · novo</span>
                <h1 className={s.h1}>Seu negócio na internet, <br />começando por <PalavraDigitada palavras={['uma loja', 'uma agenda', 'um curso', 'um serviço', 'uma ideia']} /></h1>
                <p className={s.lead}>Você responde perguntas simples, o site se desenha na sua frente e o pedido chega até nós pronto para orçar. Quer atendimento no WhatsApp? Entra no mesmo pacote.</p>
                <div className={s.acoes}>
                  <Magnetico href="/monte-seu-negocio" className={`${s.botao} ${s.principal}`}>Montar o meu negócio →</Magnetico>
                  <a href="#demonstracao" className={`${s.botao} ${s.contorno}`}>Ver ao vivo</a>
                  <Magnetico href={WHATS_CONSTRUCAO} target="_blank" rel="noopener noreferrer" className={`${s.botao} ${s.verde}`}>💬 WhatsApp</Magnetico>
                </div>
                <div className={s.selos}><span>✓ Sem compromisso</span><span>✓ Valor combinado antes</span><span>✓ Sem precisar entender de tecnologia</span></div>
              </div>
              <ConstrucaoPlanta />
            </div>
          </div>
        </Holofote>
        <div className={s.faixa} aria-hidden="true">
          <div className={s.faixaTrilho}>{[...faixa, ...faixa].map((f, i) => <span key={i}>{f}</span>)}</div>
        </div>
      </header>

      <section className={s.wrap}>
        <div className={s.numeros}>
          {[[5, '', 'tipos de negócio'], [5, '', 'passos da jornada'], [3, '', 'níveis de pacote'], [14, ' dias', 'piloto do Atendente']].map(([n, suf, l], i) => (
            <Revela key={l} atraso={i * 80} className={s.numero}><strong><Contador ate={n} sufixo={suf} /></strong><span>{l}</span></Revela>
          ))}
        </div>
      </section>

      <section className={s.bloco}>
        <div className={s.wrap}>
          <Revela><span className={s.rotulo}>Como o pacote funciona</span><h2 className={s.h2}>Três camadas, um só caminho</h2>
            <p className={s.sub}>Do primeiro clique até o site no ar, tudo passa pelo mesmo motor de perguntas.</p></Revela>
          <div className={s.camadas}>
            {CAMADAS.map((c, i) => (
              <Revela key={c.t} atraso={i * 120}>
                <Inclina className={s.camada}>
                  <span className={s.ic}>{c.e}</span><h3>{c.t}</h3><p>{c.d}</p><span className={s.camadaTag}>{c.tag}</span>
                </Inclina>
              </Revela>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.bloco} ${s.blocoEscuro}`} id="demonstracao">
        <div className={s.grade} />
        <div className={s.wrap} style={{ position: 'relative', zIndex: 1 }}>
          <Revela><span className={s.rotulo}>Demonstração ao vivo</span><h2 className={s.h2}>Escolha, clique e veja o site nascer</h2>
            <p className={s.sub}>Mude o tipo de negócio, as páginas e as cores. O site e o script do pedido mudam juntos. É uma demonstração com dados de exemplo: nada é enviado.</p></Revela>
          <ConstrucaoMotor />
        </div>
      </section>

      <section className={s.bloco}>
        <div className={s.wrap}>
          <Revela><span className={s.rotulo}>A jornada</span><h2 className={s.h2}>Do pedido à entrega, passo a passo</h2>
            <p className={s.sub}>A linha acende conforme você rola a página.</p></Revela>
          <Jornada />
        </div>
      </section>

      <section className={`${s.bloco} ${s.blocoRoxo}`}>
        <div className={s.wrap}>
          <Revela><span className={s.rotulo}>Os pacotes</span><h2 className={s.h2}>Escolha até onde ir</h2>
            <p className={s.sub}>Os valores são combinados caso a caso pelo WhatsApp, antes de qualquer pagamento. Não publicamos preço fixo porque cada negócio é diferente.</p></Revela>
          <div className={s.niveis}>
            {NIVEIS.map((n, i) => (
              <Revela key={n.id} atraso={i * 120}>
                <Inclina className={`${s.nivel} ${n.destaque ? s.nivelDestaque : ''}`} style={{ height: '100%' }}>
                  {n.destaque && <span className={s.selo}>⭐ Mais completo</span>}
                  <span className={s.e}>{n.e}</span><h3>{n.t}</h3><p>{n.d}</p>
                  <ul>{n.itens.map((it) => <li key={it}>{it}</li>)}</ul>
                  <span className={s.preco}>Valor combinado no WhatsApp</span>
                </Inclina>
              </Revela>
            ))}
          </div>
        </div>
      </section>

      <section className={s.bloco}>
        <div className={s.wrap}>
          <Revela><span className={s.rotulo}>Antes de contratar</span><h2 className={s.h2}>Sobre o Atendente WhatsApp</h2></Revela>
          <AvisoCanal />
        </div>
      </section>

      <section className={s.bloco} style={{ paddingTop: 0 }}>
        <div className={s.wrap}>
          <Revela><span className={s.rotulo}>Dúvidas</span><h2 className={s.h2}>Perguntas frequentes</h2></Revela>
          <Revela className={s.faq}>
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
          </Revela>
        </div>
      </section>

      <section className={`${s.bloco} ${s.blocoEscuro} ${s.final}`}>
        <div className={s.grade} />
        <div className={s.wrap} style={{ position: 'relative', zIndex: 1 }}>
          <Revela><h2 className={s.h2}>Pronto para tirar a ideia do papel?</h2>
            <p className={s.sub}>Leva alguns minutos. Você recebe um número de pedido e respondemos pelo WhatsApp.</p>
            <div className={s.acoes}>
              <Magnetico href="/monte-seu-negocio" className={`${s.botao} ${s.principal}`}>Montar o meu negócio →</Magnetico>
              <Magnetico href={WHATS_CONSTRUCAO} target="_blank" rel="noopener noreferrer" className={`${s.botao} ${s.verde}`}>💬 Falar no WhatsApp</Magnetico>
            </div></Revela>
        </div>
      </section>
    </div>
  );
}
