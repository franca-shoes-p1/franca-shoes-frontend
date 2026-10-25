-- Regras de conferência por cartão (editáveis no painel: Cartões > Regras de conferência)
alter table public.op_cartoes add column if not exists regras jsonb not null default '[]';

-- Regras iniciais equivalentes à conferência fixa de C2 e C3
update public.op_cartoes set regras = '[
 {"tipo":"min_caracteres","campo":"legenda","valor":"40","minimo":0,"msg":"Legenda com tamanho mínimo"},
 {"tipo":"sem_colchetes","campo":"legenda","valor":"","minimo":0,"msg":"Sem colchetes na legenda"},
 {"tipo":"contem","campo":"legenda","valor":"sem promessa de ganho","minimo":0,"msg":"Aviso obrigatório: sem promessa de ganho"},
 {"tipo":"contem","campo":"legenda","valor":"trabalho autonomo","minimo":0,"msg":"Aviso obrigatório: trabalho autônomo"},
 {"tipo":"contem","campo":"legenda","valor":"igreja.eco.br","minimo":0,"msg":"Link igreja.eco.br presente"},
 {"tipo":"anexo","campo":"","valor":"","minimo":0,"msg":"Imagem anexada"}
]'::jsonb where codigo = 'C2' and regras = '[]'::jsonb;

update public.op_cartoes set regras = '[
 {"tipo":"min_linhas","campo":"base","valor":"Pergunta:","minimo":10,"msg":"10 perguntas"},
 {"tipo":"min_linhas","campo":"base","valor":"Resposta:","minimo":10,"msg":"10 respostas"},
 {"tipo":"min_caracteres","campo":"faltas","valor":"3","minimo":0,"msg":"Lista do que falta ao cliente preenchida"}
]'::jsonb where codigo = 'C3' and regras = '[]'::jsonb;
