// Verificações automáticas do guia: o sistema marca sozinho os passos que já estão cumpridos.
import { sb } from './varejoServer';

const n = async (q) => { try { return (await sb(q)).length; } catch (e) { return 0; } };

export async function verificacoes() {
  const [pix, leads, mapa, abordados, interessados, forn, ativos, modelos, entregues] = await Promise.all([
    n('rev_config?chave=eq.pix_chave&select=chave&limit=1'),
    n("forn_leads?status=neq.descartado&select=id&limit=50"),
    n("forn_leads?origem=eq.mapa&select=id&limit=1"),
    n('forn_leads?abordagens=gt.0&select=id&limit=50'),
    n('forn_leads?status=in.(interessado,cadastrado)&select=id&limit=5'),
    n('forn_empresas?select=id&limit=5'),
    n('forn_empresas?status=eq.ativo&select=id&limit=5'),
    n('rf_produtos?fornecedor_id=not.is.null&revisao=eq.aprovado&select=id&limit=5'),
    n('forn_pedidos?status=eq.entregue&select=id&limit=5'),
  ]);
  return {
    pix: pix >= 1, leads20: leads >= 20, mapa: mapa >= 1, abordados10: abordados >= 10, interessado: interessados >= 1,
    forn1: forn >= 1, ativo1: ativos >= 1, modelo1: modelos >= 1, ativo2: ativos >= 2, entregue1: entregues >= 1,
  };
}
