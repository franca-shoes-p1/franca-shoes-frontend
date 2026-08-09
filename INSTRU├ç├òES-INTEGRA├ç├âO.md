# 📦 INSTRUÇÕES DE INTEGRAÇÃO - FRANCA SHOES P1

**Data:** 09/08/2026 - 02:30
**Status:** 4 arquivos prontos para integrar
**Tempo estimado:** 15-20 minutos

---

## 📋 O QUE VOCÊ RECEBEU

```
✅ Home.jsx         - Página home profissional
✅ Home.css         - Estilos da home
✅ Loja.jsx         - Página loja com filtros
✅ Loja.css         - Estilos da loja
✅ INSTRUÇÕES       - Este arquivo
```

---

## 🎯 PASSO 1 - COPIAR ARQUIVOS

### Local de destino no seu PC:

```
C:\Users\User\franca-shoes\frontend\src\pages\
```

### Copie os 4 arquivos para lá:

1. **Home.jsx** → `C:\Users\User\franca-shoes\frontend\src\pages\Home.jsx`
2. **Home.css** → `C:\Users\User\franca-shoes\frontend\src\pages\Home.css`
3. **Loja.jsx** → `C:\Users\User\franca-shoes\frontend\src\pages\Loja.jsx`
4. **Loja.css** → `C:\Users\User\franca-shoes\frontend\src\pages\Loja.css`

---

## 🔧 PASSO 2 - VERIFICAR ESTRUTURA DO NEXT.JS

Como o projeto é **Next.js**, os arquivos em `/pages/` são automaticamente rotas:

- `Home.jsx` → Rota: `/` (raiz)
- `Loja.jsx` → Rota: `/loja`

**Se você quer que `Home` seja a página inicial (/), renomeie assim:**

```
Home.jsx → index.js
```

**Ou deixe como `Home.jsx` e crie um `index.js` que importa Home:**

```javascript
// pages/index.js
import Home from './Home';
export default Home;
```

---

## 🧪 PASSO 3 - TESTAR LOCALMENTE

Abra o **PowerShell** na pasta `frontend`:

```bash
cd C:\Users\User\franca-shoes\frontend
npm run dev
```

**Abra o navegador e teste:**

```
http://localhost:3000          → Deve mostrar Home profissional
http://localhost:3000/loja     → Deve mostrar Loja com filtros
```

---

## ✨ O QUE VOCÊ DEVE VER

### Na HOME (localhost:3000):
- ✅ Hero section azul com "🚀 Franca Shoes - v5.1"
- ✅ 7 categorias em cards coloridos
- ✅ Seção "Cotação Automática" com formulário
- ✅ 3 benefícios (Entrega, Preços, Atendimento)
- ✅ Status do sistema (Frontend, Backend, PostgreSQL)
- ✅ Footer completo

### Na LOJA (localhost:3000/loja):
- ✅ Header azul
- ✅ Sidebar com filtros:
  - 🔍 Busca por nome
  - 📦 Categoria (dropdown)
  - 💰 Preço máximo (slider)
  - 📐 Tamanho (dropdown)
  - 🎨 Cor (dropdown)
- ✅ Grid de produtos responsivo
- ✅ Contador de produtos encontrados
- ✅ Botão "Limpar Tudo"

---

## 🚀 PASSO 4 - FAZER COMMIT E PUSH

Se tudo funcionou, commit e push para Vercel:

```bash
git add .
git commit -m "Add: Home + Loja pages com design profissional 09/08"
git push origin main
```

**Vercel fará deploy automático em 2-3 minutos!**

---

## 🌐 RESULTADO FINAL

| URL | O que abre |
|-----|-----------|
| https://igreja.eco.br | Home profissional ✅ |
| https://igreja.eco.br/loja | Loja com filtros ✅ |
| https://franca-shoes-frontend.vercel.app | Backup Vercel ✅ |

---

## ⚠️ IMPORTANTE - SOBRE OS PRODUTOS

Os produtos mostrados são **MOCKADOS** (dados fake para demonstração).

Para colocar **produtos reais** do banco de dados em P2, você vai:

1. Conectar com o backend (localhost:5000)
2. Fazer uma chamada API para buscar produtos
3. Substituir os dados mock pelos dados reais

**Para P2, você vai usar:**
```javascript
useEffect(() => {
  fetch('http://localhost:5000/api/produtos')
    .then(res => res.json())
    .then(data => setProducts(data))
}, [])
```

---

## 📝 CHECKLIST FINAL

Antes de dar o deploy:

- [ ] Copiei os 4 arquivos para `src/pages/`
- [ ] Testei `npm run dev` localmente
- [ ] Home carrega em `localhost:3000` ✅
- [ ] Loja carrega em `localhost:3000/loja` ✅
- [ ] Filtros funcionam na Loja ✅
- [ ] Design está profissional ✅
- [ ] Responsivo no mobile ✅
- [ ] Fiz `git push origin main` ✅
- [ ] Vercel fez deploy ✅
- [ ] Site funciona em `https://igreja.eco.br` ✅

---

## 🎊 PARABÉNS!

Você completou **P1 com Design Profissional!**

### Próximos passos (P2):

1. **Admin Panel** - Gerenciar produtos
2. **PIX 100%** - Integrar checkout com backend
3. **Robô P2** - Automação Nicho 7
4. **Banco Real** - Substituir dados mock por dados do backend

---

## 💬 DÚVIDAS?

Se algo não funcionar:

1. Verifique se os arquivos estão em `src/pages/`
2. Verifique se `npm install` foi executado
3. Verifique se não tem erros no console do navegador
4. Tente: `npm install --legacy-peer-deps` se tiver erro de dependências
5. Tente: `npm cache clean --force` e depois `npm install`

---

## 🏁 RESULTADO

**Seu site agora tem:**

✅ Homepage profissional
✅ Loja com filtros avançados
✅ Design responsivo (mobile/tablet/desktop)
✅ Pronto para P2
✅ LIVE em https://igreja.eco.br

**VOCÊ TEM UM E-COMMERCE DE VERDADE!** 🚀💰
