// Radar de Pontos: constantes e regras compartilhadas (servidor e navegador).

export const TIPOS = {
  rodoviaria: 'Rodoviária / terminal',
  universidade: 'Faculdade / centro acadêmico',
  igreja: 'Igreja / templo',
  mercado: 'Mercado / supermercado',
  feira: 'Feira / evento',
  comercio: 'Comércio (padaria, salão, loja)',
  condominio: 'Condomínio (mural)',
  mural_publico: 'Mural público / biblioteca',
  outro: 'Outro',
};

// Nota inicial de movimento (1 a 5) pelo tipo; você ajusta depois.
export const NOTA_TIPO = {
  rodoviaria: 5, universidade: 5, feira: 5, mercado: 4, igreja: 4,
  mural_publico: 3, comercio: 3, condominio: 3, outro: 2,
};

export const STATUS = {
  mapeado: ['Mapeado', '#64748b'],
  convidado: ['Convidado', '#d97706'],
  autorizado: ['Autorizado', '#2563eb'],
  ativo: ['Ativo (cartaz colado)', '#16a34a'],
  recusado: ['Recusado', '#dc2626'],
};

export const CIDADES = {
  'Belo Horizonte': { uf: 'MG', lat: -19.9191, lng: -43.9386 },
};

export const SITE_PUBLICO = 'https://www.igreja.eco.br';

// Locais públicos conhecidos de BH para começar. As coordenadas são aproximadas:
// confira no mapa e ajuste. Nenhum contato é inventado.
export const SEMENTE_BH = [
  ['Terminal Rodoviário de Belo Horizonte', 'rodoviaria', -19.9157, -43.9468],
  ['Praça Sete de Setembro (Centro)', 'mural_publico', -19.9208, -43.9378],
  ['Mercado Central', 'mercado', -19.9197, -43.9405],
  ['Mercado Novo', 'mercado', -19.9228, -43.9427],
  ['Praça da Liberdade (Savassi)', 'mural_publico', -19.9318, -43.9380],
  ['UFMG - Campus Pampulha', 'universidade', -19.8693, -43.9645],
  ['PUC Minas - Coração Eucarístico', 'universidade', -19.9227, -43.9524],
  ['Estação Central do Metrô', 'rodoviaria', -19.9170, -43.9430],
].map(([nome, tipo, lat, lng]) => ({
  cidade: 'Belo Horizonte', uf: 'MG', nome, tipo, lat, lng,
  observacao: 'Local público: pedir autorização à administração. Coordenada aproximada, confira no mapa.',
}));

export function textoConvite({ nome, cidade, link }) {
  return (
    `Olá! Aqui é o Ricardo, de Franca-SP. Estou levando calçados e acessórios direto da fábrica para ${cidade}, ` +
    `com entrega em dia marcado. Gostaria de deixar um cartaz pequeno com QR Code no mural de "${nome}". ` +
    `Em troca, o seu negócio ganha uma vitrine grátis no nosso site, com logotipo e contatos que você mesmo escolhe.\n\n` +
    `Para autorizar ou recusar, é só clicar: ${link}\n\n` +
    `Se não quiser receber novas mensagens, é só responder "não". Obrigado!`
  );
}
