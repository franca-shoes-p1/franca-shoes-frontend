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
