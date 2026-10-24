-- PASSO 0 (rode uma vez, ANTES dos outros dois SQL).
-- Seu Supabase já tinha tabelas op_candidatos e op_tarefas de um projeto anterior, com colunas diferentes.
-- Este script NÃO apaga nada: só troca o nome delas para op_candidatos_legado e op_tarefas_legado (os dados ficam guardados).
-- Só mexe se a tabela for mesmo a antiga. Pode rodar de novo sem problema.
-- Para desfazer: alter table public.op_tarefas_legado rename to op_tarefas;  (e igual para candidatos), depois de apagar a nova.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='op_tarefas' and column_name='pedido_id')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='op_tarefas' and column_name='ordem_id') then
    alter table public.op_tarefas rename to op_tarefas_legado;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='op_candidatos' and column_name='setores') then
    alter table public.op_candidatos rename to op_candidatos_legado;
  end if;
end $$;
