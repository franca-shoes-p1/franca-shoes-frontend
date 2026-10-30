import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { VAREJO } from '../../lib/varejo';

// RASCUNHO: revise com calma e ajuste ao que você realmente vai praticar antes de divulgar a loja.
export default function Politicas() {
  return (
    <VarejoLayout titulo="Trocas, devoluções e entrega">
      <div className={styles.texto}>
        <h1>Trocas, devoluções e entrega</h1>
        <p><Link href="/calcados/regulamento">Leia também o regulamento completo</Link>, com a política de troca de cada fábrica.</p>

        <h2>Como funciona o pedido</h2>
        <p>
          A {VAREJO.nomeLoja} trabalha sem estoque próprio: depois que o pagamento é confirmado, o seu pedido é separado diretamente na
          fábrica em Franca, SP. A saída do pedido acontece em {VAREJO.prazoPreparoDias}, {VAREJO.prazoEntregaInfo}.
        </p>

        <h2>Pagamento</h2>
        <p>
          O pagamento é feito no ambiente seguro do Mercado Pago, com PIX ou cartão. Não guardamos dados do seu cartão.
        </p>

        <h2>Desistência em até 7 dias</h2>
        <p>
          Por ser uma compra pela internet, você pode desistir em até 7 dias corridos a partir do recebimento (art. 49 do Código de
          Defesa do Consumidor), com o produto sem uso e na embalagem. Avise pelo WhatsApp e orientamos o envio de volta e o reembolso.
        </p>

        <h2>Troca de numeração</h2>
        <p>
          Se o número não servir, fale conosco em até 7 dias após o recebimento. Confira a numeração com atenção antes de comprar, pois
          cada fábrica tem sua forma.
        </p>

        <h2>Produto com defeito</h2>
        <p>Se chegar com defeito de fabricação, trocamos ou devolvemos o valor. Mande fotos pelo WhatsApp.</p>

        <h2>Modelos de fornecedores (loja de fábrica)</h2>
        <p>
          Alguns modelos são vendidos por fornecedores de Franca. Nesses casos o fornecedor é quem vende: ele recebe o seu PIX, faz o par
          depois do pedido (por isso existe o prazo de confecção, mostrado em cada modelo) e emite a nota fiscal no seu nome e CPF. A{' '}
          {VAREJO.nomeLoja} faz a intermediação, a coleta e a entrega, por rota de entrega ou pelos Correios.
        </p>
        <p>
          A política de troca é a de cada fornecedor e aparece em cada modelo antes da compra: prazo para defeito, se aceita troca por tamanho
          ou vontade, e quem paga o frete. Troca por defeito não tem custo para o cliente. A desistência de 7 dias da compra pela internet segue o
          Código de Defesa do Consumidor. O pedido de troca é feito pelo WhatsApp dentro do prazo, e a peça é recolhida na próxima entrega.
        </p>
        <p>
          Para a nota fiscal pedimos o seu CPF e a autorização de retirada e transporte, que você aceita ao comprar. Os dados são usados só
          para o pedido, a nota e a entrega.
        </p>

        <h2>Contato</h2>
        <p>
          WhatsApp:{' '}
          <a href={`https://wa.me/${VAREJO.whatsapp}`} target="_blank" rel="noopener noreferrer">
            {VAREJO.whatsapp.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')}
          </a>
        </p>
      </div>
    </VarejoLayout>
  );
}
