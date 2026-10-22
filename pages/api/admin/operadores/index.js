// Operadores: lista e cadastro (só o dono). O código de acesso aparece UMA vez, ao cadastrar.
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, txt } from '../../../../lib/varejoServer';
import { novoCodigo, hashCodigo, configurado } from '../../../../lib/operadorAuth';

const CAMPOS = 'id,criado_em,nome,whatsapp,chave_pix,setor,nivel,ativo,aceite_em,nota_interna';
const NIVEIS = ['iniciante', 'aprovado', 'referencia'];

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      let operadores;
      try {
        operadores = await sb(`op_operarios?select=${CAMPOS},pode_catalogo&order=setor.asc,nome.asc&limit=500`);
      } catch (e) {
        // SQL do catálogo ainda não rodado: lista sem essa coluna.
        operadores = await sb(`op_operarios?select=${CAMPOS}&order=setor.asc,nome.asc&limit=500`);
      }
      return res.json({ operadores });
    }
    if (req.method === 'POST') {
      if (!configurado()) return res.status(500).json({ erro: 'Falta ADMIN_SESSION_SECRET na Vercel (16+ caracteres).' });
      const c = req.body && typeof req.body === 'object' ? req.body : {};
      const nome = txt(c.nome, 120);
      const setor = txt(c.setor, 80);
      if (!nome || !setor) return res.status(400).json({ erro: 'Informe nome e setor.' });
      const nivel = NIVEIS.includes(c.nivel) ? c.nivel : 'iniciante';
      const codigo = novoCodigo();
      const [op] = await sb('op_operarios', {
        method: 'POST',
        body: JSON.stringify({
          nome, setor, nivel,
          whatsapp: txt(c.whatsapp, 30) || null,
          chave_pix: txt(c.chave_pix, 120) || null,
          nota_interna: txt(c.nota_interna, 500) || null,
          codigo_hash: hashCodigo(codigo),
        }),
      });
      delete op.codigo_hash;
      return res.status(201).json({ operador: op, codigo });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('admin/operadores', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
