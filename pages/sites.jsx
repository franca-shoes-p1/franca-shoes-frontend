import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/sites.module.css';
import { TIPOS, ETAPAS, NIVEIS, AVISO, FONE, achar } from '../lib/sites';

export default function Sites() {
  const [tipo, setTipo] = useState(TIPOS[0].id);
  const [escolhidos, setEscolhidos] = useState([]);
  const [nome, setNome] = useState('');
  const [negocio, setNegocio] = useState('');
  const [nivel, setNivel] = useState('');
  const [obs, setObs] = useState('');
  const t = achar(tipo);
  const niv = NIVEIS[t.nivel];

  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get('tipo');
      if (id && achar(id)) { setTipo(id); setTimeout(() => document.getElementById('ficha')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150); }
    } catch (e) { /* sem filtro */ }
  }, []);

  const alterna = (id) => setEscolhidos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const lista = escolhidos.map(achar);

  const msg = () => {
    const l = ['Olá! Montei meu cartão na Fábrica de Sites da Igreja Eco.'];
    if (nome) l.push('Nome: ' + nome);
    if (negocio) l.push('Negócio: ' + negocio);
    l.push('Sites de interesse: ' + (lista.length ? lista.map((x) => x.nome).join(', ') : 'ainda não escolhi, preciso de ajuda'));
    if (nivel) l.push('Nível desejado: ' + NIVEIS[nivel].rotulo);
    if (obs) l.push('Observações: ' + obs);
    l.push('Gostaria de fazer o briefing e receber uma proposta.');
    return l.join('\n');
  };
  const zap = (texto) => `https://wa.me/${FONE}?text=${encodeURIComponent(texto)}`;

  return (
    <>
      <Head>
        <title>Fábrica de Sites | Igreja Eco</title>
        <meta name="description" content="Mini site, captação de leads, site institucional, loja virtual, agendamento e mais. Veja o que vai em cada site e como produzimos, do briefing ao suporte." />
      </Head>
      <div className={s.pagina}>
        <div className={s.grade} aria-hidden="true" />
        <header className={s.barra}>
          <Link href="/" className={s.voltar}>← Voltar ao início</Link>
          <nav className={s.links}>
            <a href="#ficha">Tipos de site</a><a href="#etapas">Etapas</a><a href="#cartao">Meu cartão</a>
            <Link href="/catalogo?area=sites">Catálogo</Link>
          </nav>
        </header>

        <section className={s.heroi}>
          <span className={s.pilula}><i />Fábrica de Sites</span>
          <h1>A planta completa do seu <em>site</em></h1>
          <p>Escolha o tipo, veja os 6 itens de cada projeto, entenda as 10 etapas da produção e monte o seu cartão de visita para pedir uma proposta.</p>
          <div className={s.numeros}>
            <span><b>{TIPOS.length}</b> tipos de site</span>
            <span><b>{TIPOS.length * 6}</b> itens descritos</span>
            <span><b>{ETAPAS.length}</b> etapas de produção</span>
          </div>
        </section>

        <section id="ficha" className={s.bloco}>
          <h2 className={s.h2}>1. Escolha o tipo de site</h2>
          <div className={s.painel}>
            <ul className={s.abas} role="tablist" aria-label="Tipos de site">
              {TIPOS.map((x, i) => (
                <li key={x.id}>
                  <button type="button" role="tab" aria-selected={x.id === tipo} className={`${s.aba} ${x.id === tipo ? s.abaOn : ''}`} onClick={() => setTipo(x.id)}>
                    <span>{x.e}</span><b>{String(i + 1).padStart(2, '0')}</b>{x.nome}
                  </button>
                </li>
              ))}
            </ul>

            <article className={s.ficha} role="tabpanel">
              <div className={s.fichaTopo}>
                <span className={s.fichaIcone} aria-hidden="true">{t.e}</span>
                <div>
                  <h3>{t.nome}</h3>
                  <p className={s.estilo}>{t.estilo}</p>
                </div>
                <span className={s.nivel} style={{ color: niv.cor, background: niv.fundo }}>{niv.rotulo}</span>
              </div>
              <p className={s.resumo}>{t.resumo}</p>
              <p className={s.para}><b>Para quem é:</b> {t.para}</p>
              <ol className={s.itens}>
                {t.itens.map((it, i) => (
                  <li key={it.t}><span className={s.nIt}>{String(i + 1).padStart(2, '0')}</span><div><b>{it.t}</b><p>{it.d}</p></div></li>
                ))}
              </ol>
              <div className={s.acoesFicha}>
                <button type="button" className={`${s.btn} ${escolhidos.includes(t.id) ? s.btnOn : s.btnP}`} onClick={() => alterna(t.id)}>
                  {escolhidos.includes(t.id) ? '✓ No meu cartão (clique para tirar)' : '+ Adicionar ao meu cartão'}
                </button>
                <a className={`${s.btn} ${s.btnC}`} href={zap(`Olá! Tenho interesse em: ${t.nome} (Fábrica de Sites).`)} target="_blank" rel="noopener noreferrer">Pedir proposta deste site</a>
              </div>
            </article>
          </div>
          <p className={s.legenda}><b>Níveis:</b> Essencial = poucas páginas e entrega rápida · Profissional = várias páginas e integrações · Avançado = recursos de venda, área restrita ou inteligência artificial.</p>
        </section>

        <section id="etapas" className={s.bloco}>
          <h2 className={s.h2}>2. Como produzimos: do briefing ao suporte</h2>
          <ol className={s.linha}>
            {ETAPAS.map((e) => (
              <li key={e.n} className={s.etapa}>
                <span className={s.bola}>{e.n}</span>
                <div className={s.etapaCorpo}>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                  <ul>{e.itens.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="cartao" className={s.bloco}>
          <h2 className={s.h2}>3. Monte o seu cartão de visita</h2>
          <p className={s.sub}>Marque os sites que te interessam na etapa 1, preencha os dados e envie pelo WhatsApp ou salve em PDF para guardar.</p>
          <div className={s.montagem}>
            <form className={s.form} onSubmit={(e) => e.preventDefault()}>
              <label>Seu nome<input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Maria Souza" /></label>
              <label>Seu negócio ou projeto<input value={negocio} onChange={(e) => setNegocio(e.target.value)} placeholder="Ex.: Salão da Maria" /></label>
              <label>Nível desejado
                <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
                  <option value="">Ainda não sei, quero ajuda</option>
                  {Object.entries(NIVEIS).map(([k, v]) => <option key={k} value={k}>{v.rotulo}</option>)}
                </select>
              </label>
              <label>Observações<textarea rows={3} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Prazo, referências, o que você já tem pronto..." /></label>
              <fieldset className={s.chips}>
                <legend>Sites no cartão</legend>
                {TIPOS.map((x) => (
                  <button type="button" key={x.id} aria-pressed={escolhidos.includes(x.id)} className={`${s.chip} ${escolhidos.includes(x.id) ? s.chipOn : ''}`} onClick={() => alterna(x.id)}>{x.e} {x.nome}</button>
                ))}
              </fieldset>
            </form>

            <div className={s.cartaoLado}>
              <div id="cartao-print" className={s.cartao}>
                <div className={s.cartaoTopo}><span>Fábrica de Sites</span><b>igreja.eco.br</b></div>
                <h3>{nome || 'Seu nome aqui'}</h3>
                <p className={s.cartaoNeg}>{negocio || 'Seu negócio ou projeto'}</p>
                <ul className={s.cartaoLista}>
                  {lista.length ? lista.map((x) => <li key={x.id}><span>{x.e}</span>{x.nome}</li>) : <li className={s.vazio}>Nenhum site escolhido ainda</li>}
                </ul>
                <p className={s.cartaoNota}>Nível: {nivel ? NIVEIS[nivel].rotulo : 'a definir no briefing'}{obs ? ' · ' + obs : ''}</p>
                <div className={s.cartaoRodape}>Próximo passo: briefing por WhatsApp (16) 99154-3663 · {AVISO}</div>
              </div>
              <div className={s.acoesCartao}>
                <a className={`${s.btn} ${s.btnP}`} href={zap(msg())} target="_blank" rel="noopener noreferrer">Enviar cartão pelo WhatsApp</a>
                <button type="button" className={`${s.btn} ${s.btnC}`} onClick={() => window.print()}>Imprimir ou salvar em PDF</button>
              </div>
            </div>
          </div>
        </section>

        <footer className={s.rodape}>
          <p>{AVISO}</p>
          <p><Link href="/">Início</Link> · <Link href="/catalogo">Catálogo completo</Link> · <Link href="/oficina">Oficina Digital</Link></p>
        </footer>
      </div>
    </>
  );
}
