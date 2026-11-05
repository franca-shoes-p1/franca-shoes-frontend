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

export default function ComercioVitrine() {
  const produtos = escolher(dados.produtos);

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
