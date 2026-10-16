// Cadastro público de profissionais parceiros (planejamento rural).
// Sempre grava como "pendente": a aprovação é manual, depois de conferir o registro no conselho.
//
// Variáveis de ambiente (Vercel):
//   SUPABASE_URL e SUPABASE_SERVICE_KEY  -> as mesmas já usadas pela loja
//   N8N_PROFISSIONAL_WEBHOOK (opcional)  -> se existir, o cadastro é enviado ao n8n (que salva e faz a triagem por IA);
//                                           se não existir, o cadastro é gravado direto no Supabase.

const AREAS = ['agronomo', 'eng_civil', 'topografo', 'eng_ambiental', 'advogado', 'contador', 'outro'];
const CONSELHOS = ['CREA', 'CFT', 'OAB', 'CRC', 'outro'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const txt = (v, n) => String(v ?? '').trim().slice(0, n);
const vazioNulo = (s) => (s ? s : null);

function montarProfissional(c) {
  return {
    nome: txt(c.nome, 120),
    email: txt(c.email, 160).toLowerCase(),
    whatsapp: vazioNulo(txt(c.whatsapp, 30).replace(/[^\d+()\- ]/g, '')),
    area: txt(c.area, 30),
    conselho: txt(c.conselho, 20),
    registro: txt(c.registro, 40),
    uf_registro: vazioNulo(txt(c.uf_registro, 2).toUpperCase()),
    cidade: vazioNulo(txt(c.cidade, 80)),
    estado: vazioNulo(txt(c.estado, 2).toUpperCase()),
    raio_km: Number.isFinite(Number(c.raio_km)) && Number(c.raio_km) > 0 ? Math.min(Math.floor(Number(c.raio_km)), 5000) : null,
    atende_remoto: c.atende_remoto === true || c.atende_remoto === 'sim',
    servicos: vazioNulo(txt(c.servicos, 800)),
    faixa_preco: vazioNulo(txt(c.faixa_preco, 120)),
    aceite_termos: true,
    status: 'pendente',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-armadilha para robôs

  const p = montarProfissional(c);
  if (p.nome.length < 3) return res.status(400).json({ erro: 'Informe seu nome completo.' });
  if (!EMAIL.test(p.email)) return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  if (!AREAS.includes(p.area)) return res.status(400).json({ erro: 'Escolha a sua área de atuação.' });
  if (!CONSELHOS.includes(p.conselho)) return res.status(400).json({ erro: 'Escolha o seu conselho profissional.' });
  if (p.registro.length < 3) return res.status(400).json({ erro: 'Informe o número do seu registro no conselho.' });
  if (c.aceite_termos !== true) return res.status(400).json({ erro: 'É preciso aceitar os termos e a política de privacidade.' });

  try {
    const webhook = process.env.N8N_PROFISSIONAL_WEBHOOK;
    if (webhook) {
      const r = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!r.ok) return res.status(502).json({ erro: 'Não foi possível concluir o cadastro agora. Se você já se cadastrou com este e-mail, aguarde o nosso contato.' });
      return res.json({ ok: true });
    }

    const base = process.env.SUPABASE_URL;
    const chave = process.env.SUPABASE_SERVICE_KEY;
    if (!base || !chave) return res.status(500).json({ erro: 'Cadastro temporariamente indisponível. Tente novamente mais tarde.' });
    const r = await fetch(`${base}/rest/v1/profissionais`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        apikey: chave,
        ...(chave.startsWith('eyJ') ? { Authorization: `Bearer ${chave}` } : {}),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(p),
    });
    if (r.status === 409) return res.status(409).json({ erro: 'Este e-mail já está cadastrado. Aguarde o nosso contato.' });
    if (!r.ok) return res.status(502).json({ erro: 'Não foi possível salvar o cadastro agora. Tente novamente em alguns minutos.' });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ erro: 'Não foi possível concluir o cadastro agora. Tente novamente em alguns minutos.' });
  }
}
