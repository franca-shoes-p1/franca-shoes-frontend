import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import VarejoLayout from '../../lib/VarejoLayout';
import styles from '../../styles/varejo.module.css';
import f from '../../styles/fabricasFranca.module.css';
import { SEGMENTOS } from '../../lib/fabricasFranca';
import { listarLojasPublicas } from '../../lib/fabricasFrancaServer';

// Vitrine pública: guia de fábricas de Franca. A compra é feita no site da própria empresa.
export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  const lojas = await listarLojasPublicas();
  return { props: { lojas } };
}

export default function Fabricas({ lojas }) {
  const [seg, setSeg] = useState('todos');
  const [q, setQ] = useState('');
  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return lojas.filter((l) => (seg === 'todos' || l.segmento === seg) && (!termo || `${l.nome} ${l.descricao} ${l.cidade}`.toLowerCase().includes(termo)));
  }, [lojas, seg, q]);
  const segmentos = [...new Set(lojas.map((l) => l.segmento))];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Fábricas de calçados e acessórios de Franca, SP',
    itemListElement: lojas.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.nome })),
  };

  return (
    <VarejoLayout titulo="Fábricas de calçados e acessórios de Franca">
      <Head>
        <meta name="description" content="Guia de fábricas de calçados e acessórios de Franca, SP, com link para o site de cada empresa. Compre direto da fábrica e conheça o passe de assinante." />
        <link rel="canonical" href="https://www.igreja.eco.br/fabricas" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <div className={styles.texto} style={{ maxWidth: 980 }}>
        <h1>Fábricas de calçados e acessórios de Franca</h1>
        <p>Reunimos empresas de Franca, SP, que vendem pela internet. Você escolhe a empresa e compra direto no site dela.</p>

        <div className={f.aviso}>
          <b>Como funciona:</b> este guia só indica as empresas. A compra, o pagamento, o frete, o prazo, a troca e a garantia são feitos e
          cumpridos pela própria empresa, no site dela. Nós não vendemos esses produtos e não recebemos comissão pela venda.
          Empresas marcadas como <b>Publicidade</b> pagam para aparecer em destaque.
        </div>

        <div className={f.faixa}>
          <div className={f.faixaItem}>
            <h2>Passe de assinante</h2>
            <p>Por um valor mensal, tenha preço menor nos produtos e serviços do nosso site e acesso à Área do cliente.</p>
            <Link href="/assinar" className={styles.botaoSecundario}>Conhecer o passe</Link>
          </div>
          <div className={f.faixaItem}>
            <h2>Já comprou em uma empresa daqui?</h2>
            <p>Registre a compra. Depois de conferida, você recebe dias de passe de boas-vindas.</p>
            <Link href="/fabricas/registrar-compra" className={styles.botaoSecundario}>Registrar minha compra</Link>
          </div>
        </div>

        {lojas.length === 0 ? (
          <div className={f.vazio}>As empresas serão publicadas em breve. Volte logo.</div>
        ) : (
          <>
            <div className={f.filtros}>
              <button type="button" className={`${f.chip} ${seg === 'todos' ? f.chipOn : ''}`} onClick={() => setSeg('todos')}>Todas</button>
              {segmentos.map((s) => (
                <button key={s} type="button" className={`${f.chip} ${seg === s ? f.chipOn : ''}`} onClick={() => setSeg(s)}>{SEGMENTOS[s] || s}</button>
              ))}
              <input className={f.busca} type="search" placeholder="Buscar empresa" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar empresa" />
            </div>
            {lista.length === 0 && <div className={f.vazio}>Nenhuma empresa encontrada com esse filtro.</div>}
            <div className={f.grade}>
              {lista.map((l) => (
                <article key={l.id} className={`${f.card} ${l.patrocinada ? f.cardDestaque : ''}`}>
                  <div className={f.topo}>
                    <h2 className={f.nome}>{l.nome}</h2>
                    {l.patrocinada && <span className={f.pub}>Publicidade</span>}
                  </div>
                  <div className={f.meta}>{SEGMENTOS[l.segmento] || l.segmento}{l.cidade ? ` · ${l.cidade}` : ''}</div>
                  {l.descricao && <p className={f.desc}>{l.descricao}</p>}
                  <a className={f.ir} href={`/api/fabricas/ir?s=${l.slug}`} target="_blank" rel={l.patrocinada ? 'sponsored nofollow noopener noreferrer' : 'nofollow noopener noreferrer'}>
                    Ir para o site da empresa
                  </a>
                </article>
              ))}
            </div>
          </>
        )}
        <p className={styles.parcela}>
          Os preços e as condições mostrados no site de cada empresa são de responsabilidade dela. Você é o dono da sua compra: confira as políticas de troca e entrega antes de pagar.
        </p>
      </div>
    </VarejoLayout>
  );
}
