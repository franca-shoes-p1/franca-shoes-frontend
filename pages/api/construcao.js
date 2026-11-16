// Pedido de Construção (público): grava o pedido e as respostas do briefing no Supabase,
// monta o script do pedido e avisa o dono no Telegram (via n8n). Só o servidor acessa as tabelas.
import { avisar } from '../../lib/avisar';
import { BLOCOS, montarScript } from '../../lib/construcaoScript';

const TIPOS = ['Comércio', 'Serviço', 'Produto próprio', 'Conteúdo ou curso', 'Ainda não sei'];
const BLOCO_CHAVES = BLOCOS.map(([k]) => k);

const txt = (v, n) => String(v ?? '').trim().slice(0, n);

const recentes = new Map();
function limite(ip) {
  const agora = Date.now();
  const lista = (recentes.get(ip) || []).filter((t) => agora - t < 10 * 60 * 1000);
  if (lista.length >= 6) return false;
  lista.push(agora);
  recentes.set(ip, lista);
  if (recentes.size > 2000) recentes.clear();
  return true;
}

async function sb(caminho, init = {}) {
  const base = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !chave) throw new Error('config');
  const r = await fetch(`${base}/rest/v1/${caminho}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: chave,
      ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });
  const t = await r.text();
  if (!r.ok) throw new Error('db');
  return t ? JSON.parse(t) : [];
}

// Aceita só { bloco conhecido: { campo: texto } }, com limites. Nada vem do navegador sem ser limpo.
function limparRespostas(bruto) {
  const saida = {};
  if (!bruto || typeof bruto !== 'object') return saida;
  let total = 0;
  for (const bloco of BLOCO_CHAVES) {
    const campos = bruto[bloco];
    if (!campos || typeof campos !== 'object') continue;
    saida[bloco] = {};
    for (const [k, v] of Object.entries(campos)) {
      if (total >= 40) break;
      const chave = txt(k, 60);
      if (!chave) continue;
      saida[bloco][chave] = txt(Array.isArray(v) ? v.join(', ') : v, 500);
      total += 1;
    }
  }
  return saida;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-armadilha para robôs

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (!limite(ip)) return res.status(429).json({ ok: false, erro: 'Muitas tentativas. Tente de novo em alguns minutos.' });

  const nome = txt(c.nome, 120);
  const whatsapp = txt(c.whatsapp, 30).replace(/[^\d+()\- ]/g, '');
  if (nome.length < 2 || whatsapp.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ ok: false, erro: 'Informe seu nome e um WhatsApp com DDD.' });
  }
  const tipo = TIPOS.includes(c.tipo_negocio) ? c.tipo_negocio : 'Ainda não sei';
  const respostas = limparRespostas(c.respostas);

  try {
    const [p] = await sb('op_construcao_pedidos', {
      method: 'POST',
      body: JSON.stringify({
        nome,
        whatsapp,
        tipo,
        segmento: txt(c.segmento, 120) || null,
        status: 'enviado',
        pacote_atendente: c.pacote_atendente === true,
        nivel: c.pacote_atendente === true ? 'projeto_atendente' : 'projeto',
        prazo: txt(c.prazo, 80) || null,
      }),
    });

    const linhas = [];
    for (const [bloco, campos] of Object.entries(respostas)) {
      for (const [campo, valor] of Object.entries(campos)) linhas.push({ pedido_id: p.id, bloco, campo, valor });
    }
    if (linhas.length) {
      try { await sb('op_construcao_respostas', { method: 'POST', body: JSON.stringify(linhas) }); } catch (e) { console.error('construcao respostas', e.message); }
    }

    const script = montarScript(p, respostas);
    try {
      await sb(`op_construcao_pedidos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ script }) });
    } catch (e) { console.error('construcao script', e.message); }

    await avisar(`🧱 Novo pedido de construção\n\n${script}`);
    return res.json({ ok: true, numero: p.numero, codigo: p.codigo_retomada });
  } catch (e) {
    console.error('construcao', e.message);
    return res.status(500).json({ ok: false, erro: 'Não conseguimos registrar agora.' });
  }
}
