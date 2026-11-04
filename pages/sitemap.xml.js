// Mapa do site para o Google: lista as páginas da Máquina de Presença (segmento x cidade) e as principais do portal.
import { caminhos } from '../lib/presenca';

const BASE = 'https://www.igreja.eco.br';
const FIXAS = ['/', '/calcados', '/catalogo', '/sites', '/presenca'];

export async function getServerSideProps({ res }) {
  const urls = [...FIXAS, ...caminhos().map((c) => `/presenca/${c.params.segmento}/${c.params.cidade}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${BASE}${u}</loc></url>`).join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }
