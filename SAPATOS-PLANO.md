# /sapatos — Plano e auditoria do que já existe

Auditoria feita em 07/11/2026 sobre a `main` (commit `7d8d216`), branch `sapatos-base`. **Nenhum arquivo existente foi alterado.** As regras estão em `SAPATOS-REGRAS.md`.

## 0. O que existe hoje (resumo)

Já existe uma loja completa em **`/calcados`** ("Franca Calçados"), com vitrine, produto, carrinho, checkout, pagamento, pedido, lote de rodoviária, passe de assinante e três painéis. O `/sapatos` não parte do zero: a maior parte da mecânica já está pronta e funcionando. Os pontos de atenção estão na seção 3.

Dois caminhos de venda coexistem em `pages/api/varejo/pedido.js`:

| Caminho | Tabela | Pagamento | Quando |
|---|---|---|---|
| **Modelo da própria loja** | `varejo_pedidos` | Mercado Pago (PIX ou cartão), webhook confirma | `rf_produtos` sem `fornecedor_id` |
| **Modelo de fornecedor** | `forn_pedidos` | PIX 1 direto ao fornecedor + PIX 2 ao dono, confirmação manual | `rf_produtos` com `fornecedor_id`; um fornecedor por pedido; só Correios |

Observações sobre o código lido:
- `pages/api/pedido.js` **não é** o pedido da loja de varejo: é o pedido antigo da `/loja` (tabela `rf_pedidos`, preço de fábrica, sem pagamento). Não serve de base.
- `/comercio` (`GUIA-COMERCIO.md`) é uma **vitrine estática de afiliados do Mercado Livre**: `public/comercio/index.html` + `products.json`, rewrite no `next.config.js`, bloco na home. Não vende, não cobra, não entrega. "Mesmo método da /comercio" só vale para a forma de entregar (branch aditiva, rewrite, guia, texto honesto). A mecânica de venda vem de `/calcados`.
- `/sapatos` não existe (nem `pages/sapatos`, nem rewrite, nem API).
- Não existe nenhum agente/importador de catálogo, tabela de origem do produto, nem fluxo de remoção.
- Não consta no código o "R$ 30 por pedido de agosto" (busca em `lib`, `pages`, `*.md`, `*.sql`): nada a remover.

## 1. Plano por função

Legenda de risco de mexer: **baixo** = só adicionar arquivo novo; **médio** = precisa de ponto de extensão num arquivo existente; **alto** = exigiria alterar comportamento que já funciona (evitar; ver conflitos).

### 1.1 Vitrine (`/sapatos`)
- **Já existe e reaproveita:** `pages/calcados/index.jsx` (busca e categorias), `GET /api/varejo/catalogo` (só publicados, preço > 0, não devolve custo), `lib/VarejoLayout.jsx`, `styles/varejo.module.css`, `parseTamanhos`, `brl` em `lib/varejo.js`.
- **Falta criar:** `pages/sapatos/index.jsx` e API própria `pages/api/sapatos/catalogo.js` (filtra só produtos do `/sapatos` e **sem** o campo `vendedor`), selo "preço de fábrica" condicionado ao tipo do fornecedor, prazo da entrega pessoal visível antes da compra.
- **Risco:** baixo se for cópia nova (não editar `/calcados`). O catálogo atual devolve `vendedor` (nome do fornecedor): não reutilizar a API como está (conflito C1).

### 1.2 Página do produto
- **Existe:** `pages/calcados/[id].jsx` (números, quantidade, regras da fábrica, troca, preço de assinante, `?rev=`).
- **Falta:** `pages/sapatos/[id].jsx`; bloco "Como você recebe" com prazo da entrega pessoal e dos Correios; texto de troca única pelos Correios; origem **não exibida**.
- **Risco:** baixo (arquivo novo). Reaproveitar `lib/varejo.js` por import, sem editar.

