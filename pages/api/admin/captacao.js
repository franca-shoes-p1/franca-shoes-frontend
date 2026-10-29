// Semana de captação e tarefas: dados do painel /admin/captacao.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { PRIMEIRA_FASE } from '../../../lib/pontos';
import { codigoMaterial } from '../../../lib/material';
import { planoSemana, QUOTA_CONVITES, CATEGORIAS, hojeSP, difDias } from '../../../lib/semanaCaptacao';

const tem = (p) => /^\d{11}$/.test(String(p.contato_whatsapp || '')) || !!p.contato_email;
const DATA = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const hoje = hojeSP();
      let tarefas = [];
      try { tarefas = await sb('rf_tarefas?select=*&order=data_prevista.asc,criado_em.asc&limit=600'); }
      catch (e) { return res.json({ semSql: true, tarefas: [], funil: [], hoje }); }
      const pontos = await sb('rf_pontos?select=cidade,status,contato_whatsapp,contato_email,convidado_em&limit=5000');
      const inicioHoje = new Date(hoje + 'T00:00:00-03:00').getTime();
      const convitesHoje = pontos.filter((p) => p.convidado_em && new Date(p.convidado_em).getTime() >= inicioHoje).length;
      const plano = tarefas.filter((t) => t.origem === 'plano');
      const inicio = plano.length ? plano.map((t) => t.data_prevista).sort()[0] : null;
      const dia = inicio ? difDias(hoje, inicio) + 1 : null;
      const quota = dia ? QUOTA_CONVITES[Math.min(dia, 7) - 1] : null;
      let visMat = [];
      try { visMat = await sb('rf_pontos_visitas?codigo=like.X*&select=codigo&limit=20000'); } catch (e) { visMat = []; }
      const cidades = Array.from(new Set([...PRIMEIRA_FASE, ...pontos.map((p) => p.cidade)])).filter((c) => PRIMEIRA_FASE.includes(c) || pontos.some((p) => p.cidade === c && p.status !== 'mapeado'));
      const funil = cidades.map((c) => {
        const l = pontos.filter((p) => p.cidade === c);
        const n = (s) => l.filter((p) => p.status === s).length;
        return { cidade: c, total: l.length, comContato: l.filter(tem).length, convidado: n('convidado'), autorizado: n('autorizado'), ativo: n('ativo'), recusado: n('recusado'), visitasMaterial: visMat.filter((v) => v.codigo === codigoMaterial(c, 'panfleto') || v.codigo === codigoMaterial(c, 'cartao')).length };
      });
      return res.json({ tarefas, funil, hoje, inicio, dia, quota, convitesHoje });
    }
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const b = req.body || {};
    if (b.acao === 'iniciar') {
      const inicio = DATA.test(String(b.inicio || '')) ? b.inicio : hojeSP();
      await sb('rf_tarefas?origem=eq.plano&status=eq.pendente', { method: 'DELETE' });
      await sb('rf_tarefas?on_conflict=chave', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(planoSemana(inicio)) });
      return res.json({ ok: true });
    }
    if (b.acao === 'nova') {
      const titulo = txt(b.titulo, 160);
      if (!titulo) return res.status(400).json({ erro: 'Escreva o que precisa ser feito.' });
      const cat = CATEGORIAS[b.categoria] ? b.categoria : 'geral';
      await sb('rf_tarefas', { method: 'POST', body: JSON.stringify([{ titulo, detalhe: txt(b.detalhe, 600) || null, cidade: txt(b.cidade, 80) || null, categoria: cat, data_prevista: DATA.test(String(b.data || '')) ? b.data : hojeSP(), origem: 'manual' }]) });
      return res.json({ ok: true });
    }
    if (!UUID.test(String(b.id || ''))) return res.status(400).json({ erro: 'Tarefa inválida.' });
    if (b.acao === 'estado') {
      const feito = b.status === 'feito';
      await sb(`rf_tarefas?id=eq.${b.id}`, { method: 'PATCH', body: JSON.stringify({ status: feito ? 'feito' : 'pendente', feito_em: feito ? new Date().toISOString() : null }) });
      return res.json({ ok: true });
    }
    if (b.acao === 'apagar') { await sb(`rf_tarefas?id=eq.${b.id}`, { method: 'DELETE' }); return res.json({ ok: true }); }
    return res.status(400).json({ erro: 'Ação inválida.' });
  } catch (e) {
    console.error('campanha', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir. ' + String(e.message).slice(0, 120) });
  }
}
