# 📜 SCRIPTS.md — Todos os Comandos Disponíveis

Guia completo de scripts do monorepo CityLine 2.0.

---

## 🚀 Desenvolvimento (Local)

### Iniciar Tudo (Frontend + Backend)
```bash
npm run dev
# Abre automaticamente:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:4000
```

### Apenas Frontend
```bash
npm run dev:frontend
# http://localhost:3000 (hot reload)
```

### Apenas Backend
```bash
npm run dev:backend
# http://localhost:4000 (auto-restart com nodemon)
```

---

## 🏗️ Build & Compilação

### Build Tudo (Shared → Backend → Frontend)
```bash
npm run build
# Compila em ordem de dependência
# Gera: packages/shared/dist/, apps/backend/dist/, apps/frontend/.next/
```

### Build Individual
```bash
npm run build --workspace @cityline/shared
npm run build --workspace @cityline/backend
npm run build --workspace @cityline/frontend
```

### Watch Mode (Recompila ao salvar)
```bash
npm run dev:shared    # Apenas tipos
npm run dev:backend   # Com nodemon
npm run dev:frontend  # Com Next.js hot reload
```

---

## 🧪 Testes & Qualidade

### Todos os Testes
```bash
npm run test
# Executa: backend + frontend testes (Vitest)
```

### Backend Tests Only
```bash
npm run test --workspace @cityline/backend
# apps/backend/src/app.test.ts (Supertest)
# - Validação de payload
# - Busca textual
```

### Frontend Tests Only
```bash
npm run test --workspace @cityline/frontend
# apps/frontend/lib/transport.test.ts (Vitest + jsdom)
# - Filtro de linhas
# - Cálculo de próximas partidas
```

### Type Check (TypeScript Strict)
```bash
npm run type-check
# Valida tipos sem compilar
# Zero errors esperado
```

### Type Check por Package
```bash
npm run type-check --workspace @cityline/backend
npm run type-check --workspace @cityline/frontend
```

### Lint (ESLint)
```bash
npm run lint
# Verifica código (ambos apps)
```

### Lint Fix (Auto-correções)
```bash
npm run lint --workspace @cityline/backend -- --fix
npm run lint --workspace @cityline/frontend -- --fix
```

---

## 📦 Monorepo Management

### Instalar Dependências
```bash
npm install
# Instala todas as deps em todos os packages
```

### Adicionar Dependência Global
```bash
npm install package-name -w root --save-dev
```

### Adicionar Dependência em App Específico
```bash
npm install express -w @cityline/backend
npm install tailwindcss -w @cityline/frontend
```

### Ver Workspaces
```bash
npm ls -R --depth=0
```

---

## 🚢 Produção

### Build Backend para Fazer Deploy
```bash
npm run build --workspace @cityline/backend
# Resultado: apps/backend/dist/ (pronto para Node.js)

# Rodar localmente
node apps/backend/dist/index.js

# Em Vercel/Railway:
node dist/index.js
```

### Build Frontend para Deploy
```bash
npm run build --workspace @cityline/frontend
# Resultado: apps/frontend/.next/ (pronto para Vercel)

# Rodar localmente
npm start --workspace @cityline/frontend
```

### Verificação Pre-Deploy
```bash
# 1. Testes
npm run test

# 2. Type-check
npm run type-check

# 3. Lint
npm run lint

# 4. Build
npm run build

# Se tudo passar ✅, safe to deploy!
```

---

## 🔌 API Testing

### Testar Backend Localmente
```bash
# Terminal 1: Rodar backend
npm run dev:backend

# Terminal 2: Testar endpoints
curl http://localhost:4000/api/lines
curl http://localhost:4000/api/lines/line-001
curl "http://localhost:4000/api/search?q=Praia"
curl http://localhost:4000/api/favorites
```

### Exemplo: Criar Favorito
```bash
curl -X POST http://localhost:4000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"lineId": "line-001"}'
```

### Exemplo: Remover Favorito
```bash
curl -X DELETE http://localhost:4000/api/favorites/favorite-id
```

---

## 📊 Debugging

