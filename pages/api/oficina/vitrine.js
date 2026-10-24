// Vitrine pública de empreendimentos: só o que o dono marcou como público. Sem promessa de retorno.
import { sb } from '../../../lib/varejoServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  try {
    const lista = await sb('op_empreendimentos?publico=eq.true&select=id,slug,nome,categoria,resumo,status,desconto_pct,marcos:op_marcos(titulo,concluido),atualizacoes:op_atualizacoes(texto,criado_em),vagas:op_vagas_projeto(titulo,descricao,aberta)&order=ordem.asc,criado_em.desc');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.json({ empreendimentos: lista.map((e) => ({ ...e, atualizacoes: (e.atualizacoes || []).sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, 3), vagas: (e.vagas || []).filter((v) => v.aberta) })) });
  } catch (e) {
    console.error('oficina/vitrine', e.message);
    return res.status(500).json({ erro: 'Indisponível agora.' });
  }
}
