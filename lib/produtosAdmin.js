// Validação dos dados de um modelo (usado pelas rotas /api/admin/produtos). Só roda no servidor.
import { txt } from './varejoServer';

// Aceita "129,90", "129.90", "R$ 1.290,50"
export function numeroBR(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').replace(/[^\d,.-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

export const CAMPOS_ADMIN =
  'id,nome,titulo_publico,descricao,categoria,material,tamanhos,foto_url,custo,preco_venda_sugerido,publicado,ativo,criado_em';

// Devolve { erro } ou { dados } pronto para gravar no Supabase.
export function validarProduto(c, { parcial = false } = {}) {
  const d = {};

  if (!parcial || c.titulo !== undefined) {
    const titulo = txt(c.titulo, 120);
    if (titulo.length < 3) return { erro: 'Informe o nome do modelo (mínimo 3 letras).' };
    d.titulo_publico = titulo;
    d.nome = txt(c.nome, 120) || titulo;
  }
  if (!parcial || c.preco !== undefined) {
    const preco = numeroBR(c.preco);
    if (!(preco > 0 && preco < 100000)) return { erro: 'Informe o preço de venda ao consumidor (maior que zero).' };
    d.preco_venda_sugerido = Math.round(preco * 100) / 100;
    d.preco_confirmado_em = new Date().toISOString();
  }
  if (!parcial || c.custo !== undefined) {
    const custoBruto = String(c.custo ?? '').trim();
    const custo = custoBruto === '' ? 0 : numeroBR(custoBruto);
    if (!(custo >= 0 && custo < 100000)) return { erro: 'O custo de fábrica está inválido.' };
    d.custo = Math.round(custo * 100) / 100;
  }
  if (!parcial || c.categoria !== undefined) d.categoria = txt(c.categoria, 60) || null;
  if (!parcial || c.material !== undefined) d.material = txt(c.material, 80) || null;
  if (!parcial || c.tamanhos !== undefined) d.tamanhos = txt(c.tamanhos, 80) || null;
  if (!parcial || c.descricao !== undefined) d.descricao = txt(c.descricao, 1500) || null;
  if (!parcial || c.foto_url !== undefined) {
    const foto = txt(c.foto_url, 500);
    if (foto && !/^https:\/\//i.test(foto)) return { erro: 'O endereço da foto precisa começar com https://' };
    d.foto_url = foto || null;
  }
  if (c.publicado !== undefined) {
    d.publicado = !!c.publicado;
    d.ativo = !!c.publicado; // "ocultar" desliga os dois; "publicar" liga os dois
  }
  return { dados: d };
}
