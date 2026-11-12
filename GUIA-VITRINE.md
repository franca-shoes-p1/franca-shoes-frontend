# Departamento Vitrine: como ligar (passo a passo)

O departamento junta três coisas: **uma IA que garimpa e escreve**, **pessoas do setor Vitrine que validam e divulgam** e **o painel `/admin/vitrine`** onde você decide.

## O que a IA faz e o que ela nunca faz

| A IA faz | A IA nunca faz |
|---|---|
| Pesquisa na internet poucas frases por dia e lê páginas de fornecedores que você cadastrou | Confirmar preço ou autorização de foto (isso é do fornecedor, validado por uma pessoa) |
| Sugere achados com título, categoria, material e descrição reescrita | Copiar fotos ou textos de outro site |
| Escreve os textos de divulgação de cada modelo publicado | Publicar modelo na loja sem a sua aprovação |
| Publica no canal do Telegram (único canal automático) | Ler marketplaces e redes sociais (proibem robôs); esses viram achado manual |
| Respeita o `robots.txt` dos sites e bloqueia endereços internos | Enviar mensagem em massa para quem não pediu |

## Passo 1: tabelas no Supabase

1. Rode `supabase-vitrine.sql` (cria fontes, achados, canais e fila de divulgação; usa só nomes `vit_`).
2. Rode `supabase-cal-lotes-portal.sql`, se ainda não rodou (a captação de leads grava em `cal_leads`).
3. Rode `supabase-vitrine-pagamentos.sql` (fundo da equipe; só precisa da loja `/calcados`). Ele acrescenta `entregue_em`, `custo_fabrica` e `taxa_pagamento` aos pedidos.
4. **Depois** de rodar os SQL da Oficina (`supabase-oficina-fase1.sql`), rode `supabase-vitrine-cartoes.sql`. Ele cria o setor Vitrine e os cartões V1 a V4. Se rodar antes da hora, ele para com uma mensagem avisando.

## Passo 2: variáveis na Vercel

| Variável | Para que serve | Obrigatória |
|---|---|---|
| `RADAR_N8N_TOKEN` | senha que o n8n usa para chamar o site (invente uma com mais de 16 letras e números) | sim, para os fluxos automáticos |
| `GEMINI_API_KEY` | já existe | já tem |
| `VITRINE_MAX_IA` | máximo de chamadas ao Gemini por execução (padrão 10) | não |
| `GEMINI_MODEL` | força um modelo específico, se o padrão falhar | não |

O plano gratuito do Gemini tem limite pequeno e o Google não publica mais a tabela: veja os seus números no Google AI Studio. Quando a cota acaba, o sistema continua sem IA (usa texto padrão na divulgação e pula a busca) e avisa no resumo.

### Como criar o `RADAR_N8N_TOKEN` sem expor a senha

No Windows, abra o PowerShell e rode:

