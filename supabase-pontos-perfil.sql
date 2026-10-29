-- Perfil público do Ponto Parceiro (vitrine do negócio).
-- Rode UMA vez no Supabase: SQL Editor > New query > cole tudo > Run.
alter table rf_pontos add column if not exists perfil_slogan text;
alter table rf_pontos add column if not exists perfil_descricao text;
alter table rf_pontos add column if not exists perfil_logo text;
alter table rf_pontos add column if not exists perfil_whatsapp text;
alter table rf_pontos add column if not exists perfil_instagram text;
alter table rf_pontos add column if not exists perfil_site text;
alter table rf_pontos add column if not exists perfil_horario text;
alter table rf_pontos add column if not exists perfil_endereco text;
alter table rf_pontos add column if not exists perfil_status text not null default 'rascunho';
alter table rf_pontos add column if not exists perfil_atualizado_em timestamptz;
do $$ begin
  alter table rf_pontos add constraint rf_pontos_perfil_status_chk check (perfil_status in ('rascunho','pendente','aprovado','reprovado'));
exception when duplicate_object then null; end $$;

-- Quem se inscreveu sozinho pelo site (/radar/participar) fica marcado como 'inscricao'.
alter table rf_pontos add column if not exists origem text not null default 'radar';
