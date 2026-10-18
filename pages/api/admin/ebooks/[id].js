import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, chamarN8n, UUID, limparSlug, urlOk } from '../../../../lib/supabaseServer';

const TEXTOS = ['titulo', 'subtitulo', 'nicho', 'publico', 'projeto_slug'];
const URLS = ['link_pagamento', 'capa_url', 'arquivo_pdf_url', 'arquivo_epub_url'];

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;

  const { id } = req.query;
  if (!UUID.test(String(id))) return res.status(400).json({ erro: 'Identificador inválido' });

  try {
    if (req.method === 'GET') {
      const r = await sb(`ebooks?id=eq.${id}&select=*,ebook_chapters(*)&ebook_chapters.order=ordem.asc`);
      if (!r || !r.length) return res.status(404).json({ erro: 'E-book não encontrado' });
      return res.status(200).json({ ebook: r[0] });
    }

    if (req.method === 'PATCH') {
      const b = req.body || {};
      const campos = {};

      for (const k of TEXTOS) if (k in b) campos[k] = b[k] === null ? null : String(b[k]).trim().slice(0, 300) || null;
      if ('titulo' in campos && !campos.titulo) return res.status(400).json({ erro: 'O título não pode ficar vazio' });
      if ('descricao_venda' in b) campos.descricao_venda = String(b.descricao_venda || '').slice(0, 5000) || null;
      for (const k of URLS) {
        if (k in b) {
          const v = String(b[k] || '').trim();
          if (!urlOk(v)) return res.status(400).json({ erro: `O campo ${k} precisa começar com https://` });
          campos[k] = v || null;
        }
      }
      if ('slug' in b) campos.slug = limparSlug(b.slug) || null;
      if ('preco' in b) {
        if (b.preco === '' || b.preco === null) campos.preco = null;
        else {
          const p = Number(String(b.preco).replace(',', '.'));
          if (!(p >= 0) || p > 100000) return res.status(400).json({ erro: 'Preço inválido' });
          campos.preco = p;
        }
      }
      if ('publicado' in b) campos.publicado = b.publicado === true;

      if ('publicado' in campos) {
        const atual = await sb(`ebooks?id=eq.${id}&select=*,ebook_chapters(status)`);
        if (!atual || !atual.length) return res.status(404).json({ erro: 'E-book não encontrado' });
        const e = atual[0];
        if (campos.publicado) {
          const caps = e.ebook_chapters || [];
          const slug = 'slug' in campos ? campos.slug : e.slug;
          const preco = 'preco' in campos ? campos.preco : e.preco;
          if (!caps.length || caps.some((c) => c.status !== 'aprovado')) {
            return res.status(400).json({ erro: 'Aprove todos os capítulos antes de publicar.' });
          }
          if (!slug) return res.status(400).json({ erro: 'Defina o endereço (slug) antes de publicar.' });
          if (preco === null || preco === undefined) return res.status(400).json({ erro: 'Defina o preço antes de publicar.' });
          campos.status = 'publicado';
        } else if (e.status === 'publicado') {
          campos.status = 'pronto';
        }
      }

      if (!Object.keys(campos).length) return res.status(400).json({ erro: 'Nada para atualizar' });
      campos.atualizado_em = new Date().toISOString();
      const r = await sb(`ebooks?id=eq.${id}`, { method: 'PATCH', prefer: 'return=representation', body: campos });
      return res.status(200).json({ ebook: r && r[0] });
    }

    if (req.method === 'POST') {
      const acao = req.body && req.body.acao;
      if (acao !== 'reescrever') return res.status(400).json({ erro: 'Ação desconhecida' });

      const marcados = await sb(`ebook_chapters?ebook_id=eq.${id}&status=eq.reescrever&select=id`);
      if (!marcados || !marcados.length) {
        return res.status(400).json({ erro: 'Nenhum capítulo está marcado para reescrever.' });
      }
      await sb(`ebooks?id=eq.${id}`, {
        method: 'PATCH',
        body: { status: 'escrevendo', publicado: false, erro_msg: null, atualizado_em: new Date().toISOString() },
      });
      try {
        await chamarN8n('reescrever', id);
      } catch (e) {
        await sb(`ebooks?id=eq.${id}`, { method: 'PATCH', body: { status: 'erro', erro_msg: String(e.message).slice(0, 500) } });
        return res.status(502).json({ erro: 'Não consegui chamar o n8n: ' + e.message });
      }
      return res.status(200).json({ ok: true, capitulos: marcados.length });
    }

    res.setHeader('Allow', 'GET, PATCH, POST');
    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (e) {
    return res.status(500).json({ erro: e.message });
  }
}
