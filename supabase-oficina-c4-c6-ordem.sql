-- Oficina: cartões C4 a C6 e ligação pedido do cliente -> ordem -> tarefas com cartão.
-- Pode rodar mais de uma vez sem duplicar.

alter table public.op_ordens add column if not exists pedido_id uuid references public.op_atelie_pedidos(id);
alter table public.op_tarefas add column if not exists cartao_id uuid references public.op_cartoes(id);

insert into public.op_postos (slug, nome, descricao, ordem) values
  ('pesquisa', 'Pesquisa', 'Montar listas organizadas, com fontes, a partir de um pedido.', 4),
  ('texto', 'Texto', 'Escrever legendas e pequenos textos para clientes.', 5)
on conflict (slug) do nothing;

insert into public.op_cartoes (codigo, titulo, posto_slug, nivel_min, tempo, objetivo, pronto_quando, material, passos, checklist, erros, campos, prints, avaliacao, seguranca, valor, pontos, unica, ordem, regras) values
('C4', 'Montar uma lista organizada com fontes', 'pesquisa', 0, '30 a 40 minutos',
 'Pesquisar um assunto pedido e entregar uma lista de 8 itens, cada um com uma frase de explicação, mais as fontes consultadas.',
 'O formulário foi enviado com a lista de 8 itens e a lista de fontes com endereços de sites.',
 $j$["PEDIDO DE EXEMPLO (fictício): lista de 8 tipos de calçado confortável para quem trabalha em pé o dia todo, para uma loja de Franca-SP.","Formato da lista: uma linha por item, começando por Item 1:, Item 2: e assim por diante. Depois do dois-pontos, o nome e uma frase curta.","Exemplo bom: Item 1: Tênis de palmilha macia. Amortece o impacto de ficar horas em pé.","Fontes: copie o endereço (link) de cada site que você usou, um por linha.","Em um pedido real, o dono troca o pedido de exemplo pelo pedido do cliente."]$j$::jsonb,
 $j$["Leia o pedido de exemplo do Material duas vezes.","Faça uma busca na internet pelo assunto. Abra pelo menos 3 sites diferentes.","Escolha 8 itens que respondem ao pedido. Não repita itens parecidos.","Para cada item, escreva uma frase curta com as suas palavras. Não copie textos prontos.","Escreva a lista no campo Lista, uma linha por item, começando por Item 1:, Item 2: e assim por diante.","Cole no campo Fontes o endereço de cada site que você usou, um por linha.","Releia a lista e confira se não ficou nenhum colchete.","Responda o checklist e toque em Enviar."]$j$::jsonb,
 $j$["A lista tem 8 itens, cada um começando por Item N:","Cada item tem uma frase explicando","As frases são com as minhas palavras","Todas as fontes têm o endereço do site","Nenhum item se repete","Não restou nenhum colchete"]$j$::jsonb,
 $j$["Copiar e colar texto de um site: escreva com as suas palavras.","Inventar um item sem achar em nenhuma fonte: se não achou, escreva nas observações.","Esquecer os endereços das fontes: volte ao histórico do navegador e copie.","Lista fora do formato: cada linha deve começar por Item 1:, Item 2: e assim por diante."]$j$::jsonb,
 $j$[{"id":"lista","rotulo":"Lista","longo":true},{"id":"fontes","rotulo":"Fontes (um endereço por linha)","longo":true}]$j$::jsonb, 0,
 'O sistema confere se há 8 itens no formato pedido, se as fontes têm endereço e se sobrou colchete. Uma pessoa lê a lista e aprova.',
 'Não use dados pessoais de ninguém na pesquisa. Use só sites públicos.',
 null, 20, false, 4,
 $j$[{"tipo":"min_linhas","campo":"lista","valor":"Item","minimo":8,"msg":"8 itens na lista"},{"tipo":"sem_colchetes","campo":"lista","valor":"","minimo":0,"msg":"Sem colchetes na lista"},{"tipo":"contem","campo":"fontes","valor":"http","minimo":0,"msg":"Fontes com endereço de site"}]$j$::jsonb),

