// Textos e regras públicas do Parceiros da Praia. Um só lugar para ajustar o que aparece nas páginas.
export const PRAIA = {
  nome: 'Parceiros da Praia',
  whatsapp: '5516991543663',
};

export const PASSOS = [
  { t: 'Cadastro', p: 'Você preenche o formulário em cerca de um minuto, sem custo.' },
  { t: 'Conversa e vaga', p: 'A coordenação chama no WhatsApp. Se houver vaga na sua cidade, você segue; se não, entra na lista de espera.' },
  { t: 'Regularização', p: 'Cadastro de ambulante na prefeitura, curso de manipulação de alimentos e contrato de parceria, cada um no seu nome.' },
  { t: 'Kit e primeira saída', p: 'Você retira o kit em comodato, sai com o estoque do dia e confere tudo no app.' },
  { t: 'Fechamento e divisão', p: 'No fim do dia vocês conferem o estoque, calculam o lucro e dividem 50/50 por PIX.' },
];

export const MODELO = [
  { e: '🧰', t: 'Eu entro com a estrutura', p: 'Kit de venda emprestado em comodato com recibo e o estoque do dia, comprado com nota.' },
  { e: '🚶', t: 'Você entra com o trabalho', p: 'Vende na praia no seu ritmo, com o seu cadastro de ambulante e o curso de manipulação.' },
  { e: '🤝', t: 'Lucro dividido 50/50', p: 'Lucro do dia = vendas − custo do produto − gelo e embalagem. Metade para cada um, no mesmo dia.' },
];

export const KITS = [
  { e: '🎒', t: 'Kit Caminhante', p: 'Caixa térmica de ombro e bolsa. Para quem vende andando na faixa de areia.' },
  { e: '🛒', t: 'Kit Carrinho', p: 'Carrinho desmontável com caixa grande. Liberado depois que o piloto mostrar bons números.' },
];

export const FAQ = [
  ['Isso é emprego?', 'Não. É uma parceria comercial entre autônomos, sem vínculo de emprego, sem horário fixo e sem chefe de turno. Cada um responde pelo seu cadastro e pelos seus tributos.'],
  ['Preciso ter CNPJ?', 'Não é exigido no começo. Você precisa do cadastro de ambulante da sua prefeitura e do curso de manipulação de alimentos. As regras variam por cidade, por isso a coordenação confere com você antes de liberar o kit.'],
  ['Quanto eu vou ganhar?', 'Não prometemos valor. O ganho depende do dia, do clima e do seu esforço. O que garantimos é a conta aberta: preço, custo e divisão aparecem para você antes de sair.'],
  ['Quanto custa para entrar?', 'O kit é emprestado, não vendido. Os custos do seu lado são o cadastro de ambulante e o curso de manipulação, que variam por cidade.'],
  ['E se sobrar produto?', 'A sobra volta para o estoque e entra na conta. O lucro é calculado pelo que saiu menos o que sobrou, conferido por foto.'],
  ['Por que as vagas são limitadas?', 'Cada vaga corresponde a um kit real. O número que você vê no site é o de kits disponíveis na cidade, e quem fica sem vaga entra na lista de espera.'],
  ['Meus dados ficam seguros?', 'Usamos nome, telefone e cidade só para falar com você sobre esta parceria. Veja a página de privacidade.'],
];

export const ETAPAS_DONO = [
  { chave: 'e1', t: 'Decisões e parte legal', itens: ['Conversar com advogado ou contador sobre o contrato de parceria', 'Ligar na prefeitura da cidade piloto sobre cadastro de ambulante', 'Definir cidade do piloto e número real de vagas', 'Definir o estoque: compra local com nota (decidido)'] },
  { chave: 'e2', t: 'Banco e automação', itens: ['Rodar o SQL no Supabase (tabelas praia_)', 'Rodar o SQL extra (vagas, avisos, etapas)', 'Criar os fluxos do n8n e o bot do Telegram', 'Testar um aviso de novo candidato'] },
  { chave: 'e3', t: 'Site publicado', itens: ['Conferir a prévia das páginas /praia', 'Ajustar textos e número de WhatsApp', 'Publicar no site oficial'] },
  { chave: 'e4', t: 'Área do sócio e painel', itens: ['Cadastrar produtos com custo e preço', 'Cadastrar as vagas por cidade', 'Testar o login de um sócio de teste'] },
  { chave: 'e5', t: 'Estrutura física', itens: ['Comprar 2 kits caminhantes (caixa térmica, bolsa, cintas)', 'Construir o carrinho desmontável e fazer o teste de carga de 40 kg', 'Imprimir recibos de comodato', 'Separar embalagens e gelo'] },
  { chave: 'e6', t: 'Recrutamento', itens: ['Gerar os cartazes com QR code', 'Postar nos grupos locais da cidade piloto', 'Entrevistar os candidatos e escolher 2'] },
  { chave: 'e7', t: 'Piloto e temporada', itens: ['Cada sócio com ambulante, curso e contrato assinados', 'Ensaio de retirada e fechamento', 'Piloto de fim de semana e revisão dos números', 'Temporada completa de 20/12 a 28/02'] },
];

export const ROTINA_DONO = [
  ['Todo dia', 'Abrir o painel, ver candidatos novos, conferir fechamentos e divergências, pagar a parte de cada sócio por PIX.'],
  ['Toda semana', 'Conferir estoque e kits, publicar um aviso para os sócios, olhar o contador de vagas e a lista de espera.'],
  ['Todo mês', 'Revisar produtos, custos e preços, decidir abrir ou fechar vagas e renovar a manutenção do VPS.'],
];

export const REGRAS_SOCIO = [
  'A conta é sempre feita por contagem: o que saiu menos o que sobrou, conferido por foto.',
  'No piloto, perda de até 3% do estoque do dia é tolerada. Acima de 10% o painel marca um alerta e a coordenação conversa com você.',
  'Sem fechamento do dia anterior não há nova retirada de estoque.',
  'O kit só é liberado com cadastro de ambulante, curso de manipulação e contrato assinados.',
  'Venda só onde a prefeitura permite. Em caso de abordagem da fiscalização, siga a orientação e avise a coordenação.',
  'O kit é emprestado em comodato: cuide e devolva em bom estado.',
];
