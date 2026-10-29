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
  pessoa: 'Pessoa ou profissional autônomo',
  grupo: 'Grupo, associação ou projeto',
  outro: 'Outro',
};

// Nota inicial de movimento (1 a 5) pelo tipo; você ajusta depois.
export const NOTA_TIPO = {
  rodoviaria: 5, universidade: 5, feira: 5, mercado: 4, igreja: 4,
  mural_publico: 3, comercio: 3, condominio: 3, pessoa: 3, grupo: 3, outro: 2,
};

export const STATUS = {
  mapeado: ['Mapeado', '#64748b'],
  convidado: ['Convidado', '#d97706'],
  autorizado: ['Autorizado', '#2563eb'],
  ativo: ['Ativo (cartaz colado)', '#16a34a'],
  recusado: ['Recusado', '#dc2626'],
};

export const CIDADES = {
  'Rio de Janeiro': { uf: 'RJ', lat: -22.9068, lng: -43.1729 },
  'Goiânia': { uf: 'GO', lat: -16.6869, lng: -49.2648 },
  'Curitiba': { uf: 'PR', lat: -25.4284, lng: -49.2733 },
  'Campo Grande': { uf: 'MS', lat: -20.4697, lng: -54.6201 },
  'Vitória': { uf: 'ES', lat: -20.3155, lng: -40.3128 },
  'Salvador': { uf: 'BA', lat: -12.9777, lng: -38.5016 },
  'Florianópolis': { uf: 'SC', lat: -27.5954, lng: -48.548 },
  'São Paulo': { uf: 'SP', lat: -23.5505, lng: -46.6333 },
  'Belo Horizonte': { uf: 'MG', lat: -19.9191, lng: -43.9386 },
  'Brasília': { uf: 'DF', lat: -15.7939, lng: -47.8828 },
  'Fortaleza': { uf: 'CE', lat: -3.7319, lng: -38.5267 },
  'Recife': { uf: 'PE', lat: -8.0476, lng: -34.877 },
  'Porto Alegre': { uf: 'RS', lat: -30.0346, lng: -51.2177 },
  'Manaus': { uf: 'AM', lat: -3.119, lng: -60.0217 },
  'Belém': { uf: 'PA', lat: -1.4558, lng: -48.4902 },
  'São Luís': { uf: 'MA', lat: -2.5307, lng: -44.3068 },
  'Teresina': { uf: 'PI', lat: -5.0892, lng: -42.8019 },
  'Natal': { uf: 'RN', lat: -5.7945, lng: -35.211 },
  'João Pessoa': { uf: 'PB', lat: -7.1195, lng: -34.845 },
  'Maceió': { uf: 'AL', lat: -9.6658, lng: -35.7353 },
  'Aracaju': { uf: 'SE', lat: -10.9472, lng: -37.0731 },
  'Cuiabá': { uf: 'MT', lat: -15.6014, lng: -56.0979 },
  'Palmas': { uf: 'TO', lat: -10.1689, lng: -48.3317 },
  'Porto Velho': { uf: 'RO', lat: -8.7612, lng: -63.9004 },
  'Rio Branco': { uf: 'AC', lat: -9.9747, lng: -67.81 },
  'Macapá': { uf: 'AP', lat: 0.0349, lng: -51.0694 },
  'Boa Vista': { uf: 'RR', lat: 2.8235, lng: -60.6758 },
};

// As nove primeiras são as cidades da primeira fase, na ordem de visita. As demais capitais ficam disponíveis para as próximas fases.
export const PRIMEIRA_FASE = ['Rio de Janeiro', 'Goiânia', 'Curitiba', 'Campo Grande', 'Vitória', 'Salvador', 'Florianópolis', 'São Paulo', 'Belo Horizonte'];

export const SITE_PUBLICO = 'https://www.igreja.eco.br';

