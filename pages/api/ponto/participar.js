// Inscrição própria: qualquer pessoa pode pedir para participar (divulgar o próprio trabalho ou ceder um espaço).
// A pessoa se cadastra já autorizando; o perfil público só aparece depois da revisão.
import crypto from 'crypto';
import { sb } from '../../../lib/varejoServer';
import { avisar } from '../../../lib/avisar';
import { validar, sigla, aleatorio } from '../../../lib/pontosServer';

const tentativas = new Map(); // limite simples por IP (reinicia quando a instância reinicia)
function limite(ip) {
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter((t) => agora - t < 3600000);
  if (lista.length >= 5) return false;
  lista.push(agora); tentativas.set(ip, lista);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (!(Number(b.tempo) >= 3000)) return res.json({ ok: true }); // robôs enviam rápido demais: descarta em silêncio (sem token)
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (!limite(ip)) return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo mais tarde.' });
  if (b.aceite !== true) return res.status(400).json({ erro: 'Marque a autorização para continuar.' });

  const whats = String(b.whatsapp || '').replace(/\D/g, '');
  const email = String(b.email || '').trim().toLowerCase();
  if (whats && (whats.length < 10 || whats.length > 13)) return res.status(400).json({ erro: 'WhatsApp inválido. Use DDD + número.' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
  if (!whats && !email) return res.status(400).json({ erro: 'Informe um WhatsApp ou um e-mail para contato.' });

  const { erro, dados } = validar({
    nome: b.nome, cidade: b.cidade, uf: b.uf, tipo: b.tipo, endereco: b.local,
    contato_whatsapp: whats ? (whats.length <= 11 ? '55' + whats : whats) : '', contato_email: email,
    observacao: 'Inscrição própria pelo site.', status: 'autorizado',
  });
  if (erro) return res.status(400).json({ erro });
  // o painel guarda o WhatsApp sem o 55 (como no restante do Radar)
  if (dados.contato_whatsapp) dados.contato_whatsapp = dados.contato_whatsapp.replace(/^55/, '');

  try {
    const filtros = [];
    if (dados.contato_whatsapp) filtros.push(`contato_whatsapp.eq.${dados.contato_whatsapp}`);
    if (dados.contato_email) filtros.push(`contato_email.eq.${encodeURIComponent(dados.contato_email)}`);
    const ja = await sb(`rf_pontos?or=(${filtros.join(',')})&select=id&limit=1`);
    if (ja.length) return res.status(409).json({ erro: 'Já temos um cadastro com esse contato. Se perdeu o link do seu painel, chame no WhatsApp.' });
    const token = crypto.randomBytes(12).toString('hex');
    const [criado] = await sb('rf_pontos', { method: 'POST', body: JSON.stringify([{
      ...dados, origem: 'inscricao', respondido_em: new Date().toISOString(),
      codigo: sigla(dados.cidade) + aleatorio(4), token_convite: token,
    }]) });
    await avisar(`🆕 Nova inscrição: ${dados.nome} (${dados.cidade}). Já aparece no passo 2 do Painel do dia.`);
    return res.status(201).json({ ok: true, token, codigo: criado.codigo });
  } catch (e) {
    console.error('ponto/participar', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir agora. Tente mais tarde ou chame no WhatsApp.' });
  }
}
