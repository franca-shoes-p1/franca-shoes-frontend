// Lista pública dos parceiros com perfil aprovado (só dados de divulgação, nunca contato interno).
import { sb } from '../../lib/varejoServer';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    const cidade = String(req.query.cidade || '').slice(0, 80).replace(/[(),*]/g, '');
    const filtro = cidade ? `&cidade=eq.${encodeURIComponent(cidade)}` : '';
    const lista = await sb(`rf_pontos?perfil_status=eq.aprovado&status=in.(autorizado,ativo)${filtro}&select=codigo,nome,cidade,uf,tipo,perfil_slogan,perfil_logo&order=perfil_atualizado_em.desc&limit=24`);
    return res.json({ parceiros: lista.map((p) => ({ codigo: p.codigo, nome: p.nome, cidade: p.cidade, uf: p.uf, tipo: p.tipo, slogan: p.perfil_slogan, logo: p.perfil_logo })) });
  } catch (e) {
    return res.json({ parceiros: [] });
  }
}
