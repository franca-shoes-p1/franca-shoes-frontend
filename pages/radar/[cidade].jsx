// Página pública de uma cidade: lista os Pontos Parceiros com perfil publicado.
import Head from 'next/head';
import Link from 'next/link';
import s from '../../styles/radar.module.css';
import { sb } from '../../lib/varejoServer';
import { CIDADES, TIPOS } from '../../lib/pontos';
import { slugCidade } from '../../lib/parceiro';

export async function getServerSideProps({ params, res }) {
  const nome = Object.keys(CIDADES).find((c) => slugCidade(c) === String(params.cidade || ''));
  if (!nome) return { notFound: true };
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  let parceiros = [];
  try {
    const l = await sb(`rf_pontos?perfil_status=eq.aprovado&status=in.(autorizado,ativo)&cidade=eq.${encodeURIComponent(nome)}&select=codigo,nome,tipo,perfil_slogan,perfil_logo&order=perfil_atualizado_em.desc&limit=60`);
    parceiros = l.map((p) => ({ codigo: p.codigo, nome: p.nome, tipo: TIPOS[p.tipo] || '', slogan: p.perfil_slogan || null, logo: p.perfil_logo || null }));
  } catch (e) {}
  return { props: { nome, uf: CIDADES[nome].uf, parceiros } };
}

export default function CidadeRadar({ nome, uf, parceiros }) {
  return (
    <div className={s.pagina}>
      <Head>
        <title>Pontos Parceiros em {nome} · Radar</title>
        <meta name="description" content={`Locais de ${nome} (${uf}) que divulgam a loja de calçados e acessórios de fábrica do Radar de Pontos.`} />
      </Head>
      <div className={s.barra}><Link href="/radar">← O que é o Radar</Link><Link href="/calcados">Ver a loja</Link></div>
      <header className={s.banner}>
        <div className={s.dentro} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <div className={s.esq}>
            <span className={s.pilula}><i />{nome} · {uf}</span>
            <h1 className={s.titulo}>Pontos Parceiros em <em>{nome}</em></h1>
            <p className={s.texto}>Estes locais autorizaram o cartaz do Radar e mostram aqui a sua marca. Aponte o celular para o QR do cartaz ou toque num local para conhecer.</p>
          </div>
        </div>
      </header>

      <section className={s.bloco}>
        <p className={s.rotulo}>Vitrine</p>
        <h2 className={s.h2}>{parceiros.length ? 'Locais parceiros' : 'Os primeiros parceiros estão chegando'}</h2>
        <div className={s.pgrade}>
          {parceiros.map((p) => (
            <Link key={p.codigo} href={`/ponto/${p.codigo}`} className={s.pcard}>
              <div className={s.logoBox}>{p.logo ? <img src={p.logo} alt={`Logotipo de ${p.nome}`} loading="lazy" /> : '🏪'}</div>
              <b>{p.nome}</b>
              <small>{p.slogan || p.tipo}</small>
            </Link>
          ))}
          <Link className={`${s.pcard} ${s.vazio}`} href="/radar/participar">
            <div className={s.logoBox}>➕</div><b>Você também pode</b><small>Grátis. Divulgue o seu trabalho ou ceda um espaço.</small>
          </Link>
        </div>
      </section>

      <section className={s.faixaBege}>
        <div className={s.bloco}>
          <p className={s.rotulo}>Entrega</p>
          <h2 className={s.h2}>Dia de Entrega em {nome}</h2>
          <p className={s.sub}>Ainda não há data marcada. Quando houver, a data aparece aqui e é avisada pelo WhatsApp a quem comprou.</p>
        </div>
      </section>
    </div>
  );
}
