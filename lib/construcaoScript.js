// Monta o "script do pedido": o briefing de uma página que chega ao dono. Só usa o que o cliente respondeu.
export const BLOCOS = [
  ['negocio', '1. NEGÓCIO'],
  ['oferta', '2. OFERTA'],
  ['identidade', '3. IDENTIDADE'],
  ['paginas', '4. PÁGINAS E FUNÇÕES'],
  ['atendimento', '5. ATENDIMENTO E PACOTE'],
  ['prazo', '6. PRAZO E OBSERVAÇÕES'],
];

export function montarScript(pedido, respostas) {
  const linhas = [];
  linhas.push(`PEDIDO DE CONSTRUÇÃO nº ${pedido.numero} · status: ${pedido.status}`);
  linhas.push(`Cliente: ${pedido.nome} · WhatsApp ${pedido.whatsapp}`);
  linhas.push(`Tipo: ${pedido.tipo}${pedido.segmento ? ' · Faz: ' + pedido.segmento : ''}`);
  const pendencias = [];
  for (const [chave, titulo] of BLOCOS) {
    const campos = respostas[chave];
    const itens = campos ? Object.entries(campos).filter(([, v]) => v !== '' && v != null) : [];
    linhas.push('', titulo);
    if (!itens.length) {
      linhas.push('(sem respostas)');
      if (chave !== 'oferta') pendencias.push(titulo.replace(/^\d+\.\s*/, ''));
    } else {
      for (const [k, v] of itens) {
        const valor = String(v);
        linhas.push(`- ${k}: ${valor}`);
        if (/^a definir$/i.test(valor)) pendencias.push(`${titulo.replace(/^\d+\.\s*/, '')} / ${k}`);
      }
    }
  }
  linhas.push('', `Pacote com Atendente WhatsApp: ${pedido.pacote_atendente ? 'sim' : 'não'}`);
  linhas.push(`Pendências: ${pendencias.length ? pendencias.join('; ') : 'nenhuma'}`);
  return linhas.join('\n');
}