### 1.3 Carrinho
- **Existe:** `pages/calcados/carrinho.jsx`; carrinho em `localStorage` (`carrinho_varejo`) em `lib/varejo.js`, limite de 10 por linha.
- **Falta:** carrinho separado do `/sapatos` (outra chave de `localStorage`, para não misturar com `/calcados`) e contador de itens do **lote de 10 a 30 itens** (calçado) com aviso claro.
- **Risco:** baixo se usar chave própria. Médio se reaproveitar a chave atual (os dois comércios se misturariam).

### 1.4 Checkout
- **Existe:** `pages/calcados/checkout.jsx` (CEP automático, CPF e autorização para fornecedor, escolha Correios ou rodoviária, desconto de assinante, `?ponto=` e `?rev=`) e `POST /api/varejo/pedido` (preço e frete calculados no servidor).
- **Falta:** `pages/sapatos/checkout.jsx` e `pages/api/sapatos/pedido.js` com: cálculo do preço por **custo + R$ 20/par + taxas** (lido de configuração); validação do lote 10 a 30; mistura de fornecedores; escolha entre entrega pessoal e Correios; campanha "site pronto" só Correios.
- **Risco:** **alto** se editar `/api/varejo/pedido`; **baixo** se criar API nova que apenas importe `sb`, `txt`, `calcularFrete`, `r2`, `cpfValido`. Ver C2 (um fornecedor por pedido) e C3 (rodoviária só para modelo da loja).

### 1.5 Pagamento
- **Existe:** Mercado Pago Checkout Pro (`/api/varejo/pedido`, `/api/varejo/passe`), webhook `/api/varejo/webhook` que confere o valor pago contra o total (divergência vira `valor_divergente`); PIX direto ao fornecedor em `pages/calcados/pagar.jsx` + `/api/varejo/pagamento` (PIX copia e cola, `lib/pixCopiaCola.js`).
- **Falta:** decidir, para o piloto Di Franca, se o cliente paga **ao nosso site** (regra: "compra e paga no nosso site") e o dono repassa ao fornecedor, ou se mantém o PIX duplo atual. A regra aponta para o primeiro: usar Mercado Pago com `external_reference` do novo pedido.
- **Risco:** médio. O webhook só atualiza `varejo_pedidos` pelo `external_reference`; um pedido do `/sapatos` na mesma tabela (`varejo_pedidos`, novo valor de `tipo`) é tratado sem mexer no webhook. Ver C4 (constraint de `tipo`).

### 1.6 Pedido (acompanhamento e status)
- **Existe:** `lib/pedidosStatus.js` (status e etapas), `POST /api/varejo/acompanhar` (número + e-mail, sem CPF, endereço nem custo), `pages/acompanhar.jsx`, `pages/calcados/obrigado.jsx`, `pages/admin/pedidos.jsx`.
- **Falta:** página `obrigado` e `acompanhar` com o texto do `/sapatos`; status extra "aguardando lote" se necessário.
- **Risco:** baixo (importar `STATUS_PEDIDO` sem alterar o arquivo). Alto se acrescentar status em `pedidosStatus.js`: afeta o painel e a página do cliente que funcionam.

### 1.7 Lote
- **Existe:** `cal_lotes` (por cidade, `minimo` em **pedidos**, status aberto/fechado/em_rota/entregue), trigger `cal_pedido_mudou` (entra no lote e fecha ao atingir o mínimo), `cal_lote_vagas` público, `lib/filaFabricas.js` (soma **pares por fábrica** com `lote_minimo_pares`), `pages/admin/lote.jsx`, `LOTE = { minimoPedidos: 10, maxParesViagem: 30 }` em `lib/varejo.js`.
- **Falta:** lote de **10 a 30 itens de calçado** (contagem em itens, não em pedidos), mistura de fornecedores no mesmo lote, acessórios fora da conta, regra de 12 pares por fornecedor piloto (Di Franca) para compra na fábrica.
- **Risco:** **alto** mexer em `cal_pedido_mudou` (trigger em produção que também libera passe e feeds do fundo dos operadores). Criar lote próprio em tabela nova (ex.: `sp_lotes`) em vez de alterar `cal_lotes`.

