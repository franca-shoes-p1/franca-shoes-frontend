-- Material real dos 3 cartões (links e textos de exemplo). Pode rodar de novo sem problema.
-- Supabase -> SQL Editor -> New query -> cole -> Run.
-- O link do modelo no Canva (cartão C2) ainda está como aviso: troque quando tiver o link.

update public.op_cartoes set material = $j$[
 "Página de exemplo para conferir no celular: https://igreja.eco.br/calcados",
 "Print correto mostra a tela inteira, sem cortes."
]$j$::jsonb where codigo = 'C1';

update public.op_cartoes set material = $j$[
 "TEXTO DO DIA (legenda do Instagram): Hoje abrimos a Oficina Digital. É uma bancada online onde pessoas comuns aprendem fazendo e executam tarefas de produtos digitais com a ajuda de uma IA. Sem experiência, sem horário fixo, de casa. Se você quer conhecer, o link está na bio. [LINK]",
 "TÍTULO DA ARTE DO DIA: Estamos abrindo a Oficina Digital",
 "Valores para trocar na legenda: [LINK] = https://igreja.eco.br/oficina  |  [WHATSAPP] = https://wa.me/5516991543663",
 "AVISO OBRIGATÓRIO (cole no final da legenda): Trabalho autônomo, pago por tarefa aprovada depois que o cliente paga. Sem promessa de ganho. Projetos e benefícios são informativos.",
 "Modelo de arte no Canva: [LINK DO MODELO NO CANVA] (o dono troca pelo link real)",
 "Palavras proibidas: renda garantida, ganhe por mês, estágio, emprego, sociedade, retorno"
]$j$::jsonb where codigo = 'C2';

update public.op_cartoes set material = $j$[
 "BRIEFING DO CLIENTE (cliente de exemplo, fictício): Padaria Pão Quente, Franca-SP. Vende pães, bolos, salgados e café. Encomenda de bolo para festa: com 3 dias de antecedência e sinal de 50%. Horário: segunda a sábado das 6h às 19h; domingo das 6h às 12h. Endereço: Rua das Acácias, 120, Centro, Franca-SP. Pagamento: dinheiro, Pix e cartão de débito; cartão de crédito só em compras acima de R$ 20. Entrega: até 3 km, taxa de R$ 5, pedido mínimo de R$ 30, prazo médio de 40 minutos. Preços informados: pão francês R$ 0,90 a unidade; fatia de bolo de cenoura R$ 8,00.",
 "Formato da entrega: escreva 10 blocos, cada um com uma linha começando por Pergunta: e outra começando por Resposta:",
 "Ideias de perguntas: horário de funcionamento, endereço, preços, formas de pagamento, prazo de entrega, trocas e devoluções, como comprar, promoções, falar com uma pessoa, informações sobre o produto.",
 "Exemplo bom (pergunta: Qual o horário de vocês?): Funcionamos de segunda a sábado, das 6h às 19h, e aos domingos das 6h às 12h. Posso ajudar em algo mais?",
 "Exemplo ruim: Abrimos todo dia, o dia todo! (inventou: o briefing diz outro horário)"
]$j$::jsonb where codigo = 'C3';
