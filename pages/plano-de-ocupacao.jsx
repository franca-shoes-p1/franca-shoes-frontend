import React from 'react';
import Link from 'next/link';
import RuralLayout, { linkWhats } from '../components/RuralLayout';
import styles from '../styles/rural.module.css';

const ENTREGA = [
  ['🗺️', 'Mapa de ocupação', 'Imagem de satélite da propriedade com as áreas marcadas: casa, horta, pomar, animais, água, estrada, energia solar, cercas e áreas de preservação.'],
  ['📋', 'Lista do que construir', 'Tudo o que a propriedade precisa para funcionar, separado por prioridade.'],
  ['🔢', 'Ordem de execução', 'O que fazer primeiro, o que esperar e o que pode ficar para depois.'],
  ['💰', 'Orçamento estimado', 'Faixa de custo de cada etapa, para você planejar o dinheiro.'],
];

const PRECISO = [
  'Cidade, estado e, se tiver, o endereço ou as coordenadas da propriedade',
  'Tamanho da área (em hectares, alqueires ou metros)',
  'Fotos do terreno e da região, se possível',
  'Onde está a água: nascente, córrego, poço ou rede',
  'O que já existe (casa, cerca, estrada, energia) e o que não existe',
  'O que você quer fazer: morar, plantar, criar animais, receber visitas',
  'Quanto pode investir e em quanto tempo quer começar',
];

const MENSAGEM = [
  'Olá! Quero um plano de ocupação para a minha propriedade rural.',
  '',
  'Cidade/Estado:',
  'Tamanho da área:',
  'Onde está a água:',
  'O que já existe:',
  'O que quero fazer:',
].join('\n');

export default function PlanoDeOcupacao() {
  const whats = linkWhats(MENSAGEM);
  return (
    <RuralLayout
      titulo="Plano de ocupação da propriedade rural | Igreja Eco"
      descricao="Estudo preliminar com imagem de satélite: mapa, lista do que construir e ordem de execução para chácaras, sítios e fazendas."
    >
      <section className={styles.hero}>
        <div className={styles.contido}>
          <p className={styles.sobretitulo}>Produto de entrada</p>
          <h1 className={styles.heroTitulo}>Plano de ocupação da propriedade</h1>
          <p className={styles.heroTexto}>
            Veja no mapa onde fica cada coisa e em que ordem fazer, antes de gastar com obra, cerca ou plantio.
          </p>
          <div className={styles.acoes}>
            <a href={whats} className={styles.botao} target="_blank" rel="noopener noreferrer">Pedir pelo WhatsApp</a>
            <Link href="/rural" className={styles.botaoClaro}>Voltar ao planejamento rural</Link>
          </div>
        </div>
      </section>

      <section className={styles.secao}>
        <div className={styles.contido}>
          <p className={styles.sobretituloEscuro}>O que você recebe</p>
          <h2 className={styles.titulo}>Quatro entregas para decidir com segurança</h2>
          <div className={styles.grade} style={{ marginTop: 24 }}>
            {ENTREGA.map(([i, t, d]) => (
              <article key={t} className={styles.cartao}>
                <span className={styles.cartaoIcone} aria-hidden="true">{i}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <p className={styles.aviso} style={{ marginTop: 24 }}>
            <strong>Estudo preliminar.</strong> O plano de ocupação é um trabalho de planejamento. Ele não é projeto técnico,
            laudo ou licença e não substitui a análise de engenheiro, agrônomo ou outro profissional habilitado quando a lei
            exigir. Para essas etapas, indicamos e coordenamos o profissional certo.
          </p>
        </div>
      </section>

      <section className={`${styles.secao} ${styles.secaoClara}`}>
        <div className={`${styles.contido} ${styles.duas}`}>
          <div>
            <p className={styles.sobretituloEscuro}>Para começar</p>
            <h2 className={styles.titulo}>O que preciso saber da sua propriedade</h2>
            <ul className={styles.lista}>
              {PRECISO.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <p style={{ color: 'var(--cinza)' }}>
              Não tem tudo? Sem problema: mande o que souber e completamos juntos.
            </p>
          </div>
          <div className={styles.caixa}>
            <h3>Como pedir</h3>
            <ol style={{ paddingLeft: 20, margin: '0 0 16px', display: 'grid', gap: 8 }}>
              <li>Toque no botão e a mensagem já abre pronta no WhatsApp.</li>
              <li>Preencha o que souber e envie.</li>
              <li>Respondemos com o valor e o prazo do seu plano.</li>
            </ol>
            <a href={whats} className={styles.botaoVerde} target="_blank" rel="noopener noreferrer">Pedir meu plano →</a>
            <p style={{ color: 'var(--cinza)', fontSize: '0.9rem', margin: '14px 0 0' }}>
              O valor depende do tamanho e da complexidade da propriedade e é combinado antes de começar.
            </p>
          </div>
        </div>
      </section>
    </RuralLayout>
  );
}
