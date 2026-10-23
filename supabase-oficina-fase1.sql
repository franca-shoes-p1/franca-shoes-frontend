-- OFICINA DIGITAL, FASE 1. Rode UMA vez: Supabase -> SQL Editor -> New query -> cole tudo -> Run.
-- Só ACRESCENTA tabelas novas (prefixo op_). Não altera nem apaga nada do painel de operadores que já existe.
-- Pré-requisito: supabase-operadores.sql já rodado (op_operarios, op_ordens, op_tarefas).
-- Todas as tabelas ficam com RLS ligada e SEM política: só o servidor (chave de serviço da Vercel) acessa.
-- Cada operador só vê o que é dele porque as rotas /api/operador filtram pelo operador logado.

create table if not exists public.op_candidatos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome text not null,
  whatsapp text not null,
  cidade text,
  interesse text,
  origem text,
  status text not null default 'novo',            -- novo | chamado | convertido | descartado
  operario_id uuid references public.op_operarios(id),
  nota_interna text
);
create index if not exists op_candidatos_status on public.op_candidatos (status, criado_em desc);

create table if not exists public.op_postos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text,
  ordem int not null default 0
);

create table if not exists public.op_cartoes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  codigo text not null unique,                    -- C1, C2...
  titulo text not null,
  posto_slug text references public.op_postos(slug),
  nivel_min int not null default 0,               -- 0 iniciante, 1 aprovado, 2 referência
  tempo text,
  objetivo text,
  pronto_quando text,
  material jsonb not null default '[]',           -- lista de textos
  passos jsonb not null default '[]',             -- lista de textos
  checklist jsonb not null default '[]',          -- lista de textos (o operador marca sim/não)
  erros jsonb not null default '[]',
  campos jsonb not null default '[]',             -- campos de entrega: [{id,rotulo,longo}]
  prints int not null default 0,                  -- quantas imagens a entrega exige
  avaliacao text,
  seguranca text,
  valor numeric(10,2),                            -- R$ por entrega aprovada (null = sem pagamento em dinheiro)
  pontos int not null default 0,                  -- Pontos Oficina ao aprovar
  unica boolean not null default false,           -- só pode ser feita uma vez (Tarefa 0)
  ativo boolean not null default true,
  ordem int not null default 0
);

create table if not exists public.op_entregas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  operario_id uuid not null references public.op_operarios(id),
  cartao_id uuid not null references public.op_cartoes(id),
  status text not null default 'entregue',        -- entregue | ajuste | aprovada | paga | recusada
  checklist jsonb not null default '[]',          -- lista de true/false, na ordem do cartão
  respostas jsonb not null default '{}',          -- {campo_id: texto}
  anexos jsonb not null default '[]',             -- lista de endereços https das imagens
  observacoes text,
  entregue_em timestamptz not null default now(),
  comentario_revisao text,
  aprovada_em timestamptz,
  paga_em timestamptz,
  valor numeric(10,2),                            -- congelado do cartão na entrega
  pontos int not null default 0                   -- congelado do cartão na entrega
);
create index if not exists op_entregas_operario on public.op_entregas (operario_id, criado_em desc);
create index if not exists op_entregas_status on public.op_entregas (status, entregue_em);

create table if not exists public.op_regras_pontos (
  chave text primary key,
  descricao text not null,
  pontos int not null
);

create table if not exists public.op_pontos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  operario_id uuid not null references public.op_operarios(id),
  pontos int not null,                            -- positivo = ganho, negativo = uso
  motivo text not null,
  origem text,                                    -- entrega | resgate | ajuste
  origem_id uuid,
  expira_em timestamptz                           -- ganhos valem 12 meses
);
create unique index if not exists op_pontos_origem on public.op_pontos (origem, origem_id) where origem_id is not null;
create index if not exists op_pontos_operario on public.op_pontos (operario_id, criado_em desc);

create table if not exists public.op_beneficios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  custo_pontos int not null,
  ativo boolean not null default true,
  ordem int not null default 0
);

