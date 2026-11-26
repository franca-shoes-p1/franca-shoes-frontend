import React, { useRef } from 'react';
import Link from 'next/link';
import s from '../styles/carrossel.module.css';

/* Carrossel das vitrines que saíram da home. Cada cartão leva à vitrine na segunda home (/inicio-2).
   Para incluir outra: acrescente um item nesta lista e retire o bloco correspondente de pages/index.jsx. */
const VITRINES = [
  {
    id: 'praia',
    emoji: '🏖️',
    titulo: 'Venda comida na praia em parceria',
    texto: 'Você entra com o trabalho, eu entro com o kit e o estoque do dia. Sem promessa de ganho.',
    fundo: 'linear-gradient(115deg, #06566e 0%, #0a7ea4 52%, #13b5c8 100%)',
  },
  {
    id: 'livros',
    emoji: '📚',
    titulo: 'Livros para estudar, plantar e servir juntos',
    texto: 'Manuais e programas em linguagem simples, com capítulo grátis e tarefas práticas.',
    fundo: 'linear-gradient(115deg, #1b1650 0%, #2e2285 50%, #5a35b8 100%)',
  },
];

export default function CarrosselVitrines() {
  const trilho = useRef(null);
  const rolar = (sentido) => {
    const el = trilho.current;
    if (el) el.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  return (
    <section className={s.secao} aria-label="Vitrines">
      <div className={s.dentro}>
        <div className={s.topo}>
          <h2>Vitrines</h2>
          {VITRINES.length > 3 && (
            <div className={s.setas}>
              <button type="button" onClick={() => rolar(-1)} aria-label="Vitrine anterior">‹</button>
              <button type="button" onClick={() => rolar(1)} aria-label="Próxima vitrine">›</button>
            </div>
          )}
        </div>
        <div className={`${s.trilho} ${VITRINES.length === 1 ? s.unico : ''}`} ref={trilho}>
          {VITRINES.map((v) => (
            <Link key={v.id} href={`/inicio-2#${v.id}`} className={s.cartao} style={{ background: v.fundo }}>
              <span className={s.emoji} aria-hidden="true">{v.emoji}</span>
              <strong>{v.titulo}</strong>
              <span className={s.texto}>{v.texto}</span>
              <span className={s.botao}>Ver vitrine →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
