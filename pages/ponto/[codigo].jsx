// Página pública do Ponto Parceiro: para onde o QR do cartaz leva. Mostra a marca do local e leva à loja.
import Head from 'next/head';
import Link from 'next/link';
import s from '../../styles/radar.module.css';
import { sb } from '../../lib/varejoServer';
import { CAMPOS_PUBLICOS, slugCidade } from '../../lib/parceiro';
import { TIPOS } from '../../lib/pontos';

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store');
  const codigo = String(params.codigo || '').toUpperCase();
  const volta = { redirect: { destination: /^[A-Z0-9]{4,10}$/.test(codigo) ? `/calcados?ponto=${codigo}` : '/calcados', permanent: false } };
  if (!/^[A-Z0-9]{4,10}$/.test(codigo)) return volta;
  try {
    const [p] = await sb(`rf_pontos?codigo=eq.${codigo}&status=in.(autorizado,ativo)&select=${CAMPOS_PUBLICOS},perfil_status`);
    if (!p) return volta;
    const ok = p.perfil_status === 'aprovado';
    return { props: { codigo, nome: p.nome, cidade: p.cidade, uf: p.uf, tipo: TIPOS[p.tipo] || '', perfil: ok ? {
      slogan: p.perfil_slogan, descricao: p.perfil_descricao, logo: p.perfil_logo, whatsapp: p.perfil_whatsapp,
      instagram: p.perfil_instagram, site: p.perfil_site, horario: p.perfil_horario, endereco: p.perfil_endereco } : null } };
  } catch (e) {
    return volta;
  }
}

export default function PontoPublico({ codigo, nome, cidade, uf, tipo, perfil }) {
  const f = perfil || {};
  return (
    <div className={s.pagina}>
      <Head>
        <title>{nome} · Ponto Parceiro em {cidade}</title>
        <meta name="description" content={f.slogan || `${nome} é Ponto Parceiro do Radar em ${cidade}.`} />
      </Head>
      <div className={s.barra}><Link href="/radar">← O que é o Radar</Link><Link href={`/radar/${encodeURIComponent(cidade.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`}>Parceiros em {cidade}</Link></div>
      <div className={s.perfilPag}>
        <div className={s.previa}>
          <div className={s.logoBox}>{f.logo ? <img src={f.logo} alt={`Logotipo de ${nome}`} /> : '🏪'}</div>
          <span className={s.local}>Ponto Parceiro · {cidade}/{uf}</span>
          <h1 style={{ margin: '6px 0', fontSize: 26 }}>{nome}</h1>
          {f.slogan && <p><b>{f.slogan}</b></p>}
          {f.descricao && <p>{f.descricao}</p>}
          {!f.descricao && tipo && <p>{tipo}</p>}
          {f.horario && <p>🕒 {f.horario}</p>}
          {f.endereco && <p>📍 {f.endereco}</p>}
          <div className={s.cta}>
            <Link href={`/calcados?ponto=${codigo}`} className={`${s.botao} ${s.principal}`}>👟 Ver os calçados de fábrica</Link>
            {f.whatsapp && <a className={`${s.botao} ${s.contorno}`} href={`https://wa.me/${f.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp do local</a>}
            {f.instagram && <a className={`${s.botao} ${s.contorno}`} href={`https://instagram.com/${f.instagram}`} target="_blank" rel="noopener noreferrer nofollow">Instagram</a>}
            {f.site && <a className={`${s.botao} ${s.contorno}`} href={f.site} target="_blank" rel="noopener noreferrer nofollow">Site</a>}
          </div>
        </div>
        <p className={s.rodape} style={{ padding: '18px 0 0', textAlign: 'center' }}>
          {perfil ? 'Informações enviadas pelo próprio estabelecimento. ' : ''}Os calçados são vendidos pela loja do site, com entrega em dia marcado na cidade.
        </p>
      </div>
    </div>
  );
}
