-- Setor VITRINE no sistema de operadores: posto + 4 cartões de tarefa (V1 a V4).
-- Rode DEPOIS do supabase-oficina-fase1.sql (precisa das tabelas op_postos e op_cartoes).
-- Supabase -> SQL Editor -> New query -> cole TUDO -> Run. Pode rodar mais de uma vez.

do $$ begin
  if to_regclass('public.op_postos') is null or to_regclass('public.op_cartoes') is null then
    raise exception 'Faltam as tabelas op_postos/op_cartoes. Rode antes o supabase-oficina-fase1.sql.';
  end if;
end $$;

insert into public.op_postos (slug, nome, descricao, ordem) values
  ('vitrine', 'Vitrine de Produtos Físicos', 'Validar achados com fornecedores, cadastrar modelos, conferir páginas de venda e divulgar nos canais.', 4)
on conflict (slug) do nothing;

insert into public.op_cartoes (codigo, titulo, posto_slug, nivel_min, tempo, objetivo, pronto_quando, material, passos, checklist, erros, campos, prints, avaliacao, seguranca, valor, pontos, unica, ordem) values
('V1', 'Validar um achado com o fornecedor', 'vitrine', 0, '20 a 30 minutos',
 'Pegar um achado liberado pelo dono, falar com o fornecedor e registrar preço de revenda, pedido mínimo, prazo e a autorização do uso das fotos.',
 'O formulário foi enviado com todas as respostas do fornecedor e o print da conversa anexado.',
 $j$["O achado liberado para você aparece aqui: link, nome e o preço que a IA viu. O preço da IA é só uma pista: vale o que o fornecedor confirmar.","Mensagem modelo: Olá! Vi o modelo [NOME] no site de vocês. Vendem para revenda? Qual o preço por par, o pedido mínimo e o prazo de preparo? Vocês autorizam usar as fotos do produto para divulgar?","Print correto mostra a conversa inteira, sem dados de cartão ou documentos"]$j$::jsonb,
 $j$["Abra o link do achado e confira se o produto existe e se é calçado ou acessório.","Procure o contato comercial (WhatsApp, e-mail ou formulário) no site do fornecedor.","Envie a mensagem modelo, trocando [NOME] pelo nome do modelo.","Anote exatamente o que o fornecedor responder: preço por par, pedido mínimo, prazo e se autoriza as fotos.","Se não responder em 24 horas, mande uma única mensagem de lembrete. Se continuar sem resposta, escreva isso nas observações.","Preencha o formulário e anexe o print da conversa."]$j$::jsonb,
 $j$["O contato é um canal comercial do fornecedor","O preço informado é o que o fornecedor escreveu, não o do site","O pedido mínimo e o prazo foram anotados","Está claro se as fotos foram autorizadas (sim ou não)","O print mostra a conversa inteira"]$j$::jsonb,
 $j$["Usar o preço do site como se fosse o de revenda: confirme sempre com o fornecedor.","Prometer compra ou volume: você só pergunta, quem decide é o dono.","Escrever que as fotos foram autorizadas sem o fornecedor ter dito isso: se não disse, marque NÃO."]$j$::jsonb,
 $j$[{"id":"link","rotulo":"Link do achado","longo":false},{"id":"fornecedor","rotulo":"Nome e WhatsApp do contato no fornecedor","longo":false},{"id":"preco","rotulo":"Preço de revenda confirmado (R$ por par)","longo":false},{"id":"minimo","rotulo":"Pedido mínimo e prazo de preparo","longo":false},{"id":"fotos","rotulo":"O fornecedor autorizou usar as fotos? (sim ou não, e como enviou)","longo":false},{"id":"obs","rotulo":"Observações","longo":true}]$j$::jsonb,
 1,
 'A IA confere se todos os campos foram preenchidos e se o preço é um número. O dono confere a conversa no print e aprova.',
 'Fale só pelo contato comercial público. Nunca envie dinheiro, senha ou documentos ao fornecedor e não prometa compra.',
 null, 20, false, 10),
