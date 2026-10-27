// Caixa de entrada única do painel: junta, numa lista só, tudo que chega do site e precisa de resposta.
//   GET  -> lista (mais novos primeiro)
//   PATCH { fonte, id, status?, nota_interna? } -> muda o status e/ou a nota de uma linha
import { exigirAdmin } from '../../../../lib/adminAuth';
import { sb, txt, UUID } from '../../../../lib/varejoServer';
import { FONTES } from '../../../../lib/atendimento';

const LIMITE = 100;

function normalizar(fonte, r) {
  const base = { fonte, id: r.id, numero: r.numero || null, criado_em: r.criado_em, nome: r.nome, whatsapp: r.whatsapp || '', status: r.status, nota_interna: r.nota_interna || '' };
  if (fonte === 'contato') return { ...base, email: r.email || '', titulo: r.assunto, texto: r.mensagem, extra: r.pagina ? `Página: ${r.pagina}` : '' };
  if (fonte === 'atelie_pedido') return { ...base, email: '', titulo: r.servico, texto: r.descricao || '', extra: r.prazo ? `Prazo: ${r.prazo}` : '' };
  if (fonte === 'atelie_montador') return { ...base, email: '', titulo: `Montador: ${r.setor}`, texto: [r.disponibilidade, r.experiencia].filter(Boolean).join(' | '), extra: '' };
  return { ...base, email: '', titulo: 'Quer ser operador', texto: r.interesse || '', extra: [r.cidade, r.origem].filter(Boolean).join(' · ') };
}

export default async function handler(req, res) {
  if (!exigirAdmin(req, res)) return;
  try {
    if (req.method === 'GET') {
      const chaves = Object.keys(FONTES);
      const listas = await Promise.all(
        chaves.map(async (k) => {
          try {
            const linhas = await sb(`${FONTES[k].tabela}?select=*&order=criado_em.desc&limit=${LIMITE}`);
            return linhas.map((r) => normalizar(k, r));
          } catch (e) {
            // tabela ainda não criada (ex.: op_contatos antes de rodar o SQL): não derruba o painel
            console.error('admin/atendimento', k, String(e.message).slice(0, 120));
            return { erro: k };
          }
        })
      );
      const itens = listas.filter(Array.isArray).flat().sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em)));
      const faltando = listas.filter((l) => !Array.isArray(l)).map((l) => FONTES[l.erro].rotulo);
      return res.json({ itens, faltando });
    }

    if (req.method === 'PATCH') {
      const c = req.body && typeof req.body === 'object' ? req.body : {};
      const f = FONTES[c.fonte];
      if (!f || !UUID.test(String(c.id || ''))) return res.status(400).json({ erro: 'Item inválido.' });
      const mudanca = {};
      if (c.status !== undefined) {
        if (!f.status.includes(c.status)) return res.status(400).json({ erro: 'Status inválido para este tipo.' });
        mudanca.status = c.status;
      }
      if (c.nota_interna !== undefined) mudanca.nota_interna = txt(c.nota_interna, 1000) || null;
      if (!Object.keys(mudanca).length) return res.status(400).json({ erro: 'Nada para salvar.' });
      if (c.fonte === 'contato') mudanca.atualizado_em = new Date().toISOString();
      await sb(`${f.tabela}?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify(mudanca) });
      return res.json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (e) {
    console.error('admin/atendimento', e.message);
    return res.status(500).json({ erro: 'Não foi possível concluir: ' + String(e.message).replace(/^db:\s*/, '').slice(0, 300) });
  }
}
