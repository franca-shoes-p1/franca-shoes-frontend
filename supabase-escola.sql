-- Escola de Agropecuária Ecológica (igreja.eco.br/escola): tabelas e conteúdo inicial.
-- Seguro para rodar mais de uma vez (não duplica nada).

create table if not exists esc_trilhas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descricao text,
  icone text default '🌱',
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz default now()
);

create table if not exists esc_aulas (
  id uuid primary key default gen_random_uuid(),
  trilha_id uuid not null references esc_trilhas(id) on delete cascade,
  slug text not null,
  titulo text not null,
  resumo text,
  conteudo text,
  video_url text,
  duracao_min int,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz default now(),
  unique (trilha_id, slug)
);

create table if not exists esc_alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  whatsapp text,
  senha_hash text not null,
  ativo boolean not null default true,
  criado_em timestamptz default now()
);

create table if not exists esc_progresso (
  aluno_id uuid not null references esc_alunos(id) on delete cascade,
  aula_id uuid not null references esc_aulas(id) on delete cascade,
  concluida_em timestamptz default now(),
  primary key (aluno_id, aula_id)
);

alter table esc_trilhas   enable row level security;
alter table esc_aulas     enable row level security;
alter table esc_alunos    enable row level security;
alter table esc_progresso enable row level security;
-- Sem policies de propósito: só o servidor do site (chave de serviço) lê e grava.

-- ---------- Trilhas ----------
insert into esc_trilhas (slug, titulo, descricao, icone, ordem) values
 ('agrofloresta-e-plantio-ecologico', 'Agrofloresta e plantio ecológico', 'Solo vivo, compostagem, sementes crioulas e como montar sua primeira área agroflorestal, sem veneno e com custo baixo.', '🌳', 1),
 ('criacao-de-pequenos-animais', 'Criação de pequenos animais', 'Galinhas, abelhas sem ferrão e ovinos em sistema ecológico: manejo, sanidade preventiva e venda legalizada.', '🐔', 2)
on conflict (slug) do nothing;

