import React from 'react';
import ModaLayout from '../../lib/ModaLayout';
import s from '../../styles/moda.module.css';

export default function Condicoes() {
  return (
    <ModaLayout titulo="Condições" descricao="Condições previstas para participar da Loja de Moda e Lembranças.">
      <div className={s.texto}>
        <h1>Condições previstas</h1>
        <p>Resumo do que está planejado. As condições que valem serão as do contrato, apresentado antes de qualquer pagamento. Os direitos previstos em lei continuam valendo.</p>
        <h2>Visita, adesão e permanência</h2>
        <p>Não há taxa de adesão. O custo da visita é diluído na mensalidade, com permanência mínima de 12 meses.</p>
        <h2>Preços e pagamentos</h2>
        <ul>
          <li>Loja Abastecida: paga na escolha; recebe a sua parte por PIX depois da entrega e de 7 dias.</li>
          <li>Revenda: paga no pedido.</li>
          <li>Em todos os planos, a mercadoria só sai depois do pagamento.</li>
          <li>Membro: mensalidade mais as compras, ao preço do fornecedor.</li>
        </ul>
        <h2>Compras ao vivo e calendário</h2>
        <ul>
          <li>O pagamento deve ser feito até o fim da pausa, no horário avisado na live e escrito no chat.</li>
          <li>No fim da pausa a lista de compras é fechada. Depois começa a rodada de compra.</li>
          <li>O calendário é avisado ao grupo: 15 dias antes, lembrete 7 dias antes e confirmação do horário 1 dia antes e no dia.</li>
        </ul>
        <h2>Entrega e frete</h2>
        <ul>
          <li>Loja Abastecida: eu faço a entrega ao cliente final.</li>
          <li>Membro: retirada em rodoviária nas cidades atendidas, a confirmar.</li>
          <li>Membro em outra cidade: Correios, com frete pago pelo comprador.</li>
          <li>Dia, hora e ponto de encontro são combinados com antecedência.</li>
        </ul>
        <h2>Trocas, devoluções e desistência</h2>
        <ul>
          <li>Compra pela internet: o consumidor pode desistir em até 7 dias após receber, com devolução dos valores pagos, inclusive o frete.</li>
          <li>Defeito ou envio errado: a responsabilidade é minha.</li>
          <li>Na Loja Abastecida, desistência ou troca de tamanho usam a reserva incluída no preço mínimo.</li>
          <li>Anúncio errado feito pelo lojista: a responsabilidade é dele.</li>
        </ul>
        <h2>Estoque</h2>
        <p>Cada lojista decide por quanto tempo os produtos ficam guardados. Não havendo venda, eles são enviados ao lojista sem cobrança de frete.</p>
        <h2>Dados pessoais</h2>
        <p>Pediremos somente os dados necessários para o atendimento, o contrato e a entrega.</p>
      </div>
    </ModaLayout>
  );
}