### 1.8 Entrega
- **Existe:** rodoviária (nove capitais em `RODOVIARIAS_VAREJO`; dez em `lib/rodoviarias.js`), frete grátis na rodoviária, Correios com frete por região + 10% (`calcularFrete`, servidor), `supabase-entrega.sql` (dia e hora marcados, aviso ao cliente, "não compareceu" segue por Correios, `entrega_registros`), regra de Norte só Correios (`ESTADOS_SO_CORREIOS`).
- **Falta:** o **passe livre** como entidade: sai e volta a Franca, até 4 rotas por mês, reentrada no mesmo estado permitida, prazo da rota exibido antes da compra. Hoje não há contagem de rotas por mês, nem datas de rota publicadas ao cliente (a data só é combinada **depois** do lote fechar; `politicas.jsx` diz "não prometemos data exata antes").
- **Risco:** médio: tabela nova de rotas (`sp_rotas`) + página de prazo; não tocar nas tabelas de entrega existentes. Ver C5 e C6.

### 1.9 Assinatura
- **Existe:** `lib/assinatura.js` (30 dias, R$ 29,90 padrão, taxa 4,98%, fundo 25%, `descontoUnitario`), `lib/assinaturaServer.js` (cookie assinado, `carregarConfigAssinatura`, `precosAssinante`), `supabase-assinatura.sql` (`cal_config`, `cal_ramos`, trigger que soma 30 dias na compra do passe e **30 dias de bônus na compra de produto**, `vit_apurar` com fundo sobre o preço geral), `/assinar`, `/api/varejo/passe`, `/api/membro/*`, bônus de 30 dias por compra registrada em fábrica (`ff_bonus_dias`).
- **Já cumpre as regras:** 30 dias a R$ 29,90 (`cal_config.preco_passe`), PIX ou cartão pelo Mercado Pago, renovação manual (pagamento avulso, sem cobrança recorrente), desconto sai da parte do dono e operadores recebem sobre o preço geral (`subtotal_geral`).
- **Falta:** (a) 30 dias de passe na compra de **produto do fornecedor** (`forn_pedidos` não passa pelo trigger); (b) **cancelamento de assinatura** com perda do "serviço de manutenção periódica no sistema da hospedagem": não existe tela de cancelamento nem o conceito de manutenção no código (só uma menção de "renovar a manutenção do VPS" na rotina do dono em `lib/praia.js`); (c) texto da campanha "site pronto" informando que o site é pago pela assinatura.
- **Risco:** alto mexer na trigger/`vit_apurar`; médio criar o cancelamento (nova tabela/rota). Ver C7.

### 1.10 Painel
- **Existe:** `/admin/calcados` (cadastro com foto, custo, preço, publicar/ocultar), `/admin/fornecedores`, `/admin/fabricas` (vitrine de links, **outro assunto**), `/admin/pedidos`, `/admin/lote`, `/fornecedor/[token]` (painel do fornecedor), autenticação por `lib/adminAuth.js`, menu em `lib/AdminNav.jsx`.
- **Falta:** `/admin/sapatos` com fila de **aprovação antes de publicar**, origem de cada produto (fornecedor, catálogo, data, agente), registro de pedido de remoção, bloqueio de nova importação, página pública `/sapatos/remocao`, configuração de lucro/taxas/frete.
- **Risco:** baixo (páginas novas). Entrada no menu exige editar `lib/AdminNav.jsx` (alteração de 1 linha, **a combinar**) ou link direto sem alterar o menu.