create table if not exists public.op_resgates (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  operario_id uuid not null references public.op_operarios(id),
  beneficio_id uuid not null references public.op_beneficios(id),
  pontos int not null,
  status text not null default 'pendente',        -- pendente | aprovado | recusado
  decidido_em timestamptz
);
create index if not exists op_resgates_status on public.op_resgates (status, criado_em desc);

create table if not exists public.op_empreendimentos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  slug text not null unique,
  nome text not null,
  categoria text not null default 'digital',      -- digital | comercial | industrial | tangivel
  resumo text,
  status text not null default 'ideia',           -- ideia | planejando | construindo | operando
  desconto_pct int,                               -- desconto para quem tem Pontos/Mérito (opcional)
  publico boolean not null default false,
  ordem int not null default 0
);

create table if not exists public.op_marcos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.op_empreendimentos(id) on delete cascade,
  titulo text not null,
  concluido boolean not null default false,
  data date
);

create table if not exists public.op_atualizacoes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  empreendimento_id uuid not null references public.op_empreendimentos(id) on delete cascade,
  texto text not null
);

create table if not exists public.op_vagas_projeto (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.op_empreendimentos(id) on delete cascade,
  titulo text not null,
  descricao text,
  aberta boolean not null default true
);

-- Convite de participação: decisão do dono, caso a caso, com contrato formal feito por advogado.
create table if not exists public.op_convites (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  operario_id uuid not null references public.op_operarios(id),
  empreendimento_id uuid references public.op_empreendimentos(id),
  mensagem text,
  status text not null default 'enviado'          -- enviado | aceito | recusado
);

create table if not exists public.op_chamados (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  operario_id uuid not null references public.op_operarios(id),
  entrega_id uuid references public.op_entregas(id),
  texto text not null,
  status text not null default 'aberto'           -- aberto | resolvido
);

create table if not exists public.op_historico (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  operario_id uuid references public.op_operarios(id),
  evento text not null,
  detalhe jsonb not null default '{}'
);

do $$ declare t text; begin
  foreach t in array array['op_candidatos','op_postos','op_cartoes','op_entregas','op_regras_pontos','op_pontos','op_beneficios','op_resgates','op_empreendimentos','op_marcos','op_atualizacoes','op_vagas_projeto','op_convites','op_chamados','op_historico']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

-- Saldo de Pontos Oficina (ganhos ainda válidos menos usos).
create or replace view public.op_saldo_pontos as
  select operario_id, coalesce(sum(pontos) filter (where expira_em is null or expira_em > now()), 0)::int as saldo
  from public.op_pontos group by operario_id;
revoke all on public.op_saldo_pontos from anon, authenticated;

-- ===== Dados iniciais =====
insert into public.op_postos (slug, nome, descricao, ordem) values
  ('testes', 'Testes', 'Conferir páginas e fluxos no celular e relatar o que viu.', 1),
  ('divulgacao', 'Divulgação', 'Preparar posts e materiais para aprovação.', 2),
  ('atendimento', 'Atendimento', 'Montar bases de respostas a partir do briefing do cliente.', 3)
on conflict (slug) do nothing;

insert into public.op_regras_pontos (chave, descricao, pontos) values
  ('tarefa_0', 'Tarefa 0 aprovada (início de tudo)', 300),
  ('tarefa_aprovada', 'Cada tarefa de cartão aprovada (padrão)', 20)
on conflict (chave) do nothing;

insert into public.op_beneficios (nome, descricao, custo_pontos, ordem) values
  ('Desconto em produto digital', 'Desconto em um produto ou serviço digital do ecossistema (valor definido pelo dono).', 200, 1),
  ('Prioridade em tarefas novas', 'Você vê e escolhe as tarefas novas antes dos demais.', 100, 2),
  ('Mentoria de 30 minutos', 'Conversa individual com a coordenação sobre carreira e projetos.', 300, 3)
on conflict do nothing;

