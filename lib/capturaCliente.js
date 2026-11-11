// Parte do NAVEGADOR (celular) da captura: reduz fotos, guarda a fila no IndexedDB e envia quando tem sinal.
// Nada aqui usa chave secreta: tudo passa pelas rotas /api/captura/*.

const BANCO = 'captura-sapatos';
const FILA = 'fila';
const KV = 'kv';
const LADO_MAX = 1280;
const QUALIDADE = 0.8;

export const novoId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); });

// ---------- Foto: reduzir antes de guardar/enviar ----------
function carregarImagem(file) {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('imagem')); };
    img.src = url;
  });
}

export async function reduzirFoto(file) {
  let fonte;
  try {
    fonte = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    fonte = await carregarImagem(file); // navegadores antigos: o <img> já corrige a rotação
  }
  const w = fonte.width || fonte.naturalWidth;
  const h = fonte.height || fonte.naturalHeight;
  const escala = Math.min(1, LADO_MAX / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * escala));
  canvas.height = Math.max(1, Math.round(h * escala));
  canvas.getContext('2d').drawImage(fonte, 0, 0, canvas.width, canvas.height);
  if (fonte.close) fonte.close();
  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', QUALIDADE));
  if (!blob) throw new Error('Não foi possível reduzir a foto.');
  return blob;
}

// ---------- IndexedDB ----------
let abrindo = null;
function abrir() {
  if (!abrindo) {
    abrindo = new Promise((ok, falha) => {
      const r = indexedDB.open(BANCO, 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore(FILA, { keyPath: 'id' });
        r.result.createObjectStore(KV);
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => { abrindo = null; falha(r.error); };
    });
  }
  return abrindo;
}
async function tx(loja, modo, fn) {
  const db = await abrir();
  return new Promise((ok, falha) => {
    const t = db.transaction(loja, modo);
    const req = fn(t.objectStore(loja));
    t.oncomplete = () => ok(req ? req.result : undefined);
    t.onerror = () => falha(t.error);
    t.onabort = () => falha(t.error);
  });
}
export const kvLer = (k) => tx(KV, 'readonly', (s) => s.get(k));
export const kvGravar = (k, v) => tx(KV, 'readwrite', (s) => s.put(v, k));
export const filaListar = async () => (await tx(FILA, 'readonly', (s) => s.getAll())).sort((a, b) => a.criado - b.criado);
const filaGravar = (item) => tx(FILA, 'readwrite', (s) => s.put(item));
export const filaApagar = (id) => tx(FILA, 'readwrite', (s) => s.delete(id));

// Quantas fotos ainda faltam enviar.
export function fotosPendentes(fila) {
  let n = 0;
  for (const item of fila) {
    for (const slot of Object.keys(item.fotos)) {
      item.fotos[slot].forEach((_, i) => { if (!(item.urls[slot] || [])[i]) n++; });
    }
  }
  return n;
}

// Coloca um item na fila (já com as fotos reduzidas). Funciona sem internet.
export async function enfileirar(tipo, dados, fotos) {
  const urls = {};
  for (const slot of Object.keys(fotos)) urls[slot] = fotos[slot].map(() => null);
  const item = { id: novoId(), tipo, dados, fotos, urls, criado: Date.now(), erro: null };
  item.id = tipo === 'fornecedor' ? dados.id : dados.ids[0]; // ids vindos do próprio celular: reenviar não duplica
  await filaGravar(item);
  return item;
}

// ---------- Envio ----------
const PASTA_DO_SLOT = { produto: 'produto', etiqueta: 'etiqueta', ponto: 'ponto' };

async function api(caminho, opcoes) {
  let r;
  try {
    r = await fetch(caminho, { credentials: 'same-origin', ...opcoes });
  } catch {
    return { rede: true };
  }
  let corpo = {};
  try { corpo = await r.json(); } catch { /* sem corpo */ }
  return { status: r.status, ok: r.ok, corpo };
}

async function enviarItem(item) {
  // 1) fotos que ainda não subiram (uma por vez; se cair o sinal, recomeça só da que faltou)
  for (const slot of Object.keys(item.fotos)) {
    for (let i = 0; i < item.fotos[slot].length; i++) {
      if (item.urls[slot][i]) continue;
      const r = await api(`/api/captura/foto?tipo=${PASTA_DO_SLOT[slot]}`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: item.fotos[slot][i] });
      if (r.rede) return { parar: 'rede' };
      if (r.status === 401) return { parar: 'login' };
      if (!r.ok) return r.status >= 500 ? { parar: 'servidor' } : { falhou: (r.corpo && r.corpo.erro) || 'Foto recusada.' };
      item.urls[slot][i] = r.corpo.url;
      await filaGravar(item); // guarda o progresso
    }
  }
  // 2) o registro em si
  let caminho; let corpo;
  if (item.tipo === 'fornecedor') {
    caminho = '/api/captura/fornecedores';
    corpo = { ...item.dados, fotos_ponto: item.urls.ponto || [] };
  } else {
    caminho = '/api/captura/enviar';
    corpo = { ...item.dados, fotos_produto: item.urls.produto, fotos_etiqueta: item.urls.etiqueta };
  }
  const r = await api(caminho, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  if (r.rede) return { parar: 'rede' };
  if (r.status === 401) return { parar: 'login' };
  if (!r.ok) return r.status >= 500 ? { parar: 'servidor' } : { falhou: (r.corpo && r.corpo.erro) || 'Recusado pelo servidor.' };
  return { ok: true };
}

let enviando = false;
// Envia a fila na ordem (fornecedor novo antes das fotos dele). Devolve { enviados, parou }.
export async function sincronizar() {
  if (enviando) return { enviados: 0, parou: 'ocupado' };
  enviando = true;
  let enviados = 0;
  let parou = null;
  try {
    for (const item of await filaListar()) {
      if (item.erro) continue; // itens com problema esperam decisão do usuário
      const r = await enviarItem(item);
      if (r.ok) { await filaApagar(item.id); enviados++; continue; }
      if (r.falhou) { item.erro = r.falhou; await filaGravar(item); continue; }
      parou = r.parar;
      break;
    }
  } finally {
    enviando = false;
  }
  return { enviados, parou };
}

export async function tentarNovamente() {
  for (const item of await filaListar()) {
    if (item.erro) { item.erro = null; await filaGravar(item); }
  }
}

// ---------- Fornecedores (lista guardada para funcionar sem sinal) ----------
export async function carregarFornecedores() {
  const r = await api('/api/captura/fornecedores');
  if (r.ok && r.corpo.fornecedores) {
    try { await kvGravar('fornecedores', r.corpo.fornecedores); } catch { /* ok */ }
    return { lista: r.corpo.fornecedores, online: true };
  }
  if (r.status === 401) return { login: true, lista: (await kvLer('fornecedores').catch(() => null)) || [] };
  return { lista: (await kvLer('fornecedores').catch(() => null)) || [], online: false };
}
