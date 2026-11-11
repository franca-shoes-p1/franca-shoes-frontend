// GET: lista de fornecedores. POST: cria um fornecedor novo (o celular já manda o id, assim repetir o envio não duplica).
import { exigirLogin, sb, txt, UUID, listaUrls } from '../../../lib/capturaServer';

const TIPOS = ['loja', 'fabrica', 'camelo'];

export default async function handler(req, res) {
  if (!exigirLogin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const lista = await sb('sp_fornecedores?select=id,apelido,nome,tipo,ultima_visita&order=apelido.asc&limit=2000');
      return res.json({ fornecedores: lista });
    }
    if (req.method === 'POST') {
      const b = req.body && typeof req.body === 'object' ? req.body : {};
      if (!UUID.test(String(b.id || ''))) return res.status(400).json({ erro: 'Identificador inválido.' });
      const apelido = txt(b.apelido, 80);
      if (apelido.length < 2) return res.status(400).json({ erro: 'Informe o apelido do fornecedor.' });
      const fotos = listaUrls(b.fotos_ponto);
      const dados = {
        id: b.id,
        apelido,
        nome: txt(b.nome, 120) || apelido, // "nome" é obrigatório no banco
        foto_ponto_url: fotos[0] || null,
        // o banco tem só uma coluna de foto do ponto: as demais ficam anotadas nas observações
        observacoes: fotos.length > 1 ? 'Outras fotos do ponto: ' + fotos.slice(1).join(' ') : null,
        tipo: TIPOS.includes(b.tipo) ? b.tipo : 'loja',
        whatsapp: txt(b.whatsapp, 30).replace(/[^\d+()\- ]/g, '') || null,
        endereco: txt(b.endereco, 200) || null,
        ponto_referencia: txt(b.ponto_referencia, 200) || null,
        dias_horarios: txt(b.dias_horarios, 200) || null,
        ultima_visita: new Date().toISOString(),
      };
      // ignore-duplicates: se o celular repetir o envio, não cria de novo.
      await sb('sp_fornecedores?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify([dados]) });
      return res.status(201).json({ ok: true });
    }
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('captura/fornecedores', e.message);
    return res.status(500).json({ erro: 'Não foi possível acessar o banco agora.' });
  }
}
