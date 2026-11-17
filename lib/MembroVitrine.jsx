import React from 'react';
import Link from 'next/link';
import s from '../styles/membroVitrine.module.css';

/* Vitrine "Comunidade da Igreja" da home: convite para ser membro (/seja-membro) e acesso às páginas da igreja.
   Para incluir uma página nova, acrescente um item em PORTAS. */
const PORTAS = [
  { e: '🙏', t: 'Seja membro', d: 'Cadastro gratuito em 6 passos, pelo celular.', href: '/seja-membro', destaque: true },
  { e: '📚', t: 'Livros e manuais', d: 'Vitrine com capítulo grátis e tarefa da semana.', href: '/livros' },
  { e: '⛪', t: 'Manual da Igreja', d: 'Declaração de fé, compromissos e como funciona.', href: '/manual-da-igreja' },
  { e: '🌱', t: 'Vigiar e Cultivar', d: 'Kit de estudo para quem quer plantar e servir.', href: '/vigiar-e-cultivar' },
  { e: '🌿', t: 'Escola de Agropecuária Ecológica', d: 'Aprenda a cultivar de forma simples.', href: '/escola' },
  { e: '🏗️', t: 'Pedido de Construção', d: 'Peça o projeto do seu negócio ou da sua obra.', href: '/construcao' },
];

const GRUPOS = ['Estudo da Palavra', 'Horta e despensa', 'Cestas e partilha', 'Visita e cuidado', 'Vídeo e comunicação'];

export default function MembroVitrine() {
  return (
    <section id="comunidade" className={s.banner} aria-label="Comunidade da Igreja">
      <span className={s.brilho1} aria-hidden="true" />
      <span className={s.brilho2} aria-hidden="true" />
      <div className={s.dentro}>
        <div className={s.topo}>
          <div>
            <span className={s.pilula}><i />Comunidade da Igreja</span>
            <h2 className={s.titulo}>Faça parte da igreja <em>desde o começo</em>.</h2>
            <p className={s.texto}>
              Ser membro é gratuito: a igreja não pede dízimo, oferta, exclusividade nem bens. Você conta onde mora, onde gostaria
              de servir, confirma a declaração de fé e os 6 compromissos, e uma pessoa responde pelo WhatsApp em até 48 horas.
            </p>
            <div className={s.acoes}>
              <Link href="/seja-membro" className={`${s.botao} ${s.principal}`}>Quero ser membro</Link>
              <Link href="/manual-da-igreja" className={`${s.botao} ${s.contorno}`}>Ler o Manual da Igreja</Link>
            </div>
            <ul className={s.selos}>
              <li>🆓 Gratuito</li>
              <li>🔒 Seus dados só para contato</li>
              <li>📲 Resposta pelo WhatsApp</li>
            </ul>
          </div>

          <div className={s.palco} aria-hidden="true">
            <div className={s.carteira}>
              <div className={s.carteiraTopo}><span>Igreja Evangelho dos Pobres</span><span>dos Alimentos Sagrados</span></div>
              <div className={s.carteiraNome}>🪪 Membro</div>
              <div className={s.carteiraLinha}><small>Nome</small><b>Seu nome aqui</b></div>
              <div className={s.carteiraLinha}><small>Cidade</small><b>Sua cidade</b></div>
              <div className={s.carteiraChips}>
                <span>Acolhimento</span><span>Mordomia</span><span>Partilha</span>
              </div>
              <div className={s.carteiraSelo}>✓ Declaração e compromissos aceitos</div>
            </div>
            <div className={`${s.chip} ${s.c1}`}>🌱 Horta e despensa</div>
            <div className={`${s.chip} ${s.c2}`}>📖 Estudo da Palavra</div>
          </div>
        </div>

        <ul className={s.portas}>
          {PORTAS.map((p) => (
            <li key={p.t}>
              <Link href={p.href} className={`${s.porta} ${p.destaque ? s.portaDestaque : ''}`}>
                <span className={s.portaIcone} aria-hidden="true">{p.e}</span>
                <span className={s.portaTexto}><b>{p.t}</b><small>{p.d}</small></span>
                <span className={s.seta} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={s.grupos}>
          <b>Grupos que estão se formando:</b>
          {GRUPOS.map((g) => <span key={g}>{g}</span>)}
          <small>Peça o convite pelo Telegram ou WhatsApp depois do cadastro.</small>
        </div>
      </div>
    </section>
  );
}
