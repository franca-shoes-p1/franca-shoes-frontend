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
3. **Depois** de rodar os SQL da Oficina (`supabase-oficina-fase1.sql`), rode `supabase-vitrine-cartoes.sql`. Ele cria o setor Vitrine e os cartões V1 a V4. Se rodar antes da hora, ele para com uma mensagem avisando.

## Passo 2: variáveis na Vercel

| Variável | Para que serve | Obrigatória |
|---|---|---|
| `RADAR_N8N_TOKEN` | senha que o n8n usa para chamar o site (invente uma com mais de 16 letras e números) | sim, para os fluxos automáticos |
| `GEMINI_API_KEY` | já existe | já tem |
| `VITRINE_MAX_IA` | máximo de chamadas ao Gemini por execução (padrão 10) | não |
| `GEMINI_MODEL` | força um modelo específico, se o padrão falhar | não |

O plano gratuito do Gemini tem limite pequeno e o Google não publica mais a tabela: veja os seus números no Google AI Studio. Quando a cota acaba, o sistema continua sem IA (usa texto padrão na divulgação e pula a busca) e avisa no resumo.

## Passo 3: fluxos no n8n

Importe os dois arquivos da pasta `n8n/`:

- `vitrine-garimpo-diario.json`: todo dia às 6h, o garimpo roda e você recebe o resumo no Telegram.
- `vitrine-divulgacao-diaria.json`: todo dia às 9h, cria os textos, avisa você e publica no canal do Telegram.

Em cada fluxo troque `COLE_AQUI_O_MESMO_VALOR_DE_RADAR_N8N_TOKEN` pelo valor da variável e os `COLE_AQUI_O_ID_...` pelos IDs do seu chat e do seu canal (o robô precisa ser administrador do canal). Se importar e algum nó pedir ajuste, confira primeiro a credencial do Telegram. Os fluxos foram montados no mesmo padrão dos que já existem, mas não foram testados dentro do seu n8n.

## Passo 4: rotina no painel

1. **Fontes de busca:** acrescente páginas de fornecedores de Franca e frases de busca.
2. **Achados:** libere os bons, uma pessoa valida (cartão V1), e você aprova com o custo confirmado. O modelo nasce escondido em `/admin/calcados`.
3. **Divulgação:** copie os textos pendentes ou deixe as pessoas do setor postarem (cartão V4) e marque como feito.

## Se algo falhar

- “Falta uma etapa” no painel: falta rodar `supabase-vitrine.sql`.
- Garimpo diz “falta GEMINI_API_KEY” ou “cota acabou”: o resto continua; os achados podem ser cadastrados à mão.
- Nada é publicado no canal: confira se o robô é administrador do canal e o ID do canal no fluxo.
