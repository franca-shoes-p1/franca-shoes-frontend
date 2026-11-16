import React from 'react';
import Link from 'next/link';
import s from '../styles/atendente.module.css';
import { WHATS_ATENDENTE } from './atendente';

export function Barra() {
  return (
    <div className={s.barra}>
      <Link href="/">← Voltar ao site</Link>
      <a href={WHATS_ATENDENTE} target="_blank" rel="noopener noreferrer">💬 Pedir orçamento</a>
    </div>
  );
}

const FAQ = [
  ['O assistente substitui uma pessoa?', 'Não. Ele responde o que é repetitivo (preço, horário, catálogo). O que for difícil chega para você, no Telegram, e você responde.'],
  ['Funciona fora do horário?', 'Sim. O assistente responde a qualquer hora, e você vê o resumo quando puder.'],
  ['Meu número pode ser bloqueado?', 'No canal não oficial do WhatsApp existe esse risco, por isso ele é usado só no piloto, em número separado. Para clientes pagantes usamos o canal oficial da Meta.'],
  ['Quanto custa por mês?', 'Depende do que você precisa. Chame no WhatsApp e passamos o valor para o seu caso, sem compromisso.'],
  ['Meus dados ficam seguros?', 'A demonstração usa só dados de exemplo e não guarda o que você digita. Na clínica, o assistente só marca horário e não pede nem guarda dado de saúde.'],
  ['Posso testar antes de contratar?', 'Sim: use a demonstração desta página e peça um piloto de 14 dias.'],
  ['Quem responde se ele não souber?', 'Você. Ele avisa no Telegram e diz ao cliente que o dono responde em seguida.'],
  ['Preciso de CNPJ?', 'Para o assistente funcionar, não. Para usar o canal oficial do WhatsApp, a Meta pode pedir dados da empresa; explicamos isso na conversa.'],
];

export function Duvidas() {
  return (
    <section className={s.bloco} id="duvidas">
      <p className={s.rotulo}>Dúvidas</p>
      <h2 className={s.h2}>Perguntas que todo mundo faz</h2>
      <div className={s.faq}>
        {FAQ.map(([q, r]) => (<details key={q}><summary>{q}</summary><p>{r}</p></details>))}
      </div>
    </section>
  );
}

export function Final() {
  return (
    <section className={s.final}>
      <h2>Quer ver o assistente no seu negócio?</h2>
      <p>Conte o que você vende e como atende hoje. Respondemos no WhatsApp, sem compromisso. Não prometemos vendas nem lucro.</p>
      <a href={WHATS_ATENDENTE} className={`${s.botao} ${s.principal}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
    </section>
  );
}