('C5', 'Escrever duas legendas para o post de um cliente', 'texto', 1, '20 a 30 minutos',
 'A partir de um briefing curto, escrever duas versões de legenda para o post de um cliente, para ele escolher.',
 'O formulário foi enviado com as duas legendas, a Versão A e a Versão B, com tamanho suficiente e sem colchetes.',
 $j$["BRIEFING DE EXEMPLO (cliente fictício): Padaria Pão Quente, Franca-SP. Post de sábado: bolo de fubá fresquinho saindo às 15h. Tom: simpático e simples. Pedidos pelo WhatsApp (16) 90000-0000.","Cada legenda: de 2 a 4 frases, com um convite no final (chamar no WhatsApp).","Exemplo bom: Bolo de fubá quentinho saindo hoje às 15h! Perfeito para o café da tarde. Garanta o seu pelo WhatsApp (16) 90000-0000.","Palavras proibidas: renda garantida, ganhe por mês, estágio, emprego, sociedade, retorno, lucro garantido.","Em um pedido real, o dono troca o briefing de exemplo pelo briefing do cliente."]$j$::jsonb,
 $j$["Leia o briefing do Material duas vezes.","Escreva a Versão A no campo Legenda A: 2 a 4 frases, com o convite no final.","Escreva a Versão B no campo Legenda B, com outro jeito de dizer (mais curta, ou com outra abertura).","Confira se as duas usam só informações do briefing. Não invente preço, horário ou promoção.","Leia as duas procurando erros de português e palavras proibidas.","Confira se não ficou nenhum colchete.","Responda o checklist e toque em Enviar."]$j$::jsonb,
 $j$["As duas legendas têm de 2 a 4 frases","As duas terminam com um convite","Só usei informações do briefing","Nenhuma palavra proibida foi usada","Reli procurando erros de português","Não restou nenhum colchete"]$j$::jsonb,
 $j$["Inventar preço ou promoção que o briefing não tem: use só o que está escrito.","As duas versões ficarem iguais: mude a abertura e o jeito de falar.","Legenda muito longa: no máximo 4 frases.","Prometer resultado, como encher a loja: não prometa nada além do briefing."]$j$::jsonb,
 $j$[{"id":"legenda_a","rotulo":"Legenda A","longo":true},{"id":"legenda_b","rotulo":"Legenda B","longo":true}]$j$::jsonb, 0,
 'O sistema confere o tamanho das duas legendas, se há colchetes e se há palavras proibidas. Uma pessoa lê e aprova.',
 'Não publique nada. O cliente escolhe a versão e publica.',
 null, 20, false, 5,
 $j$[{"tipo":"min_caracteres","campo":"legenda_a","valor":"60","minimo":0,"msg":"Legenda A com tamanho mínimo"},{"tipo":"min_caracteres","campo":"legenda_b","valor":"60","minimo":0,"msg":"Legenda B com tamanho mínimo"},{"tipo":"sem_colchetes","campo":"legenda_a","valor":"","minimo":0,"msg":"Sem colchetes na Legenda A"},{"tipo":"sem_colchetes","campo":"legenda_b","valor":"","minimo":0,"msg":"Sem colchetes na Legenda B"}]$j$::jsonb),

('C6', 'Conferir o site de um cliente no celular', 'testes', 1, '20 a 30 minutos',
 'Abrir o site de um cliente no celular, conferir os itens e enviar um relatório escrito com 3 prints.',
 'O formulário foi enviado com o relatório escrito, as respostas do checklist e os 3 prints anexados.',
 $j$["O endereço do site do cliente vem junto com a tarefa. No treino, use a página de exemplo que o dono informar.","Formato do relatório: uma linha por problema, começando por Problema:. Se não achou nenhum, escreva Nenhum problema encontrado.","Cada problema: onde está (página e lugar), o que viu e como era para ser.","Print correto mostra a tela inteira, sem cortes."]$j$::jsonb,
 $j$["Abra o endereço do site no navegador do seu celular.","Espere carregar. Se demorar muito, anote quanto tempo.","Role a página inteira, devagar, olhando textos e imagens.","Toque em cada botão e em cada item do menu e veja se levam ao lugar certo.","Toque no botão de WhatsApp e veja se abre uma conversa.","Procure erros de português e imagens que não carregam.","Tire 3 prints: início, meio e fim da página.","Escreva o relatório: uma linha por problema, começando por Problema:.","Responda o checklist, anexe os 3 prints e toque em Enviar."]$j$::jsonb,
 $j$["O site abriu sem demorar demais","Todos os textos aparecem inteiros","As imagens aparecem","O botão de WhatsApp abriu uma conversa","Os itens do menu levaram ao lugar certo","Não vi erro de português"]$j$::jsonb,
 $j$["Dizer só que está ruim: explique onde e o que viu.","Não anotar o lugar do problema: sempre escreva a página e a parte.","Print cortado: tire de novo com a tela inteira.","Mexer no site ou pedir senha ao cliente: você só confere, não edita nada."]$j$::jsonb,
 $j$[{"id":"relatorio","rotulo":"Relatório (uma linha por problema, começando por Problema:)","longo":true}]$j$::jsonb, 3,
 'O sistema confere o tamanho do relatório e se há imagens. Uma pessoa confere os prints e aprova.',
 'Você só abre o site público. Nunca peça nem use senhas do cliente.',
 null, 20, false, 6,
 $j$[{"tipo":"min_caracteres","campo":"relatorio","valor":"30","minimo":0,"msg":"Relatório com tamanho mínimo"},{"tipo":"anexo","campo":"","valor":"","minimo":0,"msg":"Prints anexados"}]$j$::jsonb)
on conflict (codigo) do nothing;
