// Painel da live (dono): publicar produtos na hora e cadastrar as lojas dos membros.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { limparSlug } from '../../../lib/supabaseServer';
import { CATEGORIAS, dinheiro, faltaTabela, sugerirPelaFoto } from '../../../lib/lojaLive';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

const ruim = (msg) => Object.assign(new Error(msg), { pedido: true });

async function painel() {
  const [produtos, lojas] = await Promise.all([
    sb('ml_produtos?order=criado_em.desc&limit=200&select=*'),
    sb('ml_lojas?order=criado_em.desc&limit=200&select=*'),
  ]);
  return { produtos, lojas };
}

async function agir(c) {
  if (c.acao === 'publicar') {
    const nome = txt(c.nome, 80);
    const custo = dinheiro(c.custo);
    const preco = dinheiro(c.preco);
    if (!nome) throw ruim('Escreva o nome do produto.');
    if (!CATEGORIAS.includes(c.categoria)) throw ruim('Escolha a categoria.');
    if (!custo) throw ruim('Informe quanto o produto custa no fornecedor.');
    if (!preco || preco < custo) throw ruim('O preço da sua vitrine não pode ser menor que o custo.');
    const foto = txt(c.foto_url, 500);
    if (foto && !foto.startsWith(`${process.env.SUPABASE_URL}/storage/`)) throw ruim('Foto inválida.');
    await sb('ml_produtos', { method: 'POST', body: JSON.stringify({
      nome, categoria: c.categoria, custo, preco_vitrine: preco, foto_url: foto || null,
      descricao: txt(c.descricao, 200) || null, tamanhos: txt(c.tamanhos, 60) || null, fornecedor: txt(c.fornecedor, 80) || null,
    }) });
  } else if (c.acao === 'status') {
    if (!UUID.test(c.id) || !['visivel', 'esgotado', 'oculto'].includes(c.status)) throw ruim('Pedido inválido.');
    await sb(`ml_produtos?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify({ status: c.status }) });
  } else if (c.acao === 'excluir') {
    if (!UUID.test(c.id)) throw ruim('Pedido inválido.');
    await sb(`ml_produtos?id=eq.${c.id}`, { method: 'DELETE' });
  } else if (c.acao === 'loja_nova') {
    const nome = txt(c.nome, 60);
    const slug = limparSlug(c.slug || nome).slice(0, 60);
    const acrescimo = parseInt(c.acrescimo, 10);
    if (!nome || !slug) throw ruim('Escreva o nome da loja.');
    if (!(acrescimo >= 10 && acrescimo <= 100)) throw ruim('O acréscimo deve ficar entre 10 e 100%.');
    const ja = await sb(`ml_lojas?slug=eq.${slug}&select=id`);
    if (ja.length) throw ruim('Já existe uma loja com esse endereço. Mude o nome.');
    await sb('ml_lojas', { method: 'POST', body: JSON.stringify({ nome, slug, acrescimo, contato: txt(c.contato, 40) || null }) });
  } else if (c.acao === 'loja_ativo') {
    if (!UUID.test(c.id)) throw ruim('Pedido inválido.');
    await sb(`ml_lojas?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify({ ativo: !!c.ativo }) });
  } else throw ruim('Ação desconhecida.');
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST') {
      const c = req.body || {};
      if (c.acao === 'ia') {
        try { return res.json(await sugerirPelaFoto(c.imagem)); } catch (e) { return res.status(400).json({ erro: e.message }); }
      }
      await agir(c);
    } else if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
    return res.json(await painel());
  } catch (e) {
    if (e.pedido) return res.status(400).json({ erro: e.message });
    if (faltaTabela(e)) return res.json({ semSql: true });
    console.error('admin/live', e.message);
    return res.status(500).json({ erro: 'Erro no banco de dados. Tente de novo.' });
  }
}
