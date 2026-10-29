// Divulgação digital e troca entre parceiros: regras compartilhadas (navegador e servidor).
export const CANAIS = {
  whatsapp: 'Status do WhatsApp',
  instagram: 'Instagram (stories ou post)',
  facebook: 'Facebook',
  grupo: 'Grupo ou lista de contatos',
  outro: 'Outro canal',
};

export const SELOS = [
  [12, 'Parceiro Ouro', '#b7791f'],
  [4, 'Parceiro Prata', '#64748b'],
  [1, 'Parceiro Divulgador', '#8a5429'],
];
export const seloDe = (n) => { const s = SELOS.find((x) => n >= x[0]); return s ? { nome: s[1], cor: s[2] } : null; };

// Número da semana (domingo a sábado) para o rodízio dos temas.
export function semanaDe(d = new Date()) {
  const ini = Date.UTC(d.getUTCFullYear(), 0, 1);
  const n = Math.floor((d.getTime() - ini + new Date(ini).getUTCDay() * 86400000) / (7 * 86400000)) + 1;
  return { chave: `${d.getUTCFullYear()}-S${String(n).padStart(2, '0')}`, n };
}

// Um tema novo por semana: o parceiro publica algo diferente a cada vez, sem repetir.
export const TEMAS = [
  { t: 'Conheça o Ponto Parceiro', f: (n, c) => `Você conhece o ${n}? Somos Ponto Parceiro do Radar em ${c}.` },
  { t: 'Calçado direto da fábrica', f: (n, c) => `Calçados e acessórios direto da fábrica de Franca, com entrega em dia marcado em ${c}. Conheça pelo QR.` },
  { t: 'Entrega em dia marcado', f: (n, c) => `Quem compra no site recebe em ${c} no dia combinado da cidade. Veja como funciona pelo QR.` },
  { t: 'Dica da semana', f: () => 'Dica: meça o seu pé no fim do dia, quando ele está mais inchado, e compare com a tabela do site antes de comprar.' },
  { t: 'Apoie quem é daqui', f: (n, c) => `Em ${c}, os parceiros se ajudam a divulgar. O ${n} participa do Radar de Pontos. Conheça os parceiros pelo QR.` },
  { t: 'Troca de divulgação', f: (n, c) => `Quer aparecer de graça na Vitrine dos Parceiros? É só trocar divulgação com a gente em ${c}. Veja como participar.` },
  { t: 'Pergunta da semana', f: () => 'Pergunta da semana: você prefere comprar calçado na loja ou pelo celular, com entrega marcada? Conte nos comentários.' },
  { t: 'Novidades da loja', f: (n, c) => `Tem novidade de calçados de fábrica no site, com entrega em ${c}. Dê uma olhada pelo QR.` },
];
export const temaDa = (n) => TEMAS[((n % TEMAS.length) + TEMAS.length) % TEMAS.length];
export const legenda = (ponto, link, n) => {
  const t = temaDa(n);
  return `${t.f(ponto.nome, ponto.cidade)}\n\n👉 ${link}\n\n#PontoParceiro #${String(ponto.cidade).replace(/\s+/g, '')} #CalçadosDeFábrica`;
};
export const textoTroca = (de, para, linkDe) =>
  `Olá, ${para}! Aqui é ${de}, também parceiro do Radar. Que tal uma troca de divulgação? Eu divulgo o seu negócio nos meus canais e você divulga o meu nos seus. Sem custo. Meu link: ${linkDe}`;

export const linkValido = (v) => { try { const u = new URL(String(v)); return /^https?:$/.test(u.protocol) && String(v).length <= 300; } catch (e) { return false; } };
