# 🚀 DEPLOYMENT.md — Guia Completo de Deploy

Instruções passo-a-passo para colocar CityLine 2.0 em produção.

---

## 📋 Pre-Deployment Checklist

Antes de fazer o deploy, garanta que:

- [ ] Todos testes passando (`npm run test`)
- [ ] TypeScript compila sem erros (`npm run type-check`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Build local validado (`npm run build`)
- [ ] `.env` variáveis definidas
- [ ] Git repository atualizado
- [ ] Changes committed e pushed

```bash
# Executar tudo de uma vez:
npm run type-check && npm run test && npm run lint && npm run build
```

---

## 🟦 Deploy Backend (Express)

### Opção 1: Vercel Functions (Recomendado)

#### 1.1 Adicionar Vercel Config
```bash
npm install -D vercel
```

**`apps/backend/vercel.json`:**
```json
{
  "version": 2,
  "env": {
    "PORT": "@port",
    "CORS_ORIGIN": "@cors_origin",
    "TRANSPORT_CACHE_TTL_MS": "@cache_ttl",
    "CITYLINE_EXTERNAL_API_URL": "@api_url"
  },
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

#### 1.2 Build
```bash
npm run build --workspace @cityline/backend
# Gera: apps/backend/dist/
```

#### 1.3 Deploy
```bash
cd apps/backend
vercel --prod

# Ou via Git:
git push origin main
# (Vercel pull automático se configurado)
```

#### 1.4 Environment Variables
No painel Vercel:
```
Settings → Environment Variables

PORT = 4000
CORS_ORIGIN = https://seu-dominio.com
TRANSPORT_CACHE_TTL_MS = 600000
CITYLINE_EXTERNAL_API_URL = https://api.real-provider.com
```

---

### Opção 2: Railway (Mais Flexível)

#### 2.1 Setup Railway
```bash
npm install -g @railway/cli
railway login
```

#### 2.2 Criar Projeto
```bash
cd apps/backend
railway init
# Seleciona: Node.js
```

#### 2.3 Add Environment Variables
```bash
railway variable add PORT 4000
railway variable add CORS_ORIGIN https://seu-dominio.com
railway variable add TRANSPORT_CACHE_TTL_MS 600000
railway variable add CITYLINE_EXTERNAL_API_URL https://api.real-provider.com
```

#### 2.4 Deploy
```bash
npm run build --workspace @cityline/backend
railway up
```

#### 2.5 Ver URL Pública
```bash
railway open
# Cópia a URL: https://seu-railway-app.railway.app
```

---

### Opção 3: Docker (Máximo Controle)

#### 3.1 Criar Dockerfile
**`apps/backend/Dockerfile`:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/

# Instalar deps
RUN npm ci --omit=dev

# Build backend
RUN npm run build --workspace @cityline/backend

# Expor porta
EXPOSE 4000

# Rodar servidor
CMD ["node", "apps/backend/dist/index.js"]
```

#### 3.2 Build Image
```bash
docker build -f apps/backend/Dockerfile -t cityline-api:latest .
```

#### 3.3 Rodar Localmente
```bash
docker run -p 4000:4000 \
  -e PORT=4000 \
  -e CORS_ORIGIN=http://localhost:3000 \
  -e CITYLINE_EXTERNAL_API_URL=https://api.example.com \
  cityline-api:latest
```

#### 3.4 Push para Registry
```bash
# Docker Hub
docker tag cityline-api:latest seu-usuario/cityline-api:latest
docker push seu-usuario/cityline-api:latest

# Ou: AWS ECR, GCP Container Registry, etc.
```

#### 3.5 Deploy em Cloud
- **AWS ECS:** ECR + ECS task
- **Google Cloud Run:** `gcloud run deploy --image ...`
- **Azure Container Instances:** `az container create ...`
- **DigitalOcean:** Droplet + Docker Compose

---

## 🟩 Deploy Frontend (Next.js)

### Opção 1: Vercel (Native Next.js)

#### 1.1 Conectar Repositório
- Ir em https://vercel.com
- "New Project"
- Conectar GitHub/GitLab/Bitbucket
- Selecionar repositório

#### 1.2 Configurar Projeto
```
Root Directory: apps/frontend
```

#### 1.3 Environment Variables
```
Settings → Environment Variables

NEXT_PUBLIC_API_URL = https://seu-backend.com/api
```

#### 1.4 Deploy
- Clicar "Deploy"
- Vercel compila automaticamente
- Resultado: https://seu-dominio.vercel.app

#### 1.5 Custom Domain (Opcional)
```
Settings → Domains
Adicionar seu domínio
Configurar DNS records
```

---

### Opção 2: Netlify (Alternativa Rápida)

#### 2.1 Conectar Repositório
- Ir em https://netlify.com
- "Add new site"
- Conectar Git
- Selecionar repositório

#### 2.2 Build Config
```
Base directory: apps/frontend
Build command: npm run build --workspace @cityline/frontend
Publish directory: apps/frontend/.next
```

#### 2.3 Environment
```
Env variables:
NEXT_PUBLIC_API_URL = https://seu-backend.com/api
```

#### 2.4 Deploy
- Netlify compila automaticamente
- Resultado: https://seu-site.netlify.app

---

### Opção 3: Self-Hosted (VPS)

#### 3.1 Compilar Localmente
```bash
npm run build --workspace @cityline/frontend
# Gera: apps/frontend/.next/
```

#### 3.2 Criar PM2 Config
**`apps/frontend/ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'cityline-frontend',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://seu-backend.com/api'
    }
  }]
};
```

#### 3.3 Deploy para VPS (via SSH)
```bash
# Copiar arquivo
scp -r apps/frontend/.next usuario@seu-vps:/home/usuario/cityline/

# SSH e rodar
ssh usuario@seu-vps
cd /home/usuario/cityline
npm install --omit=dev
pm2 start ecosystem.config.js
pm2 save
```

#### 3.4 Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔄 CI/CD Automático (GitHub Actions)

### GitHub Actions Workflow

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy CityLine

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run type-check
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      # Deploy Backend
      - run: npm run build --workspace @cityline/backend
      - uses: railway-app/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          service: cityline-api
      
      # Deploy Frontend
      - uses: vercel/next.js-action@v1
        with:
          token: ${{ secrets.VERCEL_TOKEN }}
          team: seu-team-id
```

---

## 📱 Monitoramento Pós-Deploy

### Backend Monitoring

#### Health Check
```bash
curl https://seu-backend.com/health
# Response: 200 OK
```

#### Logs (Railway)
```bash
railway logs
# Veja erros em tempo real
```

#### Logs (Vercel)
```
Project Settings → Logs
Ver output em tempo real
```

### Frontend Monitoring

#### Vercel Analytics
```
Dashboard → Analytics
Veja: Page Load Time, Core Web Vitals, etc.
```

#### WebVitals
```typescript
// Next.js auto reports:
// - Largest Contentful Paint (LCP)
// - Cumulative Layout Shift (CLS)
// - First Input Delay (FID)
```

---

## 🔧 Rollback (Se Algo Quebrar)

### Vercel Rollback
```
Deployments → Selecionar versão anterior
"Promote to Production"
```

### Railway Rollback
```bash
railway variable set DEPLOYMENT_ID <previous-id>
railway redeploy
```

### Git Rollback
```bash
git revert <commit-hash>
git push origin main
# CI/CD redeploy automáticamente
```

---

## 🌍 Domínios & DNS

### Configurar Domínio (Vercel)
```
Project Settings → Domains
Adicionar domínio
Vercel fornece nameservers
Atualizar em seu registrador (GoDaddy, Namecheap, etc.)
```

### Configurar CORS
Backend precisar permitir frontend domain:

**`.env.production`:**
```env
CORS_ORIGIN=https://seu-dominio.com
```

Frontend precisa saber URL do backend:

**`apps/frontend/.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://seu-api-dominio.com
```

---

## 🔒 Segurança em Produção

### Checklist
- [x] HTTPS enabled (Vercel/Railway padrão)
- [x] Environment variables não em repo
- [x] CORS configurado (origin restrito)
- [x] Validação de inputs (Zod)
- [x] Error handling gracioso (sem stack traces)
- [x] Rate limiting (implementar se necessário)
- [x] Logs sensatez (não logar dados sensíveis)

### Enable HTTPS
```bash
# Vercel: Automático
# Railway: Automático
# Self-hosted: Let's Encrypt
```

### Rate Limiting (Opcional)
```bash
npm install express-rate-limit --workspace @cityline/backend
```

**`apps/backend/src/app.ts`:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Performance Checklist

- [ ] Frontend bundle size < 200 KB (current: 154 KB ✅)
- [ ] Backend response time < 200ms
- [ ] API cache working (TTL 5-10 min)
- [ ] Images optimized (Next.js auto)
- [ ] Database indexes created (when applicable)

---

## 🚨 Troubleshooting Deploy

### Backend Not Starting (Porta já usada)
```bash
# Local fix:
lsof -i :4000
kill -9 <PID>

# Production: Usar porta diferente ou container isolado
```

### CORS Errors
```
Error: Access-Control-Allow-Origin denied

Fix: Verificar CORS_ORIGIN env var
backend: CORS_ORIGIN=https://seu-frontend.com
```

### API 404 (Frontend não consegue reach)
```
Error: Cannot reach http://localhost:4000/api

Fix: Verificar NEXT_PUBLIC_API_URL
frontend: NEXT_PUBLIC_API_URL=https://seu-backend.com/api
```

### Build Fails
```bash
# Local test:
npm run build

# Se passar local, push para ver logs remotos
# Vercel/Railway logs apontam exatamente o erro
```

---

## 📈 Next Step: Real API

Quando API real está pronta:

**Backend `.env.production`:**
```env
CITYLINE_EXTERNAL_API_URL=https://api.real-provider.com
```

Sistema encontra automaticamente:
1. Tenta External API
2. Se falha → fallback automático (fallbackLines)
3. Response meta: `{source: 'fallback'|'external'}`

---

## 🎉 Vitória Template

Após deploy bem-sucedido:

```
Frontend ✅ https://seu-dominio.com
Backend  ✅ https://seu-backend.com/api

Health check:
curl https://seu-backend.com/health       → 200
curl https://seu-dominio.com               → 200

Congrats! CityLine 2.0 em produção 🚀
```

---

**Last Updated:** 30 de Março de 2026  
**Version:** 2.0.0 - Production Deployment

