import { useEffect } from 'react';

// Quando alguém chega por um link do Motor de Divulgação (?utm_medium=divulgacao&utm_campaign=CODIGO&utm_source=canal),
// registra 1 clique por visita. Sem cookie e sem dado pessoal: só o código da campanha e o canal.
export default function DivulgacaoClique() {
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('utm_medium') !== 'divulgacao') return;
      const campanha = (q.get('utm_campaign') || '').toLowerCase();
      const canal = (q.get('utm_source') || 'desconhecido').toLowerCase();
      if (!/^[a-z0-9]{3,16}$/.test(campanha)) return;
      const chave = `ie_clique_${campanha}_${canal}`;
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, '1');
      fetch('/api/divulgacao/clique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campanha, canal }),
        keepalive: true,
      }).catch(() => {});
    } catch (e) { /* sem registro, o site continua igual */ }
  }, []);
  return null;
}
