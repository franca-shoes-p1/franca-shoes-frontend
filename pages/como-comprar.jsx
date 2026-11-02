import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/comoComprar.module.css';
import { VAREJO, LOTE, RODOVIARIAS_VAREJO } from '../lib/varejo';

/* ------------------------------------------------------------------
   COMO COMPRAR: página pública com o caminho completo do pedido, da escolha à entrega,
   prazos, trocas e perguntas frequentes. Para ajustar um prazo ou regra, edite os blocos abaixo.
   As regras de lote e as capitais vêm de lib/varejo.js (as mesmas usadas no checkout).
------------------------------------------------------------------- */
const zap = (t) => `https://wa.me/${VAREJO.whatsapp}?text=${encodeURIComponent(t)}`;

// "mode": 'todos' aparece nos dois jeitos de receber; 'rod' só na retirada; 'cor' só nos Correios.
const PASSOS = [
  {
    icone: '🛍️', titulo: 'Escolha o modelo e o número', quem: 'Você', mode: 'todos',
    resumo: 'Na vitrine, abra o modelo, escolha o número e coloque no carrinho.',
    itens: [
      'O preço que aparece é o preço final do produto. Nada de taxa escondida: o frete só entra se você escolher os Correios.',
      'Confira a numeração com calma. Cada fábrica tem a sua forma, e a página do modelo mostra os números disponíveis.',
      'Pode juntar vários modelos no mesmo pedido.',
    ],
  },
  {
    icone: '🚚', titulo: 'Escolha como receber', quem: 'Você', mode: 'todos',
    resumo: 'Retirada na rodoviária da sua capital (frete grátis) ou Correios no seu endereço.',
    itens: [
      'Retirada na rodoviária: frete grátis, levamos em viagem, em lote. Você escolhe a cidade na hora de pagar.',
      'Correios: você informa o endereço e vê o valor do frete no resumo, antes de pagar.',
      'Não fazemos entrega em domicílio por conta própria. Na região Norte, a entrega é só pelos Correios.',
    ],
  },
  {
    icone: '💳', titulo: 'Pague com PIX ou cartão', quem: 'Você', mode: 'todos',
    resumo: 'O pagamento é feito no ambiente seguro do Mercado Pago. Você recebe o número do pedido.',
    itens: [
      'Não guardamos os dados do seu cartão: tudo acontece dentro do Mercado Pago.',
      'O número do pedido é o seu "ticket". Guarde, ele identifica a sua compra em qualquer conversa com a gente.',
      'Se o pagamento não for concluído, nada é cobrado e os itens continuam no carrinho.',
    ],
  },
  {
    icone: '✅', titulo: 'Pagamento confirmado', quem: 'Mercado Pago e nós', mode: 'todos',
    resumo: 'O PIX costuma cair na hora. Assim que confirmar, o pedido muda para "pago" e você é avisado.',
    itens: [
      'Avisamos por e-mail e WhatsApp.',
      'Seu pedido só segue para a fábrica depois da confirmação do pagamento.',
    ],
  },
  {
    icone: '🏭', titulo: 'Compramos o seu par na fábrica', quem: 'Nós', mode: 'todos',
    resumo: 'Trabalhamos sem estoque parado: o seu pedido é comprado direto na fábrica, em Franca (SP).',
    itens: [
      'Cada fábrica tem o seu jeito. Algumas vendem só em lote mínimo (por exemplo, 12 pares): nesse caso o seu pedido espera juntar o lote, e você vê "X de Y pares" em Acompanhar pedido.',
      `Depois do lote (ou logo após o pagamento, quando a fábrica não pede mínimo), o preparo segue o prazo da fábrica. Se a fábrica não informar outro, é de ${VAREJO.prazoPreparoDias}.`,
      'O prazo e o lote mínimo de cada modelo aparecem na página dele, antes de você comprar.',
      'Conferimos modelo, cor e número antes de embalar. Se algo faltar ou o modelo acabar, falamos com você antes de qualquer coisa: outro modelo ou reembolso.',
    ],
  },
  {
    icone: '🧾', titulo: 'Fechamos o lote da sua cidade', quem: 'Nós', mode: 'rod',
    resumo: `O lote de cada rodoviária fecha quando juntar ${LOTE.minimoPedidos} pedidos pagos.`,
    itens: [
      `Cada viagem leva até ${LOTE.maxParesViagem} pares. Os acessórios viajam junto.`,
      'Quando o lote fecha, programamos a rota e avisamos a data e o horário aproximado da retirada.',
      'Como depende de juntar pedidos, não prometemos uma data exata antes do lote fechar. Avisamos quando estiver perto.',
    ],
  },
  {
    icone: '📮', titulo: 'Postamos nos Correios', quem: 'Nós', mode: 'cor',
    resumo: 'Depois do preparo, o pedido é postado e você recebe o código de rastreio.',
    itens: [
      'O código de rastreio chega por WhatsApp e e-mail.',
      'O prazo de entrega é o dos Correios para o seu CEP, somado ao preparo.',
      'Confira se alguém poderá receber no endereço. Os Correios fazem novas tentativas e avisam.',
    ],
  },
  {
    icone: '🤝', titulo: 'Retire na rodoviária', quem: 'Você', mode: 'rod',
    resumo: 'No dia combinado, nos encontramos na rodoviária da capital que você escolheu.',
    itens: [
      'Leve um documento com foto e o número do pedido.',
      'Confira o produto na hora da entrega.',
      'Se não puder ir no dia, avise com antecedência pelo WhatsApp para combinarmos.',
    ],
  },
  {
    icone: '📦', titulo: 'Receba em casa', quem: 'Correios', mode: 'cor',
    resumo: 'O carteiro entrega no endereço que você informou.',
    itens: [
      'Abra e confira o produto assim que receber.',
      'Se houver qualquer problema, fale com a gente logo: as regras de troca estão logo abaixo.',
    ],
  },
  {
    icone: '🔁', titulo: 'Pós-venda: trocas e dúvidas', quem: 'Nós, com você', mode: 'todos',
    resumo: 'Se o número não servir ou o produto vier com defeito, resolvemos pelo WhatsApp.',
    itens: [
      'Mande o número do pedido e, se for o caso, fotos.',
      'As regras de desistência, troca e defeito estão na seção "Trocas e devoluções".',
    ],
  },
];

