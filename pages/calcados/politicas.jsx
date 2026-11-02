import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import { VAREJO } from '../../lib/varejo';

// Texto completo das regras. O resumo visual está em /como-comprar. Mantenha os dois iguais ao alterar prazos.
export default function Politicas() {
  return (
    <VarejoLayout titulo="Trocas, devoluções e entrega">
      <div className={styles.texto}>
        <h1>Trocas, devoluções e entrega</h1>

        <h2>Como funciona o pedido</h2>
        <p>
          A {VAREJO.nomeLoja} trabalha sem estoque próprio: depois que o pagamento é confirmado, o seu pedido é separado diretamente na
          fábrica em Franca, SP. O prazo de saída depende da fábrica: quando ela não informa outro, é de {VAREJO.prazoPreparoDias}, {VAREJO.prazoEntregaInfo}, e fábricas com lote mínimo só liberam o pedido quando o lote completa.
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

        <h2>Cada fábrica tem as suas regras</h2>
        <p>
          Trabalhamos com várias fábricas de Franca e cada uma tem o seu jeito: algumas pedem <b>lote mínimo de pares</b> (por exemplo, 12), o prazo de
          preparo muda, e nem todas aceitam troca de numeração. Essas regras aparecem na página de cada modelo, antes da compra. Quando o modelo tem lote
          mínimo, o seu pedido fica na fila até o lote completar, e você acompanha o andamento em <a href="/acompanhar">Acompanhar pedido</a>.
        </p>
        <p>
          Vale sempre, para qualquer fábrica: desistência em 7 dias, defeito de fabricação com no mínimo 30 dias para avisar, erro no pedido em 7 dias.
          Se a regra da fábrica for melhor para você, vale a dela. A lei sempre prevalece.
        </p>

        <h2>Como você recebe</h2>
        <p>
          <b>Retirada na rodoviária (frete grátis):</b> nas capitais atendidas, levamos os pedidos em viagem, em lote. O lote de cada cidade fecha
          quando juntar pedidos pagos suficientes; então programamos a rota e avisamos a data e o horário da retirada por WhatsApp e e-mail.
          Leve um documento com foto. Como depende de formar o lote, não prometemos uma data exata antes dele fechar.
        </p>
        <p>
          <b>Correios:</b> o frete aparece no resumo antes do pagamento e o código de rastreio é enviado por WhatsApp e e-mail. Na região Norte, a
          entrega é só pelos Correios. Não fazemos entrega em domicílio por conta própria.
        </p>
        <p>
          Veja o caminho completo do pedido, com prazos e situações, em <a href="/como-comprar">Como comprar, passo a passo</a>.
        </p>

        <h2>Troca de numeração</h2>
        <p>
          Fazemos uma troca de numeração por pedido, pelos Correios, com o produto sem uso e na embalagem, exceto nos modelos de fábricas que não aceitam troca de
          numeração (isso aparece na página do modelo). Fale conosco pelo WhatsApp e combinamos o custo do envio antes. Confira a numeração com atenção antes de comprar, pois cada fábrica tem sua forma.
        </p>

        <h2>Produto com defeito</h2>
        <p>
          Se chegar com defeito de fabricação, você tem no mínimo 30 dias a partir do recebimento para avisar (alguns modelos têm prazo maior, mostrado na página do modelo). Trocamos ou devolvemos o valor, sem custo
          para você. Mande fotos pelo WhatsApp.
        </p>

        <h2>Erro no pedido</h2>
        <p>Se enviarmos modelo, cor ou número diferente do que você comprou, avise em até 7 dias. A troca é por nossa conta.</p>

        <h2>Se o modelo acabar</h2>
        <p>Falamos com você antes de qualquer coisa: você escolhe outro modelo ou o reembolso do valor pago.</p>

        <h2>Seus dados</h2>
        <p>
          Usamos os seus dados só para o pedido, o pagamento, a entrega e o contato sobre a sua compra. Não vendemos nem repassamos seus dados.
        </p>

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
