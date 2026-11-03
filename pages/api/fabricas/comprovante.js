// Cliente registra uma compra feita no site de uma empresa listada em /fabricas.
// O site só faz as conferências que consegue (chave da nota, empresa, duplicidade); quem aprova é o dono, no painel.
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { emailValido } from '../../../lib/assinaturaServer';
import { avisar } from '../../../lib/avisar';
import { validarChaveNfe, soDigitos } from '../../../lib/fabricasFranca';
import { bonusDias } from '../../../lib/fabricasFrancaServer';

const tentativas = new Map();
function limitar(ip) {
  const agora = Date.now();
  const l = (tentativas.get(ip) || []).filter((t) => agora - t < 60 * 60 * 1000);
  l.push(agora); tentativas.set(ip, l);
  if (tentativas.size > 5000) tentativas.clear();
  return l.length > 6;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (c.site) return res.json({ ok: true }); // campo-armadilha para robôs
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (limitar(ip)) return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo mais tarde.' });

  const nome = txt(c.nome, 120);
  const email = txt(c.email, 120).toLowerCase();
  const whatsapp = soDigitos(c.whatsapp).slice(0, 15);
  const pedido = txt(c.pedido, 60);
  const lojaId = UUID.test(String(c.loja_id || '')) ? String(c.loja_id) : null;
  if (nome.length < 3) return res.status(400).json({ erro: 'Informe seu nome completo.' });
  if (!emailValido(email)) return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  if (whatsapp.length < 10) return res.status(400).json({ erro: 'Informe um WhatsApp com DDD.' });
  if (!lojaId) return res.status(400).json({ erro: 'Escolha em qual empresa você comprou.' });

  const temChave = soDigitos(c.chave).length > 0;
  if (!temChave && pedido.length < 3) return res.status(400).json({ erro: 'Informe a chave da nota fiscal (44 números) ou o número do pedido na loja.' });

  const notas = [];
  let chave = null;
  if (temChave) {
    const v = validarChaveNfe(c.chave);
    if (!v.ok) return res.status(400).json({ erro: v.motivo });
    chave = v.chave;
    notas.push(`Chave válida, emitida em ${v.emissao}${v.recente ? '' : ' (nota com mais de 3 meses)'}`);
  }

  try {
    const [loja] = await sb(`ff_lojas?id=eq.${lojaId}&ativo=eq.true&select=id,nome,cnpj&limit=1`);
    if (!loja) return res.status(400).json({ erro: 'Escolha uma empresa da lista.' });
    if (chave && loja.cnpj) {
      if (chave.slice(6, 20) !== soDigitos(loja.cnpj)) return res.status(400).json({ erro: 'Essa nota não foi emitida pela empresa escolhida. Confira a chave ou a empresa.' });
      notas.push('CNPJ da nota confere com a empresa');
    } else if (chave) {
      notas.push('CNPJ da empresa não cadastrado: conferir à mão');
    }
    if (!chave) notas.push('Sem nota: conferir o pedido à mão');

    const [r] = await sb('ff_comprovantes', {
      method: 'POST',
      body: JSON.stringify({ loja_id: loja.id, nome, email, whatsapp, chave_nfe: chave, pedido_ref: pedido || null, verificacao: notas.join('; ') }),
    });
    avisar(`🧾 Compra registrada #${r.numero} em ${loja.nome} por ${nome}. Confira em /admin/fabricas.`);
    return res.json({ ok: true, protocolo: r.numero, bonus_dias: await bonusDias() });
  } catch (e) {
    if (/duplicate|23505|unique/i.test(e.message)) return res.status(409).json({ erro: 'Essa nota fiscal já foi registrada.' });
    console.error('fabricas/comprovante', e.message);
    return res.status(500).json({ erro: 'Não foi possível registrar agora. Tente de novo ou fale pelo WhatsApp.' });
  }
}
