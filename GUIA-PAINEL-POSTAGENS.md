# Painel de Postagens: divulgação diária feita pela IA e publicada pelo operador

## Como funciona (em 5 linhas)

1. **Toda noite às 21h** o n8n (no seu VPS) pede ao Gemini os textos do dia seguinte: Telegram, Facebook, Instagram e, em dois dias da semana, e-mail.
2. O n8n **envia tudo sozinho** para o site (`/api/postagens/receber`), que grava na tabela `op_postagens` já com dia e hora marcados.
3. O operador abre **`/operador/postagens`** e vê a fila do dia: arte pronta, texto pronto e o horário.
4. Ele copia o texto, baixa a arte, publica na rede e toca em **"Já postei"**.
5. Você acompanha tudo em **`/admin/postagens`** (quem postou, o que ficou pendente, reagendar, cancelar, criar postagem manual).

A **arte** é desenhada pelo próprio painel (frase grande + linha de apoio + marca igreja.eco.br, em 4 cores). Não precisa de nenhuma API paga de imagem.

Se o Gemini falhar, o fluxo usa um **texto de reserva** do tema do dia: o operador nunca fica sem postagem. Esses itens aparecem com "(texto de reserva)" no título.

## Passo 1: criar a tabela no Supabase (2 min)

Supabase, projeto `franca-shoes-p1` → **SQL Editor** → **New query** → cole o conteúdo de `supabase-postagens.sql` → **Run**. (O `supabase-operadores.sql` já precisa ter sido rodado, e foi.)
Cria a tabela `op_postagens` e a coluna `pode_postagens` em `op_operarios`. Não mexe em nada que já existe.

## Passo 2: senha de ligação site ↔ n8n (3 min)

1. Invente uma senha longa (30 letras e números, sem espaço). Guarde.
2. Vercel → projeto `franca-shoes-frontend` → **Settings → Environment Variables** → crie:

| Nome | Valor |
|---|---|
| `N8N_TOKEN_POSTAGENS` | a senha que você inventou |

3. Faça **Redeploy** do último deploy.

(`ADMIN_SESSION_SECRET`, `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` já existem.)

## Passo 3: importar o fluxo no n8n (10 min)

1. `https://n8n.igreja.eco.br` → **Workflows → Add workflow** → menu de três pontinhos → **Import from file** → `n8n/postagens-diarias.json`.
2. Bloco **Gemini escreve os textos**: em *Credential for Header Auth*, escolha a credencial **Gemini** que você já criou (cabeçalho `x-goog-api-key`).
3. Bloco **Enviar ao painel do operador**: em *Header Parameters*, troque `COLE_AQUI_O_MESMO_VALOR_DE_N8N_TOKEN_POSTAGENS` pela senha do Passo 2.
4. (Opcional) Bloco **Avisar no Telegram**: coloque a credencial do seu bot e o seu ID de chat e ligue o bloco. Ele avisa quando as postagens do dia chegaram.
5. Clique em **Testar agora (manual)**. Deve ficar tudo verde e o último bloco devolver `criadas: 3` (ou 4).
6. Ligue o interruptor **Active**. Sem isso, o horário das 21h não dispara.

Se o bloco do Gemini der erro **404** ou "model not found", o nome do modelo mudou: no endereço do bloco, troque `gemini-2.5-flash` por um modelo "flash" atual que apareça no Google AI Studio. Enquanto isso o fluxo continua funcionando com o texto de reserva.

### Onde mudar o conteúdo
No bloco **Preparar pedido** (começa com "CONFIGURAÇÃO"): horários de cada rede, dias com e-mail, e o **tema de cada dia da semana** (Oficina Digital, Ateliê, calçados, agroecologia, pontos e afiliados, cursos, comunidade). Edite os textos entre aspas com calma e salve.

## Passo 4: liberar o operador (2 min)

1. `/admin/operadores` → aba **Operadores** → no operador, clique **Liberar postagens**.
2. O operador entra em **`/operador`** com o código dele, aceita as regras e toca em **Abrir a fila de postagens** (ou vai direto em `/operador/postagens`).

## Passo 5: teste final

1. Em `/admin/postagens` → **Nova postagem** → agende para daqui a 10 minutos.
2. Em `/operador/postagens` ela deve aparecer, com a arte desenhada. Teste **Copiar texto**, **Baixar arte** e **Já postei**.
3. Volte em `/admin/postagens`: o status deve estar **Postada**, com o nome do operador.

## Rotina do operador (o que você ensina a ele)

- Abre `/operador/postagens` de manhã (a fila do dia já está pronta desde a noite anterior).
- Em cada cartão: **Copiar texto** → **Baixar arte** → abre a rede → cola, anexa e publica no horário → volta e toca **Já postei** (se quiser, cola o link da publicação).
- No celular, o botão **Compartilhar (celular)** abre o menu do aparelho já com a arte e o texto.
- Se a rede estiver fora do ar ou algo impedir: **Não consegui postar** e diz o motivo.
- **Vou fazer esta** evita que dois operadores postem a mesma coisa. **Devolver à fila** desfaz.
- E-mail: copia assunto e texto, abre o Gmail, cola e envia **com os destinatários em cópia oculta**.

