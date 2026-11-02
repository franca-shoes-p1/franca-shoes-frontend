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
