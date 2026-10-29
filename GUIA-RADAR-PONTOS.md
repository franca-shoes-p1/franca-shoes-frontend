# Radar de Pontos (cartazes com QR por cidade)

1. No Supabase (SQL Editor), rode o arquivo `supabase-pontos.sql` uma vez.
2. Entre em `/admin/pontos` com a senha do painel.
3. Escolha a cidade (as capitais da primeira fase aparecem primeiro: Rio de Janeiro, Goiânia, Curitiba, Campo Grande, Vitória, Salvador, Florianópolis, São Paulo e Belo Horizonte) e clique em "Adicionar rodoviárias de ..." para trazer as rodoviárias principais.
4. Confira as posições no mapa. Para um ponto novo, clique no mapa, preencha o nome e cadastre.
5. Em cada ponto: "Texto do convite" (copie e envie ao responsável), "Cartaz com QR" (imprimir ou salvar PDF; 1 ou 4 por folha).
6. Quando o responsável abrir o link do convite e clicar em "Sim", o ponto muda sozinho para "Autorizado". Só cole o cartaz depois disso.
7. Depois de colar, marque o ponto como "Ativo". O painel mostra visitas e pedidos de cada ponto.

Como o rastreio funciona: o QR leva a `/p/CODIGO`, que conta a visita e abre a loja. O código fica salvo no celular do cliente e vai junto do pedido, aparecendo na observação como `[ponto:CODIGO]`.
