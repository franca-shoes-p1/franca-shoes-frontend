// Fila de postagens do operador: o que falta postar (hoje e próximos dias) e o que ele já fez.
import { exigirPostagens } from '../../../../lib/operadorAuth';
import { sb } from '../../../../lib/varejoServer';

const CAMPOS =
  'id,numero,rede,titulo,texto,hashtags,link_destino,imagem_url,arte_titulo,arte_subtitulo,arte_tema,email_assunto,agendada_para,status,operario_id,postada_em,link_postagem,observacao_operador,projeto';

export default async function handler(req, res) {
  const op = await exigirPostagens(req, res);
  if (!op) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    const limite = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(); // fila dos próximos 3 dias
    const [fila, feitas] = await Promise.all([
      sb(`op_postagens?status=in.(agendada,em_andamento)&agendada_para=lte.${limite}&select=${CAMPOS}&order=agendada_para.asc&limit=150`),
      sb(`op_postagens?status=in.(postada,pulada)&operario_id=eq.${op.id}&select=${CAMPOS}&order=postada_em.desc.nullslast&limit=40`),
    ]);
    // Marca o que é meu e esconde de quem é cada uma das outras (operador não precisa saber).
    const pronta = (p) => ({ ...p, minha: p.operario_id === op.id, operario_id: undefined });
    return res.json({ operador: { nome: op.nome }, agora: new Date().toISOString(), fila: fila.map(pronta), feitas: feitas.map(pronta) });
  } catch (e) {
    console.error('operador/postagens', e.message);
    const faltaTabela = /op_postagens|relation|does not exist/i.test(String(e.message));
    return res.status(500).json({ erro: faltaTabela ? 'A tabela de postagens ainda não foi criada (rode o supabase-postagens.sql).' : 'Não foi possível carregar a fila.' });
  }
}
