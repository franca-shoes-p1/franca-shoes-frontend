// Mapeamento automático de pontos com dados abertos do OpenStreetMap (grátis, sem chave).
// Só busca locais que já estão publicados no mapa; nada é inventado.

export const GRUPOS = {
  comercio: {
    nome: 'Comércios pequenos (padarias, salões, barbearias, mercadinhos, lojas)',
    filtros: ['["shop"~"^(bakery|hairdresser|beauty|barber|supermarket|convenience|clothes|shoes|butcher|greengrocer)$"]'],
  },
  academia: { nome: 'Academias', filtros: ['["leisure"="fitness_centre"]'] },
  igreja: { nome: 'Igrejas e templos', filtros: ['["amenity"="place_of_worship"]'] },
  faculdade: { nome: 'Faculdades e escolas técnicas', filtros: ['["amenity"~"^(university|college)$"]'] },
  terminal: { nome: 'Terminais e rodoviárias', filtros: ['["amenity"="bus_station"]'] },
};

export function montarConsulta(bbox, grupos) {
  const [s, w, n, e] = bbox;
  const caixa = `(${s},${w},${n},${e})`;
  const partes = [];
  for (const g of grupos) {
    for (const f of (GRUPOS[g] || { filtros: [] }).filtros) partes.push(`nwr${f}["name"]${caixa};`);
  }
  return `[out:json][timeout:25];(${partes.join('')});out center 800;`;
}

function tipoDe(tags) {
  if (tags.amenity === 'place_of_worship') return 'igreja';
  if (tags.amenity === 'university' || tags.amenity === 'college') return 'universidade';
  if (tags.amenity === 'bus_station') return 'rodoviaria';
  if (tags.shop === 'supermarket') return 'mercado';
  return 'comercio';
}

// Celular brasileiro: DDD + 9 + 8 dígitos. Telefone fixo não serve para WhatsApp.
function whatsappDe(tel) {
  let d = String(tel || '').replace(/\D/g, '');
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  return d.length === 11 && d[2] === '9' ? d : '';
}

export function interpretar(elementos) {
  const vistos = new Set();
  const saida = [];
  for (const el of elementos || []) {
    const t = el.tags || {};
    const nome = String(t.name || '').trim().slice(0, 120);
    const lat = el.lat ?? (el.center && el.center.lat);
    const lng = el.lon ?? (el.center && el.center.lon);
    if (!nome || lat == null || lng == null) continue;
    const chave = nome.toLowerCase() + '|' + lat.toFixed(3) + '|' + lng.toFixed(3);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    const tel = t.phone || t['contact:phone'] || t['contact:mobile'] || t.mobile || '';
    const email = String(t.email || t['contact:email'] || '').trim().slice(0, 120);
    const site = t.website || t['contact:website'] || t['contact:instagram'] || '';
    const wpp = whatsappDe(t['contact:whatsapp'] || tel);
    const endereco = [t['addr:street'], t['addr:housenumber'], t['addr:suburb']].filter(Boolean).join(', ');
    const obs = ['Fonte: OpenStreetMap', tel && !wpp ? `Tel: ${String(tel).slice(0, 30)}` : '', site ? `Site/rede: ${String(site).slice(0, 80)}` : '']
      .filter(Boolean).join(' · ');
    const contatos = (email ? 2 : 0) + (wpp ? 2 : 0) + (tel ? 1 : 0) + (site ? 1 : 0);
    saida.push({ nome, tipo: tipoDe(t), lat, lng, endereco: endereco.slice(0, 200), contato_email: email, contato_whatsapp: wpp, observacao: obs, contatos });
  }
  return saida;
}