insert into public.op_cartoes (codigo, titulo, posto_slug, nivel_min, tempo, objetivo, pronto_quando, material, passos, checklist, erros, campos, prints, avaliacao, seguranca, valor, pontos, unica, ordem) values
('C1', 'Tarefa 0: conferir uma página no celular', 'testes', 0, '10 a 15 minutos',
 'Abrir uma página de exemplo no seu celular, conferir 6 itens e enviar um relatório com 3 prints.',
 'O formulário foi enviado com as 6 respostas e os 3 prints anexados.',
 '["Link da página de exemplo: [LINK DA PÁGINA DE EXEMPLO] (o dono troca pelo link real)","Print correto mostra a tela inteira, sem cortes"]',
 '["Abra o link da página de exemplo no navegador do seu celular (pode ser o que você já usa).","Espere a página carregar por completo.","Role a página devagar até o final, olhando cada parte.","Toque no botão de WhatsApp da página e veja se o WhatsApp abre com uma mensagem já escrita. Depois volte para a página.","Se a página tiver um menu, toque em cada item e veja se leva ao lugar certo.","Gire o celular de lado e veja se a página continua legível.","Tire 3 prints da tela: um do início da página, um do meio e um do fim.","Responda sim ou não a cada item do checklist abaixo.","Anexe os 3 prints e toque em Enviar."]',
 '["A página abriu sem demorar demais","Todos os textos aparecem inteiros, sem letras cortadas","As imagens aparecem","O botão de WhatsApp abriu uma mensagem","Cada item do menu levou ao lugar certo (ou a página não tem menu)","A página continua legível com o celular de lado"]',
 '["Página em branco: espere 30 segundos, atualize e tente de novo. Se continuar, entregue assim mesmo e escreva \"página não abriu\" com um print.","WhatsApp não abre: confira se o aplicativo está instalado. Se não estiver, escreva isso nas observações.","Não sabe tirar print: na maioria dos celulares, aperte ao mesmo tempo o botão de ligar e o de diminuir volume.","Não sabe se o problema é seu ou da página: entregue mesmo assim e descreva o que viu. Registrar uma falha é uma boa entrega."]',
 '[]', 3,
 'Confere se os 3 prints são de páginas diferentes, se as 6 respostas foram preenchidas e se as observações combinam com os prints. Entrega completa é aprovada; faltando algo, você recebe a mensagem dizendo o que ajustar.',
 'Você só abre uma página pública. Não precisa de senha nem de conta.',
 null, 300, true, 1),
('C2', 'Preparar o post do dia para aprovação', 'divulgacao', 0, '15 a 20 minutos',
 'Deixar pronta, para aprovação, a legenda e a arte do post do dia, a partir do texto do kit de divulgação.',
 'O formulário foi enviado com a legenda final e a imagem do post anexada, e o checklist está todo marcado.',
 '["O texto do dia (legenda do Instagram), copiado do kit de divulgação, aparece aqui quando a tarefa for liberada","Valores para trocar: [LINK] e [WHATSAPP]","Aviso obrigatório, para colar no final da legenda","Modelo de arte: [LINK DO MODELO NO CANVA]","Palavras proibidas: renda garantida, ganhe por mês, estágio, emprego, sociedade, retorno"]',
 '["Copie o texto do dia que aparece no Material.","Cole o texto no campo Legenda final.","Troque [LINK] e [WHATSAPP] pelos valores do Material. Não deixe nenhum colchete na legenda.","Confira se o aviso obrigatório está no final da legenda. Se não estiver, cole-o.","Leia a legenda procurando as palavras proibidas. Se achar alguma, não apague sozinho: escreva nas observações o que encontrou.","Abra o modelo de arte no Canva pelo link do Material.","Troque o título do modelo pelo título do dia. Não mude cores nem fontes.","Baixe a arte como imagem PNG.","Anexe a imagem e toque em Enviar."]',
 '["Nenhum colchete restou na legenda","O link e o WhatsApp estão corretos","O aviso obrigatório está no final","Nenhuma palavra proibida foi encontrada (ou foi avisada nas observações)","O título da arte é o título do dia","A imagem anexada abre e aparece inteira"]',
 '["Esquecer de trocar [LINK]: o post sai com o colchete. Releia a legenda inteira antes de enviar.","Mudar o texto \"para melhorar\": não mude. Se achar erro de português, avise nas observações.","Imagem cortada ou ilegível: baixe de novo como PNG, em tamanho original.","Não tem conta no Canva: crie uma gratuita com o seu próprio e-mail. Nunca use ou peça a senha de contas da empresa."]',
 '[{"id":"legenda","rotulo":"Legenda final","longo":true}]', 1,
 'A IA confere se ainda há colchetes, se o aviso obrigatório está presente e se há palavras proibidas. Um referência ou o dono olha a arte e aprova.',
 'Você não publica nada. Depois da aprovação, a automação publica o post nas redes da empresa.',
 null, 20, false, 2),
