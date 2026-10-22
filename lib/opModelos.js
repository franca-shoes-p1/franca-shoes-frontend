// Modelo de ordem de produção: "Loja de Calçados Pronta" (7 setores).
export const SETORES = [
  'Briefing',
  'Garimpo e cotação',
  'Catálogo',
  'Montagem da loja',
  'Pagamento e frete',
  'Qualidade (QA)',
  'Treinamento e suporte',
];

export const MODELO_LOJA = [
  { setor: 'Briefing', titulo: 'Entender cliente, nível e orçamento', criterio: 'Todos os campos da ficha respondidos, sem suposição; perguntas pendentes listadas.', instrucoes: 'Converse com o cliente (WhatsApp) e preencha a ficha: objetivo, nível contratado, público, cidade, experiência no setor. Entregue a ficha e a lista do que falta.' },
  { setor: 'Garimpo e cotação', titulo: 'Selecionar fábricas e confirmar condições', criterio: 'Cada condição (pedido mínimo, aceita CPF/CNPJ, aceita 1 par, prazo) confirmada com a fábrica, com contato e data registrados.', instrucoes: 'Monte planilha de fornecedores de Franca para o perfil do cliente. Confirme direto com a fábrica; nunca invente condição.' },
  { setor: 'Catálogo', titulo: 'Cadastrar os modelos do pacote', criterio: 'Nome, preço, números e foto corretos; custo nunca aparece ao consumidor.', instrucoes: 'Use o painel /admin/calcados da loja do cliente. Fotos boas, nomes claros, tamanhos no formato 35 ao 40.' },
  { setor: 'Montagem da loja', titulo: 'Criar a cópia da loja do cliente', criterio: 'Vitrine, produto, carrinho e checkout abrem na loja do cliente.', instrucoes: 'Siga o checklist de entrega: cópia do repositório, Supabase e deploy do cliente.' },
  { setor: 'Pagamento e frete', titulo: 'Configurar Mercado Pago e frete', criterio: 'Pagamento de teste aprovado; frete correto por região.', instrucoes: 'Credenciais na conta do cliente (nunca na sua). Ajuste a tabela de frete e o prazo de preparo.' },
  { setor: 'Qualidade (QA)', titulo: 'Compra de teste de ponta a ponta', criterio: 'Briefing confere, links funcionam, sem erro de português, sem dados de terceiros, sem promessa de resultado; pedido de teste vira "pago".', instrucoes: 'Faça a compra de teste e entregue o relatório com o que passou e o que falhou.', depende_saldo: true },
  { setor: 'Treinamento e suporte', titulo: 'Ensinar o cliente e acompanhar os primeiros pedidos', criterio: 'Cliente cadastra um modelo sozinho e entende o acompanhamento de pedidos.', instrucoes: 'Treinamento por chamada ou vídeo; registre as dúvidas e os ajustes pedidos.', depende_saldo: true },
];
