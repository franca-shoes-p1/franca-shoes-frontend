// Operador com permissão: lista os modelos que ele cadastrou e cadastra novos.
// Regras impostas aqui no servidor: o modelo entra SEMPRE oculto (só o dono publica),
// o operador não envia custo nem decide publicação, e há um limite diário.
import { exigirCatalogo } from '../../../../lib/operadorAuth';
import { sb } from '../../../../lib/varejoServer';
import { validarProduto, camposDoOperador } from '../../../../lib/produtosAdmin';

const CAMPOS = 'id,nome,titulo_publico,descricao,categoria,material,tamanhos,foto_url,preco_venda_sugerido,publicado,ativo,criado_em';
const LIMITE_DIA = 50;

export default async function handler(req, res) {
  const op = await exigirCatalogo(req, res);
  if (!op) return;
  try {
    if (req.method === 'GET') {
      const regs = await sb(`op_catalogo_registros?operario_id=eq.${op.id}&select=produto_id&order=criado_em.desc&limit=200`);
      const ids = regs.map((r) => r.produto_id);
      const produtos = ids.length ? await sb(`rf_produtos?id=in.(${ids.join(',')})&select=${CAMPOS}`) : [];
      const ordem = new Map(ids.map((id, i) => [id, i]));
      produtos.sort((a, b) => ordem.get(a.id) - ordem.get(b.id));
      return res.json({ produtos });
    }
    if (req.method === 'POST') {
      const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const recentes = await sb(`op_catalogo_registros?operario_id=eq.${op.id}&criado_em=gte.${desde}&select=id`);
      if (recentes.length >= LIMITE_DIA) return res.status(429).json({ erro: `Limite de ${LIMITE_DIA} modelos por dia atingido.` });

      const c = req.body && typeof req.body === 'object' ? req.body : {};
      const { erro, dados } = validarProduto(camposDoOperador(c));
      if (erro) return res.status(400).json({ erro });
      dados.publicado = false;
      dados.ativo = false;
      const [produto] = await sb('rf_produtos', { method: 'POST', body: JSON.stringify(dados) });
      try {
        await sb('op_catalogo_registros', { method: 'POST', body: JSON.stringify({ produto_id: produto.id, operario_id: op.id }) });
      } catch (e) {
        // Sem o registro, o modelo ficaria sem dono: desfaz para não deixar um modelo solto.
        await sb(`rf_produtos?id=eq.${produto.id}`, { method: 'DELETE' }).catch(() => {});
        throw e;
      }
      return res.status(201).json({ produto });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('operador/catalogo', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 200) });
  }
}
