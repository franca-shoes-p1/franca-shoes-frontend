-- Torna fornecedor_id opcional em rf_produtos.
-- Modelos cadastrados em /admin/calcados e pelo garimpo da Vitrine nao tem fornecedor no sistema de fornecedores.
-- O codigo ja trata fornecedor_id vazio como "modelo proprio".
alter table public.rf_produtos alter column fornecedor_id drop not null;
