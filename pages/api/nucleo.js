import { timingSafeEqual } from 'crypto';

// Variáveis de ambiente (configurar no Vercel, nunca no código):
//   SUPABASE_URL, SUPABASE_SERVICE_KEY, NUCLEO_SENHA, GEMINI_API_KEY (opcional)

const REAL = {
  fornecedores: 'rf_fornecedores',
  produtos: 'rf_produtos',
  interacoes: 'rf_interacoes',
  tarefas: 'rf_tarefas',
  pedidos: 'rf_pedidos',
};
const TABELAS = Object.keys(REAL);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FILTRO = /^[a-z_]+=eq\.[0-9a-f-]{36}$/i;
const ORDEM = /^[a-z_]+\.(asc|desc)$/;

function senhaOk(enviada) {
  const certa = process.env.NUCLEO_SENHA;
  if (!certa || !enviada) return false;
  const a = Buffer.from(String(enviada));
  const b = Buffer.from(certa);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function sb(caminho, init = {}) {
  const base = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !chave) throw new Error('Faltam SUPABASE_URL ou SUPABASE_SERVICE_KEY no Vercel.');
  const r = await fetch(`${base}/rest/v1/${caminho}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: chave,
      // Chave nova (sb_secret_...) vai só em apikey; chave antiga (eyJ...) também vai em Authorization.
      ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${texto.slice(0, 200)}`);
  return texto ? JSON.parse(texto) : [];
}

async function extrairComIA(texto) {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error('Falta GEMINI_API_KEY no Vercel.');
  const modelo = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt =
    'Você lê a resposta de uma fábrica de calçados de Franca-SP a um revendedor. ' +
    'Extraia SOMENTE o que está escrito no texto. Se algo não foi dito, use null. ' +
    'Responda em JSON com estas chaves: minimo_pedido (texto), aceita_terceiro ("sim"|"nao"|null), ' +
    'nf_nome_cliente ("sim"|"nao"|null), autoriza_fotos ("sim"|"nao"|null), vende_cpf ("sim"|"nao"|null), ' +
    'troca (texto), prazo (texto), observacoes (texto curto), ' +
    'produtos (lista de {nome, descricao, custo (número em reais), tamanhos}).\n\nTEXTO:\n' +
    String(texto).slice(0, 8000);
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      }),
    }
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  const j = await r.json();
  const bruto = j?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(bruto);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const corpo = req.body && typeof req.body === 'object' ? req.body : {};
  if (!senhaOk(corpo.senha)) return res.status(401).json({ erro: 'Senha incorreta.' });
  try {
    const { acao, tabela, id, dados, filtro, ordem } = corpo;
    if (acao === 'entrar') return res.json({ dados: true });
    if (acao === 'extrair') return res.json({ dados: await extrairComIA(corpo.texto) });
    if (!TABELAS.includes(tabela)) return res.status(400).json({ erro: 'Tabela inválida.' });
    if (id && !UUID.test(id)) return res.status(400).json({ erro: 'Id inválido.' });
    if (acao === 'listar') {
      const partes = ['select=*'];
      if (filtro) {
        if (!FILTRO.test(filtro)) return res.status(400).json({ erro: 'Filtro inválido.' });
        partes.push(filtro);
      }
      if (ordem) {
        if (!ORDEM.test(ordem)) return res.status(400).json({ erro: 'Ordem inválida.' });
        partes.push(`order=${ordem}`);
      }
      return res.json({ dados: await sb(`${REAL[tabela]}?${partes.join('&')}&limit=500`) });
    }
    if (acao === 'criar') return res.json({ dados: await sb(REAL[tabela], { method: 'POST', body: JSON.stringify(dados) }) });
    if (acao === 'atualizar' && id) {
      return res.json({ dados: await sb(`${REAL[tabela]}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(dados) }) });
    }
    if (acao === 'apagar' && id) return res.json({ dados: await sb(`${REAL[tabela]}?id=eq.${id}`, { method: 'DELETE' }) });
    return res.status(400).json({ erro: 'Ação inválida.' });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
