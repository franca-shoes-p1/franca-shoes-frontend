// Cadastro público de revendedor. Fica "pendente" até o dono aprovar; o link do painel é enviado depois, pelo WhatsApp.
import { sb } from '../../../lib/varejoServer';
import { avisar } from '../../../lib/avisar';
import { novoToken, novoCodigo, validarRevBasica } from '../../../lib/revendedoresServer';
import { MARGEM_PADRAO } from '../../../lib/revendedores';

const tentativas = new Map();
function limite(ip) {
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter((t) => agora - t < 3600000);
  if (lista.length >= 4) return false;
  lista.push(agora); tentativas.set(ip, lista);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (b.site || !(Number(b.tempo) >= 3000)) return res.json({ ok: true });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (!limite(ip)) return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo mais tarde.' });
  if (b.aceite !== true) return res.status(400).json({ erro: 'Marque a concordância com as regras para continuar.' });
  const { erro, dados } = validarRevBasica(b);
  if (erro) return res.status(400).json({ erro });
  try {
    const repetido = await sb(`rev_revendedores?whatsapp=eq.${dados.whatsapp}&select=id&limit=1`);
    if (repetido.length) return res.json({ ok: true, repetido: true });
    await sb('rev_revendedores', {
      method: 'POST',
      body: JSON.stringify({ ...dados, token: novoToken(), codigo: novoCodigo(), status: 'pendente', margem_pct: MARGEM_PADRAO, aceite_termos_em: new Date().toISOString() }),
    });
    await avisar(`🤝 Novo revendedor pediu cadastro: ${dados.nome} (${dados.cidade}/${dados.estado}). Aprove em Revendedores no painel.`);
    return res.json({ ok: true });
  } catch (e) {
    console.error('revendedor/cadastro', e.message);
    const faltaSql = /rev_revendedores|relation|does not exist/i.test(e.message || '');
    return res.status(500).json({ erro: faltaSql ? 'O cadastro ainda está sendo preparado. Tente mais tarde.' : 'Não foi possível enviar agora. Tente de novo.' });
  }
}
