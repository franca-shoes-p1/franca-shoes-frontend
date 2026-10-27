// Regras das postagens (servidor): o que é aceito, como é limpo e como entra no Supabase.
// Usado pela entrada automática do n8n (/api/postagens/receber) e pela importação do painel do dono.
import crypto from 'crypto';
import { sb, txt } from './varejoServer';
import { urlOk } from './supabaseServer';

export const REDES = ['facebook', 'instagram', 'telegram', 'email'];
export const TEMAS = ['azul', 'verde', 'terra', 'noite'];
export const MAX_POR_LOTE = 60;

const httpsOuNulo = (v) => {
  const s = String(v ?? '').trim();
  return s && urlOk(s) && s.length <= 600 ? s : null;
};

// Valida e limpa UMA postagem vinda de fora. Devolve { erro } ou { dados }.
export function validarPostagem(c, { lote, origem } = {}) {
  if (!c || typeof c !== 'object') return { erro: 'Postagem inválida.' };
  const rede = String(c.rede || '').toLowerCase().trim();
  if (!REDES.includes(rede)) return { erro: `Rede inválida (use: ${REDES.join(', ')}).` };

  const titulo = txt(c.titulo, 140);
  const texto = String(c.texto ?? '').trim().slice(0, 6000);
  if (titulo.length < 3) return { erro: 'Falta o título (mínimo 3 letras).' };
  if (texto.length < 5) return { erro: 'Falta o texto da postagem.' };

  const quando = new Date(c.agendada_para);
  if (Number.isNaN(quando.getTime())) return { erro: 'Data/hora de agendamento inválida (use o formato 2026-10-28T10:00:00-03:00).' };
  const agora = Date.now();
  if (quando.getTime() < agora - 7 * 24 * 3600 * 1000 || quando.getTime() > agora + 120 * 24 * 3600 * 1000) {
    return { erro: 'Agendamento fora do intervalo aceito (de 7 dias atrás até 120 dias à frente).' };
  }

  if (c.link_destino && !httpsOuNulo(c.link_destino)) return { erro: 'O link de destino precisa começar com https://' };
  if (c.imagem_url && !httpsOuNulo(c.imagem_url)) return { erro: 'O endereço da imagem precisa começar com https://' };

  const tema = TEMAS.includes(c.arte_tema) ? c.arte_tema : 'azul';
  const dados = {
    chave_externa: txt(c.chave, 120) || null,
    projeto: txt(c.projeto, 80) || 'igreja.eco.br',
    lote: txt(lote ?? c.lote, 60) || null,
    origem: ['ia', 'lote', 'manual'].includes(origem) ? origem : 'ia',
    rede,
    titulo,
    texto,
    hashtags: txt(c.hashtags, 400) || null,
    link_destino: httpsOuNulo(c.link_destino),
    imagem_url: httpsOuNulo(c.imagem_url),
    arte_titulo: txt(c.arte_titulo, 90) || null,
    arte_subtitulo: txt(c.arte_subtitulo, 160) || null,
    arte_tema: tema,
    email_assunto: rede === 'email' ? txt(c.email_assunto, 160) || titulo : null,
    agendada_para: quando.toISOString(),
    status: 'agendada',
  };
  return { dados };
}

// Grava uma lista. Postagens repetidas (mesma "chave") são ignoradas, não duplicadas.
// Devolve { criadas, ignoradas, erros: [{ indice, erro }] }.
export async function inserirLote(lista, opcoes = {}) {
  const itens = Array.isArray(lista) ? lista : [];
  if (!itens.length) return { criadas: 0, ignoradas: 0, erros: [{ indice: 0, erro: 'Nenhuma postagem recebida.' }] };
  if (itens.length > MAX_POR_LOTE) throw Object.assign(new Error(`Máximo de ${MAX_POR_LOTE} postagens por envio.`), { publico: true });

  const validas = [];
  const erros = [];
  itens.forEach((c, indice) => {
    const r = validarPostagem(c, opcoes);
    if (r.erro) erros.push({ indice, erro: r.erro });
    else validas.push(r.dados);
  });
  // Mesma chave repetida dentro do próprio envio: fica só a primeira.
  const vistas = new Set();
  const unicas = validas.filter((d) => {
    if (!d.chave_externa) return true;
    if (vistas.has(d.chave_externa)) return false;
    vistas.add(d.chave_externa);
    return true;
  });

  let criadas = 0;
  if (unicas.length) {
    const gravadas = await sb('op_postagens?on_conflict=chave_externa', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(unicas),
    });
    criadas = Array.isArray(gravadas) ? gravadas.length : 0;
  }
  return { criadas, ignoradas: validas.length - criadas, erros };
}

// Compara o token enviado pelo n8n com o guardado na Vercel (sem vazar por tempo de resposta).
export function tokenConfere(recebido) {
  const certo = process.env.N8N_TOKEN_POSTAGENS || process.env.N8N_WEBHOOK_TOKEN || '';
  if (certo.length < 16) return false;
  const a = crypto.createHash('sha256').update(String(recebido || '')).digest();
  const b = crypto.createHash('sha256').update(certo).digest();
  return crypto.timingSafeEqual(a, b);
}
