import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import s from '../styles/vitrineFaixa.module.css';
import { brl, VAREJO } from './varejo';

/* ------------------------------------------------------------------
   FAIXA "VITRINE" DA HOME (entre a Campanha, em verde, e o Canal, em azul)
   - Mostra os modelos publicados na loja (/api/varejo/catalogo). Cadastrou em /admin/calcados, aparece aqui.
   - Assistente de busca: o visitante digita o que procura; se não achar, o botão abre o WhatsApp já com o pedido.
   - "Ver a vitrine completa" leva à loja (/calcados), com todas as informações de cada modelo.
------------------------------------------------------------------- */
const MAX_NA_HOME = 8;

const zap = (texto) => `https://wa.me/${VAREJO.whatsapp}?text=${encodeURIComponent(texto)}`;
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function VitrineFaixa() {
  const [produtos, setProdutos] = useState([]);
  const [carregou, setCarregou] = useState(false);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    let vivo = true;
    fetch('/api/varejo/catalogo')
      .then((r) => r.json())
      .then((j) => vivo && setProdutos(Array.isArray(j.produtos) ? j.produtos : []))
      .catch(() => vivo && setProdutos([]))
      .finally(() => vivo && setCarregou(true));
    return () => { vivo = false; };
  }, []);

  const categorias = useMemo(() => [...new Set(produtos.map((p) => p.categoria).filter(Boolean))].sort(), [produtos]);

  const lista = useMemo(() => {
    const q = norm(busca).trim();
    return produtos.filter((p) => {
      if (categoria && p.categoria !== categoria) return false;
      if (!q) return true;
      return norm(`${p.titulo} ${p.categoria} ${p.material} ${p.descricao}`).includes(q);
    });
  }, [produtos, busca, categoria]);

  const mostrados = lista.slice(0, MAX_NA_HOME);
  const filtrando = !!(busca.trim() || categoria);
  const pedido = busca.trim()
    ? `Olá! Procuro: ${busca.trim()}. Vocês têm ou conseguem pra mim?`
    : 'Olá! Quero ajuda para escolher um calçado ou acessório.';

  return (
    <section id="vitrine" className={s.faixa} aria-label="Vitrine de calçados e acessórios">
      <span className={`${s.bolha} ${s.b1}`} aria-hidden="true" />
      <span className={`${s.bolha} ${s.b2}`} aria-hidden="true" />
      <div className={s.dentro}>
        <header className={s.topo}>
          <span className={s.pilula}><i />Vitrine · preço de fábrica</span>
          <h2 className={s.titulo}>Calçados e acessórios <em>direto das fábricas de Franca</em></h2>
          <p className={s.texto}>
            Escolha o modelo e o número, pague por PIX ou cartão e retire na rodoviária da sua cidade ou receba pelos Correios.
            Novos modelos entram sempre que a loja cadastra.
          </p>
        </header>

        <form className={s.assistente} onSubmit={(e) => e.preventDefault()} role="search">
          <label htmlFor="vf-busca" className={s.assLabel}>
            <span aria-hidden="true">🔎</span> Assistente da vitrine: o que você procura?
          </label>
          <div className={s.assLinha}>
            <input
              id="vf-busca"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex.: sapato social marrom, tênis, sandália, cinto..."
              autoComplete="off"
              maxLength={80}
            />
            <a className={s.assZap} href={zap(pedido)} target="_blank" rel="noopener noreferrer">
              Pedir pelo WhatsApp
            </a>
          </div>
          {categorias.length > 0 && (
            <div className={s.chips} role="group" aria-label="Filtrar por categoria">
              <button type="button" className={!categoria ? s.chipOn : ''} onClick={() => setCategoria('')}>Todos</button>
              {categorias.map((c) => (
                <button key={c} type="button" className={categoria === c ? s.chipOn : ''} onClick={() => setCategoria(categoria === c ? '' : c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </form>

        {carregou && mostrados.length > 0 && (
          <div className={s.grade}>
            {mostrados.map((p) => (
              <Link key={p.id} href={`/calcados/${p.id}`} className={s.card}>
                <div className={s.foto}>
                  {p.foto ? <img src={p.foto} alt={p.titulo} loading="lazy" /> : <div className={s.semFoto}>👟</div>}
                  {p.categoria && <span className={s.selo}>{p.categoria}</span>}
                </div>
                <h3>{p.titulo}</h3>
                {p.tamanhos ? <p className={s.nums}>Números: {p.tamanhos}</p> : null}
                <div className={s.preco}>{p.preco > 0 ? brl(p.preco) : 'Sob consulta'}</div>
                <span className={s.ver}>Ver e escolher o número →</span>
              </Link>
            ))}
          </div>
        )}

        {carregou && mostrados.length === 0 && (
          <div className={s.vazio}>
            {filtrando
              ? <p>Não encontramos esse item na vitrine agora. Fale com a gente: buscamos nas fábricas de Franca e avisamos.</p>
              : <p>Estamos montando a vitrine com os primeiros modelos. Peça o que você procura pelo WhatsApp.</p>}
            <a className={s.assZap} href={zap(pedido)} target="_blank" rel="noopener noreferrer">Pedir pelo WhatsApp</a>
          </div>
        )}

        <div className={s.acoes}>
          <Link href="/calcados" className={`${s.botao} ${s.principal}`}>
            Ver a vitrine completa{lista.length > MAX_NA_HOME ? ` (${lista.length} modelos)` : ''}
          </Link>
          <Link href="/como-comprar" className={`${s.botao} ${s.contorno}`}>Como comprar, passo a passo</Link>
        </div>

        <ul className={s.faixaInfo}>
          <li><span>💳</span>PIX ou cartão</li>
          <li><span>🚌</span>Retirada na rodoviária das capitais</li>
          <li><span>📦</span>Correios para todo o Brasil</li>
          <li><span>🏭</span>Direto da fábrica</li>
        </ul>
      </div>
    </section>
  );
}