### 1.11 Itens sem equivalente (novos por completo)
- **Importação por agentes de IA** (leitura de catálogo de fornecedor, geração de anúncio): nada existe. Entrada por rascunho aprovável; nunca publica sozinho.
- **Origem do produto**, **remoção/bloqueio**: nada existe. Tabelas novas `sp_origens`, `sp_remocoes` com prefixo próprio.
- **Preço automático**: `custo + R$ 20 + taxas`. Hoje o preço de venda é digitado (`preco_venda_sugerido`) ou `preco_fornecedor × (1 + comissão% + margem%)`. Lucro fixo em reais é conceito novo; ficar em `cal_config` (chave nova, ex.: `sp_lucro_par`, `sp_taxa_*`).

## 2. Estratégia de entrega (aditiva)

1. Branch `sapatos-base` só com documentação (este PR).
2. Depois: SQL novo `supabase-sapatos.sql` (tabelas `sp_*`, `create table if not exists`, RLS ligada, sem alterar tabela existente); `lib/sapatos.js` + `lib/sapatosServer.js`; `pages/sapatos/*`; `pages/api/sapatos/*`; `pages/admin/sapatos.jsx`; rewrite/links **somente se necessário** em arquivos existentes e com seu OK.
3. `GUIA-SAPATOS.md` criado junto e atualizado a cada mudança (regra do manual).

## 3. Conflitos entre as regras e o código atual

