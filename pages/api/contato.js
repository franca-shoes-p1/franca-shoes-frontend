// "Fale conosco" (/contato): grava em op_contatos (Supabase) e avisa o n8n.
// Nada que vem do navegador entra sem ser limpo e limitado.
import { sb, txt } from '../../lib/varejoServer';
import { avisarAtendimento, criarLimite } from '../../lib/avisoServer';
import { ASSUNTOS } from '../../lib/atendimento';

const permitir = criarLimite(6, 10 * 60 * 1000);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  }
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-isca: robôs preenchem, pessoas não

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
  if (!permitir(ip)) return res.status(429).json({ ok: false, erro: 'Muitas tentativas. Tente de novo em alguns minutos.' });

  const nome = txt(c.nome, 120);
  const whatsapp = txt(c.whatsapp, 30).replace(/[^\d+()\- ]/g, '');
  const email = txt(c.email, 160).toLowerCase();
  const mensagem = txt(c.mensagem, 1500);
  const assunto = ASSUNTOS.includes(c.assunto) ? c.assunto : 'Outro assunto';
  const pagina = txt(c.pagina, 80).replace(/[^\w\-/.?=&%]/g, '') || null;

  const zapOk = whatsapp.replace(/\D/g, '').length >= 10;
  const emailOk = EMAIL.test(email);
  if (nome.length < 2) return res.status(400).json({ ok: false, erro: 'Informe o seu nome.' });
  if (!zapOk && !emailOk) return res.status(400).json({ ok: false, erro: 'Informe um WhatsApp com DDD ou um e-mail válido, para podermos responder.' });
  if (mensagem.length < 3) return res.status(400).json({ ok: false, erro: 'Escreva a sua mensagem.' });
  if (c.aceito !== true) return res.status(400).json({ ok: false, erro: 'Marque que aceita receber a nossa resposta.' });

  try {
    const [r] = await sb('op_contatos', {
      method: 'POST',
      body: JSON.stringify({
        nome,
        whatsapp: zapOk ? whatsapp : null,
        email: emailOk ? email : null,
        assunto,
        mensagem,
        pagina,
      }),
    });
    await avisarAtendimento({
      evento: 'contato_novo',
      numero: r.numero,
      nome,
      whatsapp: zapOk ? whatsapp : '',
      email: emailOk ? email : '',
      assunto,
      mensagem,
      pagina: pagina || '',
    });
    return res.json({ ok: true, numero: r.numero });
  } catch (e) {
    console.error('contato', e.message);
    return res.status(500).json({ ok: false, erro: 'Não foi possível enviar agora.' });
  }
}
