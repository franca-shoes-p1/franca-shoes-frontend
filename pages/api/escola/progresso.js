// Marcar ou desmarcar uma aula como concluída.
import { sb, UUID } from '../../../lib/varejoServer';
import { exigirAluno } from '../../../lib/escolaServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const aluno = await exigirAluno(req, res);
  if (!aluno) return;
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  if (!UUID.test(String(c.aula_id || ''))) return res.status(400).json({ erro: 'Aula inválida.' });
  try {
    const [aula] = await sb(`esc_aulas?id=eq.${c.aula_id}&ativo=eq.true&select=id&limit=1`);
    if (!aula) return res.status(404).json({ erro: 'Aula não encontrada.' });
    if (c.feita) {
      await sb('esc_progresso?on_conflict=aluno_id,aula_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ aluno_id: aluno.id, aula_id: aula.id }),
      });
    } else {
      await sb(`esc_progresso?aluno_id=eq.${aluno.id}&aula_id=eq.${aula.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    }
    return res.json({ ok: true, feita: !!c.feita });
  } catch (e) {
    console.error('escola/progresso', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar agora.' });
  }
}
