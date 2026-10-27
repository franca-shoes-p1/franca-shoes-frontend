import { useEffect } from 'react';

// Guarda por 30 dias o código ?ref= de quem indicou o visitante (cookie próprio do site). Só vale se tiver 6 a 12 letras ou números.
export default function RefCapture() {
  useEffect(() => {
    try {
      const v = new URLSearchParams(window.location.search).get('ref');
      if (v && /^[a-z0-9]{6,12}$/i.test(v)) {
        document.cookie = `ie_ref=${encodeURIComponent(v.toLowerCase())}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch (e) { /* sem cookie, sem indicação: tudo continua funcionando */ }
  }, []);
  return null;
}
