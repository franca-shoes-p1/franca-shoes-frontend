# GUIA-SAPATOS — manual do /sapatos

Registro de tudo o que foi feito no projeto /sapatos (regra: toda mudança entra aqui).

## Etapa 1 — Captura de fotos dos fornecedores (`/captura`)

App de celular (instalável) para fotografar produto e etiqueta/preço no fornecedor. **Ainda sem leitura por IA** (isso é a etapa 2).

### Arquivos novos (nada existente foi alterado)
- `pages/captura.jsx` + `styles/captura.module.css` — a tela do celular.
- `lib/capturaCliente.js` — reduz fotos (máx. 1280 px, JPEG 0,8) e mantém a fila offline (IndexedDB).
- `lib/capturaServer.js` — PIN, cookie e acesso ao Supabase (só no servidor).
- `pages/api/captura/` — `login`, `sessao`, `sair`, `fornecedores`, `foto`, `enviar`.
- `public/captura-sw.js`, `public/captura/manifest.webmanifest`, `public/captura/icon-*.png` — app instalável.

### Variáveis (`.env.local` e Vercel)
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CAPTURA_PIN`.

### Como funciona
1. PIN → cookie httpOnly assinado (30 dias). Sem ele, todas as APIs respondem 401.
2. Escolhe (ou cria) o fornecedor; ele fica memorizado para os próximos produtos.
3. Em cada bloco de fotos (produto, etiqueta, ponto/banca): **Tirar agora** (câmera traseira) ou **Escolher da galeria** (várias de uma vez).
4. **Enviar** guarda tudo na fila do celular; a fila envia sozinha (fotos ao bucket `fotos`, registro em `sp_capturas` com status `novo`, `ultima_visita` do fornecedor atualizada). Sem sinal, mostra "N fotos aguardando envio" e envia quando voltar.
5. Cada registro tem um id gerado no celular, então reenviar não duplica.

### Colunas usadas (conferidas no banco real)
- `sp_fornecedores`: id, nome (obrigatório; se ficar vazio usa o apelido), apelido, tipo, whatsapp, endereco, ponto_referencia, dias_horarios, foto_ponto_url (1ª foto; as extras vão em observacoes), observacoes, ultima_visita.
- `sp_capturas`: id, fornecedor_id, foto_produto_url, foto_etiqueta_url, status ("novo"). Várias fotos de uma vez = um registro por produto: a 1ª foto de produto casa com a 1ª de etiqueta, etc. (as quantidades precisam ser iguais).