('V2', 'Cadastrar o modelo validado no painel de catálogo', 'vitrine', 1, '15 a 20 minutos',
 'Cadastrar no painel de catálogo um modelo cujo fornecedor já foi validado, com foto autorizada e descrição escrita por você.',
 'O formulário foi enviado com o nome do modelo cadastrado e o print da tela do cadastro.',
 $j$["Você precisa do acesso de catálogo liberado pelo dono","Dados validados no cartão V1 (preço de revenda, números, material)","Foto do produto só se o fornecedor autorizou (ou foto sua do produto)"]$j$::jsonb,
 $j$["Entre no painel de catálogo com o seu acesso.","Escolha a foto autorizada.","Escreva o nome do modelo, a categoria, o material e os números disponíveis no formato 37 ao 44.","Escreva a descrição com as suas palavras, sem copiar o texto do fornecedor e sem prometer o que o produto não tem.","Salve. O modelo fica escondido até o dono aprovar.","Tire um print da tela do cadastro e anexe."]$j$::jsonb,
 $j$["A foto é autorizada ou é sua","O nome e a categoria estão corretos","Os números estão no formato certo","A descrição foi escrita por você","Nenhum preço de custo aparece fora do campo do dono"]$j$::jsonb,
 $j$["Copiar a descrição do site do fornecedor: reescreva.","Usar foto de outro site sem autorização: não use.","Cadastrar sem validar o fornecedor antes: faça o V1 primeiro."]$j$::jsonb,
 $j$[{"id":"modelo","rotulo":"Nome do modelo cadastrado","longo":false},{"id":"obs","rotulo":"Observações","longo":true}]$j$::jsonb,
 1,
 'O dono abre o modelo escondido no painel, confere foto, nome e descrição e decide publicar ou devolver com ajustes.',
 'O seu acesso só cadastra modelos escondidos. Você não vê custo, senha nem pedidos de clientes.',
 null, 20, false, 11),
('V3', 'Conferir a página de venda de um produto no celular', 'vitrine', 0, '10 a 15 minutos',
 'Abrir a página de um produto no seu celular, conferir o que aparece e relatar com prints o que funcionou e o que não funcionou.',
 'O formulário foi enviado com as respostas e os 3 prints anexados.',
 $j$["O link da página aparece aqui quando a tarefa for liberada","Print correto mostra a tela inteira, sem cortes"]$j$::jsonb,
 $j$["Abra o link no navegador do seu celular.","Espere a página carregar por completo.","Role até o final olhando cada parte.","Escolha um número de calçado e toque em comprar. Não precisa pagar.","Toque no botão de WhatsApp e veja se a mensagem abre.","Preencha o formulário e anexe 3 prints."]$j$::jsonb,
 $j$["A página abriu sem demorar demais","Fotos, nome e preço aparecem inteiros","A escolha do número funcionou","O botão de comprar levou à loja","O botão de WhatsApp abriu uma mensagem"]$j$::jsonb,
 $j$["Página em branco: espere 30 segundos e atualize. Se continuar, entregue assim e escreva página não abriu.","Tentar pagar de verdade: não pague, só confira até a tela de pagamento."]$j$::jsonb,
 $j$[{"id":"link","rotulo":"Link da página conferida","longo":false},{"id":"preco","rotulo":"O preço da página confere com o combinado? (sim ou não, e qual aparece)","longo":false},{"id":"botoes","rotulo":"O que não funcionou (ou escreva: tudo funcionou)","longo":true}]$j$::jsonb,
 3,
 'A IA confere se os campos foram preenchidos e se há 3 prints. O dono lê o que não funcionou e corrige.',
 'Você só abre uma página pública. Não precisa de senha nem de conta e não faz pagamento.',
 null, 15, false, 12),
('V4', 'Divulgar um produto em um canal permitido', 'vitrine', 0, '15 a 20 minutos',
 'Publicar o texto pronto de um produto em um canal onde divulgar é permitido e enviar o print da publicação.',
 'O formulário foi enviado com o canal, a confirmação da regra e o print da publicação.',
 $j$["O texto pronto e o link do produto aparecem aqui quando a tarefa for liberada (o link já tem o código de acompanhamento)","Regra de ouro: poste só onde a divulgação é permitida"]$j$::jsonb,
 $j$["Leia o texto pronto e o link. Não mude o link.","Escolha um canal que permita divulgar (grupo de venda, status, página). Leia a regra do grupo antes.","Publique o texto como está. Se o grupo exigir outro formato, ajuste só o formato, sem mudar preço ou promessas.","Tire um print da publicação feita.","Preencha o formulário com o canal e anexe o print."]$j$::jsonb,
 $j$["O canal permite divulgação","O link não foi alterado","O texto não tem promessa que não esteja no texto original","O print mostra a publicação"]$j$::jsonb,
 $j$["Postar em grupo que proíbe: escolha outro e anote.","Mandar a mesma mensagem para muitas pessoas no privado: não faça, é spam.","Usar perfil falso: use só o seu perfil real ou o da loja."]$j$::jsonb,
 $j$[{"id":"canal","rotulo":"Canal onde postou (nome do grupo, página ou status)","longo":false},{"id":"regra","rotulo":"A regra do canal permite divulgação? (sim ou não)","longo":false},{"id":"obs","rotulo":"Observações","longo":true}]$j$::jsonb,
 1,
 'A IA confere se o campo da regra está preenchido e se há print. O dono olha o print por amostragem.',
 'Você só publica onde é permitido, com o seu perfil real. Nunca envie mensagens em massa ou no privado para desconhecidos.',
 null, 10, false, 13)
on conflict (codigo) do nothing;
