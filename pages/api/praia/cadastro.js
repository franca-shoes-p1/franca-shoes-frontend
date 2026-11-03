// Inscrição pública no Parceiros da Praia. Guarda só o que o formulário pede; sem promessa de ganho.
import { sb, txt } from '../../../lib/varejoServer';
import { calcularVagas, normCidade } from '../../../lib/praiaAuth';

const recentes = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const agora = Date.now();
  const n = (recentes.get(ip) || []).filter((t) => agora - t < 3600 * 1000);
  if (n.length >= 5) return res.status(429).json({ erro: 'Muitas tentativas. Tente mais tarde.' });
  recentes.set(ip, [...n, agora]);
  const nome = txt(c.nome, 120);
  const telefone = txt(c.telefone, 30).replace(/[^\d+()\s-]/g, '');
  const cidade = txt(c.cidade, 80);
  if (nome.length < 2 || telefone.replace(/\D/g, '').length < 10) return res.status(400).json({ erro: 'Informe seu nome e um WhatsApp com DDD.' });
  if (cidade.length < 2) return res.status(400).json({ erro: 'Informe a sua cidade.' });
  if (c.aceito !== true) return res.status(400).json({ erro: 'Marque que aceita receber contato.' });
  try {
    let lista = false;
    try {
      const v = await calcularVagas();
      const da = v.cidades.find((x) => normCidade(x.cidade) === normCidade(cidade));
      lista = !da || da.livres <= 0; // cidade sem vaga aberta ou fora do piloto: lista de espera
    } catch (e) { lista = true; }
    const corpo = {
      nome, telefone, cidade, bairro: txt(c.bairro, 80) || null, tem_pix: c.tem_pix === true,
      disponibilidade: txt(c.disponibilidade, 200) || null, experiencia: txt(c.experiencia, 400) || null,
      ponto_codigo: null, status: lista ? 'lista_espera' : 'novo', origem: txt(c.origem, 60) || null, aceito_em: new Date().toISOString(),
    };
    const licenca = ['sim', 'andamento', 'nao'].includes(c.licenca) ? c.licenca : null;
    try {
      await sb('praia_candidatos', { method: 'POST', body: JSON.stringify({ ...corpo, tem_licenca: licenca }) });
    } catch (e) {
      // coluna tem_licenca ainda não criada no Supabase: salva sem ela para não perder o cadastro
      if (!/tem_licenca/.test(e.message)) throw e;
      await sb('praia_candidatos', { method: 'POST', body: JSON.stringify(corpo) });
    }
    return res.status(201).json({ ok: true, lista_espera: lista });
  } catch (e) {
    console.error('praia/cadastro', e.message);
    return res.status(500).json({ erro: 'Não foi possível enviar agora. Tente de novo.' });
  }
}
