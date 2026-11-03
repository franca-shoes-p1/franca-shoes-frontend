// Central de Anúncios: gerar (IA com modelo de reserva), editar, aprovar/agendar e ver o resultado por canal. Só para quem fez login no painel.
import { exigirAdmin } from '../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../lib/varejoServer';
import { ESTADOS } from '../../../lib/varejo';
import { geminiJson } from '../../../lib/vitrineServer';
import { CANAIS_ANUNCIO, ANGULOS, campanhaDe, linkRastreado, modeloAnuncio, montarPrompt, conferirAnuncio } from '../../../lib/anuncios';

export const config = { maxDuration: 60 };

const dataOk = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));

async function carregar() {
  const anuncios = await sb('rf_anuncios?select=*&order=criado_em.desc&limit=300');
  const desde = new Date(Date.now() - 30 * 86400000).toISOString();
  const [vis, ped] = await Promise.all([
    sb(`rf_anuncios_visitas?select=canal,campanha&em=gte.${desde}&limit=20000`).catch(() => []),
    sb(`rf_encomendas?select=origem&origem=like.*/*&criado_em=gte.${desde}&limit=5000`).catch(() => []),
  ]);
  const linhas = {};
  const ref = (k) => linhas[k] || (linhas[k] = { canal: k.split('/')[0], campanha: k.split('/')[1], visitas: 0, pedidos: 0 });
  vis.forEach((v) => { ref(`${v.canal}/${v.campanha}`).visitas += 1; });
  ped.forEach((p) => { if (p.origem && p.origem.includes('/')) ref(p.origem).pedidos += 1; });
  const resultados = Object.values(linhas).sort((a, b) => b.pedidos - a.pedidos || b.visitas - a.visitas);
  return { anuncios, resultados };
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') return res.json(await carregar());
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
    const c = req.body && typeof req.body === 'object' ? req.body : {};

    if (c.acao === 'gerar') {
      const angulo = ANGULOS[c.angulo] ? c.angulo : 'prova';
      const canais = (Array.isArray(c.canais) ? c.canais : []).filter((x) => CANAIS_ANUNCIO[x]).slice(0, 7);
      if (!canais.length) return res.status(400).json({ erro: 'Escolha pelo menos um canal.' });
      const cidade = txt(c.cidade, 80);
      const uf = ESTADOS.includes(txt(c.uf, 2).toUpperCase()) ? txt(c.uf, 2).toUpperCase() : '';
      const campanha = campanhaDe(cidade);
      let ia = {}; let semIA = '';
      try {
        const r = await geminiJson(montarPrompt({ angulo, cidade, canais }));
        (Array.isArray(r.itens) ? r.itens : []).forEach((i) => { if (i && CANAIS_ANUNCIO[i.canal] && typeof i.texto === 'string' && i.texto.trim().length > 20) ia[i.canal] = i; });
      } catch (e) { semIA = e.semChave ? 'chave' : e.limite ? 'limite' : 'erro'; }
      const linhas = canais.map((canal) => {
        const link = linkRastreado({ canal, campanha, angulo, cidade, uf });
        const veio = ia[canal];
        let texto = veio ? txt(veio.texto, 2200) : modeloAnuncio({ canal, angulo, cidade, link });
        if (veio && !texto.includes('http')) texto += canal === 'reels' || canal === 'story' ? `\n\nLINK: ${link}` : `\n\n👉 ${link}`;
        return {
          campanha, canal, angulo, cidade: cidade || null, uf: uf || null, link, texto,
          titulo: txt(veio && veio.titulo, 80) || ANGULOS[angulo].titulo,
          arte: txt(veio && veio.arte, 300) || null,
          avisos: conferirAnuncio(texto, canal), gerado_por: veio ? 'ia' : 'modelo',
        };
      });
      await sb('rf_anuncios', { method: 'POST', body: JSON.stringify(linhas), headers: { Prefer: 'return=minimal' } });
      const nota = semIA === 'limite' ? ' A cota gratuita do Gemini acabou por hoje: usei os textos-modelo.' : semIA === 'chave' ? ' Falta GEMINI_API_KEY na Vercel: usei os textos-modelo.' : semIA ? ' A IA não respondeu: usei os textos-modelo.' : '';
      return res.json({ ...(await carregar()), aviso: `${linhas.length} anúncio(s) criado(s) como rascunho.${nota}` });
    }

    const id = txt(c.id, 40);
    if (!UUID.test(id)) return res.status(400).json({ erro: 'Anúncio inválido.' });
    if (c.acao === 'excluir') {
      await sb(`rf_anuncios?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      return res.json({ ...(await carregar()), aviso: 'Anúncio excluído.' });
    }
    if (c.acao === 'atualizar') {
      const d = { atualizado_em: new Date().toISOString() };
      if (c.status !== undefined) {
        if (!['rascunho', 'aprovado', 'publicado'].includes(c.status)) return res.status(400).json({ erro: 'Situação inválida.' });
        d.status = c.status;
        d.publicado_em = c.status === 'publicado' ? new Date().toISOString() : null;
      }
      if (c.agendado_para !== undefined) {
        if (c.agendado_para && !dataOk(String(c.agendado_para))) return res.status(400).json({ erro: 'Data inválida.' });
        d.agendado_para = c.agendado_para || null;
      }
      if (c.titulo !== undefined) d.titulo = txt(c.titulo, 80) || null;
      if (c.texto !== undefined) {
        const t = txt(c.texto, 2500);
        if (t.length < 10) return res.status(400).json({ erro: 'O texto ficou curto demais.' });
        const atual = await sb(`rf_anuncios?id=eq.${id}&select=canal&limit=1`);
        d.texto = t; d.avisos = conferirAnuncio(t, atual[0] && atual[0].canal);
      }
      await sb(`rf_anuncios?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(d), headers: { Prefer: 'return=minimal' } });
      return res.json({ ...(await carregar()), aviso: 'Salvo.' });
    }
    return res.status(400).json({ erro: 'Ação inválida.' });
  } catch (e) {
    const falta = /rf_anuncios|relation|does not exist|schema cache/i.test(e.message);
    console.error('admin/anuncios', e.message);
    return res.status(500).json({ erro: falta ? 'As tabelas ainda não existem: rode o SQL supabase-anuncios.sql no Supabase.' : 'Não foi possível concluir agora.' });
  }
}
