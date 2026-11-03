// Painel da vitrine "Fábricas de Franca": empresas listadas, cliques e compras registradas pelos clientes.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { limparSlug } from '../../../lib/supabaseServer';
import { SEGMENTOS, soDigitos } from '../../../lib/fabricasFranca';
import { bonusDias, concederBonus } from '../../../lib/fabricasFrancaServer';

const httpsOk = (u) => { try { const x = new URL(u); return x.protocol === 'https:' && !x.username && !x.password; } catch (e) { return false; } };

async function carregar() {
  let lojas;
  try { lojas = await sb('ff_lojas?select=*&order=ordem.asc,nome.asc&limit=300'); } catch (e) { return { semSql: true }; }
  const desde = new Date(Date.now() - 30 * 86400000).toISOString();
  const cliques = await sb(`ff_cliques?criado_em=gte.${desde}&select=loja_id,criado_em,visitante&limit=20000`).catch(() => []);
  const corte7 = Date.now() - 7 * 86400000;
  // Cada pessoa conta uma vez por dia por empresa (a marca anônima muda todo dia).
  const vistos7 = new Set();
  const vistos30 = new Set();
  const cont = {};
  cliques.forEach((c) => {
    const o = cont[c.loja_id] || (cont[c.loja_id] = { d7: 0, d30: 0 });
    const chave = `${c.loja_id}|${c.visitante || c.criado_em}`;
    if (!vistos30.has(chave)) { vistos30.add(chave); o.d30 += 1; }
    if (Date.parse(c.criado_em) >= corte7 && !vistos7.has(chave)) { vistos7.add(chave); o.d7 += 1; }
  });
  const comp = await sb('ff_comprovantes?select=*&order=criado_em.desc&limit=200').catch(() => []);
  const nomes = Object.fromEntries(lojas.map((l) => [l.id, l.nome]));
  return { lojas, cont, comprovantes: comp.map((c) => ({ ...c, loja: nomes[c.loja_id] || '' })), bonus_dias: await bonusDias() };
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.json(await carregar());
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const b = req.body || {};
    const id = String(b.id || '');
    let aviso = '';
    switch (b.acao) {
      case 'salvar': {
        const nome = txt(b.nome, 120);
        const site_url = txt(b.site_url, 300);
        const segmento = String(b.segmento || 'calcados');
        const cnpj = soDigitos(b.cnpj);
        const ate = txt(b.patrocinio_ate, 10);
        if (nome.length < 3) return res.status(400).json({ erro: 'Informe o nome da empresa.' });
        if (!httpsOk(site_url)) return res.status(400).json({ erro: 'O endereço do site precisa começar com https://' });
        if (!SEGMENTOS[segmento]) return res.status(400).json({ erro: 'Segmento inválido.' });
        if (cnpj && cnpj.length !== 14) return res.status(400).json({ erro: 'O CNPJ tem 14 números (ou deixe em branco).' });
        if (ate && !/^\d{4}-\d{2}-\d{2}$/.test(ate)) return res.status(400).json({ erro: 'Data do patrocínio inválida.' });
        const ordem = Math.min(9999, Math.max(0, parseInt(b.ordem, 10) || 100));
        const corpo = {
          nome, site_url, segmento,
          cidade: txt(b.cidade, 80) || 'Franca, SP',
          descricao: txt(b.descricao, 400) || null,
          cnpj: cnpj || null,
          patrocinada: !!b.patrocinada,
          patrocinio_ate: ate || null,
          patrocinio_obs: txt(b.patrocinio_obs, 300) || null,
          ordem,
          ativo: b.ativo !== false,
        };
        try {
          if (UUID.test(id)) await sb(`ff_lojas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(corpo) });
          else await sb('ff_lojas', { method: 'POST', body: JSON.stringify({ ...corpo, slug: limparSlug(b.slug || nome) || `empresa-${Date.now()}` }) });
        } catch (e) {
          if (/duplicate|23505|unique/i.test(e.message)) return res.status(400).json({ erro: 'Já existe uma empresa com esse nome/endereço curto. Mude o nome um pouco.' });
          throw e;
        }
        aviso = 'Empresa salva.';
        break;
      }
      case 'ativo': {
        if (!UUID.test(id)) return res.status(400).json({ erro: 'Empresa inválida.' });
        await sb(`ff_lojas?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ativo: !!b.ativo }) });
        aviso = b.ativo ? 'Empresa publicada.' : 'Empresa ocultada da página.';
        break;
      }
      case 'aprovar': {
        if (!UUID.test(id)) return res.status(400).json({ erro: 'Registro inválido.' });
        const [c] = await sb(`ff_comprovantes?id=eq.${id}&select=*&limit=1`);
        if (!c) return res.status(404).json({ erro: 'Registro não encontrado.' });
        if (c.status !== 'pendente') return res.status(400).json({ erro: 'Este registro já foi decidido.' });
        const pedido = parseInt(b.dias, 10);
        const dias = Number.isInteger(pedido) ? Math.min(365, Math.max(0, pedido)) : await bonusDias();
        if (dias > 0) await concederBonus({ email: c.email, nome: c.nome, whatsapp: c.whatsapp, dias });
        await sb(`ff_comprovantes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'aprovado', bonus_dias: dias, decidido_em: new Date().toISOString() }) });
        aviso = dias > 0 ? `Aprovado. ${dias} dias de passe liberados para ${c.email}.` : 'Aprovado (sem bônus).';
        break;
      }
      case 'recusar': {
        if (!UUID.test(id)) return res.status(400).json({ erro: 'Registro inválido.' });
        await sb(`ff_comprovantes?id=eq.${id}&status=eq.pendente`, { method: 'PATCH', body: JSON.stringify({ status: 'recusado', motivo: txt(b.motivo, 200) || null, decidido_em: new Date().toISOString() }) });
        aviso = 'Registro recusado.';
        break;
      }
      case 'bonus': {
        const dias = parseInt(b.dias, 10);
        if (!Number.isInteger(dias) || dias < 0 || dias > 365) return res.status(400).json({ erro: 'Use um número de 0 a 365.' });
        const achou = await sb('cal_config?chave=eq.ff_bonus_dias&select=chave&limit=1').catch(() => { throw new Error('Falta rodar o SQL do passe de assinante (supabase-assinatura.sql).'); });
        if (achou.length) await sb('cal_config?chave=eq.ff_bonus_dias', { method: 'PATCH', body: JSON.stringify({ valor: String(dias) }) });
        else await sb('cal_config', { method: 'POST', body: JSON.stringify({ chave: 'ff_bonus_dias', valor: String(dias) }) });
        aviso = dias > 0 ? `Bônus de ${dias} dias.` : 'Bônus desligado.';
        break;
      }
      default:
        return res.status(400).json({ erro: 'Ação desconhecida.' });
    }
    return res.json({ ...(await carregar()), aviso });
  } catch (e) {
    console.error('admin/fabricas', e.message);
    return res.status(500).json({ erro: e.message && !/^db:|config/.test(e.message) ? e.message : 'Não foi possível concluir agora. Tente de novo.' });
  }
}
