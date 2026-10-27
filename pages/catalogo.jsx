import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../styles/catalogo.module.css';
import { CATEGORIAS, STATUS, totais } from '../lib/catalogo';

const FONE = '5516991543663';
const zap = (nome) => `https://wa.me/${FONE}?text=${encodeURIComponent('Olá! Tenho interesse em: ' + nome)}`;

export default function Catalogo() {
  const [cat, setCat] = useState('todas');
  const [st, setSt] = useState('todos');
  const [q, setQ] = useState('');
  const t = totais();

  // Link direto: /catalogo?situacao=agora (ou encomenda, breve, estudo) e /catalogo?area=sites
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const sit = p.get('situacao');
      const ar = p.get('area');
      if (sit && STATUS[sit]) setSt(sit);
      if (ar && CATEGORIAS.some((c) => c.id === ar)) setCat(ar);
    } catch (e) { /* sem filtro */ }
  }, []);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return CATEGORIAS.filter((c) => cat === 'todas' || c.id === cat)
      .map((c) => ({
        ...c,
        itens: c.itens.filter((i) => (st === 'todos' || i.s === st) && (!termo || (i.t + ' ' + i.d).toLowerCase().includes(termo))),
      }))
      .filter((c) => c.itens.length);
  }, [cat, st, q]);

  return (
    <div className={s.pagina}>
      <Head>
        <title>Catálogo de produtos e serviços | Igreja Eco</title>
        <meta name="description" content="Tudo o que a Igreja Eco oferece ou está construindo: sites, automação, marketing, calçados, agro, cursos e mais." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={s.topo}>
        <div className={s.topoDentro}>
          <Link href="/">← Igreja Eco</Link>
          <div className={s.topoLinks}>
            <Link href="/fidelidade">Clube de Fidelidade</Link>
            <Link href="/afiliados">Afiliados</Link>
            <Link href="/oficina">Oficina</Link>
          </div>
        </div>
      </div>
      <main className={s.miolo}>
        <h1 className={s.h1}>Catálogo completo</h1>
        <p className={s.lead}>
          Tudo o que oferecemos hoje e o que estamos construindo, em um só lugar. Cada item mostra com clareza se está <b>disponível agora</b>,
          se é <b>sob encomenda</b>, se está <b>em breve</b> ou <b>em estudo</b>. Os preços são combinados por pedido, conforme o que você precisa.
        </p>
        <div className={s.contagem}>
          <span><b>{t.itens}</b> itens</span>
          <span><b>{t.categorias}</b> áreas</span>
          <span><b>{t.agora}</b> disponíveis agora</span>
          <span><b>{t.encomenda}</b> sob encomenda</span>
        </div>

        <div className={s.filtros}>
          <input className={s.busca} type="search" placeholder="Buscar: site, WhatsApp, curso, calçado…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar no catálogo" />
          <div className={s.chips} role="group" aria-label="Filtrar por situação">
            <button type="button" className={st === 'todos' ? s.on : ''} onClick={() => setSt('todos')}>Todos</button>
            {Object.entries(STATUS).map(([k, v]) => (
              <button key={k} type="button" className={st === k ? s.on : ''} onClick={() => setSt(k)}>{v.rotulo}</button>
            ))}
          </div>
          <div className={s.chips} role="group" aria-label="Filtrar por área">
            <button type="button" className={cat === 'todas' ? s.on : ''} onClick={() => setCat('todas')}>Todas as áreas</button>
            {CATEGORIAS.map((c) => (
              <button key={c.id} type="button" className={cat === c.id ? s.on : ''} onClick={() => setCat(c.id)}>{c.e} {c.t}</button>
            ))}
          </div>
        </div>

        {lista.length === 0 && <p className={s.vazio}>Nada encontrado com esse filtro. Tente limpar a busca.</p>}

        {lista.map((c) => (
          <section key={c.id} className={s.area} id={c.id}>
            <h2 className={s.h2}><span className={s.bola}>{c.e}</span> {c.t}</h2>
            <p className={s.sub}>{c.d}</p>
            <div className={s.grade}>
              {c.itens.map((i) => {
                const x = STATUS[i.s];
                return (
                  <article key={i.t} className={s.cartao}>
                    <div className={s.tags}>
                      <span className={s.tag} style={{ color: x.cor, background: x.fundo }}>{x.rotulo}</span>
                      {i.novo && <span className={s.novo}>Nova ideia</span>}
                    </div>
                    <h3>{i.t}</h3>
                    <p>{i.d}</p>
                    <a className={s.zap} href={zap(i.t)} target="_blank" rel="noopener noreferrer">
                      {i.s === 'agora' || i.s === 'encomenda' ? 'Pedir orçamento' : 'Quero ser avisado'}
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <div className={s.aviso}>
          <b>Como ler este catálogo.</b> “Disponível agora” e “Sob encomenda” podemos atender, e o valor é combinado antes de começar.
          “Em breve” está sendo construído e “Em estudo” é uma ideia ainda sem oferta: nesses casos não prometemos data nem preço, e você só é avisado.
          Orientações de campo, saúde animal, imóveis e questões jurídicas são informativas e não substituem o profissional habilitado.
          Pontos do <Link href="/fidelidade">Clube de Fidelidade</Link> valem em itens marcados como disponíveis.
        </div>
        <div className={s.cta}>
          <Link href="/atelie">Montar sob medida no Ateliê</Link>
          <Link className={s.sec} href="/oficina#cadastro">Trabalhar na Oficina</Link>
          <Link className={s.sec} href="/fidelidade">Juntar pontos</Link>
        </div>
      </main>
    </div>
  );
}
