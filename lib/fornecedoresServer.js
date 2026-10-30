// Ajudantes do SERVIDOR do sistema de fornecedores.
import crypto from 'crypto';
import { sb, txt } from './varejoServer';
import { numeroBR } from './produtosAdmin';
import { so_digitos, precoCliente, r2, COMISSAO_PADRAO } from './fornecedores';

export const novoToken = () => crypto.randomBytes(12).toString('hex');
export const TOKEN = /^[0-9a-f]{24}$/;

export const COLS_EMPRESA =
  'id,criado_em,status,nome_fantasia,responsavel,documento,whatsapp,email,endereco_coleta,pix_tipo,pix_chave,pix_nome,emite_nota,comissao_pct,aceite_termos_em,troca_defeito_dias,troca_vontade,troca_vontade_dias,troca_frete_vontade,troca_obs';

export async function acharEmpresa(token) {
  if (!TOKEN.test(String(token || ''))) return null;
  const [e] = await sb(`forn_empresas?token=eq.${token}&select=${COLS_EMPRESA}`);
  return e || null;
}

// CNPJ/CPF: só confere o tamanho (não valida dígitos para não travar cadastro por engano de digitação).
export function validarEmpresaBasica(b, { exigirPix = false } = {}) {
  const nome = txt(b.nome_fantasia, 80);
  const resp = txt(b.responsavel, 80);
  const whats = so_digitos(b.whatsapp);
  const email = txt(b.email, 120).toLowerCase();
  const doc = so_digitos(b.documento);
  if (nome.length < 2) return { erro: 'Informe o nome da empresa.' };
  if (resp.length < 3) return { erro: 'Informe o nome do responsável.' };
  if (whats.length < 10 || whats.length > 13) return { erro: 'WhatsApp inválido. Use DDD + número.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { erro: 'E-mail inválido.' };
  if (doc && doc.length !== 11 && doc.length !== 14) return { erro: 'CNPJ (14 números) ou CPF (11 números) inválido.' };
  const d = {
    nome_fantasia: nome,
    responsavel: resp,
    whatsapp: whats.length <= 11 ? '55' + whats : whats,
    email: email || null,
    documento: doc || null,
    endereco_coleta: txt(b.endereco_coleta, 200) || null,
    emite_nota: !!b.emite_nota,
  };
  if (b.troca_defeito_dias !== undefined || b.troca_vontade !== undefined) {
    const dd = Math.floor(Number(b.troca_defeito_dias));
    if (!(dd >= 7 && dd <= 365)) return { erro: 'Prazo de troca por defeito: informe entre 7 e 365 dias (o mínimo legal é 30 para a maioria dos calçados).' };
    d.troca_defeito_dias = dd;
    d.troca_vontade = !!b.troca_vontade;
    const dv = Math.floor(Number(b.troca_vontade_dias));
    d.troca_vontade_dias = d.troca_vontade && dv > 0 && dv <= 365 ? dv : null;
    if (d.troca_vontade && !d.troca_vontade_dias) return { erro: 'Se você aceita troca por tamanho ou vontade, informe em quantos dias.' };
    d.troca_frete_vontade = b.troca_frete_vontade === 'fornecedor' ? 'fornecedor' : 'comprador';
    d.troca_obs = txt(b.troca_obs, 300) || null;
  }
  if (b.pix_chave !== undefined || exigirPix) {
    const tipo = txt(b.pix_tipo, 12);
    const chave = txt(b.pix_chave, 80);
    if (!['cpf', 'cnpj', 'celular', 'email', 'aleatoria'].includes(tipo)) return { erro: 'Escolha o tipo da chave PIX.' };
    if (chave.length < 5) return { erro: 'Informe a chave PIX.' };
    if ((tipo === 'cpf' && so_digitos(chave).length !== 11) || (tipo === 'cnpj' && so_digitos(chave).length !== 14)) return { erro: 'A chave PIX não confere com o tipo escolhido.' };
    if (tipo === 'celular' && (so_digitos(chave).length < 10 || so_digitos(chave).length > 13)) return { erro: 'Celular da chave PIX inválido.' };
    const pnome = txt(b.pix_nome, 40);
    if (pnome.length < 3) return { erro: 'Informe o nome do titular da conta PIX, como aparece no banco.' };
    d.pix_tipo = tipo; d.pix_chave = chave; d.pix_nome = pnome;
  }
  return { dados: d };
}

const FOTO_OK = (url) => !url || /^https:\/\//i.test(url);

// Dados de um modelo digitados pelo fornecedor. O preço digitado é o que ELE quer receber.
export function validarModeloFornecedor(c, comissaoPct) {
  const titulo = txt(c.titulo, 120);
  if (titulo.length < 3) return { erro: 'Informe o nome do modelo (mínimo 3 letras).' };
  const pf = numeroBR(c.preco);
  if (!(pf > 0 && pf < 100000)) return { erro: 'Informe o seu preço (o que você quer receber por par). Precisa ser maior que zero.' };
  const foto = txt(c.foto_url, 500);
  if (!FOTO_OK(foto)) return { erro: 'O endereço da foto precisa começar com https://' };
  if (!foto) return { erro: 'Coloque pelo menos uma foto do modelo.' };
  const estoque = ['disponivel', 'sob_consulta', 'esgotado'].includes(c.estoque_status) ? c.estoque_status : 'disponivel';
  const prazo = Math.floor(Number(c.prazo_postagem_dias));
  const conf = Math.floor(Number(c.prazo_confeccao_dias));
  const pct = Number(comissaoPct) >= 0 ? Number(comissaoPct) : COMISSAO_PADRAO;
  return {
    dados: {
      nome: titulo,
      titulo_publico: titulo,
      categoria: txt(c.categoria, 60) || null,
      material: txt(c.material, 80) || null,
      tamanhos: txt(c.tamanhos, 80) || null,
      descricao: txt(c.descricao, 1500) || null,
      foto_url: foto,
      preco_fornecedor: r2(pf),
      preco_venda_sugerido: precoCliente(pf, pct),
      preco_confirmado_em: new Date().toISOString(),
      estoque_status: estoque,
      prazo_postagem_dias: prazo > 0 && prazo <= 30 ? prazo : null,
      prazo_confeccao_dias: conf > 0 && conf <= 120 ? conf : null,
      custo: 0, // fica fora do catálogo de lotes (revendedores)
    },
  };
}

export const COLS_PRODUTO =
  'id,titulo_publico,descricao,categoria,material,tamanhos,foto_url,preco_fornecedor,preco_venda_sugerido,estoque_status,prazo_postagem_dias,prazo_confeccao_dias,revisao,publicado,ativo,criado_em';

// Recalcula o preço ao cliente de todos os modelos de uma empresa (quando a comissão muda).
export async function recalcularPrecos(empresaId, pct) {
  const lista = await sb(`rf_produtos?fornecedor_id=eq.${empresaId}&select=id,preco_fornecedor`);
  for (const p of lista) {
    if (Number(p.preco_fornecedor) > 0) {
      await sb(`rf_produtos?id=eq.${p.id}`, { method: 'PATCH', body: JSON.stringify({ preco_venda_sugerido: precoCliente(p.preco_fornecedor, pct) }) });
    }
  }
}
