# Ateliê Sob Medida: ativar o registro de pedidos e o aviso no n8n

O que acontece depois de ativar:

1. A pessoa preenche o pedido (ou a candidatura) em `igreja.eco.br/atelie`.
2. O site grava no Supabase (tabelas `op_atelie_pedidos` e `op_atelie_candidatos`).
3. O site avisa o n8n, que monta a mensagem e avisa você.
4. A pessoa ainda recebe a mensagem pronta para mandar no seu WhatsApp. Se qualquer passo acima falhar, esse último continua funcionando.

Enquanto você não fizer os passos abaixo, o registro não funciona: o visitante vê o aviso "Não foi possível registrar agora" e a mensagem pronta para mandar no seu WhatsApp. Nada quebra, mas faça os passos logo depois de publicar.

## Passo 1: criar as tabelas no Supabase (3 min)

1. Abra o Supabase, projeto `franca-shoes-p1`, menu **SQL Editor**, botão **New query**.
2. Abra o arquivo `supabase-atelie.sql` (está na raiz do repositório), copie tudo e cole.
3. Clique em **Run**. Deve aparecer "Success". O comando não mexe em nenhuma tabela que já existe.
4. Para conferir, vá em **Table Editor**: devem existir `op_atelie_pedidos` e `op_atelie_candidatos`.

## Passo 2: importar o fluxo no n8n (5 min)

1. Abra `https://n8n.igreja.eco.br` e entre.
2. **Workflows → Add workflow**. No menu de três pontinhos (canto superior direito), escolha **Import from file** e selecione `n8n/atelie-avisos.json`.
3. Abra o bloco **Conferir e montar mensagem** e troque o texto `COLE_AQUI_O_MESMO_VALOR_DE_N8N_WEBHOOK_TOKEN` por uma senha longa que você inventar (por exemplo 30 letras e números). Guarde essa senha, ela será usada no Passo 3. Se você já usa `N8N_WEBHOOK_TOKEN` nos outros fluxos, use o mesmo valor.
4. Abra o bloco **Webhook Ateliê** e copie a **Production URL** (não a Test URL). Ela termina em `/webhook/atelie-novo`.
5. Para receber o aviso, você tem duas opções:
   - **Telegram (mais simples e grátis):** abra o bloco **Avisar no Telegram (opcional)**, crie a credencial com o token do seu bot, coloque o seu ID de chat e ative o bloco (ele vem desligado).
   - **WhatsApp:** ligue, depois do bloco **Conferir e montar mensagem**, o mesmo envio de WhatsApp que você já usa em outros fluxos. O texto do aviso está pronto no campo `mensagem`.
6. No canto superior direito, ligue o interruptor **Active**. Sem isso a Production URL não funciona.

## Passo 3: variáveis na Vercel (3 min)

Projeto `franca-shoes-frontend` → **Settings → Environment Variables**. `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` já existem. Adicione:

| Nome | Valor |
|---|---|
| `N8N_WEBHOOK_ATELIE` | a Production URL copiada no Passo 2 |
| `N8N_WEBHOOK_TOKEN` | a senha do Passo 2 (só adicione se ainda não existir) |

Depois faça **Redeploy** do último deploy.

## Passo 4: testar

1. Abra `igreja.eco.br/atelie`, preencha o formulário de pedido com um nome e WhatsApp de teste e clique em **Enviar meu pedido**.
2. A tela deve dizer "Registramos o seu pedido nº ...".
3. No Supabase, **Table Editor → op_atelie_pedidos**: a linha deve aparecer.
4. No n8n, menu **Executions**: deve aparecer uma execução com sucesso. Se você ativou o Telegram, a mensagem chega lá.
5. Faça o mesmo com o formulário "Seja montador" e confira `op_atelie_candidatos`.

## Se algo não funcionar

| O que aparece | O que provavelmente é |
|---|---|
| "Não foi possível registrar agora" | Faltam as tabelas (Passo 1) ou as variáveis do Supabase na Vercel. O site continua mostrando a mensagem para o WhatsApp. |
| Registra no Supabase mas não chega aviso | O fluxo do n8n está desligado (Active), a URL na Vercel está errada ou a senha do Passo 2 é diferente nos dois lugares. Olhe **Executions** no n8n. |
| Erro "Token inválido" no n8n | A senha no bloco **Conferir e montar mensagem** é diferente de `N8N_WEBHOOK_TOKEN` na Vercel. |

## Cuidados

- Os dados de pedidos e candidatos são pessoais. Use só para responder a pessoa e, se alguém pedir para apagar, apague a linha no Supabase.
- As tabelas só podem ser lidas pelo servidor (chave de serviço). Nunca copie essa chave para o site ou para mensagens.
