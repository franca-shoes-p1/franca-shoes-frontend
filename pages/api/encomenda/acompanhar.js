// Acompanhamento da encomenda pelo próprio cliente: consultar, confirmar a cotação ou sair da fila.
// O cliente precisa informar o código da encomenda E o WhatsApp usado no pedido (os dois precisam bater).
import { sb, txt } from '../../../lib/varejoServer';
import { avisar } from '../../../lib/avisar';
import { ENCERRADOS } from '../../../lib/encomendas';

const tentativas = new Map(); // limite simples por IP (reinicia quando a instância reinicia)
function limite(ip) {
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter((t) => agora - t < 3600000);
  if (lista.length >= 30) return false;
  lista.push(agora); tentativas.set(ip, lista);
  return true;
}

const CAMPOS = 'id,codigo,produto,quantidade,numeracao,cidade,uf,status,preco_cotado,melhor_horario,criado_em,observacao';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (!limite(ip)) return res.status(429).json({ erro: 'Muitas consultas. Tente de novo mais tarde ou chame no WhatsApp.' });

  const codigo = txt(b.codigo, 12).toUpperCase().replace(/\s/g, '');
  const whatsapp = String(b.whatsapp || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  const acao = ['consultar', 'confirmar', 'desistir'].includes(b.acao) ? b.acao : 'consultar';
  const naoAchou = 'Não encontramos uma encomenda com esse código e WhatsApp. Confira os dados ou chame no WhatsApp.';
  if (!/^EN[0-9A-F]{6}$/.test(codigo) || whatsapp.length < 10 || whatsapp.length > 11) return res.status(404).json({ erro: naoAchou });

  try {
    const achou = await sb(`rf_encomendas?codigo=eq.${codigo}&whatsapp=eq.${whatsapp}&select=${CAMPOS}&limit=1`);
    if (!achou.length) return res.status(404).json({ erro: naoAchou });
    let e = achou[0];

    if (acao === 'confirmar') {
      if (e.status !== 'cotado') return res.status(409).json({ erro: 'Esta encomenda não está aguardando a sua confirmação agora.' });
      await sb(`rf_encomendas?id=eq.${e.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'aguardando_lote', atualizado_em: new Date().toISOString() }) });
      e = { ...e, status: 'aguardando_lote' };
      await avisar(`✅ Cliente confirmou a cotação: ${codigo} · ${e.cidade}/${e.uf}`);
    }
    if (acao === 'desistir') {
      if (ENCERRADOS.includes(e.status)) return res.status(409).json({ erro: 'Esta encomenda já foi encerrada.' });
      const nota = `${e.observacao ? e.observacao + ' | ' : ''}Saiu da fila pelo site em ${new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (situação anterior: ${e.status})`;
      await sb(`rf_encomendas?id=eq.${e.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'desistiu', observacao: nota.slice(0, 600), atualizado_em: new Date().toISOString() }) });
      e = { ...e, status: 'desistiu' };
      await avisar(`🚪 Cliente saiu da fila: ${codigo} · ${e.cidade}/${e.uf}`);
    }

    const { id, observacao, ...publico } = e; // nada interno vai para o navegador
    return res.json({ ok: true, encomenda: publico });
  } catch (err) {
    console.error('encomenda/acompanhar', err.message);
    return res.status(500).json({ erro: 'Não foi possível consultar agora. Tente mais tarde ou chame no WhatsApp.' });
  }
}
