# Painel dos operadores (Fábrica Digital)

Duas páginas novas, as duas protegidas:

- **`/admin/operadores`** (só você, mesma senha do `/admin/calcados`): cadastra operadores, cria ordens de produção, atribui tarefas, aprova entregas e registra pagamentos.
- **`/operador`** (cada operador, com código pessoal): mostra só as tarefas dele, ele começa e entrega.

## Passo 1: criar as tabelas (2 min)

Supabase → **SQL Editor** → **New query** → cole o conteúdo de `supabase-operadores.sql` → **Run**.
Cria `op_operarios`, `op_ordens` e `op_tarefas`.

## Passo 2: variáveis na Vercel

Nada novo se o painel de modelos (`/admin/calcados`) já abre para você. O painel usa `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (16+ caracteres), `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`.

## Passo 3: subir os arquivos

Suba as pastas `lib`, `pages` e o `supabase-operadores.sql` no GitHub (ou faça o merge da branch `loja-varejo`).

## Como funciona no dia a dia

1. **Cadastre o operador** em `/admin/operadores` → aba **Operadores**. Aparece um código (ex.: `7KQ2M-X9D4P`) **uma única vez**. Envie por WhatsApp. Perdeu? Use **Novo código**.
2. **O operador entra em `/operador`**, digita o código e lê/aceita as regras de trabalho (autônomo, pago por tarefa aprovada, sem promessa de ganho, LGPD). Sem aceitar, não consegue trabalhar.
3. **Quando fechar uma venda**, aba **Ordens** → **Nova ordem**. Vêm as 7 tarefas do modelo "Loja de Calçados Pronta" (briefing, garimpo e cotação, catálogo, montagem, pagamento e frete, QA, treinamento).
4. **Atribua** operador, valor e prazo em cada tarefa e clique **Salvar**.
5. **Marque "Entrada (50%) paga"** só depois de o Pix cair. **Antes disso o operador não vê nada.**
6. O operador clica **Começar**, trabalha e **entrega** (texto ou link).
7. Você **aprova** ou **pede ajuste** (ele refaz).
8. Faça o Pix ao operador e clique **Marcar como paga**.

## Travas que o próprio sistema impõe

- Operador só vê tarefa **atribuída a ele** e de ordem com **entrada confirmada**.
- Operador nunca vê o valor que o cliente paga.
- **Só se marca como paga tarefa aprovada.** Tarefas de QA e treinamento só depois do **saldo** do cliente.
- Código perdido ou operador que sai: **Novo código** ou **Desativar** corta o acesso na hora.
- A aba Operadores mostra a meta de **1 titular + 2 substitutos** por setor.

## Importante

- O texto das regras na tela do operador é um **resumo**. Faça o **acordo de prestação de serviço** com revisão de advogado antes de usar com pessoas de verdade.
- O sistema **registra** o pagamento; o Pix você faz no seu banco.
- Comissão por venda **não** está neste painel ainda: por enquanto lance como tarefa à parte, com valor combinado.
- Você trabalha com CPF: dê **recibo** ao operador e guarde o registro (dúvida fiscal: contador).

## Se algo der erro

- "Não foi possível salvar: relation op_... does not exist": o Passo 1 não foi executado.
- "Falta ADMIN_SESSION_SECRET": crie a variável na Vercel e faça Redeploy.
