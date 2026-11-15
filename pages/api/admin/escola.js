// Painel do dono da Escola de Agropecuária Ecológica. GET traz tudo; POST executa uma ação por vez.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, UUID, txt } from '../../../lib/varejoServer';
import { hashSenha, senhaTemporaria } from '../../../lib/escolaServer';
import { youtubeId, slugEscola } from '../../../lib/escola';

const bad = (res, m) => res.status(400).json({ erro: m });
const inteiro = (v, min, max, padrao) => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n >= min && n <= max ? n : padrao;
};

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const seguro = (p) => sb(p).catch(() => null);
      const [trilhas, aulas, alunos, progresso] = await Promise.all([
        seguro('esc_trilhas?select=*&order=ordem,titulo'),
        seguro('esc_aulas?select=*&order=ordem,titulo'),
        seguro('esc_alunos?select=id,nome,email,whatsapp,ativo,criado_em&order=criado_em.desc&limit=500'),
        seguro('esc_progresso?select=aluno_id'),
      ]);
      if (trilhas === null || aulas === null || alunos === null) {
        return res.json({ pronto: false, motivo: 'As tabelas esc_ ainda não existem no Supabase. Rode o SQL da escola.' });
      }
      const feitas = {};
      (progresso || []).forEach((p) => { feitas[p.aluno_id] = (feitas[p.aluno_id] || 0) + 1; });
      return res.json({
        pronto: true,
        trilhas,
        aulas,
        alunos: alunos.map((a) => ({ ...a, aulas_feitas: feitas[a.id] || 0 })),
      });
    }
    if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
    const c = req.body && typeof req.body === 'object' ? req.body : {};

    if (c.acao === 'salvar_trilha') {
      const titulo = txt(c.titulo, 100);
      if (titulo.length < 3) return bad(res, 'Escreva o título da trilha.');
      const corpo = {
        titulo,
        slug: slugEscola(c.slug || titulo),
        descricao: txt(c.descricao, 400),
        icone: txt(c.icone, 8) || '🌱',
        ordem: inteiro(c.ordem, 0, 999, 0),
        ativo: c.ativo !== false,
      };
      if (!corpo.slug) return bad(res, 'Endereço inválido.');
      if (c.id) {
        if (!UUID.test(String(c.id))) return bad(res, 'Trilha inválida.');
        await sb(`esc_trilhas?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify(corpo) });
      } else {
        await sb('esc_trilhas', { method: 'POST', body: JSON.stringify(corpo) });
      }
      return res.json({ ok: true });
    }

    if (c.acao === 'salvar_aula') {
      const titulo = txt(c.titulo, 140);
      if (titulo.length < 3) return bad(res, 'Escreva o título da aula.');
      if (!UUID.test(String(c.trilha_id || ''))) return bad(res, 'Escolha a trilha.');
      const video = txt(c.video_url, 300);
      if (video && !youtubeId(video)) return bad(res, 'O vídeo precisa ser um link https:// do YouTube.');
      const corpo = {
        trilha_id: c.trilha_id,
        titulo,
        slug: slugEscola(c.slug || titulo),
        resumo: txt(c.resumo, 300),
        conteudo: String(c.conteudo || '').slice(0, 30000),
        video_url: video || null,
        duracao_min: inteiro(c.duracao_min, 0, 600, null),
        ordem: inteiro(c.ordem, 0, 999, 0),
        ativo: c.ativo !== false,
      };
      if (!corpo.slug) return bad(res, 'Endereço inválido.');
      if (c.id) {
        if (!UUID.test(String(c.id))) return bad(res, 'Aula inválida.');
        await sb(`esc_aulas?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify(corpo) });
      } else {
        await sb('esc_aulas', { method: 'POST', body: JSON.stringify(corpo) });
      }
      return res.json({ ok: true });
    }

    if (c.acao === 'aluno_ativo') {
      if (!UUID.test(String(c.id || ''))) return bad(res, 'Aluno inválido.');
      await sb(`esc_alunos?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify({ ativo: !!c.ativo }) });
      return res.json({ ok: true });
    }

    if (c.acao === 'aluno_senha') {
      if (!UUID.test(String(c.id || ''))) return bad(res, 'Aluno inválido.');
      const nova = senhaTemporaria();
      await sb(`esc_alunos?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify({ senha_hash: hashSenha(nova) }) });
      return res.json({ ok: true, senha: nova });
    }

    return bad(res, 'Ação desconhecida.');
  } catch (e) {
    if (/duplicate|unique|23505/i.test(e.message)) return bad(res, 'Já existe um item com esse endereço (slug). Mude o título ou o endereço.');
    console.error('admin/escola', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar agora.' });
  }
}
