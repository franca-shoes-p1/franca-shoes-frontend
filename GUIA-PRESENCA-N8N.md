# Máquina de Presença: divulgação diária no Telegram (etapa 3)

Todo dia às 10h o n8n pede o post do dia ao site, publica no canal @vitrine_igrejaeco e marca como publicado.
O segmento muda a cada dia (calçados de fábrica, lojas de calçados, comércio local) e o link leva à página certa com `?canal=telegram_vitrine`, para as visitas e os leads aparecerem por canal em `mp_eventos` e `mp_leads`.

## Passo a passo
1. No n8n, importe o arquivo `n8n/presenca-divulgacao-diaria.json` (menu ⋯ > Import from file).
2. Nos dois nós de requisição ("Criar post da Presença" e "Marcar como enviado"), troque `COLE_AQUI_O_MESMO_VALOR_DE_RADAR_N8N_TOKEN` pela mesma senha `RADAR_N8N_TOKEN` que já está na Vercel.
3. No nó "Resumo para mim", troque `COLE_AQUI_O_ID_DO_SEU_CHAT` pelo seu chat do Telegram. Nos dois nós do Telegram, escolha a credencial do seu bot.
4. Clique em "Execute workflow" para testar. Deve chegar o resumo no seu chat e o post no canal.
5. Ative o fluxo (chave "Active").

## Como funciona
- `POST /api/presenca/divulgar` devolve `posts_telegram` com o post do dia e grava em `mp_conteudos` (status `pendente`). Se for chamado de novo no mesmo dia, devolve o mesmo post (se ainda pendente) ou nada (se já publicado).
- `POST /api/presenca/enviado` marca o post como `publicado`.
- Os textos ficam em `lib/presencaPosts.js`. Para incluir um modelo novo, acrescente uma linha na lista do segmento.

## Erros comuns
- 401: a senha do fluxo é diferente da `RADAR_N8N_TOKEN` da Vercel.
- 503: falta a variável `RADAR_N8N_TOKEN` na Vercel (ou falta o Redeploy).
- "faltam linhas em mp_segmentos ou mp_canais": rode de novo o SQL da etapa 1 no Supabase.
