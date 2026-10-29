// Perfil do Ponto Parceiro: regras compartilhadas (navegador e servidor).
export const PERFIL_STATUS = {
  rascunho: ['Ainda não enviado', '#64748b'],
  pendente: ['Em análise', '#d97706'],
  aprovado: ['Publicado', '#16a34a'],
  reprovado: ['Precisa de ajuste', '#dc2626'],
};

export const slugCidade = (c) => String(c || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const corta = (v, n) => String(v == null ? '' : v).replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

// Limpa o que o parceiro digitou. Devolve só campos permitidos, nunca HTML.
export function limparPerfil(b, baseStorage) {
  const o = b || {};
  const out = {
    perfil_slogan: corta(o.slogan, 80) || null,
    perfil_descricao: corta(o.descricao, 400) || null,
    perfil_horario: corta(o.horario, 120) || null,
    perfil_endereco: corta(o.endereco, 160) || null,
  };
  const wpp = String(o.whatsapp || '').replace(/\D/g, '');
  if (wpp && (wpp.length < 10 || wpp.length > 13)) return { erro: 'WhatsApp inválido. Use DDD + número.' };
  out.perfil_whatsapp = wpp ? (wpp.length <= 11 ? '55' + wpp : wpp) : null;
  const ig = String(o.instagram || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
  if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) return { erro: 'Instagram inválido. Escreva só o nome de usuário.' };
  out.perfil_instagram = ig || null;
  const site = String(o.site || '').trim();
  if (site && !/^https?:\/\/[^\s<>"']{3,200}$/i.test(site)) return { erro: 'Site inválido. Comece com https://' };
  out.perfil_site = site || null;
  const logo = String(o.logo || '').trim();
  if (logo) {
    if (!baseStorage || !logo.startsWith(baseStorage + '/storage/v1/object/public/')) return { erro: 'Logotipo inválido. Envie a imagem pelo botão.' };
    out.perfil_logo = logo;
  } else out.perfil_logo = null;
  return { dados: out };
}

// Campos que podem aparecer em páginas públicas.
export const CAMPOS_PUBLICOS = 'codigo,nome,cidade,uf,tipo,perfil_slogan,perfil_descricao,perfil_logo,perfil_whatsapp,perfil_instagram,perfil_site,perfil_horario,perfil_endereco';
