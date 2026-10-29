import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import s from '../styles/radar.module.css';
import { WHATS_RADAR } from './radarAssistente';

/* Vitrine dos Parceiros: painel de divulgação no fim da home. Mostra os perfis aprovados e convida novos parceiros. */
export default function ParceirosPainel() {
  const [lista, setLista] = useState(null);
  useEffect(() => {
    let vivo = true;
    fetch('/api/parceiros').then((r) => r.json()).then((j) => { if (vivo) setLista(j.parceiros || []); }).catch(() => { if (vivo) setLista([]); });
    return () => { vivo = false; };
  }, []);
  const itens = lista || [];
  return (
    <section id="parceiros" className={s.vitrine} aria-label="Vitrine dos Parceiros">
      <div className={s.vitrineIn}>
        <p className={s.rotulo}>Vitrine dos Parceiros</p>
        <h2>Negócios que fazem parte do Radar</h2>
        <p className={s.sub}>Comércios que autorizaram o cartaz e mostram aqui a sua marca. É grátis e você mesmo monta a sua vitrine num painel simples.</p>
        <div className={s.pgrade}>
          {itens.map((p) => (
            <Link key={p.codigo} href={`/ponto/${p.codigo}`} className={s.pcard}>
              <div className={s.logoBox}>{p.logo ? <img src={p.logo} alt={`Logotipo de ${p.nome}`} loading="lazy" /> : '🏪'}</div>
              <b>{p.nome}</b>
              <small>{p.slogan || `${p.cidade}/${p.uf}`}</small>
            </Link>
          ))}
          <a className={`${s.pcard} ${s.vazio}`} href={WHATS_RADAR} target="_blank" rel="noopener noreferrer">
            <div className={s.logoBox}>➕</div>
            <b>O seu negócio aqui</b>
            <small>Peça o convite pelo WhatsApp. Sem custo e sem contrato.</small>
          </a>
        </div>
        <div className={s.acoes}>
          <Link href="/radar" className={`${s.botao} ${s.principal}`}>Como ser Ponto Parceiro</Link>
          <Link href="/radar/belo-horizonte" className={`${s.botao} ${s.contorno}`}>Ver parceiros de Belo Horizonte</Link>
        </div>
      </div>
    </section>
  );
}
