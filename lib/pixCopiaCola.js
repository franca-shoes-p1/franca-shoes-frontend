// Gera o PIX "copia e cola" (BR Code estático) com o valor já preenchido.
// Serve no navegador e no servidor. Padrão do Banco Central: campos "ID + tamanho + valor" e CRC16 no final.

const campo = (id, valor) => id + String(valor.length).padStart(2, '0') + valor;

export function crc16(texto) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

const limpa = (t, n) =>
  String(t || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, n)
    .toUpperCase();

// Deixa a chave no formato que os bancos esperam.
export function chavePix(tipo, chave) {
  const c = String(chave || '').trim();
  if (tipo === 'cpf' || tipo === 'cnpj') return c.replace(/\D/g, '');
  if (tipo === 'celular') {
    const d = c.replace(/\D/g, '');
    return '+' + (d.startsWith('55') && d.length >= 12 ? d : '55' + d);
  }
  if (tipo === 'email') return c.toLowerCase();
  return c; // aleatória
}

export function pixCopiaECola({ tipo, chave, nome, cidade = 'FRANCA', valor, txid = '***' }) {
  const k = chavePix(tipo, chave);
  const conta = campo('00', 'br.gov.bcb.pix') + campo('01', k);
  const v = Number(valor);
  const corpo =
    campo('00', '01') +
    campo('01', '11') +
    campo('26', conta) +
    campo('52', '0000') +
    campo('53', '986') +
    (v > 0 ? campo('54', v.toFixed(2)) : '') +
    campo('58', 'BR') +
    campo('59', limpa(nome, 25) || 'FORNECEDOR') +
    campo('60', limpa(cidade, 15) || 'FRANCA') +
    campo('62', campo('05', String(txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***')) +
    '6304';
  return corpo + crc16(corpo);
}
