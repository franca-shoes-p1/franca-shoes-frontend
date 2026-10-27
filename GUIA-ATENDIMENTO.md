# Atendimento manual: Fale conosco, botão flutuante, avisos e painel

O que passa a existir depois de ativar:

1. **Botão "Fale conosco"** flutuante em todas as páginas públicas (WhatsApp, Telegram e formulário).
2. **Página `/contato`** com formulário. A mensagem é gravada no Supabase (`op_contatos`) e o n8n avisa você.
3. **Aviso de candidato a operador**: quem se inscreve na Oficina agora também gera aviso (antes só ficava gravado).
4. **Painel `/admin/contatos`** ("Atendimento"): uma lista só com mensagens do site, pedidos do Ateliê, candidatos a montador e candidatos a operador. Você responde no WhatsApp ou e-mail com um clique, muda o status e escreve notas.

Nada disto usa IA nem API paga. Se o n8n estiver fora do ar, o formulário continua gravando no Supabase e o painel mostra tudo.

## Passo 1: criar a tabela no Supabase (3 min)

1. Supabase, projeto `franca-shoes-p1`, **SQL Editor → New query**.
2. Abra `supabase-contatos.sql`, copie tudo, cole e clique em **Run**. Deve aparecer "Success". Não mexe em tabelas que já existem.
3. Confira em **Table Editor**: deve existir `op_contatos`.

## Passo 2: importar o fluxo no n8n (5 min)

1. Abra `https://n8n.igreja.eco.br` e entre.
2. **Workflows → Add workflow → ⋯ → Import from file** e escolha `n8n/atendimento-avisos.json`.
3. Abra o bloco **Conferir e montar mensagem** e troque `COLE_AQUI_O_MESMO_VALOR_DE_N8N_WEBHOOK_TOKEN_ATENDIMENTO` por uma senha longa inventada por você. Guarde-a para o Passo 3.
4. Abra o bloco **Webhook Atendimento** e copie a **Production URL** (termina em `/webhook/atendimento-novo`). Não use a Test URL.
5. Ative o aviso que preferir (os blocos vêm desligados):
   - **Avisar no Telegram**: crie a credencial com o token do seu bot, troque `COLE_AQUI_O_ID_DO_SEU_CHAT` pelo seu ID de chat e ative o bloco. Pode reaproveitar a mesma credencial e o mesmo chat do fluxo do Ateliê.
   - **Avisar por e-mail (opcional)**: crie a credencial do Gmail e ative o bloco.
6. Ligue o interruptor **Active** (canto superior direito). Sem isso a Production URL não funciona.

## Passo 3: variáveis na Vercel (3 min)

Projeto `franca-shoes-frontend` → **Settings → Environment Variables**. Adicione:

| Nome | Valor |
|---|---|
| `N8N_WEBHOOK_ATENDIMENTO` | a Production URL do Passo 2 |
| `N8N_WEBHOOK_TOKEN_ATENDIMENTO` | a senha do Passo 2 |

Depois faça **Redeploy** do último deploy. `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` já existem (são os mesmos do painel de operadores).

## Passo 4: testar

1. Abra `igreja.eco.br`, clique em **Fale conosco → Enviar mensagem**, preencha com dados de teste e envie. Deve aparecer "Mensagem recebida (nº ...)".
2. Supabase → `op_contatos`: a linha aparece.
3. n8n → **Executions**: uma execução com sucesso, e a mensagem chega no Telegram.
4. Abra `igreja.eco.br/admin/contatos`, entre com a senha do painel e veja a mensagem. Troque o status para "Respondido".
5. Cadastre um candidato de teste na Oficina e confira o aviso "Novo CANDIDATO a operador".

## Se algo não funcionar

| O que aparece | O que provavelmente é |
|---|---|
| "Não foi possível enviar agora" no formulário | Falta rodar o SQL (Passo 1) ou as variáveis do Supabase na Vercel. |
| Grava mas não chega aviso | Fluxo desligado (Active), URL errada na Vercel ou senha diferente nos dois lugares. Veja **Executions** no n8n. |
| Erro "Token inválido" no n8n | A senha no bloco **Conferir e montar mensagem** difere de `N8N_WEBHOOK_TOKEN_ATENDIMENTO`. |
| Painel diz "Não consegui ler: Fale conosco" | O SQL do Passo 1 ainda não foi rodado. |

## Cuidados

- As mensagens têm dados pessoais (nome, WhatsApp, e-mail). Use só para responder. Se alguém pedir para apagar, apague a linha no Supabase.
- As tabelas só são lidas pelo servidor (chave de serviço). Nunca copie essa chave para o site ou para mensagens.
- O n8n fica no VPS da Hostinger, que precisa ser renovado todo mês. Se vencer, os avisos param, mas as mensagens continuam gravadas e aparecem no painel.

## Como as peças conversam

```
Visitante → /contato ou botão → POST /api/contato
          → grava op_contatos (Supabase)
          → POST no n8n (cabeçalho x-webhook-token, JSON evento=contato_novo)
          → n8n → Telegram / e-mail
Candidato → /api/oficina/candidatar → op_candidatos → n8n (evento=operador_candidato)
Você      → /admin/contatos → lê op_contatos + op_atelie_pedidos + op_atelie_candidatos + op_candidatos
```
