# Ajudante do Radar no n8n (avisos no Telegram)

Três fluxos prontos na pasta `n8n/`:

| Arquivo | O que faz |
|---|---|
| `radar-resumo-diario.json` | Todo dia às 8h manda no Telegram o resumo: perfis a aprovar, divulgações a conferir, autorizados, lembretes (5+ dias), convites na fila, propostas de troca, visitas das últimas 24h. |
| `radar-avisos-tempo-real.json` | Avisa na hora: nova inscrição, vitrine enviada, comprovação de divulgação, troca aceita, resposta SIM/NÃO ao convite. |
| `radar-busca-semanal.json` | Toda segunda às 7h roda "Buscar locais" sozinho (rodízio: academias+faculdades, comércios, igrejas, terminais) e avisa o resultado. |

O envio de WhatsApp continua manual (de propósito, para não arriscar bloqueio do número).

## Passo 1 · Criar o robô no Telegram
1. No Telegram, procure **@BotFather** e envie `/newbot`. Escolha um nome e um usuário terminado em `bot`.
2. Ele devolve um **token** (texto longo). Guarde.
3. Abra a conversa com o seu robô novo e envie qualquer mensagem (ex.: "oi").
4. Para descobrir o seu **chat id**: procure **@userinfobot** e envie `/start`; o número em "Id" é o seu chat id.

## Passo 2 · Criar a senha entre site e n8n
Invente uma senha longa (mínimo 16 caracteres, sem espaços), por exemplo gerada em um gerador de senhas. Ela será usada em dois lugares e **precisa ser igual**: na Vercel e dentro dos fluxos.

## Passo 3 · Variáveis na Vercel
Vercel → projeto → Settings → Environment Variables (Production), depois **Redeploy**:
- `RADAR_N8N_TOKEN` = a senha do passo 2
- `N8N_AVISO_URL` = `https://n8n.igreja.eco.br/webhook/radar-aviso` (se o seu n8n tiver outro endereço, use o dele)

## Passo 4 · Credencial do Telegram no n8n
n8n → Credentials → Create → **Telegram API** → cole o token do robô → Save. Dê o nome "Telegram Radar".

## Passo 5 · Importar os 3 fluxos
Para cada arquivo: n8n → Workflows → Import from file. Depois, em cada fluxo:
1. No nó **Enviar no Telegram**: escolha a credencial "Telegram Radar" e troque `COLE_AQUI_O_ID_DO_SEU_CHAT` pelo seu chat id.
2. Onde aparecer `COLE_AQUI_O_MESMO_VALOR_DE_RADAR_N8N_TOKEN`, cole a senha do passo 2 (nos fluxos 1 e 3 é o nó de requisição; no fluxo 2 é o nó "Conferir senha").
3. No fluxo 3, abra o nó "Cidades e tipos da semana" e confira a cidade (começa com Belo Horizonte).
4. Clique em **Execute workflow** para testar (no fluxo 2, use "Listen for test event" e depois publique) e então ative (Active / Publish).

## Teste rápido
- Fluxo 1: Execute workflow; chega o resumo no Telegram.
- Fluxo 2: faça uma inscrição de teste em /radar/participar; chega o aviso em segundos.
- Fluxo 3: Execute workflow; chega "Busca de locais em ... novo(s) cadastrado(s)".

## Se algo não chegar
- Erro 401 na requisição: a senha do fluxo é diferente da `RADAR_N8N_TOKEN` da Vercel.
- Erro 503: a variável `RADAR_N8N_TOKEN` não existe (ou tem menos de 16 caracteres) ou faltou o Redeploy.
- Avisos em tempo real não chegam: confira `N8N_AVISO_URL` e se o fluxo 2 está ativo. O site nunca trava por causa disso; só deixa de avisar.
