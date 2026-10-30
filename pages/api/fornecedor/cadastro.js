// Cadastro público de fornecedor. Fica "pendente" até o dono aprovar; o link do painel é enviado depois, pelo WhatsApp.
import { sb } from '../../../lib/varejoServer';
import { avisar } from '../../../lib/avisar';
import { novoToken, validarEmpresaBasica } from '../../../lib/fornecedoresServer';
import { COMISSAO_PADRAO } from '../../../lib/fornecedores';

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
  if (b.site || !(Number(b.tempo) >= 3000)) return res.json({ ok: true }); // robôs: descarta em silêncio
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (!limite(ip)) return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo mais tarde.' });
  if (b.aceite !== true) return res.status(400).json({ erro: 'Marque a concordância com as regras para continuar.' });
  const { erro, dados } = validarEmpresaBasica(b);
  if (erro) return res.status(400).json({ erro });
  try {
    const repetido = await sb(`forn_empresas?whatsapp=eq.${dados.whatsapp}&select=id&limit=1`);
    if (repetido.length) return res.json({ ok: true, repetido: true });
    await sb('forn_empresas', {
      method: 'POST',
      body: JSON.stringify({ ...dados, token: novoToken(), status: 'pendente', comissao_pct: COMISSAO_PADRAO, aceite_termos_em: new Date().toISOString() }),
    });
    await avisar(`🏭 Novo fornecedor pediu cadastro: ${dados.nome_fantasia} (${dados.responsavel}). Aprove em Fornecedores no painel.`);
    return res.json({ ok: true });
  } catch (e) {
    console.error('fornecedor/cadastro', e.message);
    const faltaSql = /forn_empresas|relation|does not exist/i.test(e.message || '');
    return res.status(500).json({ erro: faltaSql ? 'O cadastro ainda está sendo preparado. Tente mais tarde.' : 'Não foi possível enviar agora. Tente de novo.' });
  }
}
