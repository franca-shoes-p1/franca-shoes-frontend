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
