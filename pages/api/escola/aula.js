// Uma aula completa (texto + vídeo). Só para aluno logado.
import { sb } from '../../../lib/varejoServer';
import { exigirAluno } from '../../../lib/escolaServer';
import { youtubeId } from '../../../lib/escola';

const SLUG = /^[a-z0-9-]{1,80}$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const aluno = await exigirAluno(req, res);
  if (!aluno) return;
  const t = String(req.query.trilha || '');
  const a = String(req.query.aula || '');
  if (!SLUG.test(t) || !SLUG.test(a)) return res.status(404).json({ erro: 'Aula não encontrada.' });
  try {
    const [trilha] = await sb(`esc_trilhas?slug=eq.${t}&ativo=eq.true&select=id,slug,titulo,icone&limit=1`);
    if (!trilha) return res.status(404).json({ erro: 'Aula não encontrada.' });
    const lista = await sb(`esc_aulas?trilha_id=eq.${trilha.id}&ativo=eq.true&select=id,slug,titulo,resumo,duracao_min,conteudo,video_url,ordem&order=ordem,titulo`);
    const i = lista.findIndex((x) => x.slug === a);
    if (i < 0) return res.status(404).json({ erro: 'Aula não encontrada.' });
    const aula = lista[i];
    const [fez] = await sb(`esc_progresso?aluno_id=eq.${aluno.id}&aula_id=eq.${aula.id}&select=aula_id&limit=1`).catch(() => []);
    const par = (x) => (x ? { slug: x.slug, titulo: x.titulo } : null);
    return res.json({
      trilha: { slug: trilha.slug, titulo: trilha.titulo, icone: trilha.icone },
      aula: {
        id: aula.id,
        slug: aula.slug,
        titulo: aula.titulo,
        resumo: aula.resumo,
        duracao_min: aula.duracao_min,
        conteudo: aula.conteudo || '',
        video: youtubeId(aula.video_url),
        numero: i + 1,
        total: lista.length,
      },
      anterior: par(lista[i - 1]),
      proxima: par(lista[i + 1]),
      feita: !!fez,
    });
  } catch (e) {
    console.error('escola/aula', e.message);
    return res.status(500).json({ erro: 'Não foi possível abrir a aula agora.' });
  }
}