| # | Regra | Código atual | O que fazer (perguntar antes) |
|---|---|---|---|
| **C1 (resolvido, ver seção 4)** | "Dados do fornecedor nunca aparecem no anúncio" | `GET /api/varejo/catalogo` devolve `vendedor` (= `nome_fantasia` do fornecedor) e `pages/calcados/politicas.jsx` descreve o fornecedor como vendedor. `pagar.jsx` mostra nome, CNPJ e WhatsApp do fornecedor ao cliente (depois da compra, não no anúncio). | No `/sapatos`, API própria sem `vendedor`. A página `/calcados` continua como está. Confirmar se nome/CNPJ na tela de pagamento, após a compra, é aceitável. |
| **C2** | Lote "podendo misturar fornecedores" | `pedidoFornecedor` rejeita pedido com mais de um fornecedor ("Cada pedido pode ter modelos de um só fornecedor"). | No `/sapatos`, pedido novo trata vários fornecedores. Não mexer no `/calcados`. |
| **C3 (resolvido, ver seção 4)** | Entrega pessoal / retirada na rodoviária para o piloto Di Franca | Modelo de fornecedor **não** pode ir por rodoviária ("Modelos de fornecedores são enviados pelos Correios"). Rodoviária só para modelo da própria loja. | O `/sapatos` precisa de caminho próprio que una fornecedor + rodoviária. Confirmar que o dono compra na fábrica (retirada) e paga o fornecedor depois. |
| **C4 (resolvido, ver seção 4)** | Pedido do `/sapatos` na mesma tabela | `varejo_pedidos.tipo` tem `check (tipo in ('produto','passe'))`. Novo tipo exigiria alterar a constraint (tabela existente). | Usar tabela nova `sp_pedidos` (e adaptar o webhook por **nova** rota `/api/sapatos/webhook`) ou reutilizar `tipo='produto'`. Decidir antes de codar. |
| **C5** | "4 rotas por mês", "reentrar no mesmo estado", "sai e volta a Franca" | Não existe contagem de rotas. Comentário em `lib/rodoviarias.js`: SP/Tietê é exceção "saindo do estado e voltando por outro" (regra oposta à nova). | Implementar a nova regra só no `/sapatos`; não alterar `lib/rodoviarias.js`. |
| **C6** | "O prazo aparece antes da compra" | `politicas.jsx` e `como-comprar.jsx` afirmam "não prometemos data exata antes do lote fechar". | Mostrar **janela estimada** (não data prometida) e deixar claro que depende do lote, mantendo a honestidade. Confirmar o texto. |
| **C7 (resolvido, ver seção 4)** | "Quem pede o cancelamento perde o serviço de manutenção periódica no sistema da hospedagem" | Não existe cancelamento de passe (é pagamento avulso, vence sozinho) nem "serviço de manutenção" no sistema. A única menção é a rotina do dono em `lib/praia.js`. A regra não diz qual é o serviço, nem se vale para o assinante comum do passe de R$ 29,90 ou só para quem contratou um site pronto. | **Dúvida real: parar e perguntar.** Precisa saber (a) o que é a manutenção, (b) a quem se aplica, (c) como o cancelamento é pedido e registrado. Também deve constar de forma clara nos termos (ver abaixo). |
| **C8** | "Compra de produto físico dá 30 dias de passe" | Vale para `varejo_pedidos` pago (trigger). **Não** vale para `forn_pedidos` (fornecedores). | Garantir no `sp_pedidos`, sem alterar a trigger existente. |
| **C9** | Lucro R$ 20,00/par "mais as taxas, configuráveis, nunca fixos no código" | `PASSE.taxaPadrao = 4.98` e `fundoPadrao = 25` são **padrões no código** (usados só se o banco não tiver o valor). `calcularFrete` usa valores em `VAREJO` (arquivo de código, "provisórios"). Comissão do fornecedor é % por empresa (`comissao_pct`, padrão 15). | O novo cálculo lê tudo de `cal_config`/tabela `sp_config` e falha de forma segura (sem preço) se a configuração faltar, em vez de cair num valor fixo. Tarifa de frete dos Correios idem. |
| **C10** | "Lote de calçados 10 a 30 itens" | `LOTE.minimoPedidos = 10` conta **pedidos**, não itens; `maxParesViagem = 30` não é imposto; `cal_lotes.minimo` também em pedidos. Fornecedor tem `lote_minimo_pares` próprio (regra do piloto: 12). | Dois mínimos diferentes: 12 pares por fornecedor (compra na fábrica) e 10 a 30 itens por lote de viagem. Confirmar se são realmente independentes (ex.: um lote com 3 fornecedores de 4 pares atende 12 itens, mas nenhum fornecedor atinge 12). |
| **C11 (resolvido, ver seção 4)** | Texto honesto / "preço de fábrica" só para fornecedor do tipo fábrica | Não há campo "tipo" no fornecedor (`forn_empresas` não distingue fábrica, atacado, distribuidor). O piloto se chama **Di Franca Atacado**: pelo nome, pode ser atacado e não fábrica. | Criar o campo `tipo` na tabela nova de origem. **Perguntar:** a Di Franca é "fábrica" ou "atacado"? Até lá, o selo "preço de fábrica" fica desligado. |
| **C12 (resolvido, ver seção 4)** | "Trocas: modalidade única pelos Correios, despesas pagas pelo cliente" | `politicas.jsx`: erro no pedido e defeito são por conta da loja; "defeito: sem custo para você"; a política de troca é por fornecedor (`troca_frete_vontade`: comprador ou fornecedor). A lei (CDC art. 18 e 49) garante troca por defeito e desistência de 7 dias na compra online: não dá para impor despesa ao cliente nesses casos. | **Dúvida real:** manter a regra só para troca por tamanho/vontade e continuar assumindo o custo em defeito e erro nosso? Redigir os termos do `/sapatos` conforme a resposta, preferencialmente revisados por advogado. |
| **C13** | "Campanha do site pronto: oferta deve dizer que o site é pago pela assinatura" | Não existe campanha "site pronto" no código (a mais próxima é `supabase-campanha-inauguracao.sql` e `lib/campanha.js`, com outro objetivo). | Criar do zero, em arquivo próprio, sem alterar a campanha existente. |
| **C14** | "Publica após minha aprovação" | Hoje `POST /api/admin/produtos` cria com `publicado=true` por padrão, e produto do fornecedor tem `revisao='aprovado'` por padrão no SQL (só muda se o fornecedor cadastrar). | No `/sapatos`, tudo entra como **rascunho** e só publica por ação sua no painel. |
| **C15** | "Mesmo método da /comercio" | `/comercio` é vitrine de afiliados (o cliente vai comprar no Mercado Livre). `/sapatos` é venda no nosso site. | Só reaproveitar o método de entrega (aditivo, guia, texto honesto). Confirmar que é isso. |
| **C16** | Build em Windows | O `GUIA-COMERCIO.md` registra que `npm run build` falha no Windows por arquivos que diferem só em maiúsculas/minúsculas (`Redes.jsx`/`redes.js` etc.). | Validar o build na Vercel (Linux) ou no WSL. Não renomear nada. |

