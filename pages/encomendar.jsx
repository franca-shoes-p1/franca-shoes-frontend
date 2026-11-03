import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/entrega.module.css';
import { ESTADOS } from '../lib/varejo';

/* Funil de vendas da Entrega em Casa: promessa clara, prova de como funciona, garantia, objeções e um formulário em 3 passos.
   Não usa depoimentos nem números inventados: tudo o que aparece aqui é regra real do projeto. */
const WHATS = (texto) => 'https://wa.me/5516991543663?text=' + encodeURIComponent(texto);

const CATEGORIAS = [
  ['calcado_fem', 'Calçado feminino'], ['calcado_masc', 'Calçado masculino'], ['calcado_infantil', 'Calçado infantil'],
  ['acessorio', 'Acessório (bolsa, cinto, carteira...)'], ['outro', 'Outro produto'],
];
const HORARIOS = [['qualquer', 'Qualquer horário'], ['manha', 'Manhã'], ['tarde', 'Tarde'], ['noite', 'Noite']];
const PACOTES = [
  ['loja_pronta', 'Negócio de calçados pronto para vender'], ['revenda', 'Projeto de revenda'],
  ['site', 'Site ou e-commerce sob medida'], ['servicos', 'Serviços digitais (divulgação, SEO, atendimento)'],
];

const PASSOS = [
  { e: '📝', t: 'Conte o que você quer', p: 'Modelo, numeração e quantidade. Em dois minutos, sem pagar nada.' },
  { e: '💬', t: 'Receba a cotação', p: 'Achamos a empresa de Franca com o melhor preço e avisamos pelo WhatsApp.' },
  { e: '🏠', t: 'Prove em casa', p: 'Quando o lote fecha, levamos até você. Gostou, paga em dinheiro. Não gostou, não paga.' },
];

const GANHOS = [
  { e: '🏭', t: 'Preço de fábrica', p: 'Compramos direto na empresa, em Franca, com nota fiscal.' },
  { e: '👟', t: 'Qualquer produto', p: 'Sem catálogo: você descreve e o radar de preços procura.' },
  { e: '🏠', t: 'Prova antes de pagar', p: 'Experimente na sua casa. O tamanho serviu? O modelo agradou? Só então você paga.' },
  { e: '📲', t: 'Avisos no WhatsApp', p: 'Você sabe quantos pedidos faltam para fechar o lote e quando a rota da sua cidade for confirmada.' },
  { e: '🚪', t: 'Saída livre', p: 'Não há prazo máximo de espera, e você sai da fila quando quiser.' },
  { e: '🧰', t: 'Extra opcional', p: 'Se quiser revender ou ter um site, conheça o pacote tecnológico depois. Sem obrigação.' },
];

const COMPARAR_CONTRA = [
  'Comprar sem provar e descobrir que não serviu',
  'Pagar antes e esperar a entrega',
  'Pagar frete e correr o risco de devolução',
  'Escolher só entre os modelos de uma loja',
];
const COMPARAR_PRO = [
  'Provar em casa, com calma',
  'Pagar só se gostar, em dinheiro, na hora',
  'Sem frete nem devolução pelos Correios',
  'Pedir o produto que você quer, direto da fábrica',
];

const FAQ = [
  ['Preciso pagar para fazer a encomenda?', 'Não. O formulário é grátis e não pede cartão nem PIX. Você só paga na visita, em dinheiro, depois de provar.'],
  ['Quando o meu pedido chega?', 'Não há data fixa. A viagem sai quando os pedidos completam o lote mínimo da empresa e há visitas suficientes na sua cidade. Você acompanha pelo WhatsApp.'],
  ['Posso desistir?', 'Sim, a qualquer momento. É só avisar pelo WhatsApp com o código da encomenda.'],
  ['E se eu não gostar na hora?', 'Você não paga nada. O par volta para a bag e é oferecido na parada seguinte.'],
  ['É seguro receber uma visita em casa?', 'Visitamos só cadastros confirmados por WhatsApp, a rota é compartilhada com uma pessoa de confiança e, se você preferir, combinamos um ponto público.'],
  ['Por que só dinheiro?', 'Nas visitas de calçados e acessórios o recebimento é só em dinheiro. A cotação mostra o preço antes, para você separar o valor.'],
  ['Minha cidade entra?', 'Entra quando houver visitas confirmadas suficientes (hoje, 6 por cidade). Enquanto isso, você fica em lista de espera para a próxima rota.'],
];

