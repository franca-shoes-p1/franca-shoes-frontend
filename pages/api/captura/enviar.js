// Cria os registros em sp_capturas (status "novo") e atualiza ultima_visita do fornecedor.
// Cada produto tem a sua etiqueta: a 1ª foto de produto casa com a 1ª de etiqueta, e assim por diante.
import { exigirLogin, sb, UUID, listaUrls } from '../../../lib/capturaServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!exigirLogin(req, res)) return;
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  const ids = Array.isArray(b.ids) ? b.ids : [];
  const produto = listaUrls(b.fotos_produto);
  const etiqueta = listaUrls(b.fotos_etiqueta);
  if (!UUID.test(String(b.fornecedor_id || '')) || !ids.length || ids.some((i) => !UUID.test(String(i)))) return res.status(400).json({ erro: 'Dados inválidos.' });
  if (!produto.length || produto.length !== etiqueta.length || ids.length !== produto.length) return res.status(400).json({ erro: 'Cada foto de produto precisa da sua foto de etiqueta.' });
  try {
    await sb('sp_capturas?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, // repetir o envio não duplica
      body: JSON.stringify(ids.map((id, i) => ({ id, fornecedor_id: b.fornecedor_id, foto_produto_url: produto[i], foto_etiqueta_url: etiqueta[i], status: 'novo' }))),
    });
    await sb(`sp_fornecedores?id=eq.${b.fornecedor_id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ultima_visita: new Date().toISOString() }) });
    return res.status(201).json({ ok: true, registros: ids.length });
  } catch (e) {
    console.error('captura/enviar', e.message);
    return res.status(500).json({ erro: 'Não foi possível salvar agora.' });
  }
}
