// Consulta pública do pedido: precisa do número E do e-mail da compra. Devolve só o necessário, nunca CPF, endereço completo nem custo.
import { sb, txt } from '../../../lib/varejoServer';
import { rotuloStatus } from '../../../lib/pedidosStatus';

// Freio simples contra tentativa em massa (por instância; ajuda, não substitui senha).
const tentativas = new Map();
function limitar(ip) {
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter((t) => agora - t < 10 * 60 * 1000);
  lista.push(agora);
  tentativas.set(ip, lista);
  if (tentativas.size > 5000) tentativas.clear();
  return lista.length > 15;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (limitar(ip)) return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos ou fale pelo WhatsApp.' });

  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const numero = parseInt(String(c.numero || '').replace(/\D/g, ''), 10);
  const email = txt(c.email, 120).toLowerCase();
  const naoAchou = { erro: 'Não encontramos esse pedido. Confira o número e o e-mail usados na compra.' };
  if (!Number.isInteger(numero) || numero <= 0 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(404).json(naoAchou);

  try {
    let p;
    try {
      [p] = await sb(`varejo_pedidos?numero=eq.${numero}&email=eq.${encodeURIComponent(email)}&select=numero,criado_em,status,cidade,estado,itens,total,frete,codigo_rastreio,entrega,lote_id&limit=1`);
    } catch (e) {
      [p] = await sb(`varejo_pedidos?numero=eq.${numero}&email=eq.${encodeURIComponent(email)}&select=numero,criado_em,status,cidade,estado,itens,total,frete,codigo_rastreio&limit=1`);
    }
    if (!p) return res.status(404).json(naoAchou);
    let lote = null;
    if (p.lote_id) {
      try {
        const [l] = await sb(`cal_lotes?id=eq.${p.lote_id}&select=status,minimo,data_saida,cidade,estado&limit=1`);
        const quantos = await sb(`varejo_pedidos?lote_id=eq.${p.lote_id}&select=numero`);
        if (l) lote = { status: l.status, minimo: l.minimo, pedidos: quantos.length, data_saida: l.data_saida, cidade: l.cidade, estado: l.estado };
      } catch (e) {}
    }
    return res.json({
      numero: p.numero,
      criado_em: p.criado_em,
      status: p.status,
      rotulo: rotuloStatus(p.status),
      entrega: p.entrega || 'correios',
      cidade: p.cidade,
      estado: p.estado,
      itens: (Array.isArray(p.itens) ? p.itens : []).map((i) => ({ titulo: i.titulo, tamanho: i.tamanho, quantidade: i.quantidade })),
      total: p.total,
      frete: p.frete,
      codigo_rastreio: p.codigo_rastreio || '',
      lote,
    });
  } catch (e) {
    console.error('varejo/acompanhar', e.message);
    return res.status(500).json({ erro: 'Não foi possível consultar agora. Tente de novo ou fale pelo WhatsApp.' });
  }
}
