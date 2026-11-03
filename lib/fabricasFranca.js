// Vitrine "Fábricas de Franca" (navegador e servidor). Nenhum segredo aqui.
export const SEGMENTOS = { calcados: 'Calçados', acessorios: 'Acessórios', bolsas: 'Bolsas e cintos', outros: 'Outros' };
export const BONUS_PADRAO = 30;
export const soDigitos = (v) => String(v ?? '').replace(/\D/g, '');

/* Confere a chave de acesso da nota fiscal eletrônica (NF-e modelo 55 ou NFC-e modelo 65).
   Estrutura de 44 números: UF(2) AAMM(4) CNPJ(14) modelo(2) série(3) número(9) tipo(1) código(8) dígito(1).
   O último número é um dígito verificador (módulo 11): se não bater, a chave foi digitada errada ou inventada.
   Isto NÃO prova que a nota existe na Receita: a consulta oficial é feita à mão no portal da NF-e. */
export function validarChaveNfe(entrada, agora = new Date()) {
  const k = soDigitos(entrada);
  if (k.length !== 44) return { ok: false, motivo: 'A chave da nota tem 44 números. Confira se copiou tudo.' };
  let soma = 0;
  let peso = 2;
  for (let i = 42; i >= 0; i--) {
    soma += Number(k[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;
  if (dv !== Number(k[43])) return { ok: false, motivo: 'A chave da nota não confere. Confira os números.' };
  const modelo = k.slice(20, 22);
  if (modelo !== '55' && modelo !== '65') return { ok: false, motivo: 'Esta chave não é de nota fiscal de venda (modelo 55 ou 65).' };
  const ano = 2000 + Number(k.slice(2, 4));
  const mes = Number(k.slice(4, 6));
  if (mes < 1 || mes > 12) return { ok: false, motivo: 'A data dentro da chave é inválida.' };
  const meses = (agora.getFullYear() - ano) * 12 + (agora.getMonth() + 1 - mes);
  if (meses < 0) return { ok: false, motivo: 'A data dentro da chave está no futuro.' };
  return {
    ok: true,
    chave: k,
    cnpj: k.slice(6, 20),
    emissao: `${String(mes).padStart(2, '0')}/${ano}`,
    recente: meses <= 3,
  };
}

export const cnpjOk = (v) => soDigitos(v).length === 14;
