# Guia: Loja Igreja Eco (vitrine de afiliados do Mercado Livre)

Vitrine de "achadinhos" do Mercado Livre publicada em **igreja.eco.br/comercio**, com um bloco de destaque na home.
É só uma vitrine: o visitante clica e compra no Mercado Livre. O site não vende, não entrega e não promete desconto.

Branch de entrega: `comercio-afiliados` (não fazer merge sem aprovar o endereço de teste da Vercel).

## O que foi mudado

| Arquivo | Tipo | O que é |
|---|---|---|
| `public/comercio/index.html` | novo | A página da vitrine (site estático, caminhos relativos) |
| `public/comercio/assets/` | novo | CSS, JS e imagens da vitrine (banner, logo, favicon) |
| `public/comercio/products.json` | novo | **Os produtos.** É o único arquivo que muda no dia a dia |
| `lib/ComercioVitrine.jsx` | novo | Bloco da home: duas vitrines lado a lado (no celular, uma embaixo da outra) |
| `styles/comercioVitrine.module.css` | novo | Estilo do bloco (azul-marinho, verde e dourado do site) |
| `next.config.js` | +1 linha | Rewrite `/comercio` → `/comercio/index.html` (mesmo padrão de `/atelie`) |
| `pages/index.jsx` | +2 linhas | `import ComercioVitrine` e `<ComercioVitrine />` entre `<VitrineFaixa />` e `<IgrejaHero />` |

Nenhum outro arquivo existente foi alterado.

**Caminhos:** na cópia do site, os caminhos relativos (`assets/...`, `products.json`) foram trocados por caminhos
absolutos (`/comercio/assets/...`, `/comercio/products.json`). Motivo: o endereço `/comercio` (sem barra no final)
é uma reescrita para `/comercio/index.html`, e com caminho relativo o navegador procuraria os arquivos na raiz do
site (erro 404, página sem estilo e sem produtos). Se um dia a pasta mudar de nome, troque `/comercio/` nesses arquivos.

## Como o bloco da home funciona

- Esquerda: banner e chamada "Entrar na vitrine" para `/comercio`.
- Direita: 4 produtos reais (foto, nome e botão "Ver na vitrine", que leva a `/comercio`).
- Os 4 produtos vêm do mesmo `public/comercio/products.json`: o primeiro de cada categoria listada em
  `CATEGORIAS_DESTAQUE` (no topo de `lib/ComercioVitrine.jsx`: games, ferramentas, celulares, moda).
  Para mudar quais aparecem, mude essa lista ou a ordem dos produtos no JSON.
- O bloco não mostra preço de propósito: o preço muda no Mercado Livre e o texto avisa que vale o do anúncio.

## Como atualizar os produtos depois

1. Edite só `public/comercio/products.json`. Cada produto tem:
   `id`, `nome`, `categoria` (um `id` da lista `categorias` do mesmo arquivo), `posicao`, `preco`, `precoObs`,
   `consultadoEm`, `imagem` (endereço da foto no Mercado Livre) e `link` (seu link de afiliado `meli.la/...`).
2. Atualize `atualizadoEm` no topo do arquivo.
3. Faça commit e envie. A Vercel publica sozinha; a página `/comercio` e o bloco da home usam o mesmo arquivo.
4. Produto sem `nome`, `imagem` ou `link` é ignorado no bloco da home.

Para trocar o banner ou o visual da página, mexa em `public/comercio/assets/` (css e img).

## Como testar

- `npm run dev` e abrir `/` (bloco entre a faixa "Vitrine" e a igreja do topo) e `/comercio`.
- **Windows:** `npm run build` falha localmente, com ou sem esta mudança, porque `lib/Redes.jsx` e `lib/redes.js`
  (e os pares `MotorLivros`/`motorLivros`, `RadarAssistente`/`radarAssistente`) só diferem em maiúsculas/minúsculas.
  Na Vercel (Linux) funciona. Para validar em Windows, use WSL ou uma cópia temporária com esses arquivos renomeados.

## Como desfazer

Basta não fazer o merge da branch. Se já foi publicado: remover o `<ComercioVitrine />` e o import de `pages/index.jsx`
tira o bloco da home; remover a linha de `/comercio` em `next.config.js` e a pasta `public/comercio/` tira a página.
