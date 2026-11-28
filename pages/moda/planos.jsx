import React from 'react';
import Link from 'next/link';
import ModaLayout from '../../lib/ModaLayout';
import s from '../../styles/moda.module.css';

const PLANOS = [
  { t: 'Começar Vendendo', link: '/moda/comecar-vendendo', itens: [
    'Você escolhe os produtos nas lives, até um limite.',
    'Eu adianto a compra.',
    'Na venda, o valor adiantado volta para mim e o lucro é seu.',
    'Vale por um período; depois você passa a pagar na hora da compra.',
    'Cadastro sujeito a aprovação e contrato.',
  ] },
  { t: 'Loja Abastecida', itens: [
    'Você tem a sua loja e escolhe produtos do meu catálogo.',
    'Paga os produtos na escolha.',
    'Eu guardo o estoque e entrego ao cliente final.',
    'Você define o preço de venda, a partir do preço mínimo (custo e minha parte).',
    'O pagamento da venda cai na minha conta; seu saldo fica anotado.',
    'Você recebe por PIX depois da entrega e de 7 dias.',
    'Material de divulgação incluído: fotos, vídeos curtos e textos.',
    'Você decide o tempo de estoque. Sem venda, envio os seus produtos sem cobrar frete.',
  ] },
  { t: 'Revenda', itens: [
    'Você compra de mim e revende.',
    'Paga no momento do pedido.',
    'Os produtos passam a ser seus para vender do seu jeito.',
  ] },
  { t: 'Membro', itens: [
    'Plano individual para o grupo específico da igreja.',
    'Compra para uso próprio, sem loja e sem estoque.',
    'Produto pelo preço do fornecedor.',
    'Previsto: cartão parcelado sem juros.',
    'Previsto: frete grátis para retirada em rodoviárias das cidades atendidas.',
    'Em outras cidades, envio pelos Correios com frete pago pelo comprador.',
  ] },
];

export default function Planos() {
  return (
    <ModaLayout titulo="Planos" descricao="Começar Vendendo, Loja Abastecida, Revenda e Membro: veja como participar.">
      <section className={s.secao}>
        <div className={s.contido}>
          <h1>Os planos</h1>
          <div className={s.grade}>
            {PLANOS.map((p) => (
              <article key={p.t} className={s.cartao}>
                <h2>{p.t}</h2>
                <p className={s.preco}>Mensalidade: será informada antes da adesão</p>
                <ul>{p.itens.map((i) => <li key={i}>{i}</li>)}</ul>
                {p.link && <Link href={p.link}>Ver como funciona →</Link>}
              </article>
            ))}
          </div>
          <p>Não há taxa de adesão. O custo da visita é diluído na mensalidade, com permanência mínima de 12 meses. Veja as <Link href="/moda/condicoes">condições</Link>.</p>
          <Link href="/moda/participar" className={s.botao}>Quero participar</Link>
        </div>
      </section>
    </ModaLayout>
  );
}
