-- Troca o endereço dos textos dos cartões para o endereço principal (com www).
-- Pode rodar de novo sem problema. Supabase -> SQL Editor -> New query -> cole -> Run.
update public.op_cartoes set
  material = replace(replace(replace(replace(material::text,
    'www.igreja.eco.br', 'igreja.eco.br'),
    'igreja.eco.br/oficina', 'www.igreja.eco.br/oficina'),
    'igreja.eco.br/calcados', 'www.igreja.eco.br/calcados'),
    'https://www.www.', 'https://www.')::jsonb,
  passos = replace(replace(replace(replace(passos::text,
    'www.igreja.eco.br', 'igreja.eco.br'),
    'igreja.eco.br/oficina', 'www.igreja.eco.br/oficina'),
    'igreja.eco.br/calcados', 'www.igreja.eco.br/calcados'),
    'https://www.www.', 'https://www.')::jsonb;

-- conferência: deve listar só endereços com www
select codigo, (material::text || passos::text) like '%//igreja.eco.br%' as ainda_sem_www from public.op_cartoes order by codigo;