```
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

O resultado (64 letras e números) é o token. Cole o mesmo valor na Vercel (`RADAR_N8N_TOKEN`) e nos fluxos do n8n. Não cole o valor em conversas.

### Como achar o ID do seu chat e do canal

- **Seu chat:** no Telegram, procure o robô `@userinfobot`, mande “oi” e ele responde o seu ID (um número).
- **Canal público:** o fluxo já vem com `@vitrine_igrejaeco` (canal criado em 01/11/2026, com o robô Vitrine Avisos como admin). Isso só funciona se esse endereço for um **canal** (não uma conta pessoal) e se o seu robô for **administrador** dele. Se não for, troque pelo endereço do canal certo.

## Passo 3: fluxos no n8n

Importe os três arquivos da pasta `n8n/`:

- `vitrine-garimpo-diario.json`: todo dia às 6h, o garimpo roda e você recebe o resumo no Telegram.
- `vitrine-divulgacao-diaria.json`: todo dia às 9h, cria os textos, avisa você e publica no canal do Telegram.
- `vitrine-apuracao-semanal.json`: toda segunda às 8h, apura o fundo da equipe e avisa quanto deve a cada pessoa.

Em cada fluxo troque `COLE_AQUI_O_MESMO_VALOR_DE_RADAR_N8N_TOKEN` pelo valor da variável e `COLE_AQUI_O_ID_DO_SEU_CHAT` pelo seu ID. O canal público já vem preenchido (veja acima). Se importar e algum nó pedir ajuste, confira primeiro a credencial do Telegram. Os fluxos foram montados no mesmo padrão dos que já existem, mas não foram testados dentro do seu n8n.

## Passo 4: rotina no painel

1. **Fontes de busca:** acrescente páginas de fornecedores de Franca e frases de busca.
2. **Achados:** libere os bons, uma pessoa valida (cartão V1), e você aprova com o custo confirmado. O modelo nasce escondido em `/admin/calcados`.
3. **Divulgação:** copie os textos pendentes ou deixe as pessoas do setor postarem (cartão V4) e marque como feito.

## Se algo falhar

- “Falta uma etapa” no painel: falta rodar `supabase-vitrine.sql`.
- Garimpo diz “falta GEMINI_API_KEY” ou “cota acabou”: o resto continua; os achados podem ser cadastrados à mão.
- Nada é publicado no canal: confira se o robô é administrador do canal e o ID do canal no fluxo.

## Dinheiro da equipe (fundo)

1. Quando você entregar um pedido, mude o status para `entregue` e preencha `custo_fabrica` (e `taxa_pagamento`, se quiser) na tabela `varejo_pedidos`. Sem o custo, o pedido não entra na apuração.
2. Registre em `/admin/vitrine`, aba **Dinheiro**, quem validou, cadastrou ou divulgou cada produto.
3. Depois da espera de 7 dias, a apuração calcula o fundo e divide entre essas pessoas. Você paga por PIX e marca **Já paguei**.
4. Pedido reembolsado ou cancelado antes do pagamento cancela os valores pendentes.

Antes do primeiro pagamento, confirme com um contador como pagar e registrar valores para pessoas sem vínculo.

## Registro de implantacao (01-02/11/2026)
- Telegram: robo "Vitrine Avisos" (@vitrine_avisos_ricardo_bot) e canal publico @vitrine_igrejaeco (robo e admin do canal). Chat de avisos do Ricardo: 8902658390.
- n8n (n8n.igreja.eco.br): credencial "Telegram Vitrine" criada; fluxos importados e PUBLICADOS: "Vitrine - garimpo diario 6h (Telegram)" e "Vitrine - divulgacao diaria 9h (resumo + canal do Telegram)". Ambos testados com sucesso (token RADAR_N8N_TOKEN colado so no n8n).
- Pendente: fluxo "apuracao semanal" (n8n/vitrine-apuracao-semanal.json); cadastrar os 2 sapatos em /admin/calcados; cadastrar fontes em /admin/vitrine > Fontes de busca; rodar supabase-vitrine-cartoes.sql depois do SQL da Oficina.

## Registro 02/11/2026 - erro ao cadastrar o primeiro modelo
- Erro 23502 (coluna obrigatoria vazia) ao salvar em /admin/calcados: rf_produtos ja existia com fornecedor_id NOT NULL.
- Correcao no Supabase: `alter table public.rf_produtos alter column fornecedor_id drop not null;` (arquivo supabase-rf-produtos-fornecedor-opcional.sql).
- Regra de preco adotada: preco = (custo + R$ 20,00 de lucro) / (1 - 4,98% taxa Mercado Pago cartao a vista), arredondado para cima. Modelo 935: custo 163,12, preco 192,90.

## Registro 02/11/2026 - faixa Vitrine na home
- Novo componente lib/VitrineFaixa.jsx (+ styles/vitrineFaixa.module.css), inserido em pages/index.jsx entre a Campanha (verde) e o Canal (azul).
- Mostra ate 8 modelos publicados (/api/varejo/catalogo), busca por texto, filtro por categoria e botao "Pedir pelo WhatsApp" (assistente da vitrine). Botao "Ver a vitrine completa" leva a /calcados.
- Cadastrou em /admin/calcados, aparece na home sozinho. Nenhum SQL novo.

## Registro 02/11/2026 - checkout com retirada na rodoviaria + pagina "Como comprar"
- Checkout (pages/calcados/checkout.jsx e pages/api/varejo/pedido.js): o cliente escolhe "Retirar na rodoviaria" (frete gratis) ou "Correios". Na rodoviaria escolhe a capital (lista RODOVIARIAS_VAREJO em lib/varejo.js); o pedido grava entrega='rodoviaria' e cidade/estado da capital, o que faz o gatilho t_cal_pedido_mudou colocar o pedido pago no lote da cidade (fecha com 10 pedidos pagos). Modelos de fornecedor so por Correios. Sem SQL novo (colunas ja existiam).
- Capitais com retirada: Belo Horizonte, Rio de Janeiro, Goiania, Curitiba, Campo Grande, Vitoria, Salvador, Florianopolis, Sao Paulo. Regiao Norte: so Correios. Sem entrega em domicilio.
- Nova pagina publica /como-comprar (pages/como-comprar.jsx + styles/comoComprar.module.css): 10 etapas (abas rodoviaria x Correios), prazos, capitais, significado das situacoes do pedido, trocas e devolucoes, perguntas frequentes. Linkada no topo/rodape da loja, no rodape do site, na faixa Vitrine da home, no checkout e na pagina de agradecimento.
- Politicas (pages/calcados/politicas.jsx) atualizadas: desistencia 7 dias (CDC), defeito 30 dias, erro no pedido 7 dias, 1 troca de numeracao por pedido pelos Correios (custo do envio combinado antes), modelo esgotado, dados pessoais.
- Para conferir antes de divulgar: prazo maximo de espera do lote, quem paga o frete da troca de numeracao, dados do vendedor (CPF e endereco) no rodape.

## Registro 02/11/2026 - bonus do portal (1 mes gratis na compra)
- Situacao real: o banco ja libera 30 dias em cal_acessos_portal quando o pedido vira "pago" (gatilho t_cal_pedido_mudou), mas NENHUMA pagina do site consulta essa tabela ainda. Nao existe login de cliente nem area bloqueada, entao o bonus ainda nao e entregue.
- Por isso o aviso "compra libera 1 mes de portal" foi retirado de /como-comprar e da previa /nova-home ate a area do cliente existir.
- Para entregar: criar area do cliente (login por e-mail + numero do pedido), definir o que ela libera e como cobra depois do mes gratis (assinatura).

## Registro 02/11/2026 - painel de Pedidos e lotes + pagina Acompanhar pedido
- Novo painel /admin/pedidos (pages/admin/pedidos.jsx, pages/api/admin/pedidos.js), item "Pedidos" no menu do painel. Aba Pedidos: lista dos 300 mais recentes, filtro por situacao, detalhe (itens, contato, endereco ou rodoviaria), mudar situacao, codigo de rastreio, custo de fabrica (so voce ve), nota interna e botao "Avisar no WhatsApp" com mensagem pronta por situacao. Aba Lotes: situacao do lote (aberto, fechado, em rota, entregue), data de saida da viagem, avisar cada cliente. Marcar o lote "Em rota" ou "Entregue" atualiza tambem os pedidos dele que ainda estao no caminho.
- Nova pagina publica /acompanhar (pages/acompanhar.jsx, pages/api/varejo/acompanhar.js): o cliente informa numero do pedido + e-mail da compra e ve a etapa, o lote (quantos pedidos faltam e data de saida) ou o codigo de rastreio. Nao mostra CPF, endereco nem custo; limite de 15 consultas por 10 minutos por IP. Linkada no topo/rodape da loja, na pagina de agradecimento e em /como-comprar.
- lib/pedidosStatus.js guarda os textos das situacoes do pedido em um lugar so. Sem SQL novo.
- Ajuste visual: topo da loja passa a quebrar linha no celular (os links novos estouravam a largura).
- Rotina sugerida: pedido pago -> comprar na fabrica e marcar "Comprando na fabrica" (preencher custo) -> Correios: informar rastreio e marcar "Enviado"; rodoviaria: lote fecha com 10 pedidos, definir data de saida e marcar o lote "Em rota", depois "Entregue".

## Registro 02/11/2026 - regras por fabrica (lote minimo, prazo, troca) e fila de compra
- Motivo: cada fabrica tem o seu jeito. A fabrica dos dois primeiros sapatos so libera retirada com lote minimo de 12 pares, entao "preparo em 3 a 5 dias" nao vale sempre.
- SQL novo: supabase-fabricas-regras.sql (tabela cal_fabricas + coluna rf_produtos.fabrica_id; cria a fabrica "Di Franca" com lote minimo 12 e liga os sapatos 934 e 935). Rodar no Supabase ANTES de usar. O nome da fabrica nunca vai para o cliente.
- Regras por fabrica: lote minimo de pares, prazo depois do lote, prazo para defeito (minimo 30 dias), aceita troca de numeracao, observacao. Cadastro em /admin/pedidos > aba "Fabricas e regras". O modelo e ligado a fabrica em /admin/calcados (campo "Fabrica deste modelo").
- Pagina do modelo (/calcados/[id]) mostra "Como funciona este modelo" com as regras da fabrica (sem nome). Sem fabrica ligada: regras padrao da loja.
- Fila de compra por fabrica em /admin/pedidos: soma os pares dos pedidos pagos por fabrica ("9 de 12 pares"); so libera o botao "Marcar como Comprando na fabrica" quando atinge o minimo. Pedidos com fabricas misturadas ficam para marcar a mao.
- Cliente ve "Aguardando o lote da fabrica: X de Y pares" em /acompanhar.
- Regras gerais (valem sempre): desistencia 7 dias (CDC), defeito no minimo 30 dias, erro no pedido 7 dias. Se a regra da fabrica for melhor para o cliente, vale a dela. Textos atualizados em /como-comprar, /calcados/politicas, checkout e agradecimento.
- Dois minimos convivem: o da fabrica (para comprar) e o do lote da cidade (10 pedidos, para a viagem). Hoje a conferencia final dos dois e sua.

## Registro 02/11/2026 - passe de assinante (30 dias) e desconto por ramo
- Decisoes do dono: assinatura opcional; passe de 30 dias a R$ 29,90 pago todo mes (PIX ou cartao, renovacao manual, os dias se somam); desconto do assinante sai da parte do dono; operadores sempre recebem sobre o PRECO GERAL; mes gratis de boas-vindas para quem compra produto fisico.
- Criterio do desconto por ramo: menor entre (1) o que a margem permite sem mexer no fundo dos operadores [lucro = preco - custo - taxa MP; permitido = lucro x (1 - fundo%)] e (2) o teto percentual do ramo. Sem custo conhecido e sem teto: sem desconto. Ramos iniciais: Calcados e acessorios (so pela margem, automatico no checkout, ~7% no sapato de R$ 192,90), E-books e livros (teto 30%), Servicos sob medida (15%), Cursos e outros (20%). Os ramos que nao sao "automaticos" tem desconto combinado pelo WhatsApp (o site ainda so aplica sozinho na loja de calcados).
- SQL novo: supabase-assinatura.sql (cal_config, cal_ramos, colunas varejo_pedidos.tipo e subtotal_geral, rf_produtos.ramo; troca o gatilho cal_pedido_mudou e a funcao vit_apurar). Rodar no Supabase ANTES de usar. Testado em Postgres de teste: passe soma 30 dias (renovacao acumula), pedido de passe vira "entregue" sozinho, produto entra no lote e libera 30 dias, fundo calculado sobre subtotal_geral (preco geral).
- Paginas novas: /assinar (compra do passe), /assinar/obrigado, /area-do-cliente (login por e-mail + numero de pedido pago; mostra passe, descontos por ramo e pedidos). APIs: /api/varejo/passe, /api/varejo/planos, /api/membro/entrar|eu|sair. Sessao do assinante: cookie assinado (ebmembro) com ADMIN_SESSION_SECRET.
- Preco de assinante aparece na pagina do modelo (publico) e e aplicado no servidor em /api/varejo/pedido quando ha passe ativo (itens guardam preco e preco_geral; pedido guarda subtotal_geral). Checkout mostra "Desconto de assinante".
- Painel /admin/pedidos, aba "Assinantes e descontos": preco do passe, taxa MP, criterio por ramo, lista de assinantes e liberar acesso a mao.
- Limites atuais: o passe nao renova sozinho; reembolso de passe nao revoga o acesso sozinho; so a loja de calcados aplica desconto automatico; "liberar tudo" do portal (conteudos fechados) ainda nao existe: a area do cliente mostra descontos e pedidos.

## Registro 02/11/2026 - catalogo inicial e correcao de prazos
- Modelos cadastrados na loja (todos ligados a fabrica "Di Franca", lote minimo 12 pares): Sapato Social Preto 934 e Marrom 935 (custo 163,12, preco 192,90, numeros 37 ao 44); Mocassim Feminino Classico Whisky 004 e Marinho 004 (custo 171,92 promocional, preco 202,00, numeros 33 ao 40). Atencao: o custo dos mocassins vem de um preco promocional (20% de desconto); se a promocao acabar o custo sobe e o preco precisa ser recalculado: preco = (custo + 20) / 0,9502.
- SQL da assinatura rodado por completo no Supabase (tabelas, colunas e as funcoes cal_pedido_mudou e vit_apurar).
- Correcao de texto: /calcados, carrinho e faixa da home diziam que todo pedido e separado em 3 a 5 dias uteis; agora remetem ao prazo e ao lote minimo de cada modelo (regra por fabrica).
