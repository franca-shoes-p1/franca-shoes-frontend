// Cadastro de membro (público): grava no Supabase e avisa o dono no Telegram (via n8n). Só o servidor acessa a tabela.
import { avisar } from '../../lib/avisar';
import { sb } from '../../lib/varejoServer';

const txt = (v, n) => String(Array.isArray(v) ? v.join(', ') : v ?? '').trim().slice(0, n);

const recentes = new Map();
function limite(ip) {
  const agora = Date.now();
  const lista = (recentes.get(ip) || []).filter((t) => agora - t < 10 * 60 * 1000);
  if (lista.length >= 5) return false;
  lista.push(agora);
  recentes.set(ip, lista);
  if (recentes.size > 2000) recentes.clear();
  return true;
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
  if (c.aceite !== true || c.dados_autorizados !== true || (c.maior_18 !== true && c.responsavel_menor !== true)) {
    return res.status(400).json({ ok: false, erro: 'Para o cadastro é preciso aceitar a declaração de fé, os compromissos e o uso dos dados.' });
  }

  try {
    const [m] = await sb('igreja_membros', {
      method: 'POST',
      body: JSON.stringify({
        nome, whatsapp,
        cidade: txt(c.cidade, 80) || null,
        conheceu: txt(c.conheceu, 80) || null,
        servir: txt(c.servir, 300) || null,
        grupos: txt(c.grupos, 300) || null,
        horario: txt(c.horario, 80) || null,
        obs: txt(c.obs, 500) || null,
        aceite: true,
        maior_18: c.maior_18 === true,
        responsavel_menor: c.responsavel_menor === true && c.maior_18 !== true,
        dados_autorizados: true,
      }),
    });
    try {
      await avisar(`🙏 Novo membro nº ${m.numero}\n\n${nome} · ${whatsapp}\nCidade: ${m.cidade || 'não informada'}\nServir: ${m.servir || 'a definir'}\nGrupos: ${m.grupos || 'a definir'}${m.responsavel_menor ? '\n⚠️ Responsável por menor de 18 anos' : ''}`);
    } catch (e) { /* o aviso é opcional */ }
    return res.json({ ok: true, numero: m.numero });
  } catch (e) {
    console.error('membro', e.message);
    return res.status(500).json({ ok: false, erro: 'Não conseguimos registrar agora.' });
  }
}
