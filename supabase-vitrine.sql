-- Departamento VITRINE DE PRODUTOS FÍSICOS: fontes de busca, achados da IA, canais e fila de divulgação.
-- Supabase -> SQL Editor -> New query -> cole TUDO -> Run. Pode rodar mais de uma vez.
-- Não mexe em nenhuma tabela existente (todas começam com vit_). Os cartões de tarefa ficam em outro arquivo.

-- 1) De onde a IA lê: páginas fixas de fornecedores ou frases de busca
create table if not exists public.vit_fontes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('pagina','busca')),
  valor text not null,                 -- endereço https da página, ou a frase de busca
  categoria text,
  ativo boolean not null default true,
  ultimo_uso timestamptz,
  unique (tipo, valor)
);

-- 2) Achados: produtos candidatos. A IA só sugere; uma pessoa valida; o dono aprova.
create table if not exists public.vit_achados (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  fonte_id uuid references public.vit_fontes(id) on delete set null,
  url text not null unique,
  titulo text,
  categoria text,
  material text,
  preco_visto numeric(10,2),           -- só pista: vale o preço que o fornecedor confirmar
  descricao text,
  foto_url text,
  fornecedor text,
  origem text not null default 'ia' check (origem in ('ia','manual')),
  status text not null default 'novo' check (status in ('novo','em_validacao','validado','aprovado','rejeitado')),
  validacao jsonb not null default '{}',
  notas text,
  produto_id uuid                      -- modelo criado em rf_produtos ao aprovar
);
create index if not exists vit_achados_status_idx on public.vit_achados (status, criado_em desc);

-- 3) Canais de divulgação. 'auto' = o n8n publica; 'manual' = vira tarefa para uma pessoa.
create table if not exists public.vit_canais (
  slug text primary key,
  nome text not null,
  modo text not null check (modo in ('auto','manual')),
  ativo boolean not null default true,
  instrucoes text,
  ordem int not null default 0
);

-- 4) Fila de divulgação: um texto pronto por produto e canal
create table if not exists public.vit_divulgacoes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  produto_id uuid not null,
  canal text not null references public.vit_canais(slug),
  texto text not null,
  link text not null,
  status text not null default 'pendente' check (status in ('pendente','enviado','feito','pulado')),
  concluido_em timestamptz,
  operario_id uuid
);
create index if not exists vit_divulgacoes_status_idx on public.vit_divulgacoes (status, criado_em desc);
create index if not exists vit_divulgacoes_prod_idx on public.vit_divulgacoes (produto_id, canal, criado_em desc);

-- Trava de segurança: só o servidor (chave de serviço) lê e grava.
alter table public.vit_fontes enable row level security;
alter table public.vit_achados enable row level security;
alter table public.vit_canais enable row level security;
alter table public.vit_divulgacoes enable row level security;

insert into public.vit_canais (slug, nome, modo, instrucoes, ordem) values
  ('telegram_canal', 'Canal do Telegram', 'auto', 'O n8n publica sozinho no canal.', 1),
  ('whatsapp_status', 'Status do WhatsApp', 'manual', 'Poste no status do WhatsApp Business da loja.', 2),
  ('whatsapp_grupos', 'Grupos de WhatsApp que permitem divulgação', 'manual', 'Só em grupos cuja regra permite divulgar. Nunca envie no privado para desconhecidos.', 3),
  ('instagram', 'Instagram (feed e stories)', 'manual', 'Poste no perfil da loja. Link na bio ou adesivo de link nos stories.', 4),
  ('facebook', 'Facebook (grupos de venda e Marketplace)', 'manual', 'Siga a regra de cada grupo. Um grupo por vez, sem repetir o mesmo texto no mesmo dia.', 5),
  ('youtube', 'YouTube (descrição e comentário fixado)', 'manual', 'Coloque o link do produto na descrição dos vídeos relacionados.', 6)
on conflict (slug) do nothing;

-- Frases de busca iniciais (a IA usa poucas por dia; você pode trocar no painel /admin/vitrine)
insert into public.vit_fontes (tipo, valor, categoria) values
  ('busca', 'fábrica de sapato social masculino em Franca SP venda no atacado', 'Masculino'),
  ('busca', 'fábrica de sandália e sapatilha feminina em Franca SP atacado', 'Feminino'),
  ('busca', 'fábrica de tênis casual em Franca SP atacado', 'Masculino'),
  ('busca', 'fábrica de cintos e carteiras de couro atacado Franca SP', 'Acessórios'),
  ('busca', 'fábrica de bolsas femininas de couro atacado', 'Acessórios')
on conflict (tipo, valor) do nothing;
