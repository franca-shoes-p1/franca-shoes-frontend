-- Central de Projetos: projetos, tarefas em duas pistas (manual e automática) e página do projeto.
-- Supabase -> SQL Editor -> New query -> cole TUDO -> Run. Pode rodar mais de uma vez.
create table if not exists public.central_projetos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  slug text not null unique,
  nome text not null,
  tipo text not null default 'outro',      -- livro | loja | servico | agencia | curso | outro
  emoji text not null default '📁',
  status text not null default 'planejando', -- ideia | planejando | andamento | pausado | concluido
  resumo text,
  proximo_passo text,
  link_site text,
  pagina jsonb,                              -- esqueleto da página pública (gerado pelo modelo)
  publicado boolean not null default false,  -- só publicado aparece em /projeto/<slug>
  ordem int not null default 0
);
create table if not exists public.central_tarefas (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references public.central_projetos(id) on delete cascade,
  criado_em timestamptz not null default now(),
  etapa text not null default 'Geral',
  titulo text not null,
  pista text not null default 'manual',      -- manual (você faz) | auto (n8n/IA faz)
  status text not null default 'a_fazer',    -- a_fazer | fazendo | feita
  nota text,
  ordem int not null default 0,
  feita_em timestamptz
);
create index if not exists central_tarefas_proj_idx on public.central_tarefas (projeto_id, ordem);
alter table public.central_projetos enable row level security;
alter table public.central_tarefas enable row level security;
