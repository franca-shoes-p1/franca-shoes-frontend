import crypto from 'crypto';
import { txt } from './varejoServer';
import { TIPOS, STATUS, NOTA_TIPO } from './pontos';

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function aleatorio(n) {
  const b = crypto.randomBytes(n);
  let s = '';
  for (let i = 0; i < n; i++) s += LETRAS[b[i] % LETRAS.length];
  return s;
}
export function sigla(cidade) {
  const s = cidade.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
  return s.padEnd(2, 'X');
}
const num = (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));

export function validar(c, cidadePadrao) {
  const nome = txt(c.nome, 120);
  const cidade = txt(c.cidade || cidadePadrao, 80);
  const uf = txt(c.uf, 2).toUpperCase();
  if (nome.length < 2) return { erro: 'Informe o nome do ponto.' };
  if (!cidade) return { erro: 'Informe a cidade.' };
  if (uf.length !== 2) return { erro: 'Informe o estado (UF).' };
  const tipo = TIPOS[c.tipo] ? c.tipo : 'comercio';
  const lat = num(c.lat), lng = num(c.lng);
  if ((lat !== null && Math.abs(lat) > 90) || (lng !== null && Math.abs(lng) > 180)) return { erro: 'Coordenadas inválidas.' };
  const nota = Math.min(5, Math.max(1, Math.round(num(c.nota) || NOTA_TIPO[tipo] || 3)));
  const dados = {
    cidade, uf, nome, tipo, lat, lng, nota,
    endereco: txt(c.endereco, 200) || null,
    contato_email: txt(c.contato_email, 120) || null,
    contato_whatsapp: txt(c.contato_whatsapp, 30).replace(/[^\d+()\- ]/g, '') || null,
    observacao: txt(c.observacao, 400) || null,
  };
  if (c.status !== undefined) {
    if (!STATUS[c.status]) return { erro: 'Status inválido.' };
    dados.status = c.status;
  }
  return { dados };
}

