-- Clube de Fidelidade: dois benefícios novos no catálogo de pontos. Pode rodar mais de uma vez.
insert into public.op_beneficios (nome, descricao, custo_pontos, ordem)
select '20% de desconto em um serviço do Ateliê',
       'Desconto de 20% em um pedido do Ateliê, com desconto máximo de R$ 200,00. Combine pelo WhatsApp.',
       2000, 12
where not exists (select 1 from public.op_beneficios where nome = '20% de desconto em um serviço do Ateliê');

insert into public.op_beneficios (nome, descricao, custo_pontos, ordem)
select 'Página de vendas simples, grátis',
       'Uma página de vendas no modelo simples, montada pelo Ateliê, sem custo para você. Combine o conteúdo pelo WhatsApp.',
       5000, 13
where not exists (select 1 from public.op_beneficios where nome = 'Página de vendas simples, grátis');
