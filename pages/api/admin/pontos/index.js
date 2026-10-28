// Lista e cadastra pontos do Radar. Só para quem fez login no painel.
import crypto from 'crypto';
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb } from '../../../../lib/varejoServer';
import { validar, sigla, aleatorio } from '../../../../lib/pontosServer';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const pontos = await sb('rf_pontos?select=*&order=cidade.asc,nota.desc,criado_em.asc&limit=2000');
      const contagem = {};
      const vis = await sb('rf_pontos_visitas?select=codigo&limit=20000');
      vis.forEach((v) => { contagem[v.codigo] = contagem[v.codigo] || { visitas: 0, pedidos: 0 }; contagem[v.codigo].visitas++; });
      let ped = [];
      try { ped = await sb('varejo_pedidos?select=observacao&observacao=like.*%5Bponto:*&limit=5000'); } catch (e) {}
      ped.forEach((p) => {
        const m = /\[ponto:([A-Z0-9]+)\]/.exec(p.observacao || '');
        if (m) { contagem[m[1]] = contagem[m[1]] || { visitas: 0, pedidos: 0 }; contagem[m[1]].pedidos++; }
      });
      pontos.forEach((p) => { p.visitas = (contagem[p.codigo] || {}).visitas || 0; p.pedidos = (contagem[p.codigo] || {}).pedidos || 0; });
      return res.json({ pontos });
    }
    if (req.method === 'POST') {
      const corpo = req.body && typeof req.body === 'object' ? req.body : {};
      const lista = Array.isArray(corpo.lote) ? corpo.lote.slice(0, 200) : [corpo];
      const linhas = [];
      for (const c of lista) {
        const { erro, dados } = validar(c);
        if (erro) return res.status(400).json({ erro });
        linhas.push({ ...dados, codigo: sigla(dados.cidade) + aleatorio(4), token_convite: crypto.randomBytes(12).toString('hex') });
      }
      const criados = await sb('rf_pontos', { method: 'POST', body: JSON.stringify(linhas) });
      return res.status(201).json({ pontos: criados });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('admin/pontos', e.message);
    const falta = /rf_pontos/.test(e.message) && /does not exist|relation|schema cache/i.test(e.message);
    return res.status(500).json({ erro: falta ? 'Rode o arquivo supabase-pontos.sql no Supabase primeiro.' : 'Não foi possível concluir: ' + String(e.message).slice(0, 200) });
  }
}