const VAZIO = {
  categoria: 'calcado_fem', produto: '', numeracao: '', quantidade: '1', referencia: '',
  nome: '', whatsapp: '', email: '', cidade: '', uf: '', bairro: '', endereco: '', melhor_horario: 'qualquer',
  aceite: false, interesse: [], site: '',
};

function Formulario() {
  const [passo, setPasso] = useState(1);
  const [d, setD] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(null);
  const t0 = useRef(0);
  useEffect(() => { t0.current = Date.now(); }, []);

  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const marcarPacote = (k) => () => setD((x) => ({ ...x, interesse: x.interesse.includes(k) ? x.interesse.filter((i) => i !== k) : [...x.interesse, k] }));

  function validar(p) {
    if (p === 1) {
      if (d.produto.trim().length < 4) return 'Conte o que você quer encomendar.';
      const q = Number(d.quantidade);
      if (!(Number.isInteger(q) && q >= 1 && q <= 10)) return 'A quantidade deve ficar entre 1 e 10.';
    }
    if (p === 2) {
      const zap = d.whatsapp.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
      if (d.nome.trim().length < 3) return 'Informe seu nome.';
      if (zap.length < 10 || zap.length > 11) return 'Informe seu WhatsApp com DDD.';
      if (d.cidade.trim().length < 2 || !d.uf) return 'Informe sua cidade e o estado.';
      if (d.endereco.trim().length < 5) return 'Informe a rua e o número para a visita.';
    }
    if (p === 3 && !d.aceite) return 'Marque que aceita a visita em casa para continuar.';
    return '';
  }

  function avancar() {
    const m = validar(passo);
    setErro(m);
    if (!m) setPasso(passo + 1);
  }

  async function enviar(e) {
    e.preventDefault();
    const m = validar(3);
    if (m) { setErro(m); return; }
    setEnviando(true); setErro('');
    try {
      const r = await fetch('/api/encomenda', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria: d.categoria, produto: d.produto, numeracao: d.numeracao, quantidade: Number(d.quantidade), referencia: d.referencia,
          nome: d.nome, whatsapp: d.whatsapp, email: d.email, cidade: d.cidade, uf: d.uf, bairro: d.bairro, endereco: d.endereco,
          melhor_horario: d.melhor_horario, aceite_visita: d.aceite, interesse_pacote: d.interesse, site: d.site, tempo: Date.now() - t0.current,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErro(j.erro || 'Não foi possível enviar agora. Tente de novo ou chame no WhatsApp.'); return; }
      setOk(j.codigo || 'recebida');
    } catch (err) {
      setErro('Sem conexão. Tente de novo ou chame no WhatsApp.');
    } finally {
      setEnviando(false);
    }
  }

  if (ok) {
    return (
      <div className={`${s.heroForm} ${s.ok}`} id="pedido">
        <div className={s.grande}>🎉</div>
        <h2>Encomenda recebida!</h2>
        {ok !== 'recebida' && <div className={s.codigo}>{ok}</div>}
        <p>Guarde este código. Ele identifica o seu pedido em qualquer conversa no WhatsApp.</p>
        <ol className={s.proximos}>
          <li>Em breve você recebe a <b>cotação</b> pelo WhatsApp, com preço e prazo estimado.</li>
          <li>Você confirma ou desiste. <b>Nada é cobrado agora.</b></li>
          <li>Quando o lote fecha e a rota da sua cidade sai, combinamos o <b>horário da visita</b>.</li>
        </ol>
        <div className={s.botoes} style={{ flexDirection: 'column' }}>
          <a className={`${s.botao} ${s.verde}`} href={WHATS(`Olá! Fiz a encomenda ${ok} no site e quero acompanhar.`)} target="_blank" rel="noopener noreferrer">Acompanhar pelo WhatsApp</a>
          <Link className={`${s.botao} ${s.claro}`} href={ok !== 'recebida' ? `/minha-encomenda?c=${ok}` : '/minha-encomenda'}>Acompanhar ou sair da fila</Link>
          <Link className={`${s.botao} ${s.claro}`} href="/entrega-em-casa#pacote">Conhecer o pacote tecnológico</Link>
        </div>
      </div>
    );
  }

  return (
    <form className={s.heroForm} id="pedido" onSubmit={enviar} noValidate>
      <h2>Faça a sua encomenda</h2>
      <p>Leva 2 minutos e não custa nada. Você só paga se gostar, na visita.</p>
      <div className={s.passoTopo} aria-label={`Passo ${passo} de 3`}>
        {[1, 2, 3].map((n) => <span key={n} className={`${s.ponto} ${n <= passo ? s.ativo : ''}`} />)}
      </div>

      <div className={s.armadilha} aria-hidden="true">
        <label>Não preencha<input tabIndex={-1} autoComplete="off" value={d.site} onChange={set('site')} /></label>
      </div>

      {passo === 1 && (
        <div>
          <label className={s.campo}><span>O que você procura?</span>
            <select value={d.categoria} onChange={set('categoria')}>{CATEGORIAS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
          </label>
          <label className={s.campo}><span>Descreva o produto</span>
            <textarea value={d.produto} onChange={set('produto')} placeholder="Ex.: sapatênis marrom de couro, solado baixo" />
          </label>
          <div className={s.linha2}>
            <label className={s.campo}><span>Numeração</span><input value={d.numeracao} onChange={set('numeracao')} placeholder="Ex.: 41" /></label>
            <label className={s.campo}><span>Quantidade</span><input type="number" min="1" max="10" inputMode="numeric" value={d.quantidade} onChange={set('quantidade')} /></label>
          </div>
          <label className={s.campo}><span>Foto ou link de referência (opcional)</span>
            <input value={d.referencia} onChange={set('referencia')} placeholder="https://..." />
            <small>Pode ser um link (https) ou uma descrição do modelo.</small>
          </label>
        </div>
      )}

      {passo === 2 && (
        <div>
          <label className={s.campo}><span>Seu nome</span><input value={d.nome} onChange={set('nome')} autoComplete="name" /></label>
          <div className={s.linha2}>
            <label className={s.campo}><span>WhatsApp com DDD</span><input type="tel" inputMode="tel" value={d.whatsapp} onChange={set('whatsapp')} placeholder="(16) 99999-9999" autoComplete="tel" /></label>
            <label className={s.campo}><span>E-mail (opcional)</span><input type="email" value={d.email} onChange={set('email')} autoComplete="email" /></label>
          </div>
          <div className={s.linha3}>
            <label className={s.campo}><span>Cidade</span><input value={d.cidade} onChange={set('cidade')} autoComplete="address-level2" /></label>
            <label className={s.campo}><span>Estado</span>
              <select value={d.uf} onChange={set('uf')}><option value="">UF</option>{ESTADOS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
            </label>
          </div>
          <div className={s.linha3}>
            <label className={s.campo}><span>Rua e número</span><input value={d.endereco} onChange={set('endereco')} autoComplete="street-address" /></label>
            <label className={s.campo}><span>Bairro</span><input value={d.bairro} onChange={set('bairro')} /></label>
          </div>
          <label className={s.campo}><span>Melhor horário para a visita</span>
            <select value={d.melhor_horario} onChange={set('melhor_horario')}>{HORARIOS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
          </label>
        </div>
      )}

      {passo === 3 && (
        <div>
          <div className={s.resumo}>
            <b>Seu pedido:</b> {d.quantidade}x {d.produto.slice(0, 90)}{d.numeracao ? `, nº ${d.numeracao}` : ''}<br />
            <b>Visita em:</b> {d.cidade}/{d.uf}, {d.endereco}
          </div>
          <label className={s.marca}>
            <input type="checkbox" checked={d.aceite} onChange={set('aceite')} />
            <span>Aceito a visita em casa e o contato por WhatsApp sobre esta encomenda. Sei que não pago nada agora e que posso sair da fila quando quiser.</span>
          </label>
          <p style={{ margin: '14px 0 4px', fontWeight: 700, fontSize: 14 }}>Também quero saber sobre (opcional):</p>
          {PACOTES.map(([k, n]) => (
            <label className={s.marca} key={k} style={{ marginTop: 6 }}>
              <input type="checkbox" checked={d.interesse.includes(k)} onChange={marcarPacote(k)} /><span>{n}</span>
            </label>
          ))}
        </div>
      )}

      {erro && <div className={s.erro} role="alert">{erro}</div>}

      <div className={s.botoes}>
        {passo > 1 && <button type="button" className={`${s.botao} ${s.claro}`} onClick={() => { setErro(''); setPasso(passo - 1); }}>Voltar</button>}
        {passo < 3
          ? <button type="button" className={`${s.botao} ${s.verde}`} onClick={avancar}>Continuar</button>
          : <button type="submit" className={`${s.botao} ${s.verde}`} disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar minha encomenda'}</button>}
      </div>
    </form>
  );
}

export default function Encomendar() {
  return (
    <div className={`${s.pagina} ${s.funil}`}>
      <Head>
        <title>Encomende o seu calçado e prove em casa antes de pagar</title>
        <meta name="description" content="Peça o calçado ou acessório que quiser, direto de fábricas de Franca. Prove em casa e só pague, em dinheiro, se gostar. Sem pagar nada para pedir." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={s.topo}>
        <Link href="/">← Voltar ao site</Link>
        <Link href="/entrega-em-casa">Como funciona o projeto</Link>
      </div>

      <header className={s.hero}>
        <div className={s.dentro}>
          <div className={s.esq}>
            <span className={s.pilula}><i />Entrega em Casa · Direto da fábrica</span>
            <h1 className={s.titulo}>Peça o calçado que você quer e <em>só pague se gostar</em></h1>
            <p className={s.texto}>
              Você descreve o produto, nós achamos a fábrica de Franca com o melhor preço e levamos até a sua casa. Prove com calma. Gostou? Paga em dinheiro na hora.
              Não gostou? Não paga nada.
            </p>
            <div className={s.selosTopo}>
              <span>Pedir é grátis</span><span>Sem pagar antes</span><span>Saia da fila quando quiser</span>
            </div>
            <p className={s.nota}>A viagem sai quando o lote da fábrica fecha. Por isso não prometemos data exata: você acompanha tudo pelo WhatsApp.</p>
          </div>
          <Formulario />
        </div>
      </header>

      <section className={s.bloco}>
        <p className={s.rotulo}>Como funciona</p>
        <h2 className={s.h2}>Três passos, nenhum risco para você</h2>
        <div className={s.grade}>
          {PASSOS.map((p, i) => (
            <div className={s.etapa} key={p.t}><b>{i + 1}</b><div><h3>{p.e} {p.t}</h3><p>{p.p}</p></div></div>
          ))}
        </div>
        <div className={s.acoes} style={{ marginTop: 22 }}>
          <a href="#pedido" className={`${s.botao} ${s.verde}`}>Quero fazer a minha encomenda</a>
        </div>
      </section>

      <section className={s.faixaVerde}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Compare</p>
          <h2 className={s.h2}>Comprar pela internet do jeito de sempre ou provar em casa?</h2>
          <div className={s.comparar}>
            <div className={`${s.card} ${s.contra}`}><h3>❌ Do jeito de sempre</h3><ul className={s.lista}>{COMPARAR_CONTRA.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div className={`${s.card} ${s.pro}`}><h3>✅ Entrega em Casa</h3><ul className={s.lista}>{COMPARAR_PRO.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </div>
      </section>

      <section className={s.bloco}>
        <p className={s.rotulo}>O que você recebe</p>
        <h2 className={s.h2}>Tudo o que muda na sua compra</h2>
        <div className={s.grade}>
          {GANHOS.map((g) => (<div className={s.card} key={g.t}><div className={s.emoji}>{g.e}</div><h3>{g.t}</h3><p>{g.p}</p></div>))}
        </div>
      </section>

      <section className={s.bloco} style={{ paddingTop: 0 }}>
        <div className={s.garantia}>
          <div className={s.selo} aria-hidden="true">🛡️</div>
          <div>
            <h3>Nossa regra: você só paga se gostar</h3>
            <p>Fazer a encomenda não custa nada. Na visita você prova, e se não gostar não paga e não precisa explicar. Se mudar de ideia antes, é só avisar pelo WhatsApp e sair da fila.</p>
          </div>
        </div>
      </section>

      <section className={s.faixaVerde}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Dúvidas</p>
          <h2 className={s.h2}>Antes de pedir, tire suas dúvidas</h2>
          <div className={s.faq} style={{ maxWidth: 820 }}>
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
          </div>
        </div>
      </section>

      <section className={s.final}>
        <div className={s.bloco}>
          <h2 className={s.h2}>O seu calçado está a dois minutos de distância</h2>
          <p>Descreva o que você quer. A gente cuida da cotação, da compra e da viagem.</p>
          <div className={s.acoes}>
            <a href="#pedido" className={`${s.botao} ${s.principal}`}>Fazer minha encomenda</a>
            <a href={WHATS('Olá! Quero tirar uma dúvida sobre a Entrega em Casa.')} className={`${s.botao} ${s.contorno}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </div>
        </div>
      </section>

      <footer className={s.rodape}>
        <p>Entrega em Casa · Igreja Eco. Preços, prazos e disponibilidade dependem de cada empresa e de cada lote. <Link href="/entrega-em-casa">Ler tudo sobre o projeto</Link></p>
      </footer>

      <div className={s.barraFixa}>
        <a href="#pedido" className={`${s.botao} ${s.principal}`}>Fazer minha encomenda (é grátis)</a>
      </div>
    </div>
  );
}
