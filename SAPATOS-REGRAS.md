# /sapatos — REGRAS

Regras do projeto igreja.eco.br/sapatos, copiadas literalmente do Prompt 0 (07/11/2026). Em caso de dúvida sobre qualquer uma delas, parar e perguntar ao dono.

Contexto: loja de calçados e acessórios de Franca-SP em que o cliente compra e paga no nosso site e o dono retira o produto na fábrica. Usa o mesmo método da /comercio (veja GUIA-COMERCIO.md), mas os anúncios vêm de agentes de IA que leem catálogos de fornecedores, e o preço é calculado automaticamente.

Trabalho: branch `sapatos-base`, criada a partir da `main` atualizada. Só mudanças aditivas: não alterar páginas, APIs, tabelas ou estilos que já funcionam.

## REGRAS

- Lucro: R$ 20,00 fixos por par, sem os R$ 30 por pedido de agosto (decisão de 07/11), mais as taxas (valores configuráveis, nunca fixos no código).
- Fornecedor piloto: Di Franca Atacado, retirada na fábrica, lote mínimo de 12 pares.
- Lotes de calçados: 10 a 30 itens, podendo misturar fornecedores; acessórios sem restrição.
- Entrega pessoal com passe livre: sai e volta a Franca; retirada na rodoviária com hora marcada e frete grátis; pode reentrar no mesmo estado; 4 rotas por mês; o prazo aparece antes da compra.
- Entrega pelos Correios: frete calculado no servidor, pago pelo cliente.
- Trocas: modalidade única pelos Correios, despesas pagas pelo cliente.
- Assinatura do portal: passe de 30 dias a R$ 29,90, PIX ou cartão, renovação manual; compra de produto físico dá 30 dias de passe; quem pede o cancelamento da assinatura perde o serviço de manutenção periódica no sistema da hospedagem; o desconto do assinante sai da parte do dono e os operadores recebem sobre o preço geral.
- Dados do fornecedor nunca aparecem no anúncio. O custo nunca vai ao navegador.
- Publica após minha aprovação; todo produto guarda a origem; se o fornecedor pedir remoção ou negar, despublica na hora e bloqueia nova importação (página /sapatos/remocao).
- Texto honesto: sem desconto, avaliação ou urgência inventados; «preço de fábrica» só em produto de fornecedor do tipo fábrica.
- Campanha do site pronto: entrega só pelos Correios; a oferta deve dizer claramente que o site é pago pela assinatura.
- Registre no manual (GUIA-SAPATOS.md) toda mudança feita.

## ESCLARECIMENTOS DO DONO (07/11/2026)

Não alteram o texto literal das regras acima; dizem como aplicá-las.

- **Cancelamento e manutenção:** a perda da manutenção periódica da hospedagem vale só para o **site pronto da campanha** (a assinatura que cobre as despesas do site). O passe de R$ 29,90 do portal é outra coisa e não tem esse efeito.
- **Trocas:** o cliente paga as despesas da troca por **tamanho ou vontade**. Defeito ou erro nosso ficam por conta da loja, conforme o Código de Defesa do Consumidor.
- **Di Franca Atacado é atacado, não fábrica:** não usar «preço de fábrica» nos produtos dela.
- **Banco de dados:** tabelas novas com prefixo `sp_`; não mexer em `varejo_pedidos`.
- **Pagamento:** o cliente paga 100% no nosso site (Mercado Pago); o dono paga o fornecedor depois.
- **Dados do fornecedor:** não aparecem na tela de pagamento; só depois do pedido pago, na página de acompanhamento e na nota.
- **Menu e rodapé:** pode-se editar 1 linha em `lib/AdminNav.jsx` e 1 linha em `lib/RodapeSite.jsx`, só quando um prompt precisar disso; o dono confere o preview antes do merge.