### Backend Logs
```bash
npm run dev:backend
# Veja logs em tempo real no terminal
```

### Frontend Console
```bash
npm run dev:frontend
# Abra DevTools (F12) > Console tab
```

### Inspecionar Network (Frontend)
```bash
npm run dev:frontend
# DevTools > Network tab
# Veja requests para http://localhost:4000/api/*
```

### TypeScript Errors
```bash
npm run type-check
# Mostra exatamente onde está o erro
```

---

## 🧹 Limpeza

### Limpar Node Modules
```bash
rm -r node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Limpar Builds
```bash
rm -r apps/backend/dist apps/frontend/.next packages/shared/dist
npm run build
```

### Limpar Cache TypeScript
```bash
rm -r .tsbuildinfo apps/*/.tsbuildinfo packages/*/.tsbuildinfo
npm run type-check
```

---

## 🎯 Workflow Recomendado

### Desenvolvimento Local
```bash
# 1. Terminal 1: Rodar tudo
npm run dev

# 2. Terminal 2: Watch testes
npm run test -- --watch

# 3. Editar código
# Mudanças aplicam automaticamente (hot reload)
```

### Antes de Commit
```bash
# 1. Type check
npm run type-check

# 2. Testes
npm run test

# 3. Lint
npm run lint

# 4. Build
npm run build

# Se tudo passar:
git add .
git commit -m "feat: descrição"
git push
```

### Deploy Checklist
```bash
# 1. Atualizar versão
npm version patch/minor/major

# 2. Validar tudo
npm run type-check && npm run test && npm run lint && npm run build

# 3. Push
git push origin main

# 4. Vercel/Railway pull automático
# (configurar webhooks no painel)
```

---

## 🔧 Variáveis de Ambiente

### `.env.local` (Development)
```env
# Backend
PORT=4000
CORS_ORIGIN=http://localhost:3000
TRANSPORT_CACHE_TTL_MS=300000
CITYLINE_EXTERNAL_API_URL=https://api.example.com

# Frontend (public)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### `.env.production` (Production)
```env
# Backend
PORT=4000
CORS_ORIGIN=https://seu-dominio.com
TRANSPORT_CACHE_TTL_MS=600000
CITYLINE_EXTERNAL_API_URL=https://api.real-provider.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

---

## 📚 Script Reference Table

| Command | What It Does | Duration |
|---------|-------------|----------|
| `npm run dev` | Frontend + Backend (hot reload) | - |
| `npm run dev:frontend` | Just frontend | - |
| `npm run dev:backend` | Just backend (auto-restart) | - |
| `npm run build` | Compile all (shared → backend → frontend) | ~10s |
| `npm run build --ws @cityline/backend` | Compile backend only | ~2s |
| `npm run build --ws @cityline/frontend` | Compile frontend only | ~3s |
| `npm run test` | Run all tests (Vitest) | <1s |
| `npm run test:watch` | Re-run tests on change | - |
| `npm run type-check` | Validate TypeScript types | ~5s |
| `npm run lint` | ESLint check | ~3s |
| `npm run lint -- --fix` | Auto-fix linting issues | ~3s |

---

## 💡 Tips & Tricks

### Ver o que changed from main
```bash
git diff main
```

### Rodar um teste específico
```bash
npm run test -- getNextDepartures
```

### Ver tamanho do bundle
```bash
npm run build --workspace @cityline/frontend
# Output: "First Load JS: 154 KB"
```

### Debug um endpoint
```bash
npm run dev:backend
# Edit code → auto-restart
# Check terminal logs
```

### Update types version
```bash
# Después editar packages/shared/
npm run build --workspace @cityline/shared
# Backend/Frontend usam automáticamente nova versão
```

---

## ⚠️ Common Issues

### `Module not found: @cityline/shared`
```bash
# Solution: rebuild shared
npm run build --workspace @cityline/shared
```

### Port 3000 / 4000 already in use
```bash
# Kill the process
# macOS/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### TypeScript errors after pulling
```bash
# Solution: clean install
rm -rf node_modules
npm install
npm run build
```

---

**Last Updated:** 30 de Março de 2026  
**Version:** 2.0.0