const STATUS = [
  ['Aguardando pagamento', 'Pedido criado. Falta concluir o PIX ou o cartão no Mercado Pago.', '#b7791f'],
  ['Pagamento confirmado', 'Recebemos. O pedido entra na fila de compra na fábrica (e no lote, se for retirada).', '#0a6a35'],
  ['Comprando na fábrica', 'Estamos separando o seu par na fábrica, em Franca.', '#0b2f66'],
  ['Enviado ou em rota', 'Postado nos Correios (com código de rastreio) ou a caminho da sua cidade, no lote.', '#0b2f66'],
  ['Entregue', 'Pedido concluído. Se algo não estiver certo, fale com a gente dentro do prazo de troca.', '#0a6a35'],
  ['Pagamento recusado ou cancelado', 'Nada é cobrado. Você pode tentar de novo, com outro cartão ou PIX.', '#a33'],
  ['Reembolsado', 'O valor volta pelo mesmo meio de pagamento usado na compra.', '#555'],
];

const TROCAS = [
  {
    t: 'Desistência em até 7 dias', d: '7 dias',
    c: 'Compra pela internet: você pode desistir em até 7 dias corridos a partir do recebimento (art. 49 do Código de Defesa do Consumidor), com o produto sem uso e na embalagem. Avise pelo WhatsApp e orientamos o envio de volta e o reembolso.',
  },
  {
    t: 'Produto com defeito', d: '30 dias',
    c: 'Defeito de fabricação: você tem no mínimo 30 dias a partir do recebimento para avisar (alguns modelos têm prazo maior, que aparece na página do modelo). Trocamos por outro igual ou devolvemos o valor. Mande fotos pelo WhatsApp. Não há custo para você.',
  },
  {
    t: 'Erro no pedido', d: '7 dias',
    c: 'Se enviamos um modelo, cor ou número diferente do que você comprou, avise em até 7 dias. A troca é por nossa conta.',
  },
  {
    t: 'Troca de numeração', d: '1 por pedido',
    c: 'Se o número não servir, fazemos uma troca de numeração por pedido, pelos Correios, com o produto sem uso e na embalagem. Combinamos o custo do envio com você antes de enviar. Algumas fábricas não aceitam troca de numeração: quando for o caso, isso aparece na página do modelo antes da compra. Confira a numeração com atenção.',
  },
];

