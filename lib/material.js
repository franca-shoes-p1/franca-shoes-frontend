// Materiais impressos do Radar. Cada cidade tem códigos próprios para contar as visitas de panfletos e cartões.
// Os códigos começam com X e têm 5 letras: nunca batem com os códigos de pontos (6 caracteres).
export const WHATS_TXT = '(16) 99154-3663';
export const slug3 = (cidade) => String(cidade || '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
export const codigoMaterial = (cidade, tipo) => `X${slug3(cidade)}${tipo === 'cartao' ? 'C' : 'P'}`;
export const PARTES = {
  kit: 'Kit completo da cidade',
  panfleto: 'Panfleto A5 (4 por folha)',
  cartao: 'Cartão de visita (10 por folha)',
  cartaz: 'Cartazes dos locais autorizados',
};
