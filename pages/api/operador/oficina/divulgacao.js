// Painel de divulgação do operador/afiliado: código, link e indicações (só o primeiro nome do indicado).
import { sb } from '../../../../lib/varejoServer';
import { exigirOperador } from '../../../../lib/operadorAuth';

export default async function handler(req, res) {
  const op = await exigirOperador(req, res);
  if (!op) return;
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ erro: 'Método não permitido.' }); }
  try {
    const [[me], lista] = await Promise.all([
      sb(`op_operarios?id=eq.${op.id}&select=ref_codigo`),
      sb(`op_indicacoes?afiliado_id=eq.${op.id}&select=id,criado_em,tipo,indicado,status,pontos&order=criado_em.desc&limit=100`),
    ]);
    const codigo = me && me.ref_codigo;
    const ativas = lista.filter((i) => i.status !== 'cancelada');
    return res.json({
      codigo,
      link: codigo ? `https://www.igreja.eco.br/?ref=${codigo}` : null,
      resumo: {
        clientes: ativas.filter((i) => i.tipo === 'pedido').length,
        pagos: ativas.filter((i) => i.status === 'paga').length,
        operadores: ativas.filter((i) => i.tipo === 'operador').length,
        pontos: ativas.reduce((s, i) => s + (i.pontos || 0), 0),
      },
      lista: ativas.slice(0, 30).map((i) => ({
        id: i.id, criado_em: i.criado_em, tipo: i.tipo, status: i.status, pontos: i.pontos,
        indicado: String(i.indicado || '').split(/\s+/)[0] || 'Pessoa',
      })),
    });
  } catch (e) {
    console.error('operador/oficina/divulgacao', e.message);
    return res.status(500).json({ erro: 'Não foi possível carregar.' });
  }
}
