// Ações do operador sobre UMA postagem: assumir, devolver, marcar como postada, pular.
// As regras ficam aqui no servidor: duas pessoas não assumem a mesma postagem, e ninguém mexe na dos outros.
import { exigirPostagens } from '../../../../lib/operadorAuth';
import { sb, UUID, txt } from '../../../../lib/varejoServer';
import { urlOk } from '../../../../lib/supabaseServer';

const patch = (filtro, corpo) => sb(`op_postagens?${filtro}`, { method: 'PATCH', body: JSON.stringify(corpo) });

export default async function handler(req, res) {
  const op = await exigirPostagens(req, res);
  if (!op) return;
  const id = String(req.query.id || '');
  if (!UUID.test(id)) return res.status(400).json({ erro: 'Postagem inválida.' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  const c = req.body && typeof req.body === 'object' ? req.body : {};
  const agora = new Date().toISOString();
  const conflito = () => res.status(409).json({ erro: 'Esta postagem mudou (outra pessoa pode ter assumido). Atualize a fila.' });
  const minha = `or=(operario_id.is.null,operario_id.eq.${op.id})`;

  try {
    let linhas;
    switch (c.acao) {
      case 'assumir':
        linhas = await patch(`id=eq.${id}&status=eq.agendada&operario_id=is.null`, { status: 'em_andamento', operario_id: op.id, assumida_em: agora });
        break;
      case 'devolver':
        linhas = await patch(`id=eq.${id}&status=eq.em_andamento&operario_id=eq.${op.id}`, { status: 'agendada', operario_id: null, assumida_em: null });
        break;
      case 'postada': {
        const link = txt(c.link, 600);
        if (link && !urlOk(link)) return res.status(400).json({ erro: 'O link da postagem precisa começar com https://' });
        linhas = await patch(`id=eq.${id}&status=in.(agendada,em_andamento)&${minha}`, {
          status: 'postada', operario_id: op.id, assumida_em: agora, postada_em: agora, link_postagem: link || null,
          observacao_operador: txt(c.observacao, 300) || null,
        });
        break;
      }
      case 'pular': {
        const motivo = txt(c.observacao, 300);
        if (motivo.length < 3) return res.status(400).json({ erro: 'Diga em poucas palavras por que não foi postada.' });
        linhas = await patch(`id=eq.${id}&status=in.(agendada,em_andamento)&${minha}`, {
          status: 'pulada', operario_id: op.id, postada_em: agora, observacao_operador: motivo,
        });
        break;
      }
      default:
        return res.status(400).json({ erro: 'Ação inválida.' });
    }
    if (!linhas || !linhas.length) return conflito();
    return res.json({ ok: true });
  } catch (e) {
    console.error('operador/postagens/[id]', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar agora.' });
  }
}
