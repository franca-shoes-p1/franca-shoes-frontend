import React from 'react';
import Link from 'next/link';
import ModaLayout from '../../lib/ModaLayout';
import s from '../../styles/moda.module.css';

const PLANOS = [
  ['🏬', 'Loja Abastecida', 'Você tem a sua loja. Escolhe e paga os produtos, eu guardo o estoque e entrego ao seu cliente. Você define o preço de venda, acima do preço mínimo.'],
  ['🔁', 'Revenda', 'Você compra de mim e revende do seu jeito. O pagamento é feito no pedido.'],
  ['🙏', 'Membro', 'Para uso próprio, no grupo específico da igreja. Mensalidade pequena e produto pelo preço do fornecedor. Não precisa ter loja nem estoque.'],
];
const PASSOS = [
  ['Live', 'Transmissão agendada no YouTube mostrando os produtos.'],
  ['Escolha', 'Você escolhe e a lista fica visível para a comunidade.'],
  ['Pagamento', 'Você paga até o fim da pausa, no horário avisado.'],
  ['Compra', 'Eu pago o fornecedor, compro e confiro.'],
  ['Estoque e entrega', 'Conforme as regras do seu plano.'],
];

export default function Moda() {
  return (
    <ModaLayout titulo="Início" descricao="Roupas, calçados, acessórios e suvenires escolhidos ao vivo, direto dos fornecedores.">
      <section className={s.hero}>
        <div className={s.contido}>
          <h1>Roupas, calçados, acessórios e suvenires para a sua loja ou para você</h1>
          <p>Eu mostro os produtos ao vivo direto dos fornecedores, você escolhe, e eu cuido da compra. Participo de tudo com você, da hospedagem da loja até a entrega.</p>
          <div className={s.acoes}>
            <Link href="/moda/participar" className={s.botao}>Quero participar</Link>
            <a href="https://www.youtube.com/@RicardoBello-o6v/streams" className={s.contorno} target="_blank" rel="noopener noreferrer">Ver o canal das lives</a>
          </div>
        </div>
      </section>
      <section className={s.secao}>
        <div className={s.contido}>
          <h2>Escolha como participar</h2>
          <div className={s.grade}>
            {PLANOS.map(([e, t, p]) => (
              <article key={t} className={s.cartao}>
                <span className={s.emoji} aria-hidden="true">{e}</span>
                <h3>{t}</h3>
                <p>{p}</p>
                <Link href="/moda/planos">Ver detalhes →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={`${s.secao} ${s.clara}`}>
        <div className={s.contido}>
          <h2>Do ao vivo até a entrega</h2>
          <ol className={s.passos}>
            {PASSOS.map(([t, p]) => (<li key={t}><b>{t}</b><span>{p}</span></li>))}
          </ol>
          <Link href="/moda/como-funciona" className={s.link}>Entender o passo a passo completo →</Link>
        </div>
      </section>
      <section className={s.secao}>
        <div className={s.contido}>
          <h2>O que vamos oferecer</h2>
          <div className={s.categorias}>
            {[['👕', 'Roupas'], ['👟', 'Calçados'], ['👜', 'Acessórios'], ['🎁', 'Suvenires']].map(([e, t]) => (
              <div key={t}><span aria-hidden="true">{e}</span>{t}</div>
            ))}
          </div>
          <p>Começamos com poucos modelos de cada categoria, comprados em polos como o Brás, Goiânia e Belo Horizonte.</p>
        </div>
      </section>
      <section className={`${s.secao} ${s.clara}`}>
        <div className={s.contido}>
          <h2>Primeiro, a gente se conhece</h2>
          <p>Convite, conversa online e visita pessoal para explicar o plano e assinar o contrato. Não há taxa de adesão. O custo da visita é diluído na mensalidade, com permanência mínima de 12 meses.</p>
          <Link href="/moda/participar" className={s.botao}>Pedir uma conversa</Link>
        </div>
      </section>
    </ModaLayout>
  );
}
