import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import s from '../../styles/escola.module.css';
import EscolaLayout from '../../lib/EscolaLayout';
import { chamar } from '../../lib/escola';

export default function EscolaTrilha() {
  const router = useRouter();
  const slug = router.query.trilha;
  const [d, setD] = useState(null);

  useEffect(() => { if (slug) chamar('/api/escola/trilhas').then(setD).catch(() => setD({ trilhas: [], logado: false })); }, [slug]);
  const t = d && d.trilhas.find((x) => x.slug === slug);
  const logado = !!(d && d.logado);

  return (
    <EscolaLayout titulo={t ? t.titulo : 'Trilha'} descricao={t ? t.descricao : undefined}>
      <main className={`${s.contido} ${s.estreito}`}>
        <p className={s.migalhas}><Link href="/escola">Escola</Link> › {t ? t.titulo : '…'}</p>
        {!d && <p className={s.meta}>Carregando…</p>}
        {d && !t && <div className={s.aviso}>Trilha não encontrada. <Link href="/escola"><b>Voltar à escola</b></Link></div>}
        {t && (
          <>
            <h1 className={s.titulo}>{t.icone} {t.titulo}</h1>
            <p style={{ color: 'var(--cinza)', margin: 0 }}>{t.descricao}</p>
            {!logado && (
              <div className={s.aviso} style={{ marginTop: 16 }}>
                As aulas são para membros (cadastro gratuito). <Link href={`/escola/entrar?novo=1&volta=/escola/${t.slug}`}><b>Cadastre-se</b></Link> ou <Link href={`/escola/entrar?volta=/escola/${t.slug}`}><b>entre</b></Link> para assistir.
              </div>
            )}
            <ol className={s.lista}>
              {t.aulas.map((a, i) => (
                <li key={a.id}>
                  <Link href={logado ? `/escola/${t.slug}/${a.slug}` : `/escola/entrar?volta=/escola/${t.slug}/${a.slug}`} className={s.item}>
                    <span className={`${s.num} ${a.feita ? s.feita : ''}`}>{a.feita ? '✓' : i + 1}</span>
                    <span className={s.itemTxt}><b>{a.titulo}</b><span>{a.resumo}{a.duracao_min ? ` · ${a.duracao_min} min` : ''}</span></span>
                    {!logado && <span className={s.cadeado} aria-label="Só para membros">🔒</span>}
                  </Link>
                </li>
              ))}
            </ol>
            {t.aulas.length === 0 && <div className={s.aviso} style={{ marginTop: 16 }}>As aulas desta trilha estão sendo preparadas.</div>}
          </>
        )}
      </main>
    </EscolaLayout>
  );
}
