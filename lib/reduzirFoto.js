// Reduz a foto do celular (vários MB) para ~1200px antes de enviar.
export async function reduzirFoto(arquivo) {
  let img;
  try {
    img = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
  } catch {
    img = await new Promise((ok, falha) => {
      const el = new Image();
      el.onload = () => ok(el);
      el.onerror = falha;
      el.src = URL.createObjectURL(arquivo);
    });
  }
  const w0 = img.width || img.naturalWidth;
  const h0 = img.height || img.naturalHeight;
  const escala = Math.min(1, 1200 / Math.max(w0, h0));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w0 * escala);
  canvas.height = Math.round(h0 * escala);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}
