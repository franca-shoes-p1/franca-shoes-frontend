# Loja de varejo — calçados e acessórios (passo a passo)

A loja nova fica em **seu-site/calcados** e não mexe na `/loja` que já existe.
O cliente escolhe o número, paga com **PIX ou cartão** (Mercado Pago) e você compra na fábrica depois do pagamento.

## O que foi criado

- `/calcados` — vitrine com busca e categorias
- `/calcados/[modelo]` — produto com botões de número
- `/calcados/carrinho` e `/calcados/checkout` — carrinho, endereço (CEP preenche sozinho) e pagamento
- `/calcados/obrigado` e `/calcados/politicas` — confirmação e política de trocas (**rascunho, revise**)
- Pedidos ficam na tabela `varejo_pedidos` do Supabase; o aviso de pagamento chega sozinho pelo Mercado Pago

O preço e o frete são sempre calculados no servidor. O cliente não consegue alterar.

## Passo 1 — Criar a tabela de pedidos (2 min)

1. Supabase → **SQL Editor** → **New query**.
2. Abra o arquivo `supabase-varejo.sql`, copie tudo, cole e clique **Run**.

## Passo 2 — Pegar a chave do Mercado Pago (10 min)

1. Entre em **mercadopago.com.br/developers** → **Suas integrações** → **Criar aplicação**.
2. Escolha **Checkout Pro**.
3. Em **Credenciais**, copie o **Access Token**.
   - Comece com o de **teste** para fazer uma compra de mentira.
   - Quando estiver tudo certo, troque pelo de **produção**.
   - Os nomes dos menus mudam de vez em quando; se não achar, me mande um print.

## Passo 3 — Variáveis na Vercel (3 min)

Projeto `franca-shoes-frontend` → **Settings** → **Environment Variables**. Já existem `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` (a loja atual usa). Adicione:

| Nome | Valor |
|---|---|
| `MP_ACCESS_TOKEN` | o Access Token do Mercado Pago |
| `SITE_URL` | `https://www.igreja.eco.br` (o endereço principal do site) |
| `N8N_WEBHOOK_VAREJO` | *(opcional)* endereço do webhook do n8n que avisa você no WhatsApp quando um pedido for pago |

Depois faça **Redeploy**.

## Passo 4 — Subir os arquivos no GitHub

Repositório `franca-shoes-p1/franca-shoes-frontend` → **Add file → Upload files**.
Descompacte o zip e arraste as pastas `lib`, `pages` e `styles` mais o `supabase-varejo.sql`.
O `pages/index.jsx` já vem com o link **Calçados** no menu do portal (sobrescreve o atual).
A Vercel publica sozinha.

## Passo 5 — Cadastrar os modelos

Na tabela `rf_produtos` do Supabase, um modelo só aparece na loja de varejo se:

- `publicado` = true e `ativo` = true
- `preco_venda_sugerido` = **preço para o consumidor** (maior que zero)
- `tamanhos` escrito como `35 ao 40`, `35-40` ou `35, 36, 37`
- `foto_url` começando com `https://`
- `categoria` preenchida (vira o filtro da vitrine; use também para bolsas, cintos etc.)

O custo da fábrica (`custo`) **nunca** aparece para o cliente.

## Passo 6 — Ajustar seus números

Abra `lib/varejo.js` (bloco `VAREJO` no topo) e troque:

- `nomeLoja` ("Franca Calçados" é um nome provisório)
- `prazoPreparoDias`
- Frete por região: `freteSP`, `freteSulSudeste`, `freteOutros` (valores provisórios, ponha seus custos reais dos Correios)
- `freteGratisAPartirDe` (0 = desligado)

## Passo 7 — Testar antes de divulgar

1. Cadastre 1 modelo de teste.
2. Abra `/calcados`, escolha o número, vá até o pagamento com o token de **teste**.
3. No Supabase, confira em `varejo_pedidos` se o pedido entrou e se o `status` virou `pago`.
4. Só então troque para o token de produção e faça uma compra real de valor baixo.

## Como acompanhar os pedidos

Supabase → **Table Editor** → `varejo_pedidos`. Status: `aguardando_pagamento`, `pago`, `em_compra_fabrica`, `enviado`, `entregue`, `cancelado`, `reembolsado`. Mude o status e preencha `codigo_rastreio` na própria tabela.
Quando virar `pago`, é a hora de comprar o par na fábrica.

---

# Painel de cadastro dos modelos (`/admin/calcados`)

Página protegida por senha para cadastrar, editar e ocultar modelos, com foto direto do celular. Ela usa **a mesma senha** do painel de e-books (`ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` já configuradas na Vercel). Se o painel de e-books não abre para você, essas duas variáveis ainda não existem: crie-as em Settings → Environment Variables (a senha é a que você quiser; o segredo é qualquer texto longo, com 16+ caracteres) e faça Redeploy.

## Como usar

1. Abra `seu-site/admin/calcados` e entre com a senha.
2. Toque em **Tirar ou escolher foto**. A foto é reduzida automaticamente e guardada no Supabase (o espaço de fotos `produtos` é criado sozinho na primeira vez).
3. Preencha nome, categoria, números (`38 ao 44`), preço de venda e custo na fábrica.
4. **Cadastrar na loja**. O modelo já aparece em `/calcados`.
5. Na lista: **Editar** muda qualquer dado, **Ocultar** tira da loja sem apagar, **Publicar** devolve.

## Arquivos novos (suba no GitHub junto com os anteriores)

`pages/admin/calcados.jsx`, `pages/api/admin/produtos/` (3 arquivos) e `lib/produtosAdmin.js`.

## Se algo der erro

- "Não foi possível salvar: ... fornecedor_id": a tabela exige o fornecedor. Me mande a mensagem completa que eu ajusto o formulário.
- "Não foi possível enviar a foto": você pode colar o endereço `https://` da foto no campo logo abaixo do botão enquanto me manda a mensagem de erro.
