// Entrar na área do cliente: e-mail + número de um pedido pago. Cria uma sessão assinada (cookie).
import { sb, txt } from '../../../lib/varejoServer';
import { criarCookieMembro, emailValido } from '../../../lib/assinaturaServer';

const tentativas = new Map();
function limitar(ip) {
  const agora = Date.now();
  const l = (tentativas.get(ip) || []).filter((t) => agora - t < 10 * 60 * 1000);
  l.push(agora); tentativas.set(ip, l);
  if (tentativas.size > 5000) tentativas.clear();
  return l.length > 10;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (limitar(ip)) return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const email = txt(c.email, 120).toLowerCase();
  const numero = parseInt(String(c.numero || '').replace(/\D/g, ''), 10);
  const nao = { erro: 'Não encontramos uma compra paga com esses dados. Confira o e-mail e o número do pedido.' };
  if (!emailValido(email) || !Number.isInteger(numero) || numero <= 0) return res.status(404).json(nao);
  try {
    let [p] = await sb(`varejo_pedidos?numero=eq.${numero}&email=eq.${encodeURIComponent(email)}&status=in.(pago,em_compra_fabrica,enviado,entregue)&select=numero&limit=1`);
    if (!p) {
      // Compra feita no site de uma fábrica listada em /fabricas e aprovada no painel: o protocolo funciona como número do pedido.
      try { [p] = await sb(`ff_comprovantes?numero=eq.${numero}&email=eq.${encodeURIComponent(email)}&status=eq.aprovado&select=numero&limit=1`); } catch (e) { /* SQL das fábricas ainda não rodado */ }
    }
    if (!p) return res.status(404).json(nao);
    res.setHeader('Set-Cookie', criarCookieMembro(email));
    return res.json({ ok: true });
  } catch (e) {
    console.error('membro/entrar', e.message);
    return res.status(500).json({ erro: 'Não foi possível entrar agora. Tente de novo.' });
  }
}
