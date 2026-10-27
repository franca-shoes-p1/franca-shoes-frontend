// Aviso do site para o n8n (roda só no servidor, na Vercel).
// Nunca derruba o pedido: se o n8n estiver fora do ar, só registra no log e segue.
// Variáveis: N8N_WEBHOOK_ATENDIMENTO (URL de produção do fluxo) e
//            N8N_WEBHOOK_TOKEN_ATENDIMENTO (senha; se faltar, usa N8N_WEBHOOK_TOKEN).

export async function avisarAtendimento(corpo) {
  const url = process.env.N8N_WEBHOOK_ATENDIMENTO;
  if (!url) return false;
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 8000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-token': process.env.N8N_WEBHOOK_TOKEN_ATENDIMENTO || process.env.N8N_WEBHOOK_TOKEN || '',
      },
      body: JSON.stringify(corpo),
      signal: controle.signal,
    });
    return r.ok;
  } catch (e) {
    console.error('n8n atendimento', e.message);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Limite simples por endereço (vale por instância da Vercel; segura o abuso comum).
export function criarLimite(max, janelaMs) {
  const recentes = new Map();
  return function permitir(chave) {
    const agora = Date.now();
    const lista = (recentes.get(chave) || []).filter((t) => agora - t < janelaMs);
    if (lista.length >= max) return false;
    lista.push(agora);
    recentes.set(chave, lista);
    if (recentes.size > 2000) recentes.clear();
    return true;
  };
}
