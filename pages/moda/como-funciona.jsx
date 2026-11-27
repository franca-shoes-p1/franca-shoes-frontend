import React from 'react';
import Link from 'next/link';
import ModaLayout from '../../lib/ModaLayout';
import s from '../../styles/moda.module.css';

export default function ComoFunciona() {
  return (
    <ModaLayout titulo="Como funciona" descricao="Como entrar e como funciona o ciclo de compra ao vivo.">
      <div className={s.texto}>
        <h1>Como funciona</h1>
        <h2>Para entrar</h2>
        <ol>
          <li><b>Convite:</b> você conhece o projeto.</li>
          <li><b>Conversa online:</b> tiramos as primeiras dúvidas.</li>
          <li><b>Visita:</b> eu saio de Franca (SP) para conhecer você pessoalmente, em qualquer lugar do Brasil.</li>
          <li><b>Contrato:</b> explico o plano e assinamos.</li>
          <li><b>Montagem:</b> preparamos o seu acesso ou a sua loja.</li>
          <li><b>Primeira live:</b> você faz as primeiras escolhas.</li>
          <li><b>Acompanhamento:</b> seguimos juntos.</li>
        </ol>
        <h2>O ciclo de compra</h2>
        <ol>
          <li>O calendário é avisado ao grupo: 15 dias antes, lembrete 7 dias antes e confirmação do horário 1 dia antes e no dia.</li>
          <li>Mostro ao vivo os produtos dos fornecedores.</li>
          <li>Você escolhe; a lista fica visível para mim e para a comunidade.</li>
          <li>Você paga até o fim da pausa, no horário avisado na live.</li>
          <li>Eu pago o fornecedor, compro, coleto e confiro.</li>
          <li>Os produtos são guardados, enviados ou retirados conforme o plano.</li>
        </ol>
        <h2>Formas de ter a loja</h2>
        <ul>
          <li>Uma página dentro da plataforma.</li>
          <li>Loja com domínio (endereço) próprio.</li>
          <li>Uma vitrine compartilhada.</li>
        </ul>
        <p>As formas disponíveis em cada plano serão informadas antes da adesão.</p>
        <h2>Tecnologia a favor</h2>
        <p>A ideia é usar inteligência artificial e automação para ajudar no cadastro dos produtos, nas transmissões e na divulgação. Essas funções serão ligadas aos poucos.</p>
        <Link href="/moda/participar" className={s.botao}>Quero participar</Link>
      </div>
    </ModaLayout>
  );
}
