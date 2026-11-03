// Dados da Área do Sócio: produtos, movimentos de hoje, fechamento de hoje, resumo dos últimos dias e avisos.
import { sb } from '../../../../lib/varejoServer';
import { exigirSocio } from '../../../../lib/praiaAuth';

export default async function handler(req, res) {
  const s = await exigirSocio(req, res);
  if (!s) return;
  try {
    const hoje = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); // data de Brasília
    const [produtos, movs, fech, resumo, avisos] = await Promise.all([
      sb('praia_produtos?ativo=eq.true&select=id,nome,preco&order=nome'),
      sb(`praia_estoque_movimentos?parceiro_id=eq.${s.id}&data=eq.${hoje}&select=id,produto_id,tipo,quantidade&order=id`),
      sb(`praia_fechamentos?parceiro_id=eq.${s.id}&data=eq.${hoje}&select=*`),
      sb(`praia_vw_lucro_dia?parceiro_id=eq.${s.id}&select=data,vendas_esperadas,valor_informado,lucro,parte_de_cada&order=data.desc&limit=14`).catch(() => []),
      sb('praia_avisos?ativo=eq.true&select=id,titulo,texto,criado_em&order=criado_em.desc&limit=10').catch(() => []),
    ]);
    const liberado = !!(s.cadastro_ambulante && s.curso_manipulacao && s.contrato_assinado);
    return res.json({ socio: s, liberado, hoje, produtos, movimentos: movs, fechamento: fech[0] || null, resumo, avisos });
  } catch (e) {
    console.error('praia/socio/eu', e.message);
    return res.status(500).json({ erro: 'Não foi possível carregar.' });
  }
}