## Sua rotina de dono (5 minutos por dia)

- Olhe `/admin/postagens` à noite, depois das 21h: as do dia seguinte já chegaram. Se algum texto não agradar, **edite** ou **cancele** antes de o operador postar.
- Filtre por **Operador fazendo / Não feita** para ver o que travou.

## Se o n8n ou o Gemini estiverem parados

Peça ao Claude, no chat, "gere uma semana de postagens no formato do painel" e cole o resultado em `/admin/postagens` → aba **Colar lote da IA**. O formato é uma lista como esta (cada item é uma postagem):

```json
[
  {
    "chave": "2026-10-29-facebook",
    "rede": "facebook",
    "titulo": "Oficina Digital · Facebook · 29/10",
    "texto": "Texto completo da publicação...",
    "hashtags": "#igrejaeco #oficinadigital",
    "link_destino": "https://www.igreja.eco.br/oficina",
    "arte_titulo": "Aprenda fazendo",
    "arte_subtitulo": "Tarefas reais, treinamento embutido",
    "arte_tema": "azul",
    "agendada_para": "2026-10-29T10:00:00-03:00"
  }
]
```

- `rede`: `facebook`, `instagram`, `telegram` ou `email` (e-mail leva também `email_assunto`).
- `arte_tema`: `azul`, `verde`, `terra` ou `noite`.
- `chave` (opcional) evita duplicar se você colar o mesmo lote duas vezes.
- Se tiver uma arte pronta (Canva, por exemplo), use `imagem_url` com um endereço `https://`; ela substitui a arte desenhada.

## Travas do sistema

- Só o n8n com a senha do Passo 2 consegue enviar postagens automáticas.
- Só operador **ativo, com regras aceitas e com "postagens liberadas"** vê a fila.
- Duas pessoas não assumem a mesma postagem; ninguém mexe na postagem que outro está fazendo.
- Links só aceitam `https://`. O mesmo lote enviado duas vezes não duplica (pela `chave`).
- Máximo de 60 postagens por envio.

## Cuidados importantes

- **A publicação é manual de propósito.** Postar por robô em conta pessoal de Facebook, Instagram ou Telegram pode levar a bloqueio da conta. O operador humano evita esse risco e mantém a rotina diária.
- **Contas pessoais:** hoje as redes são contas pessoais suas. O operador precisa de acesso a elas (ou a páginas/canais criados depois). Nunca passe a senha da conta principal: use as funções de administrador de Página/Grupo do Facebook e o acesso de gerente do Instagram quando criar essas contas.
- **Textos da IA:** as regras do fluxo proíbem prometer renda, cura ou preço inventado, mas **confira** os textos de vez em quando.
- **E-mail marketing:** o Gmail limita envios por dia (cerca de 500 destinatários). Só escreva para quem aceitou receber e sempre em cópia oculta. Se a lista crescer, considere uma ferramenta de e-mail própria.
- **Pagamento do operador:** este painel registra o trabalho, não paga. Por enquanto, combine pelo sistema de Pontos Oficina ou como tarefa à parte, e sem valor em R$ até o primeiro pedido real, como você decidiu.

## Se algo der errado

| O que aparece | O que provavelmente é |
|---|---|
| "A tabela de postagens ainda não foi criada" | Passo 1 não foi executado. |
| n8n: "Token inválido" (401) | A senha no bloco do n8n é diferente de `N8N_TOKEN_POSTAGENS` na Vercel, ou faltou o Redeploy. |
| Operador entra mas vê "Acesso ainda não liberado" | Falta aceitar as regras em `/operador` ou **Liberar postagens** em `/admin/operadores`. |
| Fila vazia de manhã | O fluxo não está **Active**, ou o n8n parou (veja **Executions**). Use **Colar lote da IA** como plano B. |
| Postagens com "(texto de reserva)" | O Gemini falhou naquela noite (chave, limite gratuito ou modelo). Edite o texto em `/admin/postagens` se quiser. |
| "Não foi possível gerar a arte" no celular | Atualize a página e tente de novo; se persistir, use outro navegador (Chrome). |
| Erro 422 do site no n8n | Algum item do lote é inválido; a resposta lista quais (`erros`). |

## Arquivos novos e alterados

Novos: `supabase-postagens.sql`, `lib/postagens.js`, `lib/arteCanvas.js`, `pages/api/postagens/receber.js`, `pages/api/operador/postagens/` (2), `pages/api/admin/postagens/` (2), `pages/operador/postagens.jsx`, `pages/admin/postagens.jsx`, `n8n/postagens-diarias.json`.
Alterados: `lib/operadorAuth.js`, `pages/api/operador/tarefas/index.js`, `pages/api/admin/operadores/` (2), `pages/admin/operadores.jsx`, `pages/operador/index.jsx`.
