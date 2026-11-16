// Central de Projetos: lista, cria a partir de modelo, marca tarefas e publica a página do projeto.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb } from '../../../lib/varejoServer';
import { TIPOS, gerarTarefas, gerarPagina, slugar, SEMENTES } from '../../../lib/centralModelos';

const STATUS_T = ['a_fazer', 'fazendo', 'feita'];
const STATUS_P = ['ideia', 'planejando', 'andamento', 'pausado', 'concluido'];
const txt = (v, n) => String(v || '').trim().slice(0, n);

async function listar() {
  const projetos = await sb('central_projetos?select=*&order=ordem.asc,criado_em.asc').catch(() => null);
  if (projetos === null) return { semSql: true };
  const tarefas = await sb('central_tarefas?select=*&order=ordem.asc,criado_em.asc');
  return { projetos: projetos.map((p) => ({ ...p, tarefas: tarefas.filter((t) => t.projeto_id === p.id) })) };
}

async function criarProjeto({ slug, nome, tipo, emoji, status, resumo, proximo_passo, link_site, tarefas, publicado }) {
  const ordem = (await sb('central_projetos?select=id')).length;
  const pagina = gerarPagina({ nome, tipo, resumo });
  const [p] = await sb('central_projetos', { method: 'POST', body: JSON.stringify([{ slug, nome, tipo, emoji, status, resumo, proximo_passo, link_site, pagina, publicado: !!publicado, ordem }]) });
  if (tarefas.length) {
    await sb('central_tarefas', { method: 'POST', body: JSON.stringify(tarefas.map((t, i) => ({ projeto_id: p.id, etapa: t.etapa, titulo: t.titulo, pista: t.pista, status: t.status || 'a_fazer', ordem: i, feita_em: t.status === 'feita' ? new Date().toISOString() : null }))) });
  }
  return p;
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.json(await listar());
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const b = req.body || {};
    switch (b.acao) {
      case 'criar': {
        const nome = txt(b.nome, 80);
        if (nome.length < 2) return res.status(400).json({ erro: 'Dê um nome ao projeto.' });
        const tipo = TIPOS[b.tipo] ? b.tipo : 'outro';
        let slug = slugar(nome);
        const ja = await sb(`central_projetos?slug=like.${slug}*&select=slug`);
        if (ja.some((x) => x.slug === slug)) slug = `${slug}-${ja.length + 1}`;
        await criarProjeto({ slug, nome, tipo, emoji: TIPOS[tipo].e, status: 'planejando', resumo: txt(b.resumo, 400), proximo_passo: 'Revisar o plano gerado e começar pela primeira tarefa manual.', link_site: null, tarefas: gerarTarefas(tipo) });
        break;
      }
      case 'semear': {
        const existentes = (await sb('central_projetos?select=slug')).map((x) => x.slug);
        for (const s of SEMENTES.filter((x) => !existentes.includes(x.slug))) await criarProjeto(s);
        break;
      }
      case 'tarefa_status': {
        if (!STATUS_T.includes(b.status)) return res.status(400).json({ erro: 'Status inválido.' });
        await sb(`central_tarefas?id=eq.${encodeURIComponent(b.id)}`, { method: 'PATCH', body: JSON.stringify({ status: b.status, feita_em: b.status === 'feita' ? new Date().toISOString() : null }) });
        break;
      }
      case 'tarefa_add': {
        const titulo = txt(b.titulo, 200);
        if (!titulo) return res.status(400).json({ erro: 'Escreva a tarefa.' });
        const n = (await sb(`central_tarefas?projeto_id=eq.${encodeURIComponent(b.projeto)}&select=id`)).length;
        await sb('central_tarefas', { method: 'POST', body: JSON.stringify([{ projeto_id: b.projeto, etapa: txt(b.etapa, 60) || 'Geral', titulo, pista: b.pista === 'auto' ? 'auto' : 'manual', ordem: n }]) });
        break;
      }
      case 'tarefa_del':
        await sb(`central_tarefas?id=eq.${encodeURIComponent(b.id)}`, { method: 'DELETE' });
        break;
      case 'projeto_editar': {
        const campos = { atualizado_em: new Date().toISOString() };
        if (b.status !== undefined) { if (!STATUS_P.includes(b.status)) return res.status(400).json({ erro: 'Status inválido.' }); campos.status = b.status; }
        if (b.proximo_passo !== undefined) campos.proximo_passo = txt(b.proximo_passo, 300);
        if (b.publicado !== undefined) campos.publicado = !!b.publicado;
        await sb(`central_projetos?id=eq.${encodeURIComponent(b.id)}`, { method: 'PATCH', body: JSON.stringify(campos) });
        break;
      }
      case 'gerar_pagina': {
        const [p] = await sb(`central_projetos?id=eq.${encodeURIComponent(b.id)}&select=nome,tipo,resumo`);
        if (!p) return res.status(404).json({ erro: 'Projeto não encontrado.' });
        await sb(`central_projetos?id=eq.${encodeURIComponent(b.id)}`, { method: 'PATCH', body: JSON.stringify({ pagina: gerarPagina(p) }) });
        break;
      }
      case 'projeto_del':
        await sb(`central_projetos?id=eq.${encodeURIComponent(b.id)}`, { method: 'DELETE' });
        break;
      default:
        return res.status(400).json({ erro: 'Ação desconhecida.' });
    }
    return res.json(await listar());
  } catch (e) {
    console.error('admin/central', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 160) });
  }
}
