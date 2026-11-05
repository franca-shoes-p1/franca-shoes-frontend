import React from 'react';
import s from '../styles/comercioVitrine.module.css';
import dados from '../public/comercio/products.json';

/* ------------------------------------------------------------------
   BLOCO "LOJA IGREJA ECO" DA HOME (entre a VitrineFaixa e a IgrejaHero)
   - Duas vitrines lado a lado (no celular, uma embaixo da outra).
   - Esquerda: banner + chamada para /comercio. Direita: 4 produtos reais.
   - Os produtos vêm de public/comercio/products.json (o mesmo arquivo da página /comercio).
     Atualizou o products.json, o bloco acompanha no próximo deploy.
   - Para trocar as categorias mostradas, edite só CATEGORIAS_DESTAQUE.
   - Texto honesto: é uma vitrine de achadinhos; a compra é feita no Mercado Livre.
------------------------------------------------------------------- */
const CATEGORIAS_DESTAQUE = ['games', 'ferramentas', 'celulares', 'moda'];

function escolher(lista) {
  const validos = (lista || []).filter((p) => p && p.nome && p.imagem && p.link);
  const achados = [];
  CATEGORIAS_DESTAQUE.forEach((cat) => {
    const p = validos.find((x) => x.categoria === cat);
    if (p) achados.push(p);
  });
  // se alguma categoria ficou sem produto, completa com os primeiros que sobrarem
  validos.forEach((p) => {
    if (achados.length < 4 && !achados.includes(p)) achados.push(p);
  });
  return achados.slice(0, 4);
}

// Resumo calculado do products.json: totais, data e as 5 categorias com mais produtos.
function resumir(d) {
  const lista = (d && d.produtos) || [];
  const cats = ((d && d.categorias) || [])
    .map((c) => ({ id: c.id, nome: c.nome, n: lista.filter((p) => p.categoria === c.id).length }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n);
  const data = (d && d.atualizadoEm) || lista.map((p) => p.consultadoEm).filter(Boolean).sort().pop() || '';
  const m = String(data).match(/^\d{4}-(\d{2})-(\d{2})/);
  return { total: lista.length, nCats: cats.length, dia: m ? `${m[2]}/${m[1]}` : '', top: cats.slice(0, 5) };
}

export default function ComercioVitrine() {
  const produtos = escolher(dados.produtos);
  const r = resumir(dados);

  return (
    <section id="loja-igreja-eco" className={s.faixa} aria-label="Loja Igreja Eco, vitrine de achadinhos do Mercado Livre">
      <div className={s.dentro}>
        <div className={s.grade}>
          {/* VITRINE 1: banner e chamada */}
          <div className={s.card + ' ' + s.chamada}>
            <picture>
              <source media="(max-width: 700px)" srcSet="/comercio/assets/img/banner-mobile.jpg" />
              <img className={s.banner} src="/comercio/assets/img/banner.jpg" alt="Loja Igreja Eco" loading="lazy" />
            </picture>
            <div className={s.chamadaTexto}>
              <span className={s.pilula}>Vitrine de achadinhos</span>
              <h2 className={s.titulo}>Loja <em>Igreja Eco</em></h2>
              <p className={s.texto}>
                Uma seleção de produtos que estão entre os mais vendidos do Mercado Livre. É só uma vitrine:
                ao clicar, você vai para o Mercado Livre, e é lá que a compra, o pagamento e a entrega acontecem.
              </p>
              <a href="/comercio" className={s.botaoPrincipal}>Entrar na vitrine →</a>

              {r.total > 0 && (
                <div className={s.painel}>
                  <p className={s.painelTitulo}>Dentro da vitrine</p>
                  <p className={s.painelResumo}>
                    {r.total} produtos em {r.nCats} categorias{r.dia ? ` · Atualizado em ${r.dia}` : ''}
                  </p>
                  <ul className={s.painelLista}>
                    {r.top.map((c, i) => (
                      <li key={c.id}>
                        {/* /comercio ainda não abre uma categoria pela URL: o link leva à vitrine inteira */}
                        <a href="/comercio" className={s.linha}>
                          <span className={s.icone} aria-hidden="true">{i + 1}</span>
                          <span className={s.linhaTexto}>
                            <b>{c.nome}</b>
                            <small>{c.n} produtos</small>
                          </span>
                          <span className={s.seta} aria-hidden="true">→</span>
                        </a>
                      </li>
                    ))}
                    <li>
                      <a href="/comercio" className={s.linha + ' ' + s.linhaTodas}>
                        <span className={s.linhaTexto}><b>Ver todas as categorias →</b></span>
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* VITRINE 2: 4 produtos reais */}
          <div className={s.card + ' ' + s.produtos}>
            <h3 className={s.subtitulo}>Alguns achadinhos da vitrine</h3>
            <ul className={s.lista}>
              {produtos.map((p) => (
                <li key={p.id} className={s.item}>
                  <a href="/comercio" className={s.foto} tabIndex={-1} aria-hidden="true">
                    <img src={p.imagem} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  </a>
                  <span className={s.nome}>{p.nome}</span>
                  <a href="/comercio" className={s.botaoVer}>Ver na vitrine</a>
                </li>
              ))}
            </ul>
            <p className={s.aviso}>
              Imagens e produtos do Mercado Livre. Preços, estoque e prazos são os do anúncio no Mercado Livre,
              e podem mudar a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
