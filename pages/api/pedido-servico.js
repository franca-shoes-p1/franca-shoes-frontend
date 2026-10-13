// Recebe o pedido de serviço do site e repassa ao n8n (que avisa no WhatsApp).
// A URL do n8n fica em variável de ambiente no Vercel, nunca no código.
//   N8N_PEDIDO_WEBHOOK_URL  -> endereço do webhook de produção do n8n
//   N8N_PEDIDO_SECRET       -> senha combinada com o n8n (cabeçalho x-portal-secret)

const SERVICOS_VALIDOS = [
  'Atendimento automático',
  'Conteúdo automático',
  'Site ou portal',
  'Painel de gestão',
  'Instalação personalizada',
  'Pacote pronto para comércio',
  'Outro / ainda não sei',
];

const limpar = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  }

  const corpo = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  // Campo-isca: pessoas não veem, robôs preenchem. Finge sucesso e descarta.
  if (corpo.site) return res.status(200).json({ ok: true });

  const pedido = {
    nome: limpar(corpo.nome, 80),
    whatsapp: limpar(corpo.whatsapp, 25),
    email: limpar(corpo.email, 120),
    servico: limpar(corpo.servico, 60),
    cidade: limpar(corpo.cidade, 80),
    mensagem: limpar(corpo.mensagem, 1200),
  };

  const digitos = pedido.whatsapp.replace(/\D/g, '');
  if (pedido.nome.length < 2) return res.status(400).json({ ok: false, erro: 'Informe o seu nome.' });
  if (digitos.length < 10 || digitos.length > 13)
    return res.status(400).json({ ok: false, erro: 'Informe um WhatsApp válido, com DDD.' });
  if (pedido.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pedido.email))
    return res.status(400).json({ ok: false, erro: 'O e-mail informado não parece válido.' });
  if (!SERVICOS_VALIDOS.includes(pedido.servico))
    return res.status(400).json({ ok: false, erro: 'Escolha o tipo de serviço.' });
  if (pedido.mensagem.length < 10)
    return res.status(400).json({ ok: false, erro: 'Conte em poucas palavras o que você precisa.' });
  if (corpo.aceite !== true)
    return res.status(400).json({ ok: false, erro: 'É preciso concordar com o uso dos dados para o contato.' });

  pedido.whatsapp = digitos;

  const url = process.env.N8N_PEDIDO_WEBHOOK_URL;
  if (!url) {
    console.error('N8N_PEDIDO_WEBHOOK_URL não configurada');
    return res.status(503).json({ ok: false, erro: 'Atendimento indisponível no momento.' });
  }

  const controle = new AbortController();
  const tempo = setTimeout(() => controle.abort(), 10000);
  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-portal-secret': process.env.N8N_PEDIDO_SECRET || '',
      },
      body: JSON.stringify({ ...pedido, origem: 'igreja.eco.br', recebidoEm: new Date().toISOString() }),
      signal: controle.signal,
    });
    if (!resposta.ok) {
      console.error('n8n respondeu', resposta.status);
      return res.status(502).json({ ok: false, erro: 'Não foi possível registrar o pedido agora.' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Falha ao chamar o n8n:', e && e.message);
    return res.status(502).json({ ok: false, erro: 'Não foi possível registrar o pedido agora.' });
  } finally {
    clearTimeout(tempo);
  }
}

function safeParse(texto) {
  try {
    return JSON.parse(texto);
  } catch {
    return {};
  }
}
