// Rodoviárias onde a entrega em mãos é feita (maiores do país) e regra entre rota e Correios.
export const RODOVIARIAS = [
  { id: 'bh', nome: 'Belo Horizonte (MG)', cidade: 'Belo Horizonte', uf: 'MG' },
  { id: 'udi', nome: 'Uberlândia (MG)', cidade: 'Uberlândia', uf: 'MG' },
  { id: 'rio', nome: 'Rio de Janeiro, Novo Rio (RJ)', cidade: 'Rio de Janeiro', uf: 'RJ' },
  { id: 'vit', nome: 'Vitória (ES)', cidade: 'Vitória', uf: 'ES' },
  { id: 'goi', nome: 'Goiânia (GO)', cidade: 'Goiânia', uf: 'GO' },
  { id: 'bsb', nome: 'Brasília (DF)', cidade: 'Brasília', uf: 'DF' },
  { id: 'cg', nome: 'Campo Grande (MS)', cidade: 'Campo Grande', uf: 'MS' },
  { id: 'cwb', nome: 'Curitiba (PR)', cidade: 'Curitiba', uf: 'PR' },
  { id: 'fln', nome: 'Florianópolis (SC)', cidade: 'Florianópolis', uf: 'SC' },
  { id: 'poa', nome: 'Porto Alegre (RS)', cidade: 'Porto Alegre', uf: 'RS' },
];
// São Paulo (Tietê) é exceção: só quando houver pedidos suficientes, saindo do estado e voltando por outro.
export const ESPECIAL = { id: 'sp', nome: 'São Paulo, Tietê (SP) — rota especial' };

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function rodoviariaDe(cidade, uf) {
  const c = norm(cidade);
  return RODOVIARIAS.find((r) => norm(r.cidade) === c && (!uf || r.uf === String(uf).toUpperCase())) || null;
}
// Sugestão: rota se a cidade do revendedor é uma rodoviária atendida; senão, Correios.
export function modoSugerido(cidade, uf) {
  return rodoviariaDe(cidade, uf) ? 'rota' : 'correios';
}
// Frete cobrado do comprador = valor da tabela (custo estimado) + 10%. A diferença para o custo real aparece no acerto.
export const FRETE_MARGEM = 1.1;
export const comMargemFrete = (v) => Math.ceil(Number(v) * FRETE_MARGEM * 100 - 1e-9) / 100;
