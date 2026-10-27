import React from 'react';
import s from '../styles/assBanner.module.css';

const PRONTOS = [
  { e: '⚙️', t: 'Motor dos assistentes', d: 'Um molde: cada produto novo vira só uma configuração.' },
  { e: '👟', t: 'Loja de calçados', d: 'Nível, categorias, nome e cor com a vitrine no celular.' },
  { e: '🌐', t: 'Site ou página de vendas', d: 'Objetivo, estilo e seções com o site ao vivo.' },
  { e: '📣', t: 'Divulgação de afiliado', d: 'Post, roteiro e calendário de 7 dias com o seu link.' },
  { e: '🧭', t: 'Vitrine de assistentes', d: 'Um lugar só para escolher o que montar.' },
];

export default function AssistentesBanner() {
  return (
    <section className={s.banner} aria-label="Assistentes do Ateliê">
      <div className={s.dentro}>
        <div>
          <span className={s.pilula}><i />Novo · Assistentes do Ateliê</span>
          <h2 className={s.titulo}>Monte a sua ideia <em>e veja ela ganhar forma</em></h2>
          <p className={s.texto}>
            Responda em poucos passos e acompanhe a prévia ao vivo: a loja no celular, o site na tela. No fim, você envia o pedido
            e respondemos no WhatsApp, sem compromisso.
          </p>
          <div className={s.acoes}>
            <a href="/assistentes" className={`${s.botao} ${s.principal}`}>Ver os assistentes</a>
            <a href="/monte-sua-loja" className={`${s.botao} ${s.contorno}`}>Montar a minha loja</a>
            <a href="/monte-seu-site" className={`${s.botao} ${s.contorno}`}>Montar o meu site</a>
          </div>
          <p className={s.nota}>Pedido sem compromisso. Não prometemos vendas nem lucro.</p>
        </div>

        <div className={s.palco}>
          <div className={s.cartao}>
            <h3 className={s.cartaoTopo}><span>Já está pronto</span><span>Novo</span></h3>
            {PRONTOS.map((p) => (
              <div key={p.t} className={s.linha}>
                <span className={s.emoji} aria-hidden="true">{p.e}</span>
                <span className={s.info}><b>{p.t}</b><small>{p.d}</small></span>
                <span className={s.ok} aria-hidden="true">✓</span>
              </div>
            ))}
            <div className={s.rodape}><span>Prévia ao vivo em cada passo</span><span>Funciona no celular</span></div>
          </div>
          <div className={`${s.chip} ${s.c1}`} aria-hidden="true">⚡ Prévia ao vivo</div>
          <div className={`${s.chip} ${s.c2}`} aria-hidden="true">📱 Celular e computador</div>
        </div>
      </div>
    </section>
  );
}
