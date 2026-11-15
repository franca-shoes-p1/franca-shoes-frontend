import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import s from '../../../styles/escola.module.css';
import EscolaLayout from '../../../lib/EscolaLayout';
import EscolaTexto from '../../../lib/EscolaTexto';
import { chamar } from '../../../lib/escola';

export default function EscolaAula() {
  const router = useRouter();
  const { trilha, aula } = router.query;
  const [d, setD] = useState(null);
  const [erro, setErro] = useState('');
  const [feita, setFeita] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!trilha || !aula) return;
    setD(null); setErro('');
    chamar(`/api/escola/aula?trilha=${encodeURIComponent(trilha)}&aula=${encodeURIComponent(aula)}`)
      .then((r) => { setD(r); setFeita(r.feita); window.scrollTo(0, 0); })
      .catch((e) => {
        if (e.status === 401) router.replace(`/escola/entrar?volta=/escola/${trilha}/${aula}`);
        else setErro(e.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trilha, aula]);

  async function alternar() {
    setOcupado(true);
    try {
      const r = await chamar('/api/escola/progresso', { method: 'POST', body: { aula_id: d.aula.id, feita: !feita } });
      setFeita(r.feita);
    } catch (e) { setErro(e.message); }
    setOcupado(false);
  }

  const a = d && d.aula;
  return (
    <EscolaLayout titulo={a ? a.titulo : 'Aula'} descricao={a ? a.resumo : undefined}>
      <main className={`${s.contido} ${s.estreito}`}>
        <p className={s.migalhas}>
          <Link href="/escola">Escola</Link> › {d ? <Link href={`/escola/${d.trilha.slug}`}>{d.trilha.titulo}</Link> : '…'}
        </p>
        {!d && !erro && <p className={s.meta}>Carregando…</p>}
        {erro && <div className={s.erro}>{erro} <Link href="/escola"><b>Voltar à escola</b></Link></div>}
        {a && (
          <>
            <span className={s.meta}>Aula {a.numero} de {a.total}{a.duracao_min ? ` · ${a.duracao_min} min` : ''}</span>
            <h1 className={s.titulo}>{a.titulo}</h1>
            <div className={s.aula}>
              {a.video ? (
                <div className={s.video}>
                  <iframe src={`https://www.youtube-nocookie.com/embed/${a.video}`} title={a.titulo} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                </div>
              ) : (
                <div className={s.semVideo}>🎬 O vídeo desta aula ainda vai ser publicado. Enquanto isso, leia o texto abaixo.</div>
              )}
              {a.conteudo ? <EscolaTexto texto={a.conteudo} /> : <p className={s.meta}>O texto desta aula está sendo preparado.</p>}
            </div>
            <div className={s.rodapeAula}>
              {d.anterior ? <Link href={`/escola/${d.trilha.slug}/${d.anterior.slug}`} className={`${s.btn} ${s.btnLinhaEscuro}`}>← {d.anterior.titulo}</Link> : <span />}
              <button type="button" className={`${s.btn} ${feita ? s.btnLinhaEscuro : s.btnVerde}`} onClick={alternar} disabled={ocupado}>{feita ? '✓ Concluída (desmarcar)' : 'Marcar como concluída'}</button>
              {d.proxima ? <Link href={`/escola/${d.trilha.slug}/${d.proxima.slug}`} className={`${s.btn} ${s.btnVerde}`}>Próxima →</Link> : <Link href={`/escola/${d.trilha.slug}`} className={`${s.btn} ${s.btnLinhaEscuro}`}>Voltar à trilha</Link>}
            </div>
          </>
        )}
      </main>
    </EscolaLayout>
  );
}