('C3', 'Montar a base de respostas do atendimento de um cliente', 'atendimento', 0, '30 a 40 minutos',
 'Escrever 10 perguntas e respostas que o atendimento automático do WhatsApp de um cliente vai usar, usando só o que o cliente informou no briefing.',
 'O formulário foi enviado com 10 perguntas respondidas e a lista de informações que ainda faltam.',
 '["Briefing do cliente (o que vende, horários, endereço, preços, pagamento, entrega, trocas) aparece aqui quando a tarefa for liberada","Ideias de perguntas: horário, endereço, preços, formas de pagamento, prazo de entrega, trocas e devoluções, como comprar, promoções, falar com uma pessoa, informações do produto","Exemplo bom: Funcionamos de segunda a sexta, das 9h às 18h. Quer que eu ajude com alguma coisa?","Exemplo ruim: Abrimos todo dia, o dia todo! (inventou, o briefing diz outro horário)"]',
 '["Leia o briefing do cliente inteiro, até o fim.","Para cada ideia da lista, escreva a pergunta como um cliente escreveria no WhatsApp.","Escreva a resposta usando apenas informações do briefing.","Se a informação não estiver no briefing, escreva FALTA INFORMAÇÃO na resposta e anote a pergunta que o cliente precisa responder. Nunca invente horário, preço ou prazo.","Mantenha cada resposta com no máximo 3 linhas, em frases curtas e tom educado.","Leia todas as respostas em voz alta. Se algo soar estranho, reescreva.","Passe um corretor de texto (o do celular ou do Google Docs) em tudo.","Confira o checklist e envie."]',
 '["As 10 perguntas têm resposta","Nenhuma resposta tem informação inventada","Tudo o que faltava está marcado como FALTA INFORMAÇÃO e listado","Cada resposta tem no máximo 3 linhas","Passou pelo corretor de texto","O tom é educado e sem gírias"]',
 '["Inventar para não deixar vazio: marque FALTA INFORMAÇÃO, isso é o certo.","Respostas longas: o cliente lê no celular, corte para o essencial.","Copiar texto de outro site: escreva com as suas palavras, a partir do briefing.","Responder algo que o briefing não cobre (por exemplo, política de troca): marque como falta e siga."]',
 '[{"id":"base","rotulo":"As 10 perguntas e respostas (uma por bloco: Pergunta / Resposta)","longo":true},{"id":"faltas","rotulo":"Lista do que ainda falta o cliente informar","longo":true}]', 0,
 'A IA compara cada resposta com o briefing e aponta onde há informação que não aparece nele. Um referência confere o tom. Aprovada, a base alimenta o atendimento do cliente.',
 'Você só lê o briefing e escreve respostas. Não tem acesso a senhas, contas do cliente nem ao aplicativo de atendimento.',
 null, 20, false, 3)
on conflict (codigo) do nothing;
-- Valor em R$ dos cartões C2 e C3: defina no painel do dono (ou: update public.op_cartoes set valor = 0.00 where codigo = 'C2';).
