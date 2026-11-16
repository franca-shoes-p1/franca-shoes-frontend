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
  ['Meu número pode ser bloqueado?', 'Sim, esse risco existe no canal não oficial, que é o que usamos. Por isso recomendamos um número separado do seu principal e não fazemos disparo em massa. Veja o aviso completo nesta página.'],
  ['Quanto custa por mês?', 'Depende do que você precisa. Chame no WhatsApp e passamos o valor para o seu caso, sem compromisso.'],
  ['Meus dados ficam seguros?', 'A demonstração usa só dados de exemplo e não guarda o que você digita. Na clínica, o assistente só marca horário e não pede nem guarda dado de saúde.'],
  ['Posso testar antes de contratar?', 'Sim: use a demonstração desta página e peça um piloto de 14 dias.'],
  ['Quem responde se ele não souber?', 'Você. Ele avisa no Telegram e diz ao cliente que o dono responde em seguida.'],
  ['Preciso de CNPJ?', 'Para o canal não oficial, não. Só o canal oficial da Meta (opcional) exige empresa com CNPJ ou MEI e verificação.'],
];

const CANAL = [
  ['🔌', 'Como o assistente se liga ao WhatsApp', 'O Atendente funciona no canal não oficial do WhatsApp, ligado a um número comum. Recomendamos um número separado do seu principal.'],
  ['💸', 'O que isso custa', 'Não há pagamento da API oficial da Meta nem taxa por conversa. Você paga só o serviço combinado e o plano do chip do número.'],
  ['⚠️', 'O risco que você precisa conhecer', 'O WhatsApp não autoriza esse tipo de ligação. A Meta pode limitar ou bloquear o número, às vezes sem aviso. Se isso acontecer, o atendimento por esse número para até ligarmos outro.'],
  ['🛡️', 'Como reduzimos o risco', 'Só respondemos quem chamou o seu número. Não fazemos disparo em massa, nem mensagem repetida para muita gente, e o número é novo ou separado.'],
  ['📶', 'Sem garantia de estar sempre no ar', 'A conexão pode cair e precisar ser refeita (ler um QR code de novo). Avisamos você, mas não garantimos funcionamento sem interrupção.'],
  ['🏢', 'Canal oficial: opcional', 'Se quiser mais segurança, é possível migrar para o canal oficial da Meta. Ele exige empresa com CNPJ ou MEI, verificação da Meta (alguns dias) e cobrança da Meta por mensagem. É combinado à parte.'],
];

export function AvisoCanal() {
  return (
    <section className={s.bloco} id="canal">
      <p className={s.rotulo}>Aviso importante</p>
      <h2 className={s.h2}>Antes de contratar: <em>como o WhatsApp funciona</em> no Atendente</h2>
      <p className={s.sub}>Queremos que você decida sabendo de tudo. Leia estes pontos; se algum não servir para o seu negócio, conversamos antes de começar.</p>
      <div className={s.grade}>
        {CANAL.map(([e, t, p]) => (<div key={t} className={s.cartao}><span className={s.icone} aria-hidden="true">{e}</span><h3>{t}</h3><p>{p}</p></div>))}
      </div>
      <div className={s.canal} style={{ marginTop: 16 }}>
        <p><b>Resumindo:</b> o piloto de 14 dias e o serviço usam o canal não oficial, sem custo de API, com o risco de bloqueio do número. Não use o número onde estão todos os seus clientes se você não puder correr esse risco.</p>
      </div>
    </section>
  );
}

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
