// Desenha a arte da postagem (quadrada, 1080x1080) no navegador, sem custo e sem API:
// título grande + subtítulo + marca do site. A IA só precisa mandar o texto da arte.
// Se a postagem tiver imagem_url (arte pronta), o painel usa a imagem e este desenho não é usado.

export const TEMAS_ARTE = {
  azul: { de: '#061a3a', ate: '#1e6bff', destaque: '#7ff0ff', texto: '#ffffff' },
  verde: { de: '#0b3d2e', ate: '#2f9e5b', destaque: '#d9f99d', texto: '#ffffff' },
  terra: { de: '#4a2c17', ate: '#b9743b', destaque: '#fde68a', texto: '#ffffff' },
  noite: { de: '#0b0f1a', ate: '#3b3f8f', destaque: '#c4b5fd', texto: '#ffffff' },
};

function quebrar(ctx, texto, larguraMax) {
  const palavras = String(texto || '').split(/\s+/).filter(Boolean);
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(teste).width <= larguraMax || !atual) atual = teste;
    else { linhas.push(atual); atual = p; }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// Escolhe o maior tamanho de letra em que o título cabe em até `maxLinhas` linhas.
function ajustar(ctx, texto, larguraMax, maxLinhas, tamMax, tamMin, peso) {
  for (let tam = tamMax; tam >= tamMin; tam -= 4) {
    ctx.font = `${peso} ${tam}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
    const linhas = quebrar(ctx, texto, larguraMax);
    if (linhas.length <= maxLinhas) return { tam, linhas };
  }
  ctx.font = `${peso} ${tamMin}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  return { tam: tamMin, linhas: quebrar(ctx, texto, larguraMax).slice(0, maxLinhas) };
}

export function desenharArte(canvas, { titulo, subtitulo, tema, rotulo }) {
  const T = TEMAS_ARTE[tema] || TEMAS_ARTE.azul;
  const W = 1080;
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, W, W);
  g.addColorStop(0, T.de);
  g.addColorStop(1, T.ate);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, W);

  // círculos suaves de fundo
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = T.destaque;
  ctx.beginPath(); ctx.arc(W * 0.9, W * 0.12, 260, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.05, W * 0.95, 200, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  const margem = 90;
  const largura = W - margem * 2;

  if (rotulo) {
    ctx.font = '700 30px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.fillStyle = T.destaque;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(rotulo).toUpperCase().slice(0, 40), margem, 150);
  }

  // Bloco central (título + barra + subtítulo) sempre entre y=200 e y=940, sem encostar no rodapé.
  const t = ajustar(ctx, titulo || 'Igreja Eco', largura, 4, 100, 48, 800);
  const alturaT = Math.round(t.tam * 1.16);
  const alturaTitulo = t.linhas.length * alturaT;
  const s = subtitulo ? ajustar(ctx, subtitulo, largura, 2, 42, 28, 500) : null;
  const alturaS = s ? Math.round(s.tam * 1.35) : 0;
  const total = alturaTitulo + (s ? 30 + 8 + 34 + s.linhas.length * alturaS : 0);
  let y = 200 + Math.max(0, (740 - total) / 2);

  ctx.textBaseline = 'top';
  ctx.font = `800 ${t.tam}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  ctx.fillStyle = T.texto;
  t.linhas.forEach((l) => { ctx.fillText(l, margem, y); y += alturaT; });

  if (s) {
    y += 30;
    ctx.fillStyle = T.destaque;
    ctx.fillRect(margem, y, 120, 8);
    y += 8 + 34;
    ctx.font = `500 ${s.tam}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    s.linhas.forEach((l) => { ctx.fillText(l, margem, y); y += alturaS; });
  }

  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 34px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  ctx.fillStyle = T.destaque;
  ctx.fillText('igreja.eco.br', margem, W - 90);
  return canvas;
}

// Gera o arquivo PNG da arte (para baixar ou compartilhar).
export function arteParaBlob(dados) {
  return new Promise((ok, falha) => {
    const c = document.createElement('canvas');
    desenharArte(c, dados);
    c.toBlob((b) => (b ? ok(b) : falha(new Error('Não foi possível gerar a arte.'))), 'image/png');
  });
}
