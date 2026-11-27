import React from 'react';
import Link from 'next/link';
import SiteLayout from '../lib/SiteLayout';
import s from '../styles/site.module.css';

/* Para pausar um projeto, apague a linha dele. A página do projeto continua existindo. */
const GRUPOS = [
  ['comercio', 'Comércio e calçados', [
    ['👟', 'Loja de Calçados Pronta', 'Sua loja online de calçados, entregue funcionando.', '/loja-de-calcados-pronta'],
    ['🏭', 'Calçados das fábricas de Franca', 'Calçados e acessórios com PIX e cartão.', '/calcados'],
    ['🔎', 'Loja de achadinhos', 'Vitrine de produtos do Mercado Livre; a compra é feita lá.', '/comercio'],
    ['🏠', 'Entrega em casa', 'Peça, prove em casa e só pague se gostar.', '/entrega-em-casa'],
    ['📍', 'Radar de Pontos', 'Pontos de venda e parceiros.', '/radar'],
  ]],
  ['servicos', 'Serviços digitais', [
    ['🧩', 'Ateliê Sob Medida', 'Sites, atendentes e automações montados para você.', '/atelie'],
    ['💬', 'Atendente WhatsApp', 'Assistente que atende, agenda e avisa você.', '/atendente'],
    ['🌐', 'Fábrica de Sites', 'Peça o seu site.', '/sites'],
    ['🏗️', 'Pedido de Construção', 'Peça o projeto do seu negócio.', '/construcao'],
  ]],
  ['participe', 'Participe e ganhe pontos', [
    ['🛠️', 'Oficina Digital', 'Tarefas curtas pelo celular.', '/oficina'],
    ['🏖️', 'Parceiros da Praia', 'Venda comida na praia em parceria.', '/praia'],
    ['📣', 'Afiliados e parceiros', 'Programa de afiliados.', '/afiliados'],
    ['🎁', 'Campanha', 'Campanha de inauguração.', '/campanha'],
    ['💛', 'Fidelidade', 'Programa de fidelidade.', '/fidelidade'],
  ]],
  ['comunidade', 'Comunidade e aprendizado', [
    ['🙏', 'Seja membro', 'Cadastro gratuito na igreja.', '/seja-membro'],
    ['🕊️', 'Comunidade da Igreja', 'Conheça a comunidade.', '/inicio-2#comunidade'],
    ['⛪', 'Manual da Igreja', 'Leia o manual.', '/manual-da-igreja'],
    ['📺', 'Canal no YouTube', 'Transmissões e vídeos.', 'https://www.youtube.com/@RicardoBello-o6v/streams'],
    ['📚', 'Livros e manuais', 'Capítulo grátis e tarefas práticas.', '/livros'],
    ['📖', 'E-books práticos', 'E-books para consultar.', '/ebooks'],
    ['🌿', 'Escola de Agropecuária Ecológica', 'Estudo e prática no campo.', '/escola'],
    ['🌱', 'Vigiar e Cultivar', 'Conheça o projeto.', '/vigiar-e-cultivar'],
  ]],
];

export default function Projetos() {
  return (
    <SiteLayout titulo="Projetos" descricao="Os demais projetos da Igreja Eco, organizados por assunto.">
      <div className={s.cabeca}>
        <div className={s.contido}>
          <h1>Projetos</h1>
          <p>Escolha um assunto.</p>
          <nav className={s.atalhos} aria-label="Assuntos">
            {GRUPOS.map(([id, t]) => (<a key={id} href={`#${id}`}>{t}</a>))}
          </nav>
        </div>
      </div>
      {GRUPOS.map(([id, t, itens], i) => (
        <section key={id} id={id} className={`${s.secao} ${i % 2 ? s.clara : ''}`}>
          <div className={s.contido}>
            <h2>{t}</h2>
            <div className={s.grade}>
              {itens.map(([e, nome, texto, href]) => (
                <Link key={nome} href={href} className={`${s.cartao} ${s.clicavel}`}>
                  <span className={s.emoji} aria-hidden="true">{e}</span>
                  <h3>{nome}</h3>
                  <p>{texto}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </SiteLayout>
  );
}