const FAQ = [
  ['Posso receber em casa sem usar os Correios?', 'Não fazemos entrega em domicílio por conta própria. Você escolhe entre retirar na rodoviária da capital (frete grátis) ou receber pelos Correios.'],
  ['Moro no Norte do país. Como recebo?', 'Pela região Norte, a entrega é só pelos Correios, com o frete calculado antes de você pagar.'],
  ['E se a fábrica tiver lote mínimo?', 'Algumas fábricas só liberam pedidos em lote (por exemplo, 12 pares). O seu pedido fica na fila até completar, e você vê o andamento em Acompanhar pedido. O lote mínimo de cada modelo aparece na página dele, antes de você comprar.'],
  ['Quanto tempo demora a retirada na rodoviária?', `Depende de juntar ${LOTE.minimoPedidos} pedidos pagos na sua cidade. Quando o lote fecha, avisamos a data e o horário. Se você não quiser esperar, escolha os Correios na hora da compra.`],
  ['O preço pode mudar depois que eu pagar?', 'Não. O valor mostrado no resumo, antes de pagar, é o valor do pedido.'],
  ['É seguro pagar?', 'O pagamento acontece no Mercado Pago, com PIX ou cartão. Nós não vemos nem guardamos os dados do seu cartão.'],
  ['O que acontece se o modelo acabar?', 'Falamos com você antes de qualquer coisa. Você escolhe entre outro modelo ou o reembolso do valor pago.'],
  ['Como falo com vocês?', 'Pelo WhatsApp. Informe o número do pedido para a gente localizar mais rápido.'],
  ['Para que usam os meus dados?', 'Só para o pedido, o pagamento, a entrega e o contato sobre a sua compra. Não vendemos nem repassamos seus dados.'],
];

