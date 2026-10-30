// Passo a passo (do início ao fim) para captar e manter fábricas de Franca. Mostrado em /admin/guia.
// "auto" diz qual verificação do sistema marca o passo sozinha; sem "auto", você marca à mão.
export const GUIA_ID = 'captar-fornecedores';

export const FASES = [
  { id: 'casa', nome: 'Preparar a casa' },
  { id: 'achar', nome: 'Achar fábricas' },
  { id: 'abordar', nome: 'Abordar' },
  { id: 'cadastrar', nome: 'Cadastrar a fábrica' },
  { id: 'pedido', nome: 'Primeiro pedido e relacionamento' },
];

export const PASSOS = [
  { id: 'pix', fase: 'casa', pontos: 10, auto: 'pix', titulo: 'Cadastrar o seu PIX', como: 'Em Admin → Revendedores → aba “Meu PIX”, informe a chave que recebe o PIX 2 (comissão e frete).', link: '/admin/revendedores' },
  { id: 'telegram', fase: 'casa', pontos: 15, titulo: 'Ligar o ajudante do Telegram', como: 'Crie o bot no @BotFather, pegue o chat id no @userinfobot, coloque RADAR_N8N_TOKEN e N8N_AVISO_URL na Vercel (e faça Redeploy), crie a credencial “Telegram Radar” no n8n e importe os JSONs da pasta n8n.' },
  { id: 'pagina', fase: 'casa', pontos: 5, titulo: 'Ver a página de cadastro no celular', como: 'Abra a página pública para fornecedores no seu celular e confira se está tudo legível. É o link que você vai mandar.', link: '/fornecedor' },
  { id: 'lista', fase: 'achar', pontos: 15, auto: 'leads20', titulo: 'Montar a primeira lista com 20 fábricas', como: 'Na aba “Fábricas”, cole nomes e WhatsApp. Dica: pesquise “fábrica de calçados Franca” no Google Maps e no Instagram e copie nome, telefone e @.' },
  { id: 'mapa', fase: 'achar', pontos: 5, auto: 'mapa', titulo: 'Importar fábricas do mapa', como: 'Na aba “Fábricas”, clique em “Buscar no mapa (Franca)”. É grátis e acrescenta o que o OpenStreetMap conhece.' },
  { id: 'n8n', fase: 'achar', pontos: 15, titulo: 'Importar os 2 fluxos do n8n', como: 'No n8n, importe n8n/leads-busca-semanal.json e n8n/leads-fila-diaria.json, cole o token e o chat id e ative. Daí a busca roda sozinha toda semana e a fila chega no Telegram toda manhã.' },
  { id: 'abordar10', fase: 'abordar', pontos: 20, auto: 'abordados10', titulo: 'Abordar as primeiras 10 fábricas', como: 'Na aba “Fila de hoje”, toque em “Abrir WhatsApp”, envie a mensagem pronta e marque “Enviei”. Faça no máximo 10 a 15 por dia.' },
  { id: 'visitas', fase: 'abordar', pontos: 15, titulo: 'Fazer 3 visitas presenciais', como: 'Roteiro: mostre um modelo no painel (2 min); diga “você define o preço, o cliente paga direto na sua conta, você emite a nota no nome dele e eu busco aqui”; responda “não pago nada”, “sem promessa de volume” e “nota no CPF do cliente final”; peça só o cadastro.' },
  { id: 'interessado', fase: 'abordar', pontos: 10, auto: 'interessado', titulo: 'Ter a primeira fábrica interessada', como: 'Quando uma fábrica responder com interesse, mude o status dela para “Interessado” na lista e mande a explicação completa.' },
  { id: 'cadastro1', fase: 'cadastrar', pontos: 10, auto: 'forn1', titulo: 'Primeira fábrica pede cadastro', como: 'O cadastro feito em /fornecedor aparece em Admin → Fornecedores e no seu Telegram.', link: '/admin/fornecedores' },
  { id: 'ativar1', fase: 'cadastrar', pontos: 10, auto: 'ativo1', titulo: 'Aprovar e liberar o painel', como: 'Confira CNPJ ou CPF e se emite nota fiscal; aprove e mande o link do painel pelo WhatsApp.', link: '/admin/fornecedores' },
  { id: 'modelo1', fase: 'cadastrar', pontos: 10, auto: 'modelo1', titulo: 'Primeiro modelo aprovado na vitrine', como: 'Ajude a fábrica a cadastrar um modelo (foto, numeração, preço, prazo) e aprove-o na aba Modelos.', link: '/admin/fornecedores' },
  { id: 'regras', fase: 'cadastrar', pontos: 5, titulo: 'Combinar nota e troca com a fábrica', como: 'Confirme: nota fiscal no nome e CPF do cliente final, e a política de troca dela preenchida no painel.' },
  { id: 'ativo2', fase: 'cadastrar', pontos: 15, auto: 'ativo2', titulo: 'Segunda fábrica ativa', como: 'Repita o processo com a segunda fábrica do piloto.', link: '/admin/fornecedores' },
  { id: 'teste', fase: 'pedido', pontos: 20, titulo: 'Fazer um pedido de teste com fábrica real', como: 'Faça uma compra pequena pelo site, pague os dois PIX, confira se a fábrica recebeu o aviso e emitiu a nota.' },
  { id: 'coleta', fase: 'pedido', pontos: 15, titulo: 'Primeira coleta com nota', como: 'Imprima a folha do dia e a autorização de retirada e colete na fábrica.', link: '/admin/lote' },
  { id: 'entrega1', fase: 'pedido', pontos: 20, auto: 'entregue1', titulo: 'Primeira entrega confirmada', como: 'Marque o pedido como entregue em Fornecedores e confirme o PIX 2.', link: '/admin/fornecedores' },
  { id: 'relacionamento', fase: 'pedido', pontos: 5, titulo: 'Combinar o contato mensal com as fábricas', como: 'Marque um lembrete mensal: “como estão as vendas? precisa de ajuda?”. Fábrica atendida indica outras.' },
];
export const TOTAL_PONTOS = PASSOS.reduce((s, p) => s + p.pontos, 0);