// Rodoviárias e terminais principais da primeira fase, para entrar e sair rápido. As coordenadas são aproximadas:
// confira no mapa e ajuste. Nenhum contato é inventado.
const RODO = {
  'Rio de Janeiro': [['Rodoviária Novo Rio', -22.8985, -43.2092], ['Terminal Rodoviário Menezes Cortes (Centro)', -22.9007, -43.1783]],
  'Goiânia': [['Terminal Rodoviário de Goiânia', -16.6717, -49.2670]],
  'Curitiba': [['Rodoferroviária de Curitiba', -25.4372, -49.2585]],
  'Campo Grande': [['Terminal Rodoviário de Campo Grande', -20.4553, -54.5990]],
  'Vitória': [['Rodoviária de Vitória', -20.3194, -40.3378]],
  'Salvador': [['Rodoviária de Salvador', -12.9996, -38.4708]],
  'Florianópolis': [['Terminal Rodoviário Rita Maria', -27.5977, -48.5575], ['Terminal Rodoviário Rodoviária Velha (TICEN)', -27.5985, -48.5530]],
  'São Paulo': [['Terminal Rodoviário Tietê', -23.5160, -46.6256], ['Terminal Rodoviário Barra Funda', -23.5265, -46.6672], ['Terminal Rodoviário Jabaquara', -23.6678, -46.6407]],
  'Belo Horizonte': [['Terminal Rodoviário de Belo Horizonte', -19.9157, -43.9468]],
};
const OUTROS_BH = [
  ['Praça Sete de Setembro (Centro)', 'mural_publico', -19.9208, -43.9378],
  ['Mercado Central', 'mercado', -19.9197, -43.9405],
  ['Mercado Novo', 'mercado', -19.9228, -43.9427],
  ['Praça da Liberdade (Savassi)', 'mural_publico', -19.9318, -43.9380],
  ['UFMG - Campus Pampulha', 'universidade', -19.8693, -43.9645],
  ['PUC Minas - Coração Eucarístico', 'universidade', -19.9227, -43.9524],
  ['Estação Central do Metrô', 'rodoviaria', -19.9170, -43.9430],
];
export const SEMENTES = Object.fromEntries(Object.entries(RODO).map(([cidade, lista]) => {
  const itens = [...lista.map(([n, la, lo]) => [n, 'rodoviaria', la, lo]), ...(cidade === 'Belo Horizonte' ? OUTROS_BH : [])];
  return [cidade, itens.map(([nome, tipo, lat, lng]) => ({
    cidade, uf: CIDADES[cidade].uf, nome, tipo, lat, lng,
    observacao: 'Local público: pedir autorização à administração. Coordenada aproximada, confira no mapa.',
  }))];
}));
export const SEMENTE_BH = SEMENTES['Belo Horizonte'];

// Textos prontos para propor a parceria. Todos deixam claro que é uma TROCA de divulgação, sem custo e sem contrato.
const TROCA =
  `A proposta é uma troca de divulgação:\n` +
  `• Você deixa um cartaz pequeno com QR Code no seu espaço.\n` +
  `• Em troca, divulgamos o seu negócio ou projeto de graça na Vitrine dos Parceiros do nosso site, com o logotipo, a frase e os contatos que você mesmo escolher.\n` +
  `• Se preferir não deixar cartaz, pode divulgar pelo celular (status, stories ou grupos), com imagem e legenda prontas que o painel entrega.\n` +
  `Cada um ajuda o outro a ser encontrado. Sem custo, sem contrato, e você sai quando quiser.`;

// 1ª mensagem (WhatsApp)
export function textoConvite({ nome, cidade, link }) {
  return (
    `Olá! Aqui é o Ricardo, de Franca-SP. Estou levando calçados e acessórios direto da fábrica para ${cidade} ` +
    `e gostaria de propor uma parceria com "${nome}".\n\n${TROCA}\n\n` +
    `Para ver como funciona e responder (sim ou não), é só clicar: ${link}\n\n` +
    `Se não for do seu interesse, responda "não" e eu não envio mais mensagens. Obrigado!`
  );
}

// 1ª mensagem (e-mail)
export function assuntoEmail({ cidade }) {
  return `Troca de divulgação: Ponto Parceiro em ${cidade}`;
}

// Lembrete único, depois de alguns dias sem resposta
export function textoLembrete({ nome, link }) {
  return (
    `Olá! Passo só uma vez para lembrar da proposta de troca de divulgação para "${nome}": ` +
    `você deixa um cartaz com QR Code e divulgamos o seu negócio de graça na nossa Vitrine dos Parceiros.\n\n` +
    `Ver e responder: ${link}\n\nSe preferir não participar, responda "não". Sem problema algum!`
  );
}

// Para pessoas que querem participar por conta própria (divulgar o próprio trabalho ou ceder um espaço)
export function textoConvitePessoa({ link }) {
  return (
    `Olá! Estou montando o Radar de Pontos: cartazes com QR Code em locais autorizados, que levam à loja de calçados de fábrica de Franca. ` +
    `Qualquer pessoa pode participar: quem tem um negócio ou serviço ganha uma vitrine grátis no site, quem tem um espaço (mural, condomínio, igreja, escola) pode ceder um cantinho para o cartaz, e quem não tem ponto físico divulga pelo celular, com imagem e legenda prontas. ` +
    `É uma troca de divulgação, sem custo e sem contrato.\n\nParticipe aqui: ${link}`
  );
}