-- ---------- Aulas: trilha 1 ----------
insert into esc_aulas (trilha_id, slug, titulo, resumo, duracao_min, ordem, conteudo)
select t.id, v.slug, v.titulo, v.resumo, v.dur, v.ordem, v.conteudo
from esc_trilhas t
join (values
 ('o-que-e-agroecologia', 'O que é agroecologia e por onde começar', 'A ideia central e os primeiros passos para quem tem pouca terra ou está começando.', 10, 1,
$c$## A ideia central
Agroecologia é produzir alimento trabalhando junto com os processos da natureza, e não contra eles. Em vez de comprar adubo químico e veneno todo ano, você cuida do solo, da água e da diversidade para que a própria área sustente a produção.

## Os pilares
- Solo vivo e sempre coberto
- Diversidade de plantas e animais na mesma área
- Aproveitar o que já existe na propriedade (esterco, restos de poda, palha)
- Reduzir a dependência de insumos comprados
- Vender perto de casa e valorizar o alimento limpo

## Por onde começar
Comece pequeno. Escolha uma área que você consiga cuidar bem, observe o terreno por algumas semanas (onde bate sol, onde empoça água, onde o solo é duro) e anote. Observar antes de plantar evita muito erro e muito gasto.

## Para fazer
- Desenhe um croqui simples da sua área
- Marque água, sol, sombra, declive e construções
- Escolha uma pequena parte para ser a sua primeira área de teste$c$),
 ('solo-vivo', 'Conhecendo e cuidando do solo vivo', 'Como ler o seu solo e o que fazer para ele ficar fértil de verdade.', 12, 2,
$c$## Solo não é só terra
Um solo saudável tem minhoca, fungos, bactérias, raízes e matéria orgânica. É esse conjunto que transforma restos em alimento para a planta. Solo exposto ao sol e à chuva, sem cobertura, perde essa vida rápido.

## Teste simples no campo
- Cave um buraco de uma pá de profundidade e observe a cor: quanto mais escuro, em geral, mais matéria orgânica
- Procure minhocas e raízes finas
- Pegue um punhado úmido: se esfarela em torrões pequenos, tem boa estrutura; se vira uma massa dura ou poeira, precisa de cuidado

## Análise de solo
Faça análise de solo em laboratório antes de corrigir a acidez ou aplicar qualquer insumo. Ela mostra pH, fósforo, potássio e matéria orgânica. O resultado orienta o que fazer, e evita gastar com o que não precisa.

## Regra de ouro
Nunca deixe o solo pelado: sempre cobertura viva (plantas) ou morta (palha, folhas).$c$),
 ('compostagem-e-adubacao-organica', 'Compostagem e adubação orgânica', 'Transforme restos da propriedade em adubo de qualidade.', 12, 3,
$c$## Como funciona
Compostagem é a decomposição controlada de restos orgânicos por microrganismos. O segredo é equilibrar dois tipos de material.

## Os dois ingredientes
- Materiais ricos em carbono (secos): folhas secas, palha, serragem, galhos triturados
- Materiais ricos em nitrogênio (úmidos e verdes): restos de cozinha, capim cortado, esterco

Como ponto de partida, use mais material seco do que úmido. Se a pilha cheirar mal, falta material seco e ar; se não esquenta nem decompõe, falta umidade ou material verde.

## Cuidados
- Mantenha úmida como uma esponja torcida, sem encharcar
- Revire de vez em quando para entrar ar
- Evite carne, gordura e fezes de cães e gatos
- Use o composto pronto quando estiver escuro, com cheiro de terra e sem pedaços reconhecíveis

## Outros adubos da propriedade
Esterco curtido, biofertilizantes e adubação verde (plantas como feijão-de-porco e crotalária, cortadas e deixadas sobre o solo) complementam a compostagem.$c$),
 ('cobertura-do-solo-e-mato', 'Cobertura do solo e manejo do mato sem veneno', 'Palhada, roçada e adubação verde para proteger o solo e controlar o mato.', 10, 4,
$c$## Por que cobrir
A cobertura mantém a umidade, baixa a temperatura do solo, reduz a erosão e alimenta a vida do solo ao se decompor. Também segura o mato.

## Como cobrir
- Palha de capim, folhas e restos de poda sobre o canteiro
- Roçar o capim e deixar a palha no lugar
- Plantar adubação verde entre as linhas

## O mato não é inimigo
Muitas plantas espontâneas indicam o estado do solo e protegem o terreno. O que se controla é a competição com a cultura, principalmente nas primeiras semanas. Roçar, capinar na hora certa e cobrir costuma bastar, sem herbicida.

## Cuidado com a palha
Use palha de origem conhecida. Material com resíduo de herbicida pode prejudicar a lavoura.$c$),
 ('sementes-crioulas', 'Sementes crioulas: escolher, guardar e trocar', 'Por que guardar sementes e como fazer isso do jeito certo.', 12, 5,
$c$## O que são
Sementes crioulas são variedades mantidas e adaptadas por agricultores ao longo de gerações. Costumam se adaptar bem à região e permitem que você guarde a semente para o próximo plantio, sem depender de comprar todo ano.

## Como escolher a matriz
Marque as plantas mais bonitas, sadias e produtivas e deixe-as para semente. Não guarde semente das plantas fracas ou doentes.

## Como guardar
- Seque bem à sombra e ao vento antes de armazenar
- Guarde em vidro ou garrafa PET bem fechada, em lugar fresco, seco e escuro
- Identifique com nome da variedade e data
- Verifique de vez em quando e descarte o que mofar ou for atacado por inseto

## Troca e guardiões
Participe de casas de sementes, feiras de troca e redes de guardiões da sua região. Trocar sementes aumenta a diversidade e a segurança da produção.

## Atenção
Vender ou distribuir semente em escala pode ter regras próprias. Confirme com o órgão de agricultura do seu estado.$c$),
 ('primeira-area-agroflorestal', 'Montando sua primeira área agroflorestal', 'Consórcio, estratos e sucessão: como desenhar uma pequena agrofloresta.', 15, 6,
$c$## A lógica da agrofloresta
Um sistema agroflorestal combina árvores, arbustos, plantas de ciclo curto e cobertura do solo na mesma área, imitando a estrutura de uma mata. As plantas se ajudam: umas dão sombra, outras fixam nitrogênio, outras produzem biomassa para cobrir o chão.

## Estratos
- Alto: árvores de longo prazo (frutíferas, madeira)
- Médio: bananeira, mamão, café, cacau conforme a região
- Baixo: hortaliças, mandioca, feijão, abóbora
- Chão: cobertura e adubação verde

## Sucessão
Plante junto espécies de ciclos diferentes: as de ciclo curto produzem logo e abrem caminho para as de ciclo longo. Você colhe desde os primeiros meses, enquanto as árvores crescem.

## Passos para começar
- Escolha uma área pequena e prepare o solo com cobertura e matéria orgânica
- Escolha espécies adaptadas à sua região e ao seu clima
- Plante em linhas, misturando ciclos e alturas
- Poda regular: os galhos podados viram cobertura do solo

## Para a sua região
Busque a assistência técnica local (como a Emater do seu estado) para ajustar as espécies e o espaçamento ao seu clima e solo.$c$)
) as v(slug, titulo, resumo, dur, ordem, conteudo) on true
where t.slug = 'agrofloresta-e-plantio-ecologico'
on conflict (trilha_id, slug) do nothing;

