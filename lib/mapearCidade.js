// Busca comércios e locais da cidade no OpenStreetMap e cadastra como "Mapeado". Usado pelo painel e pelo n8n.
import crypto from 'crypto';
import { sb, txt } from './varejoServer';
import { sigla, aleatorio, validar } from './pontosServer';
import { GRUPOS, montarConsulta, interpretar } from './mapeador';

const UA = 'igreja-eco-br-radar/1.0 (ricardobelo1973@gmail.com)';
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

async function achar(url, init) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 28000);
  try {
    const r = await fetch(url, { ...init, signal: c.signal, headers: { 'User-Agent': UA, ...(init && init.headers) } });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

// Devolve { status, json } para a rota só repassar.
export async function mapearCidade(c) {
  const cidade = txt(c.cidade, 80);
  const uf = txt(c.uf, 2).toUpperCase();
  const grupos = (Array.isArray(c.grupos) ? c.grupos : []).filter((g) => GRUPOS[g]);
  const quantos = Math.min(100, Math.max(5, Math.round(Number(c.quantos)) || 40));
  if (!cidade || uf.length !== 2 || grupos.length === 0) return { status: 400, json: { erro: 'Informe cidade, UF e ao menos um tipo de local.' } };
  try {
    const geo = await achar(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${cidade}, ${uf}, Brasil`)}&format=json&limit=1`);
    if (!geo.length || !geo[0].boundingbox) return { status: 404, json: { erro: 'Não encontrei essa cidade no mapa. Confira o nome e a UF.' } };
    const [s, n, w, e] = geo[0].boundingbox.map(Number);
    const consulta = montarConsulta([s, w, n, e], grupos);
    let dados = null;
    for (const url of OVERPASS) {
      try {
        dados = await achar(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(consulta) });
        break;
      } catch (err) { /* tenta o próximo servidor */ }
    }
    if (!dados) return { status: 502, json: { erro: 'O serviço de mapas está ocupado agora. Tente de novo em alguns minutos.' } };
    const achados = interpretar(dados.elements);
    const existentes = await sb(`rf_pontos?cidade=eq.${encodeURIComponent(cidade)}&select=nome&limit=5000`);
    const ja = new Set(existentes.map((p) => String(p.nome).toLowerCase()));
    const novos = achados.filter((p) => !ja.has(p.nome.toLowerCase()));
    novos.sort((a, b) => b.contatos - a.contatos);
    const linhas = [];
    for (const p of novos.slice(0, quantos)) {
      const { dados: d } = validar({ ...p, cidade, uf });
      if (!d) continue;
      linhas.push({ ...d, codigo: sigla(cidade) + aleatorio(4), token_convite: crypto.randomBytes(12).toString('hex') });
    }
    if (linhas.length) await sb('rf_pontos', { method: 'POST', body: JSON.stringify(linhas) });
    const comContato = linhas.filter((l) => l.contato_whatsapp || l.contato_email).length;
    return { status: 200, json: { encontrados: achados.length, novos: novos.length, cadastrados: linhas.length, com_contato: comContato } };
  } catch (e) {
    console.error('mapear', e.message);
    return { status: 500, json: { erro: 'Não consegui mapear agora: ' + String(e.message).slice(0, 150) } };
  }
}
