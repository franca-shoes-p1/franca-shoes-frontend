import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, chamarN8n } from '../../../../lib/supabaseServer';

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const ebooks = await sb(
        'ebooks?select=id,titulo,slug,nicho,status,publicado,preco,criado_em,ebook_chapters(status)&order=criado_em.desc&limit=200'
      );
      return res.status(200).json({ ebooks: ebooks || [] });
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      const titulo = String(b.titulo || '').trim();
      const publico = String(b.publico || '').trim();
      const nicho = String(b.nicho || '').trim();
      const num = Number(b.num_capitulos);
      if (titulo.length < 3 || titulo.length > 200) {
        return res.status(400).json({ erro: 'Informe um título de 3 a 200 caracteres' });
      }
      if (!publico || !nicho) {
        return res.status(400).json({ erro: 'Informe o nicho e o público do e-book' });
      }
      if (!Number.isInteger(num) || num < 3 || num > 20) {
        return res.status(400).json({ erro: 'Número de capítulos deve ser de 3 a 20' });
      }

      const criado = await sb('ebooks', {
        method: 'POST',
        prefer: 'return=representation',
        body: { titulo, publico: publico.slice(0, 300), nicho: nicho.slice(0, 120), num_capitulos: num, status: 'escrevendo' },
      });
      const ebook = criado[0];

      try {
        await chamarN8n('gerar', ebook.id);
      } catch (e) {
        await sb(`ebooks?id=eq.${ebook.id}`, {
          method: 'PATCH',
          body: { status: 'erro', erro_msg: String(e.message).slice(0, 500) },
        });
        return res.status(502).json({ erro: 'Não consegui chamar o n8n: ' + e.message });
      }
      return res.status(201).json({ ebook });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
