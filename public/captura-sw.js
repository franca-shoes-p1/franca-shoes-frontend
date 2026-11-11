// Service worker da captura: deixa a página /captura abrir mesmo sem sinal.
// Não guarda NADA de /api (as fotos e o PIN passam sempre pela internet de verdade).
const VERSAO = 'captura-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Páginas: tenta a internet; sem sinal, usa a última cópia guardada.
  if (req.mode === 'navigate') {
    if (!url.pathname.startsWith('/captura')) return;
    e.respondWith(
      fetch(req).then((r) => { const c = r.clone(); caches.open(VERSAO).then((ca) => ca.put('/captura', c)); return r; })
        .catch(() => caches.match('/captura'))
    );
    return;
  }

  // Arquivos do Next e ícones: guarda na primeira vez e reaproveita.
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/captura/')) {
    e.respondWith(
      caches.match(req).then((guardado) => guardado || fetch(req).then((r) => {
        if (r.ok) { const c = r.clone(); caches.open(VERSAO).then((ca) => ca.put(req, c)); }
        return r;
      }))
    );
  }
});
