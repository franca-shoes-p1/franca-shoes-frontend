// Dados da área do cliente: passe, benefícios por ramo e pedidos da pessoa logada.
import { sb } from '../../../lib/varejoServer';
import { emailDoCookie, acessoDe, carregarConfigAssinatura } from '../../../lib/assinaturaServer';
import { rotuloStatus } from '../../../lib/pedidosStatus';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const email = emailDoCookie(req);
  const cfg = await carregarConfigAssinatura();
  const publico = { preco_passe: cfg.preco_passe, ramos: cfg.ramos };
  if (!email) return res.json({ logado: false, ...publico });
  const acesso = await acessoDe(email);
  let pedidos = [];
  try {
    pedidos = await sb(`varejo_pedidos?email=eq.${encodeURIComponent(email)}&tipo=neq.passe&select=numero,criado_em,status,total&order=numero.desc&limit=30`);
  } catch (e) {
    try { pedidos = await sb(`varejo_pedidos?email=eq.${encodeURIComponent(email)}&select=numero,criado_em,status,total&order=numero.desc&limit=30`); } catch (e2) {}
  }
  return res.json({
    logado: true,
    email,
    nome: acesso ? acesso.nome : '',
    ativo: !!(acesso && acesso.ativo),
    expira_em: acesso ? acesso.expira_em : null,
    pedidos: pedidos.map((p) => ({ ...p, rotulo: rotuloStatus(p.status) })),
    ...publico,
  });
}