export default function ComoComprar() {
  const [modo, setModo] = useState('rod');
  const [aberto, setAberto] = useState(0);
  const [troca, setTroca] = useState(0);
  const [faq, setFaq] = useState(-1);

  const passos = PASSOS.filter((p) => p.mode === 'todos' || p.mode === modo);
  useEffect(() => { setAberto(0); }, [modo]);

  // revela as seções ao rolar (sem animação para quem prefere menos movimento)
  useEffect(() => {
    const els = document.querySelectorAll('[data-rev]');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add(s.vis)); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(s.vis); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.pagina}>
      <Head>
        <title>Como comprar: do pedido à entrega | Franca Calçados</title>
        <meta name="description" content="Passo a passo da compra: escolha, pagamento, compra na fábrica, retirada na rodoviária ou Correios, prazos, trocas e devoluções." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={s.topo}>
        <div className={s.topoIn}>
          <Link href="/calcados" className={s.marca}>👟 {VAREJO.nomeLoja}</Link>
          <nav>
            <Link href="/calcados">Ver a vitrine</Link>
            <a href={zap('Olá! Tenho uma dúvida sobre como comprar.')} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </nav>
        </div>
      </header>

      <section className={s.hero}>
        <span className={`${s.bolha} ${s.b1}`} aria-hidden="true" />
        <span className={`${s.bolha} ${s.b2}`} aria-hidden="true" />
        <div className={s.heroIn}>
          <span className={s.pilula}><i />Transparência do pedido à entrega</span>
          <h1>Como comprar, <em>passo a passo</em></h1>
          <p>
            Do clique na vitrine até o par nos seus pés: o que acontece em cada etapa, quanto tempo leva, quem faz o quê e o que
            fazer se algo não sair como esperado.
          </p>
          <div className={s.heroAcoes}>
            <a href="#passos" className={`${s.btn} ${s.btnAm}`}>Ver o passo a passo</a>
            <Link href="/calcados" className={`${s.btn} ${s.btnLinha}`}>Ir para a vitrine</Link>
          </div>
          <ul className={s.selos}>
            <li><span>💳</span>PIX ou cartão no Mercado Pago</li>
            <li><span>🚌</span>Retirada grátis na rodoviária</li>
            <li><span>📮</span>Correios para todo o Brasil</li>
            <li><span>🔁</span>Troca e devolução garantidas</li>
          </ul>
        </div>
      </section>

      <section id="passos" className={s.secao} data-rev>
        <div className={s.cont}>
          <p className={s.sobre}>O caminho do seu pedido</p>
          <h2>Da escolha à entrega</h2>
          <p className={s.sub}>Escolha como você vai receber para ver só as etapas que valem para a sua compra.</p>

          <div className={s.abas} role="tablist" aria-label="Forma de receber">
            <button role="tab" aria-selected={modo === 'rod'} className={modo === 'rod' ? s.abaOn : ''} onClick={() => setModo('rod')}>🚌 Retirar na rodoviária</button>
            <button role="tab" aria-selected={modo === 'cor'} className={modo === 'cor' ? s.abaOn : ''} onClick={() => setModo('cor')}>📮 Receber pelos Correios</button>
          </div>

          <ol className={s.linha}>
            {passos.map((p, i) => {
              const on = aberto === i;
              return (
                <li key={p.titulo} className={`${s.passo} ${on ? s.passoOn : ''}`}>
                  <span className={s.bola}>{i + 1}</span>
                  <button className={s.passoBtn} aria-expanded={on} onClick={() => setAberto(on ? -1 : i)}>
                    <span className={s.ico} aria-hidden="true">{p.icone}</span>
                    <span className={s.passoTx}>
                      <b>{p.titulo}</b>
                      <small>{p.resumo}</small>
                    </span>
                    <span className={s.quem}>{p.quem}</span>
                    <span className={s.seta} aria-hidden="true">{on ? '−' : '+'}</span>
                  </button>
                  {on && (
                    <ul className={s.passoDet}>
                      {p.itens.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className={`${s.secao} ${s.clara}`} data-rev>
        <div className={s.cont}>
          <p className={s.sobre}>Prazos</p>
          <h2>Quanto tempo leva</h2>
          <div className={s.prazos}>
            <div className={s.cartao}>
              <span className={s.cIco}>🏭</span>
              <b>Preparo na fábrica</b>
              <strong>Depende da fábrica</strong>
              <small>cada modelo mostra o prazo e o lote mínimo; o padrão é {VAREJO.prazoPreparoDias}</small>
            </div>
            <div className={s.cartao}>
              <span className={s.cIco}>📮</span>
              <b>Correios</b>
              <strong>Prazo dos Correios</strong>
              <small>somado ao preparo; o rastreio chega por WhatsApp e e-mail</small>
            </div>
            <div className={s.cartao}>
              <span className={s.cIco}>🚌</span>
              <b>Rodoviária (lote)</b>
              <strong>Quando o lote fechar</strong>
              <small>{LOTE.minimoPedidos} pedidos pagos na sua cidade; avisamos a data</small>
            </div>
          </div>
        </div>
      </section>

      <section id="regras" className={s.secao} data-rev>
        <div className={s.cont}>
          <p className={s.sobre}>Regras</p>
          <h2>O que vale sempre e o que muda por fábrica</h2>
          <p className={s.sub}>Cada fábrica trabalha de um jeito. Por isso a página de cada modelo mostra as regras daquela fábrica antes da compra.</p>
          <div className={s.prazos}>
            <div className={s.cartao}>
              <span className={s.cIco}>🛡️</span>
              <b>Vale para todas as compras</b>
              <ul className={s.listaRegra}>
                <li>Desistência em 7 dias (Código de Defesa do Consumidor).</li>
                <li>Defeito de fabricação: no mínimo 30 dias.</li>
                <li>Erro no pedido: 7 dias, troca por nossa conta.</li>
                <li>Pagamento seguro no Mercado Pago.</li>
                <li>Você escolhe: rodoviária (grátis) ou Correios.</li>
              </ul>
            </div>
            <div className={s.cartao}>
              <span className={s.cIco}>🏭</span>
              <b>Muda de fábrica para fábrica</b>
              <ul className={s.listaRegra}>
                <li>Lote mínimo de pares para a fábrica produzir ou liberar.</li>
                <li>Prazo de preparo depois do lote.</li>
                <li>Prazo maior para avisar defeito, quando a fábrica oferece.</li>
                <li>Se aceita ou não troca de numeração.</li>
                <li>Observações do modelo (por exemplo, sob encomenda).</li>
              </ul>
            </div>
          </div>
          <div className={s.aviso}>Se a regra da fábrica for diferente da regra geral, vale a que for <b>melhor para você</b>, e a lei sempre prevalece.</div>
        </div>
      </section>

      <section className={s.secao} data-rev>
        <div className={s.cont}>
          <p className={s.sobre}>Retirada em mãos</p>
          <h2>Onde fazemos a retirada</h2>
          <p className={s.sub}>Frete grátis nas rodoviárias das capitais abaixo. O local e o horário exatos combinamos com você pelo WhatsApp.</p>
          <ul className={s.cidades}>
            {RODOVIARIAS_VAREJO.map((r) => <li key={r.cidade}>📍 {r.cidade} <small>{r.uf}</small></li>)}
          </ul>
          <div className={s.aviso}>
            <b>Não achou a sua cidade?</b> Escolha os Correios na hora da compra. Na região Norte, a entrega é só pelos Correios. Não fazemos entrega em domicílio por conta própria.
          </div>
        </div>
      </section>

      <section className={`${s.secao} ${s.clara}`} data-rev>
        <div className={s.cont}>
          <p className={s.sobre}>Acompanhe</p>
          <h2>O que cada situação do pedido significa</h2>
          <p className={s.sub}>Avisamos você por WhatsApp e e-mail a cada etapa importante. Para ver como está o seu pedido a qualquer hora, use a página <Link href="/acompanhar" style={{ color: '#0a6a35', fontWeight: 800, textDecoration: 'underline' }}>Acompanhar pedido</Link>.</p>
          <ul className={s.status}>
            {STATUS.map(([t, d, cor]) => (
              <li key={t}><span className={s.ponto} style={{ background: cor }} /><div><b>{t}</b><small>{d}</small></div></li>
            ))}
          </ul>
        </div>
      </section>

      <section id="trocas" className={s.secao} data-rev>
        <div className={s.cont}>
          <p className={s.sobre}>Trocas e devoluções</p>
          <h2>Sua compra protegida</h2>
          <p className={s.sub}>As regras abaixo valem junto com o Código de Defesa do Consumidor. Se a lei der a você um direito maior, vale a lei.</p>
          <div className={s.trocas}>
            <div className={s.trocaAbas} role="tablist">
              {TROCAS.map((t, i) => (
                <button key={t.t} role="tab" aria-selected={troca === i} className={troca === i ? s.trocaOn : ''} onClick={() => setTroca(i)}>
                  <b>{t.d}</b>
                  <span>{t.t}</span>
                </button>
              ))}
            </div>
            <div className={s.trocaCorpo} role="tabpanel">
              <h3>{TROCAS[troca].t}</h3>
              <p>{TROCAS[troca].c}</p>
              <a className={`${s.btn} ${s.btnVerde}`} href={zap(`Olá! Preciso de ajuda com ${TROCAS[troca].t.toLowerCase()}. Meu pedido é o nº `)} target="_blank" rel="noopener noreferrer">Pedir pelo WhatsApp</a>
            </div>
          </div>
          <p className={s.nota}>
            Modelos vendidos por fornecedores parceiros têm a política do fornecedor, mostrada na página de cada modelo antes da compra.
            O texto completo está em <Link href="/calcados/politicas">Trocas, devoluções e entrega</Link>.
          </p>
        </div>
      </section>

      <section className={`${s.secao} ${s.clara}`} data-rev>
        <div className={s.cont}>
          <p className={s.sobre}>Dúvidas</p>
          <h2>Perguntas frequentes</h2>
          <div className={s.faq}>
            {FAQ.map(([q, a], i) => (
              <div key={q} className={`${s.faqItem} ${faq === i ? s.faqOn : ''}`}>
                <button aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}>
                  <span>{q}</span><i aria-hidden="true">{faq === i ? '−' : '+'}</i>
                </button>
                {faq === i && <p>{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.final}>
        <div className={s.cont}>
          <h2>Pronto para escolher o seu par?</h2>
          <p>Veja os modelos disponíveis e escolha o número. Se ficar em dúvida, chame no WhatsApp: respondemos pessoalmente.</p>
          <div className={s.heroAcoes} style={{ justifyContent: 'center' }}>
            <Link href="/calcados" className={`${s.btn} ${s.btnAm}`}>Ver a vitrine</Link>
            <a href={zap('Olá! Quero ajuda para escolher e comprar.')} className={`${s.btn} ${s.btnLinha}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </div>
          <p className={s.resp}>Franca Calçados · Franca, SP · Responsável: Ricardo Bello</p>
        </div>
      </section>
    </div>
  );
}
