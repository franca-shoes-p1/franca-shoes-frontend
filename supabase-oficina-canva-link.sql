-- Coloca o link real do Canva no Cartão 2 e ajusta o passo a passo. Pode rodar de novo sem problema.
update public.op_cartoes set
 material = replace(replace(material::text,
   'Modelo de arte no Canva: [LINK DO MODELO NO CANVA] (o dono troca pelo link real)',
   'Modelo de arte no Canva (abra, clique em Personalizar este modelo ou Usar em novo design): https://canva.link/rojc4425aarj0rd'),
   'Modelo de arte no Canva: [LINK DO MODELO NO CANVA]',
   'Modelo de arte no Canva (abra, clique em Personalizar este modelo ou Usar em novo design): https://canva.link/rojc4425aarj0rd')::jsonb,
 passos = replace(passos::text,
   'Abra o modelo de arte no Canva pelo link do Material.',
   'Abra o link do Canva do Material e clique em Personalizar este modelo (ou Usar em novo design). Entre com a sua conta gratuita; não ative o teste pago.')::jsonb
where codigo = 'C2';
