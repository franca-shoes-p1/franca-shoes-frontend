import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import s from '../styles/campanha.module.css';
import { CAMPANHA as C } from './campanha';

// Faixa fina no topo das páginas públicas. Fica de fora do painel, do login do operador e do pagamento.
const SEM_FAIXA = [/^\/$/, /^\/campanha/, /^\/admin/, /^\/operador/, /^\/carrinho/, /^\/checkout/, /^\/confirmacao/, /^\/api/];

export default function CampanhaFaixa() {
  const { pathname } = useRouter();
  if (SEM_FAIXA.some((r) => r.test(pathname))) return null;
  return (
    <div className={s.faixa} role="note">
      <div className={s.faixaDentro}>
        <span>🎁 <b>{C.nome}:</b> ganhe um calçado ou acessório juntando Pontos ou Créditos.</span>
        <Link href="/campanha">Ver as regras</Link>
      </div>
    </div>
  );
}
