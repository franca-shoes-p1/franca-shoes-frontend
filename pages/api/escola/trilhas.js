// Vitrine: trilhas e a lista de aulas (só títulos). O conteúdo das aulas só sai para aluno logado.
import { sb } from '../../../lib/varejoServer';
import { alunoLogado } from '../../../lib/escolaServer';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const [trilhas, aulas] = await Promise.all([
      sb('esc_trilhas?ativo=eq.true&select=id,slug,titulo,descricao,icone,ordem&order=ordem,titulo'),
      sb('esc_aulas?ativo=eq.true&select=id,trilha_id,slug,titulo,resumo,duracao_min,ordem&order=ordem,titulo'),
    ]);
    const aluno = await alunoLogado(req).catch(() => null);
    let feitas = [];
    if (aluno) {
      const p = await sb(`esc_progresso?aluno_id=eq.${aluno.id}&select=aula_id`).catch(() => []);
      feitas = p.map((x) => x.aula_id);
    }
    const feitasSet = new Set(feitas);
    const saida = trilhas.map((t) => {
      const doT = aulas.filter((a) => a.trilha_id === t.id);
      return {
        ...t,
        aulas: doT.map((a) => ({ ...a, feita: feitasSet.has(a.id) })),
        total: doT.length,
        concluidas: doT.filter((a) => feitasSet.has(a.id)).length,
      };
    });
    return res.json({ logado: !!aluno, trilhas: saida });
  } catch (e) {
    console.error('escola/trilhas', e.message);
    return res.json({ pronto: false, trilhas: [], logado: false });
  }
}
