// Aviso para o n8n (que repassa ao Telegram). Opcional: sem N8N_AVISO_URL não faz nada e nunca derruba a rota.
export async function avisar(texto) {
  const url = process.env.N8N_AVISO_URL;
  if (!url) return;
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 2500);
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-radar-token': process.env.RADAR_N8N_TOKEN || '' }, body: JSON.stringify({ texto: String(texto).slice(0, 500) }), signal: c.signal });
  } catch (e) { /* sem aviso, sem problema */ }
  finally { clearTimeout(t); }
}
