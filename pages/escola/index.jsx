import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import s from '../../styles/escola.module.css';
import EscolaLayout from '../../lib/EscolaLayout';
import { chamar } from '../../lib/escola';

export default function Escola() {
  const [d, setD] = useState(null);
  useEffect(() => { chamar('/api/escola/trilhas').then(setD).catch(() => setD({ trilhas: [], logado: false })); }, []);
  const logado = !!(d && d.logado);

  return (
    <EscolaLayout descricao="Escola de Agropecuária Ecológica da Igreja Eco: trilhas de agrofloresta, plantio ecológico e criação de pequenos animais, com aulas em vídeo e texto. Cadastro gratuito.">
      <section className={s.hero}>
        <div className={s.contido}>
          <span className={s.etiqueta}>Cadastro gratuito de membro</span>
          <h1>Aprenda a plantar e criar com a natureza, passo a passo</h1>
          <p>Trilhas de aulas em vídeo e texto sobre agrofloresta, solo vivo, sementes crioulas e criação de pequenos animais em sistema ecológico. Para quem está começando e para quem já tem terra.</p>
          <div className={s.botoes}>
            {logado
              ? <Link href="#trilhas" className={`${s.btn} ${s.btnOuro}`}>Continuar estudando</Link>
              : <Link href="/escola/entrar?novo=1" className={`${s.btn} ${s.btnOuro}`}>Quero me cadastrar</Link>}
            <Link href="#trilhas" className={`${s.btn} ${s.btnLinha}`}>Ver as trilhas</Link>
          </div>
        </div>
      </section>

      <main>
        <section className={s.secao} id="trilhas">
          <div className={s.contido}>
            <h2>Trilhas de estudo</h2>
            <p className={s.sub}>Cada trilha é uma sequência de aulas curtas. Você estuda no seu ritmo e marca o que já concluiu.</p>
            {!d && <p className={s.meta}>Carregando…</p>}
            {d && d.trilhas && d.trilhas.length === 0 && <div className={s.aviso}>As trilhas estão sendo preparadas. Volte em breve!</div>}
            <div className={s.grade}>
              {d && d.trilhas && d.trilhas.map((t) => {
                const pct = t.total ? Math.round((t.concluidas / t.total) * 100) : 0;
                return (
                  <article key={t.id} className={s.cartao}>
                    <span className={s.icone} aria-hidden="true">{t.icone || '🌱'}</span>
                    <h3>{t.titulo}</h3>
                    <p>{t.descricao}</p>
                    <span className={s.meta}>{t.total} {t.total === 1 ? 'aula' : 'aulas'}{logado ? ` · ${t.concluidas} concluída${t.concluidas === 1 ? '' : 's'}` : ''}</span>
                    {logado && <div className={s.barraProg} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>}
                    <Link href={`/escola/${t.slug}`} className={`${s.btn} ${s.btnVerde}`}>{logado ? 'Abrir trilha' : 'Ver aulas'}</Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={s.secao} style={{ paddingTop: 0 }}>
          <div className={s.contido}>
            <h2>Como funciona</h2>
            <p className={s.sub}>Simples, pelo celular ou computador.</p>
            <div className={s.passos}>
              <div className={s.passo}><b>Cadastre-se</b><span>Nome, e-mail e uma senha. É gratuito.</span></div>
              <div className={s.passo}><b>Escolha uma trilha</b><span>Agrofloresta e plantio, ou criação de pequenos animais.</span></div>
              <div className={s.passo}><b>Assista e leia</b><span>Cada aula tem vídeo e um texto para consultar depois.</span></div>
              <div className={s.passo}><b>Marque o progresso</b><span>Acompanhe o que já concluiu em cada trilha.</span></div>
            </div>
            {!logado && <p style={{ marginTop: 24 }}><Link href="/escola/entrar?novo=1" className={`${s.btn} ${s.btnVerde}`}>Criar meu cadastro</Link></p>}
          </div>
        </section>
      </main>
    </EscolaLayout>
  );
}