## 4. Decisões do dono (07/11/2026) e status dos conflitos

As 7 perguntas da primeira versão deste plano foram respondidas:

| # | Resposta | Efeito no plano |
|---|---|---|
| 1 (C7) | A perda da manutenção periódica da hospedagem vale **só para o site pronto da campanha** (a assinatura que cobre as despesas do site). O passe de R$ 29,90 do portal é outra coisa. | **C7 resolvido.** Duas assinaturas distintas: o passe do portal continua como está (pagamento avulso, vence sozinho, sem cancelamento); a assinatura do site pronto é nova, com pedido de cancelamento registrado e perda da manutenção. Os termos da campanha devem dizer isso com clareza. |
| 2 (C12) | O cliente paga a troca por **tamanho ou vontade**. Defeito ou erro nosso ficam por nossa conta (Código de Defesa do Consumidor). | **C12 resolvido.** Troca única pelos Correios; despesas do cliente só na troca por tamanho/vontade. Os textos do `/sapatos` não impõem despesa ao cliente em defeito, erro nosso ou desistência de 7 dias. |
| 3 (C11) | A Di Franca é **atacado**. | **C11 resolvido.** O selo "preço de fábrica" **não** é usado nos produtos da Di Franca. Continua previsto o campo `tipo` do fornecedor (fábrica ou atacado) para fornecedores futuros. |
| 4 (C4) | Criar tabelas novas `sp_`; **não mexer** em `varejo_pedidos`. | **C4 resolvido.** Pedidos do `/sapatos` ficam em `sp_pedidos` (e demais `sp_*`), com webhook próprio `/api/sapatos/webhook`. Nenhuma tabela, constraint ou trigger existente é alterada. |
| 5 (C3 / pagamento) | O cliente paga 100% no nosso site (Mercado Pago); **nós pagamos o fornecedor depois**. | **C3 resolvido.** Sem o PIX duplo do `/calcados`. O dono compra na fábrica (retirada) depois do pagamento e do lote. Fornecedor + entrega pessoal passam a funcionar no caminho novo. |
| 6 (C1) | Dados do fornecedor **não** aparecem na tela de pagamento; só depois do pedido pago, na página de acompanhamento e na nota. | **C1 resolvido.** Catálogo e pagamento do `/sapatos` sem nome, CNPJ ou contato do fornecedor. Dados liberados apenas após o pagamento confirmado. |
| 7 (menu) | Pode editar **1 linha** em `lib/AdminNav.jsx` e **1 linha** em `lib/RodapeSite.jsx`, **só quando chegar o prompt que precisar disso**; o dono confere o preview antes do merge. | Nenhuma dessas edições é feita agora. Quando feitas, serão registradas no `GUIA-SAPATOS.md`. |

**Conflitos ainda em aberto** (decidir no prompt que os tocar): C2 (misturar fornecedores: resolvido pelo caminho novo, sem tocar o `/calcados`), C5 (rotas: regra nova só no `/sapatos`), C6 (prazo antes da compra: janela estimada, texto a confirmar), C8, C9, C10 (dois mínimos independentes: 12 pares por fornecedor e 10 a 30 itens por lote; confirmar a interação), C13, C14, C15, C16. As soluções propostas na seção 3 continuam valendo.

**Nota de escopo:** esta etapa altera só `SAPATOS-REGRAS.md` e `SAPATOS-PLANO.md`. Nenhum código foi escrito.
