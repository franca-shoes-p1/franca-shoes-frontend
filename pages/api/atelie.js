// Formulários do Ateliê Sob Medida (/atelie): grava no Supabase (tabelas op_atelie_*) e avisa o n8n.
import { registrarIndicacao } from '../../lib/ref';
// Só aceita dois tipos: 'pedido' (cliente) e 'montador' (candidato). Nada vem do navegador sem ser limpo e limitado.

const SERVICOS = [
  'Site ou página de vendas',
  'Agente de WhatsApp com IA',
  'Automação de processo',
  'Textos, artes ou vídeos',
  'Sistema ou painel sob medida',
  'Consultoria de escopo',
  'Mentoria',
  'Ainda não sei, preciso de ajuda para definir',
  'Loja de Calçados Pronta',
  'Tarefa avulsa da Oficina',
];
const SETORES = [
  'Briefing e atendimento',
  'Texto',
  'Design',
  'Montagem de páginas',
  'Agentes e automações',
  'Testes e suporte',
];

const txt = (v, n) => String(v ?? '').trim().slice(0, n);

// limite simples por endereço (vale por instância; segura o abuso comum)
const recentes = new Map();
function limite(ip) {
  const agora = Date.now();
  const lista = (recentes.get(ip) || []).filter((t) => agora - t < 10 * 60 * 1000);
  if (lista.length >= 8) return false;
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

async function avisarN8n(corpo) {
  const url = process.env.N8N_WEBHOOK_ATELIE;
  if (!url) return;
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 8000);
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-token': process.env.N8N_WEBHOOK_TOKEN_ATELIE || process.env.N8N_WEBHOOK_TOKEN || '' },
      body: JSON.stringify(corpo),
      signal: controle.signal,
    });
  } catch (e) {
    console.error('n8n atelie', e.message);
  } finally {
    clearTimeout(timer);
  }
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

  try {
    if (c.tipo === 'pedido') {
      const servico = SERVICOS.includes(c.servico) ? c.servico : 'Ainda não sei, preciso de ajuda para definir';
      const [r] = await sb('op_atelie_pedidos', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          whatsapp,
          servico,
          descricao: txt(c.descricao, 1500) || null,
          prazo: txt(c.prazo, 80) || null,
        }),
      });
      await registrarIndicacao({ req, tipo: 'pedido', pedidoId: r.id, nome, whatsapp });
      await avisarN8n({
        evento: 'atelie_pedido',
        numero: r.numero,
        nome,
        whatsapp,
        servico,
        descricao: r.descricao,
        prazo: r.prazo,
      });
      return res.json({ ok: true, numero: r.numero });
    }

    if (c.tipo === 'montador') {
      const setor = SETORES.includes(c.setor) ? c.setor : null;
      if (!setor) return res.status(400).json({ ok: false, erro: 'Escolha um setor.' });
      const [r] = await sb('op_atelie_candidatos', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          whatsapp,
          setor,
          disponibilidade: txt(c.disponibilidade, 200) || null,
          experiencia: txt(c.experiencia, 1500) || null,
        }),
      });
      await avisarN8n({
        evento: 'atelie_montador',
        numero: r.numero,
        nome,
        whatsapp,
        setor,
        disponibilidade: r.disponibilidade,
        experiencia: r.experiencia,
      });
      return res.json({ ok: true, numero: r.numero });
    }

    return res.status(400).json({ ok: false, erro: 'Pedido inválido.' });
  } catch (e) {
    console.error('atelie', e.message);
    return res.status(500).json({ ok: false, erro: 'Não foi possível registrar agora.' });
  }
}