-- ---------- Aulas: trilha 2 ----------
insert into esc_aulas (trilha_id, slug, titulo, resumo, duracao_min, ordem, conteudo)
select t.id, v.slug, v.titulo, v.resumo, v.dur, v.ordem, v.conteudo
from esc_trilhas t
join (values
 ('principios-criacao-ecologica', 'Princípios da criação ecológica e bem-estar animal', 'Como criar com respeito ao animal e ao ambiente, e por que isso melhora o resultado.', 10, 1,
$c$## Criar com o ambiente, não contra ele
Na criação ecológica o animal vive solto ou semi-solto, com abrigo, sombra, água limpa e alimento adequado. Animal sem estresse adoece menos, e isso reduz a necessidade de remédio.

## As cinco liberdades do bem-estar animal
- Livre de fome e sede
- Livre de desconforto
- Livre de dor, lesão e doença
- Livre para expressar comportamentos naturais
- Livre de medo e estresse

## Integração com a lavoura
O esterco vira adubo para a lavoura; restos da lavoura e a vegetação do pasto alimentam os animais. Quanto mais o sistema fecha esse ciclo, menor o gasto com insumos de fora.

## Começar pequeno
Comece com poucos animais e aprenda o manejo antes de aumentar. Registre tudo: datas, ocorrências, produção e gastos.$c$),
 ('galinhas-caipiras', 'Galinhas caipiras: instalações, alimentação e manejo', 'Galinheiro, piquete, alimentação e cuidados básicos para começar bem.', 15, 2,
$c$## Instalações
O galinheiro deve proteger de chuva, vento e predadores, ter boa ventilação, poleiros e ninhos, e ser fácil de limpar. Ao lado, um piquete com sombra permite que as aves peguem sol, ciscam e comam capim e insetos.

## Lotação
Evite aglomeração: ave amontoada estressa e adoece. Como orientação inicial, confirme com a assistência técnica a lotação recomendada para a sua região, tanto no galinheiro quanto no piquete.

## Alimentação
- Ração equilibrada ou mistura balanceada de grãos orientada por técnico
- Verduras, capim e sobras da horta como complemento
- Água limpa e fresca sempre disponível
- Fonte de cálcio para as poedeiras (como casca de ovo triturada)

## Manejo
- Limpe comedouros e bebedouros com frequência
- Troque a cama quando úmida e use a cama curtida como adubo
- Rodízio de piquetes para o capim se recuperar e reduzir parasitas
- Observe diariamente: ave isolada, arrepiada ou sem comer precisa de atenção

## Vacinas
Consulte um técnico para o calendário de vacinação das aves na sua região.$c$),
 ('abelhas-sem-ferrao', 'Abelhas sem ferrão: primeiros passos', 'Meliponicultura: o que é, espécies e cuidados iniciais.', 12, 3,
$c$## O que é
Meliponicultura é a criação de abelhas nativas sem ferrão. Elas polinizam a vegetação, produzem mel e dão pouco trabalho: não picam, o que facilita começar em área pequena.

## Antes de criar
- Escolha espécies nativas da sua região
- Informe-se sobre as regras do seu estado para criação e comercialização
- Compre colônias de criadores legalizados, nunca retire do mato

## O ambiente
- Caixas à sombra parcial, protegidas de chuva forte e de formigas
- Flores o ano todo por perto: diversidade de plantas é a melhor alimentação
- Água limpa próxima

## Cuidados
- Faça revisões raras e rápidas para não estressar a colônia
- Mantenha a caixa bem vedada contra parasitas
- Colha o mel com higiene e deixe sempre reserva para a colônia

## Venda de mel
Mel de abelha sem ferrão tem regras sanitárias próprias. Procure a vigilância sanitária ou a agricultura do município antes de vender.$c$),
 ('ovinos-nocoes-iniciais', 'Ovinos: noções para começar', 'Escolha de animais, pasto, instalações e manejo básico para iniciantes.', 15, 4,
$c$## Por que ovinos
Ovinos se adaptam bem a áreas pequenas, aproveitam pasto e têm boa procura por carne em muitas regiões.

## Escolhendo os animais
Escolha a raça conforme o clima e o objetivo (carne, lã ou os dois). Compre animais sadios de criadores conhecidos e observe aprumos, casco, mucosas e pelagem.

## Pasto e água
- Pasto de boa qualidade, em rodízio, para reduzir vermes
- Água limpa e sombra
- Sal mineral próprio para ovinos, sempre disponível

## Instalações
Um abrigo seco e arejado com piso ripado ou cama seca já atende bem. Proteja o rebanho de cães e outros predadores.

## Vermes: o maior problema
Os vermes são a principal causa de perda nos rebanhos. Em vez de dosar vermífugo em todos, use o método FAMACHA, que avalia a cor da mucosa do olho para tratar só o animal que precisa, com orientação veterinária. Pasto em rodízio e descanso das áreas também ajudam.

## Importante
Combine as práticas com um veterinário ou técnico da sua região. Aqui está a base para você entender o assunto.$c$),
 ('sanidade-preventiva', 'Sanidade preventiva: manejo sem excesso de remédio', 'Prevenir é mais barato e mais ecológico do que remediar.', 12, 5,
$c$## Prevenção primeiro
Animal bem alimentado, com água limpa, abrigo seco e sem aglomeração adoece menos. A maior parte dos problemas começa em falha de manejo.

## Rotina de prevenção
- Observação diária dos animais
- Quarentena para animais novos antes de misturar com o rebanho
- Limpeza e descanso das instalações e piquetes
- Rodízio de pasto
- Calendário de vacinação e vermifugação orientado por veterinário

## Quando o animal adoece
Separe o animal doente, anote os sinais e chame um veterinário. Tratar sem diagnóstico pode piorar o quadro e criar resistência a medicamentos.

## Carência de medicamentos
Medicamentos têm prazo de carência antes do abate ou da venda de leite e ovos. Respeite sempre o que está na bula.

## Registros
Anote vacinas, tratamentos, nascimentos e mortes. O caderno do sítio é a melhor ferramenta de gestão e é exigido em muitos processos de regularização.$c$),
 ('do-sitio-a-mesa', 'Do sítio à mesa: registros, regularização e venda', 'Como organizar a produção para vender com segurança e dentro da lei.', 12, 6,
$c$## Antes de vender
Alimentos de origem animal (carne, leite, ovos, mel e derivados) costumam ter regras sanitárias de produção, abate e venda. Elas variam conforme o produto e o alcance da venda (município, estado ou país).

## O que procurar
- Vigilância sanitária ou serviço de inspeção do município
- Agência de defesa agropecuária do seu estado
- Cadastro de produtor rural e documentos do imóvel
- Assistência técnica rural (Emater e similares)

## Canais de venda
- Feiras e cestas de entrega
- Venda direta a vizinhos e restaurantes
- Compras públicas da agricultura familiar, quando você for enquadrado
- Venda pela internet, respeitando as regras do produto

## Organize a gestão
- Caderno de custos e vendas
- Preço que cubra custo, trabalho e imprevistos
- Rotulagem e embalagem adequadas

## Próximo passo
Procure o órgão da sua cidade e pergunte, produto a produto, o que é exigido. Regularizar cedo evita multa e abre mais mercado.$c$)
) as v(slug, titulo, resumo, dur, ordem, conteudo) on true
where t.slug = 'criacao-de-pequenos-animais'
on conflict (trilha_id, slug) do nothing;
