import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, UUID } from '../../../../lib/supabaseServer';

const STATUS_OK = ['escrito', 'aprovado', 'reescrever'];

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;

  const { id } = req.query;
  if (!UUID.test(String(id))) return res.status(400).json({ erro: 'Identificador inválido' });
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const b = req.body || {};
    const campos = {};
    if ('titulo' in b) campos.titulo = String(b.titulo || '').trim().slice(0, 300);
    if ('texto_md' in b) {
      campos.texto_md = String(b.texto_md || '').slice(0, 100000);
      // editar o texto exige aprovar de novo, salvo se o status vier junto
      if (!('status' in b)) campos.status = 'escrito';
    }
    if ('status' in b) {
      if (!STATUS_OK.includes(b.status)) return res.status(400).json({ erro: 'Status inválido' });
      campos.status = b.status;
    }
    if (!Object.keys(campos).length) return res.status(400).json({ erro: 'Nada para atualizar' });
    campos.atualizado_em = new Date().toISOString();

    const r = await sb(`ebook_chapters?id=eq.${id}`, { method: 'PATCH', prefer: 'return=representation', body: campos });
    if (!r || !r.length) return res.status(404).json({ erro: 'Capítulo não encontrado' });

    // Se o capítulo saiu de "aprovado" num e-book publicado, tira da loja por segurança.
    if (campos.status && campos.status !== 'aprovado') {
      await sb(`ebooks?id=eq.${r[0].ebook_id}&publicado=eq.true`, {
        method: 'PATCH',
        body: { publicado: false, status: 'pronto', atualizado_em: campos.atualizado_em },
      });
    }
    return res.status(200).json({ capitulo: r[0] });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
