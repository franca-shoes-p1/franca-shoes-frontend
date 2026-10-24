# Oficina Digital, Fase 1

Soma-se ao painel de operadores que já existe (`/admin/operadores`, `/operador`). Nada do que existe é alterado.

## Passo 1: SQL (2 min)
Supabase → **SQL Editor** → **New query** → cole `supabase-oficina-fase1.sql` → **Run**. Pode rodar de novo sem estragar nada.
Cria as tabelas `op_` novas (candidatos, cartões, entregas, pontos, benefícios, resgates, empreendimentos, marcos, atualizações, vagas, convites, chamados, histórico) e já cadastra os 3 primeiros Cartões de Tarefa e 3 benefícios de exemplo.

## Passo 2: variáveis
Nenhuma nova. Usa as mesmas do painel de operadores (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).

## Passo 3: subir
Faça o merge do pull request; a Vercel publica sozinha.

## Páginas novas
- `/oficina`: inscrição pública (vai para a aba Candidatos). Use `?origem=instagram` nos links das campanhas.
- `/vitrine`: projetos públicos. Só aparece o que você marcar como público.
- `/admin/oficina` (só você): Entregas, A pagar, Candidatos, Resgates, Cartões, Vitrine.
- `/operador/oficina` e `/operador/cartao/...` (operador): cartões, pontos, benefícios.

## Fluxo
1. Candidato se inscreve em `/oficina` → você chama no WhatsApp → **Criar operador e gerar código** → manda o código.
2. Operador entra em `/operador`, aceita as regras, abre **Oficina Digital** e faz o Cartão 1 (Tarefa 0).
3. Você revisa em **Entregas**: Aprovar (credita os pontos), Pedir ajuste ou Recusar.
4. Cartões com valor em R$: depois de aprovado aparece em **A pagar**; Pix no seu banco e **Marcar como paga**.
5. Pontos: o operador pede um benefício; você aprova em **Resgates** e os pontos são descontados.

## Antes de usar com pessoas de verdade
- Aba **Cartões**: defina o valor em R$ de C2 e C3.
- Troque os textos `[LINK DA PÁGINA DE EXEMPLO]` e `[LINK DO MODELO NO CANVA]` (tabela `op_cartoes`, coluna `material`) pelos links reais. No C2 e C3 o material do dia (texto do post, briefing do cliente) ainda é manual, até a Fase 2.
- Contrato com advogado e contador (MEI, recibo) antes de pagar em dinheiro ou convidar para projetos.

## Regras imposta pelo servidor
- Tarefa 0 só vale uma vez. Pontuação não duplica (índice único).
- Operador só vê o que é dele; só aprovar, pagar e resgatar são do dono.
- Pontos valem 12 meses, não se compram, não viram participação.
- Prints ficam no bucket público `produtos` do Supabase (endereço difícil de adivinhar). Não peça dados pessoais nos prints.

## Fica para a Fase 2
Tutor "Pergunte à IA", avaliação automática pela IA (hoje a análise é sua), automação n8n lendo as entregas, aviso por WhatsApp, níveis automáticos.
