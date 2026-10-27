-- Campanha de Inauguração: dois benefícios no catálogo de pontos dos operadores.
-- Pode rodar mais de uma vez: não duplica.
insert into public.op_beneficios (nome, descricao, custo_pontos, ordem)
select 'Acessório da loja de calçados (Campanha de Inauguração)',
       'Um acessório de fábrica de Franca, conforme os modelos disponíveis. Entrega gratuita em lotes, programada quando juntar de 5 a 10 brindes (prazo avisado no resgate). Vale até 31/12/2026.',
       1000, 10
where not exists (select 1 from public.op_beneficios where nome = 'Acessório da loja de calçados (Campanha de Inauguração)');

insert into public.op_beneficios (nome, descricao, custo_pontos, ordem)
select 'Calçado da loja de calçados (Campanha de Inauguração)',
       'Um calçado de fábrica de Franca, conforme os modelos disponíveis. Entrega gratuita em lotes, programada quando juntar de 5 a 10 brindes (prazo avisado no resgate). Vale até 31/12/2026.',
       2500, 11
where not exists (select 1 from public.op_beneficios where nome = 'Calçado da loja de calçados (Campanha de Inauguração)');
