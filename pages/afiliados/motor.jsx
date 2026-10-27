import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import s from '../../styles/afiliados.module.css';
import { NEGOCIOS, CANAIS, TONS, montarTexto, ideiaDeArte, calendario7, conferirTexto, linkDe } from '../../lib/motorDivulgacao';

const CHAVE = 'ie_meu_ref';

export default function Motor() {
  const [negocio, setNegocio] = useState('campanha');
  const [canal, setCanal] = useState('feed');
  const [tom, setTom] = useState('amigavel');
  const [codigo, setCodigo] = useState('');
  const [texto, setTexto] = useState('');
  const [editado, setEditado] = useState(false);
  const [aba, setAba] = useState('post');
  const [copiado, setCopiado] = useState('');

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('ref');
      const g = (q && /^[a-z0-9]{6,12}$/i.test(q) && q) || window.localStorage.getItem(CHAVE) || '';
      if (g) setCodigo(g);
    } catch (e) { /* sem armazenamento: o código é digitado a cada visita */ }
  }, []);
  useEffect(() => {
    try { if (/^[a-z0-9]{6,12}$/i.test(codigo)) window.localStorage.setItem(CHAVE, codigo); } catch (e) { /* ok */ }
  }, [codigo]);

  const base = useMemo(() => montarTexto({ negocio, canal, tom, codigo }), [negocio, canal, tom, codigo]);
  useEffect(() => { setTexto(base); setEditado(false); }, [base]);

  const dias = useMemo(() => calendario7({ negocio, tom, codigo }), [negocio, tom, codigo]);
  const conf = conferirTexto(texto);
  const codigoOk = /^[a-z0-9]{6,12}$/i.test(codigo);

  async function copiar(valor, rotulo) {
    try { await navigator.clipboard.writeText(valor); setCopiado(rotulo); setTimeout(() => setCopiado(''), 2000); }
    catch (e) { setCopiado('Não deu para copiar. Selecione o texto e use Ctrl+C.'); }
  }

  const Opcoes = ({ itens, valor, onChange, tipo }) => (
    <div className={s.opcoes}>
      {Object.entries(itens).map(([k, v]) => (
        <button key={k} type="button" className={s.opcao} aria-pressed={valor === k} onClick={() => onChange(k)}>
          {tipo === 'negocio' ? `${v.emoji} ${v.nome}` : tipo === 'canal' ? `${v.emoji} ${v.nome}` : v}
        </button>
      ))}
    </div>
  );

  return (
    <div className={s.pagina}>
      <Head>
        <title>Assistente de divulgação | Igreja Eco</title>
        <meta name="description" content="Monte posts, roteiros e um calendário de 7 dias para divulgar os negócios da Igreja Eco com o seu link de afiliado." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={s.topo}>
        <div className={s.topoDentro}>
          <Link href="/afiliados">← Programa de Afiliados</Link>
          <div className={s.topoLinks}>
            <a href="/manual-afiliado">Manual do afiliado</a>
            <Link href="/operador/oficina">Meu painel</Link>
          </div>
        </div>
      </div>
      <main className={s.miolo}>
        <h1 className={s.h1}>Assistente de divulgação</h1>
        <p className={s.lead}>Escolha o negócio, o canal e o tom e veja o post ao vivo. Depois é só copiar e publicar. Tudo já sai com o aviso obrigatório.</p>

        <div className={s.abas}>
          <button type="button" className={s.opcao} aria-pressed={aba === 'post'} onClick={() => setAba('post')}>📝 Montar um post</button>
          <button type="button" className={s.opcao} aria-pressed={aba === 'semana'} onClick={() => setAba('semana')}>🗓️ Calendário de 7 dias</button>
        </div>

        <div className={s.motor}>
          <div>
            <div className={s.passoBox}>
              <h3><b>1</b>Sobre o que você vai falar?</h3>
              <Opcoes itens={NEGOCIOS} valor={negocio} onChange={setNegocio} tipo="negocio" />
            </div>
            {aba === 'post' && (
              <div className={s.passoBox}>
                <h3><b>2</b>Onde vai publicar?</h3>
                <Opcoes itens={CANAIS} valor={canal} onChange={setCanal} tipo="canal" />
              </div>
            )}
            <div className={s.passoBox}>
              <h3><b>{aba === 'post' ? '3' : '2'}</b>Qual o tom?</h3>
              <Opcoes itens={TONS} valor={tom} onChange={setTom} tipo="tom" />
            </div>
            <div className={s.passoBox}>
              <h3><b>{aba === 'post' ? '4' : '3'}</b>Seu código de divulgador</h3>
              <input
                style={{ padding: '12px 14px', border: '1px solid #d8b4fe', borderRadius: 14, width: '100%', font: 'inherit' }}
                value={codigo} onChange={(e) => setCodigo(e.target.value.trim())} placeholder="Ex.: 3fa9c21b" maxLength={12} aria-label="Seu código de divulgador"
              />
              <p style={{ margin: '8px 0 0', fontSize: 13, color: '#5b4a7d' }}>
                {codigoOk ? 'Código aplicado: o seu link já está nos textos.' : <>Sem o seu código, as indicações não contam pontos. Veja o código em <Link href="/operador/oficina">Meu painel</Link>, no card Divulgação. Ainda não é afiliado? <Link href="/afiliados">Cadastre-se</Link>.</>}
              </p>
            </div>
          </div>

          <div className={s.prev}>
            {aba === 'post' ? (
              <>
                <div className={s.celular}>
                  <div className={s.tela}>
                    <textarea value={texto} onChange={(e) => { setTexto(e.target.value); setEditado(true); }} aria-label="Texto do post, você pode editar" />
                  </div>
                </div>
                {conf.achadas.length > 0 && <div className={`${s.alerta} ${s.ruim}`}><b>Cuidado:</b> estas palavras podem ser entendidas como promessa de ganho e não podem ser usadas: {conf.achadas.join(', ')}.</div>}
                {conf.falta.map((f) => <div key={f} className={`${s.alerta} ${s.aviso}`}>{f}</div>)}
                {conf.ok && <div className={`${s.alerta} ${s.bom}`}>Texto conferido: sem promessa de ganho e com o aviso de parceria.</div>}
                <p className={s.arte}><b>Ideia de arte:</b> {ideiaDeArte(negocio, canal === 'story' ? 'story' : canal === 'reels' ? 'reels' : 'feed')}</p>
                <div className={s.acoesMotor}>
                  <button type="button" className={`${s.btn} ${s.peq}`} onClick={() => copiar(texto, 'Texto copiado!')}>Copiar texto</button>
                  <button type="button" className={`${s.btn} ${s.sec} ${s.peq}`} onClick={() => copiar(linkDe(negocio, codigo), 'Link copiado!')}>Copiar só o link</button>
                  {editado && <button type="button" className={`${s.btn} ${s.sec} ${s.peq}`} onClick={() => { setTexto(base); setEditado(false); }}>Voltar ao texto original</button>}
                </div>
                {copiado && <div className={`${s.alerta} ${s.bom}`}>{copiado}</div>}
              </>
            ) : (
              <p className={s.arte}>Um post por dia, em formatos diferentes, para {NEGOCIOS[negocio].nome}. Copie o de cada dia e publique no canal indicado.</p>
            )}
          </div>
        </div>

        {aba === 'semana' && dias.map((d) => (
          <div key={d.dia} className={s.dia}>
            <h3><b>{d.dia}</b>{d.tema} · {CANAIS[d.canal].emoji} {CANAIS[d.canal].nome}</h3>
            <pre>{d.texto}</pre>
            <div className={s.arte}><b>Ideia de arte:</b> {d.arte}</div>
            <div className={s.acoesMotor}><button type="button" className={`${s.btn} ${s.peq}`} onClick={() => copiar(d.texto, `Dia ${d.dia} copiado!`)}>Copiar dia {d.dia}</button></div>
          </div>
        ))}
        {aba === 'semana' && copiado && <div className={`${s.alerta} ${s.bom}`}>{copiado}</div>}

        <div className={`${s.cx} ${s.am}`} style={{ marginTop: 28 }}>
          <b className={s.t}>Lembre-se</b>
          Não prometa renda, lucro, emprego ou sociedade. Não envie mensagens para quem não conhece. Pontos só entram depois que o pagamento da pessoa indicada é confirmado.
        </div>
      </main>
    </div>
  );
}
