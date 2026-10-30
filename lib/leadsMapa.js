// Procura fábricas e lojas de calçados em Franca-SP no OpenStreetMap (grátis) e guarda como "fábricas para abordar".
import { sb, txt } from './varejoServer';

const UA = 'igreja-eco-br-radar/1.0 (ricardobelo1973@gmail.com)';
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
// Área aproximada de Franca-SP: sul, oeste, norte, leste.
const CAIXA = '-20.62,-47.52,-20.47,-47.33';

async function pedir(url, body) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 28000);
  try {
    const r = await fetch(url, { method: 'POST', signal: c.signal, headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(body) });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

export async function buscarFabricasMapa() {
  const q = `[out:json][timeout:25];(nwr["craft"="shoemaker"]["name"](${CAIXA});nwr["shop"="shoes"]["name"](${CAIXA});nwr["industrial"~"shoe|footwear"]["name"](${CAIXA});nwr["name"~"cal[cç]ad|sapat|footwear|shoes",i]["office"!~"."](${CAIXA}););out center 400;`;
  let dados = null;
  for (const u of OVERPASS) { try { dados = await pedir(u, q); break; } catch (e) { /* tenta o próximo */ } }
  if (!dados) return { encontrados: 0, novos: 0, erro: 'O serviço de mapas está ocupado. Tente de novo em alguns minutos.' };
  const vistos = new Set();
  const achados = [];
  for (const el of dados.elements || []) {
    const t = el.tags || {};
    const nome = txt(t.name, 100);
    if (nome.length < 3 || vistos.has(nome.toLowerCase())) continue;
    vistos.add(nome.toLowerCase());
    const tel = String(t.phone || t['contact:phone'] || t['contact:whatsapp'] || '').replace(/\D/g, '');
    const whats = tel.length >= 10 && tel.length <= 13 ? (tel.length <= 11 ? '55' + tel : tel) : null;
    const insta = txt(t['contact:instagram'] || '', 60) || null;
    const site = txt(t.website || t['contact:website'] || '', 150) || null;
    const email = /@/.test(t.email || t['contact:email'] || '') ? txt(t.email || t['contact:email'], 120).toLowerCase() : null;
    const fab = t.craft === 'shoemaker' || /^(shoe|footwear)/.test(t.industrial || '');
    achados.push({ nome, whatsapp: whats, instagram: insta, site, email, endereco: txt([t['addr:street'], t['addr:housenumber'], t['addr:suburb']].filter(Boolean).join(', '), 150) || null, origem: 'mapa', nota: (fab ? 6 : 3) + (whats ? 2 : 0) + (insta ? 1 : 0) + (email ? 1 : 0) });
  }
  const existentes = new Set((await sb('forn_leads?select=nome&limit=5000')).map((l) => l.nome.toLowerCase()));
  const novos = achados.filter((a) => !existentes.has(a.nome.toLowerCase()));
  if (novos.length) await sb('forn_leads', { method: 'POST', body: JSON.stringify(novos) });
  return { encontrados: achados.length, novos: novos.length, comWhats: novos.filter((n) => n.whatsapp).length };
}
