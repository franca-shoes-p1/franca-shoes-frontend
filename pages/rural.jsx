import React from 'react';
import Link from 'next/link';
import RuralLayout, { linkWhats } from '../components/RuralLayout';
import styles from '../styles/rural.module.css';

const OFERTAS = [
  {
    icone: '🗺️',
    titulo: 'Plano de ocupação',
    texto: 'Estudo preliminar com imagem de satélite: onde ficam casa, horta, pomar, animais, água, estrada, energia e áreas de preservação.',
    etiqueta: 'Produto de entrada',
    link: '/plano-de-ocupacao',
  },
  {
    icone: '📋',
    titulo: 'Roteiro de infraestrutura',
    texto: 'Lista do que construir e em que ordem, com orçamento estimado para você decidir sem susto.',
  },
  {
    icone: '🤝',
    titulo: 'Coordenação com profissionais',
    texto: 'Quando o trabalho pede engenheiro, agrônomo, topógrafo ou advogado, indicamos e acompanhamos o profissional certo.',
  },
  {
    icone: '📑',
    titulo: 'Regularização rural',
    texto: 'Orientação e encaminhamento para CAR, CCIR, ITR e regularização ambiental, com profissional habilitado nas etapas técnicas.',
  },
  {
    icone: '🌱',
    titulo: 'Implantação prática agroecológica',
    texto: 'Horta, pomar e pequenas criações em sistema agroecológico, executados na propriedade nas partes que não exigem responsável técnico.',
  },
];

const PASSOS = [
  ['1', 'Você conta o que tem', 'Localização, tamanho, fontes de água, o que existe hoje e o que você quer fazer.'],
  ['2', 'Você recebe o plano', 'Um estudo preliminar com mapa, lista do que construir e ordem de execução.'],
  ['3', 'Você escolhe o que executar', 'Pode começar pelo que é simples e deixar o resto para depois.'],
  ['4', 'Quem assina, executa', 'Quando a lei exige profissional habilitado, ele assume o serviço e assina somente o que realmente fez.'],
];

const REDE = [
  ['🌾', 'Engenheiro agrônomo', 'Projetos e laudos agronômicos, CAR e PRA, licenciamento.'],
  ['🏗️', 'Engenheiro civil', 'Casa, galpão, fossa, estradas e barragens.'],
  ['📐', 'Topógrafo / agrimensor', 'Levantamento, georreferenciamento e certificação.'],
  ['🌳', 'Engenheiro ambiental ou florestal', 'Reserva legal, outorga de água e licenciamento.'],
  ['⚖️', 'Advogado agrário e imobiliário', 'Escritura, regularização fundiária e inventário rural.'],
  ['🧾', 'Contador rural', 'ITR, imposto de renda rural e inscrição de produtor.'],
];

const PUBLICO = [
  'Comprou uma chácara ou sítio e não sabe por onde começar',
  'Herdou terra e quer regularizar e aproveitar',
  'Quer sair da cidade e morar no campo',
  'Tem fazenda e quer organizar a infraestrutura em etapas',
];

export default function Rural() {
  const whats = linkWhats('Olá! Vim pelo site e quero saber mais sobre o planejamento da minha propriedade rural.');
  return (
    <RuralLayout
      titulo="Planejamento de propriedades rurais | Igreja Eco"
      descricao="Plano de ocupação, roteiro de infraestrutura e coordenação com profissionais habilitados para chácaras, sítios e fazendas."
    >
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.contido}>
          <p className={styles.sobretitulo}>Novo · Planejamento rural</p>
          <h1 className={styles.heroTitulo}>Planeje sua chácara, sítio ou fazenda antes de gastar</h1>
          <p className={styles.heroTexto}>
            Um plano claro do que construir, onde e em que ordem. E quando o serviço exige assinatura,
            um profissional habilitado cuida da parte técnica.
          </p>
          <div className={styles.acoes}>
            <Link href="/plano-de-ocupacao" className={styles.botao}>Pedir meu plano de ocupação</Link>
            <a href={whats} className={styles.botaoClaro} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            <Link href="/profissionais" className={styles.botaoClaro}>Sou profissional</Link>
          </div>
        </div>
      </section>

      {/* O QUE OFERECEMOS */}
      <section className={styles.secao}>
        <div className={styles.contido}>
          <p className={styles.sobretituloEscuro}>O que oferecemos</p>
          <h2 className={styles.titulo}>Do primeiro mapa à propriedade funcionando</h2>
          <p className={styles.subtitulo}>Você começa pelo plano e avança conforme o seu momento e o seu bolso.</p>
          <div className={styles.grade}>
            {OFERTAS.map((o) => (
              <article key={o.titulo} className={styles.cartao}>
                <span className={styles.cartaoIcone} aria-hidden="true">{o.icone}</span>
                {o.etiqueta && <div><span className={styles.etiqueta}>{o.etiqueta}</span></div>}
                <h3>{o.titulo}</h3>
                <p>{o.texto}</p>
                {o.link && <p style={{ marginTop: 12 }}><Link href={o.link} className={styles.botaoContorno}>Saber mais →</Link></p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className={`${styles.secao} ${styles.secaoClara}`}>
        <div className={styles.contido}>
          <p className={styles.sobretituloEscuro}>Como funciona</p>
          <h2 className={styles.titulo}>Quatro passos, sem complicação</h2>
          <div className={styles.grade} style={{ marginTop: 24 }}>
            {PASSOS.map(([n, t, d]) => (
              <div key={n} className={styles.cartao}>
                <span className={styles.numero}>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REDE DE PROFISSIONAIS */}
      <section className={styles.secao}>
        <div className={styles.contido}>
          <p className={styles.sobretituloEscuro}>Rede de profissionais parceiros</p>
          <h2 className={styles.titulo}>Quem assina, executa</h2>
          <p className={styles.subtitulo}>
            Trabalhamos com profissionais independentes, contratados por serviço, em cada área técnica.
            Cada um responde pelo que executa e assina, dentro das regras do seu conselho.
          </p>
          <div className={styles.grade}>
            {REDE.map(([i, t, d]) => (
              <div key={t} className={styles.cartao}>
                <span className={styles.cartaoIcone} aria-hidden="true">{i}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link href="/profissionais" className={styles.botaoVerde}>Cadastrar como profissional parceiro →</Link>
          </p>
        </div>
      </section>

      {/* EXECUÇÃO PRÁTICA X HABILITADO */}
      <section className={`${styles.secao} ${styles.secaoClara}`}>
        <div className={`${styles.contido} ${styles.duas}`}>
          <div>
            <p className={styles.sobretituloEscuro}>Com transparência</p>
            <h2 className={styles.titulo}>O que fazemos na prática e o que passa por profissional habilitado</h2>
            <ul className={styles.lista}>
              <li>Implantação de horta, pomar e canteiros agroecológicos</li>
              <li>Preparo do solo e cobertura com matéria orgânica</li>
              <li>Organização de pequenas criações em sistema natural</li>
              <li>Acompanhamento da execução do plano de ocupação</li>
            </ul>
            <p className={styles.aviso}>
              Trabalhamos somente com agroecologia. Não emitimos projeto, laudo nem receituário.
            </p>
          </div>
          <div className={styles.caixa}>
            <h3>Sempre com profissional habilitado</h3>
            <ul className={styles.lista}>
              <li>Projetos técnicos e laudos (com ART ou RRT)</li>
              <li>Obras que exigem responsável técnico</li>
              <li>Georreferenciamento e certificação</li>
              <li>Licenciamento e documentos ambientais</li>
              <li>Escrituras e questões jurídicas</li>
              <li>Declarações e obrigações fiscais rurais</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PARA QUEM */}
      <section className={styles.secao}>
        <div className={`${styles.contido} ${styles.duas}`}>
          <div>
            <p className={styles.sobretituloEscuro}>Para quem é</p>
            <h2 className={styles.titulo}>Feito para quem está começando no campo</h2>
            <ul className={styles.lista}>
              {PUBLICO.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <div className={styles.avisoVerde}>
            <strong>Estudo preliminar.</strong> O plano de ocupação ajuda a decidir e a conversar com os
            profissionais, mas não substitui projeto técnico nem aprovação de órgãos públicos.
          </div>
        </div>
      </section>

      {/* CHAMADA FINAL */}
      <section className={styles.faixa}>
        <div className={styles.contido}>
          <h2>Pronto para começar a sua propriedade pelo caminho certo?</h2>
          <p>Conte o que você tem e o que quer fazer. Respondemos pelo WhatsApp.</p>
          <div className={styles.acoes}>
            <Link href="/plano-de-ocupacao" className={styles.botao}>Pedir meu plano</Link>
            <a href={whats} className={styles.botaoClaro} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
        </div>
      </section>
    </RuralLayout>
  );
}
