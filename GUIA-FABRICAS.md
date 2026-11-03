# Vitrine "Fábricas de Franca": como ligar (passo a passo)

Página pública `/fabricas` com as empresas de calçados e acessórios de Franca. O cliente clica em **Ir para o site da empresa** e compra lá, direto. O site **não vende, não cobra e não guarda dinheiro** dessas compras. Painel: `/admin/fabricas`.

## O que o sistema faz

| Parte | O que faz |
|---|---|
| Página `/fabricas` | Lista as empresas, com busca e filtro por tipo. Mostra o aviso de como funciona, o convite para o passe de assinante e o botão de registrar compra. Boa para o Google (texto no servidor, título e descrição próprios). |
| Botão "Ir para o site da empresa" | Conta o clique e leva ao site. Sem guardar IP: só uma marca anônima que muda todo dia. Robôs de busca não contam. |
| Destaque patrocinado | Empresa marcada como patrocinada vai para o topo com a etiqueta **Publicidade** e `rel="sponsored"`. O destaque some sozinho na data combinada. |
| Registrar compra (`/fabricas/registrar-compra`) | O cliente informa a chave da nota fiscal (44 números) ou o número do pedido. O site confere o que consegue; você aprova no painel; o cliente ganha dias de passe. |
| Passe de assinante | **Já existia** (`/assinar`, 30 dias, Mercado Pago, PIX ou cartão). A vitrine só leva o cliente até ele. Nada foi mudado na cobrança. |

## O que o sistema confere na chave da nota (e o que NÃO confere)

Confere: 44 números; dígito verificador (módulo 11); modelo 55 ou 65; data não está no futuro; CNPJ da nota é o da empresa escolhida (se você cadastrou o CNPJ); a mesma nota não pode ser registrada duas vezes; avisa se a nota tem mais de 3 meses.

**Não confere:** se a nota existe de verdade na Receita, e se quem registrou é o comprador. Isso não dá para automatizar sem acordo com a empresa. Por isso quem aprova é você: antes de aprovar, cole a chave em **nfe.fazenda.gov.br** (consulta completa). Sem acordo com a fábrica, esta é a conferência possível.

## Passo 1: tabela no Supabase

1. Supabase > SQL Editor > New query.
2. Cole todo o arquivo `supabase-fabricas-franca.sql` e clique em Run. Esperado: "Success. No rows returned".
3. Aparecem as tabelas `ff_lojas`, `ff_cliques` e `ff_comprovantes`. Nenhuma tabela existente é alterada.
4. O bônus de passe usa a tabela `cal_config` do `supabase-assinatura.sql` (já rodado). Se ela não existir, o site usa 30 dias.

## Passo 2: publicar no site

1. No GitHub, abra o pull request da branch `fabricas-franca` e faça **Merge**.
2. A Vercel publica sozinha. Não há variável nova para colocar.

## Passo 3: cadastrar as empresas

1. Entre em `/admin/fabricas` > **Adicionar empresa**.
2. Preencha nome, **site onde se compra** (precisa começar com `https://`), tipo e uma descrição escrita por você com as suas palavras.
3. CNPJ é opcional, mas ajuda a conferir as notas fiscais.
4. Só mostre na página empresas que **vendem pela internet**, com preço e condições visíveis no próprio site.

## Patrocínio (links patrocinados)

- Marque **Destaque patrocinado** só quando existir acordo e pagamento. Sem isso, a empresa aparece como as outras.
- A etiqueta **Publicidade** é automática e não pode ser tirada pelo painel. Isso é exigência de transparência para o consumidor.
- Use a aba **Cliques** para mostrar resultado a quem quiser patrocinar (cliques em 7 e 30 dias, uma pessoa conta uma vez por dia).
- O valor recebido de patrocínio é renda: guarde os comprovantes e confirme com um contador como declarar no CPF.

## Regras do texto da página (importante)

- A página diz que **não recebemos comissão pela venda**. Isso é verdade só enquanto você não entrar em programa de afiliados de nenhuma empresa listada. Se entrar, mude o aviso em `pages/fabricas/index.jsx` antes.
- Não copie fotos, preços nem textos dos sites das empresas. Descrição é sua.
- Não escreva "parceiro oficial" nem sugira acordo que não existe.

## Rotina

1. Quando chegar aviso de compra registrada no Telegram, abra `/admin/fabricas` > **Compras registradas**.
2. Confira a chave em nfe.fazenda.gov.br. Estando certa, **Aprovar**; senão, **Recusar** com o motivo.
3. Ao aprovar, o passe é somado ao do cliente (se já tiver passe ativo, os dias se acumulam).
4. O cliente entra na Área do cliente com o **e-mail + número do protocolo**.
5. Para mudar os dias de bônus (ou desligar com 0), use a caixa **Bônus de passe** na mesma aba.

## Se algo falhar

- Painel mostra "Falta uma etapa": falta rodar `supabase-fabricas-franca.sql`.
- Página `/fabricas` mostra "As empresas serão publicadas em breve": ainda não há empresa cadastrada e publicada.
- "Essa nota fiscal já foi registrada": a mesma chave só vale uma vez.
- Cliente aprovado não consegue entrar: ele precisa usar o **mesmo e-mail** do registro e o número do **protocolo**.

## Registro de implantação (02/11/2026)

- Nova branch `fabricas-franca`. Arquivos novos: `supabase-fabricas-franca.sql`, `lib/fabricasFranca.js`, `lib/fabricasFrancaServer.js`, `pages/fabricas/index.jsx`, `pages/fabricas/registrar-compra.jsx`, `pages/api/fabricas/ir.js`, `pages/api/fabricas/comprovante.js`, `pages/admin/fabricas.jsx`, `pages/api/admin/fabricas.js`, `styles/fabricasFranca.module.css`.
- Arquivos alterados: `pages/api/membro/entrar.js` (o protocolo de uma compra aprovada também serve para entrar na Área do cliente; o login por pedido continua igual), `lib/AdminNav.jsx` (item "Vitrine de fábricas"), `lib/RodapeSite.jsx` e `lib/VarejoLayout.jsx` (link "Fábricas de Franca").
- Tabelas novas (prefixo `ff_`): `ff_lojas`, `ff_cliques`, `ff_comprovantes`. Chave nova em `cal_config`: `ff_bonus_dias` (padrão 30).
- Decisões que originaram isto: o site é só uma ponte para as fábricas (não vende, não ganha na venda); o ganho vem do passe de assinante (já existente) e, opcionalmente, de destaques patrocinados identificados como publicidade. A cobrança do passe continua no Mercado Pago do próprio site; Kiwify/Hotmart ficam como reserva, não são usados.
- Testado antes de abrir o pull request: build de produção sem erros; testes automáticos com banco simulado (conferência da chave, duplicidade, CNPJ, limite por IP, aprovar/recusar, soma de dias de passe, contagem de cliques, lista pública sem dados privados, login pelo protocolo e login por pedido inalterado). **Não testado** com o Supabase, o Mercado Pago e o Telegram reais.
- Pendências suas: rodar o SQL; fazer o merge; cadastrar a primeira empresa; confirmar com um contador a declaração do passe e de eventual patrocínio no CPF; escolher se o bônus de 30 dias para compra registrada fica ligado.
