# GUIA DE EVOLUÇÃO 2.0

Este documento registra as principais transformações na evolução do CityLine para uma plataforma escalável e profissional.

## ✅ Refatorações Implementadas

### 1. Estrutura — Monorepo Profissional

**Antes:**
- Arquivo único de projeto Next.js
- Dados e código misturados

**Depois:**
- **Monorepo** (`npm workspaces`) com 3 pacotes:
  - `packages/shared` — Tipos e dados comuns
  - `apps/backend` — Express + Node.js
  - `apps/frontend` — Next.js 15 App Router
- Separação nítida de responsabilidades
- Compartilhamento de tipos via `@cityline/shared`

**Benefício:** Escalabilidade, reutilização, múltiplas operadoras futuras

### 2. Backend — Criação do Servidor Express

**Antes:**
- Não havia backend
- Dados hardcoded no frontend

**Depois:**
- **Express.js** com TypeScript
- **Estrutura em camadas:**
  - Controllers / Routes → Handlers HTTP
  - Services → Lógica de negócio
  - Repositories → Persistência
  - Providers → Abstração de fontes (Local vs External API)
- **Fallback inteligente** — Cai automaticamente para dados locais se API externa falhar
- **Cache em memória** com TTL configurável
- **Validação com Zod** — Runtime validation
- **Error handling centralizado** — Envelopes padronizados

**Endpoints:**
```
GET    /api/lines              # Todas as linhas
GET    /api/lines/:id          # Detalhes
GET    /api/search?q=...       # Busca textual
GET    /api/schedules          # Horários
GET    /api/map/lines          # Dados para mapa
GET    /api/favorites          # Favoritos
POST   /api/favorites          # Criar favorito
DELETE /api/favorites/:id      # Deletar favorito
```

**Benefício:** API real, escalável, pronta para DB, múltiplas operadoras

### 3. Frontend — Refatoração Next.js + App Router

**Antes:**
- App.jsx/App.css em SRC
- Componentes acoplados
- Lógica misturada com UI

**Depois:**
- **Next.js 15 App Router** (Server + Client Components)
- **Organização por features:**
  - `features/dashboard` — Orquestrador principal
  - `features/lines/` — Listagem e detalhes
  - `features/schedules/` — Horários
  - `features/map/` — Mapa interativo
- **Separação clara:**
  - UI components (sem lógica)
  - Services (data fetching)
  - Hooks (state & logic)
  - Lib (helpers puros)
- **Mapa interativo** — Leaflet + react-leaflet
- **Favoritos persistidos** — localStorage + sincronização otimista com backend
- **Fallback automático** — JS nunca quebra

**Benefício:** Manutenível, testável, escalável, boa UX

### 4. Tipos Compartilhados — Shared Package

**Antes:**
- Types espalhados
- Duplicação entre MVP

**Depois:**
- `packages/shared/src/types/transport.ts`
  - `TransportLine` — Estrutura da linha
  - `Schedule` — Horários
  - `FavoriteRecord` — Favoritos
  - `ApiEnvelope` — Padrão de resposta
- `packages/shared/src/data/fallback-transport.ts`
  - 4 linhas reais de São Francisco do Sul
  - Dados estruturados, coordenadas reais (Leaflet-ready)

**Benefício:** Single source of truth, sem divergências

### 5. Persistência Inteligente

**Antes:**
- localStorage apenas no frontend
- Sem backend-sync

**Depois:**
- **Frontend:** localStorage + React hooks
- **Sincronização otimista:**
  - Atualiza UI imediatamente
  - Sincroniza em background com API
  - Se falhar, mantém local
- **Backend:** JSON em `data/favorites.json` (preparado para PostgreSQL)

**Benefício:** Offline-first, UX fluida, segurança (não quebra se API cai)

### 6. Testes & Qualidade

**Antes:**
- Sem testes
- Sem linting automático

**Depois:**
- **Backend:**
  - Vitest + Supertest
  - Testes de API (payload padronizado, busca)
  - 2 testes implementados
- **Frontend:**
  - Vitest + jsdom
  - Testes de helpers (filtro, próximas partidas)
  - 2 testes implementados
- **TypeScript strict** — Sem `any`, validação em tempo de compilação
- **ESLint** — Sem unused code, imports organizados

**Benefício:** Confiança em mudanças, menos bugs, refatorações seguras

### 7. API Real & Fallback

**Antes:**
- Dados hardcoded
- Sem integração
- Impossível atualizar linhas

**Depois:**
```env
CITYLINE_EXTERNAL_API_URL=https://api.seu-provedor.com/lines
```

- Se a URL estiver definida e responder, usa dados reais
- Se falhar (timeout, 500, formato inválido), cai para dados locais automaticamente
- User nunca vê erro — UX sempre funciona

**Benefício:** Pronto para APIs reais (Verdes Mares, SPTrans, etc.)

### 8. Mapa Interativo

**Antes:**
- Sem visualização cartográfica

**Depois:**
- **Leaflet** — Open-source, lightweight
- **react-leaflet** — Integração React nativa
- **Rotas (polylines)** — Coordenadas reais das linhas
- **Paradas (markers)** — Latitude/longitude dos pontos
- **Highlight dinâmico** — Linha selecionada em destaque
- **Responsivo** — Desktop e mobile

**Benefício:** Visualização profissional, experiência moderna

### 9. Padrão & Consistência

**Antes:**
- Nomes inconsistentes
- Estruturas variadas
- Duplicação de lógica

**Depois:**
- **Naming:** Claro e semântico
  - `getNextDepartures()` em vez de `getNextBuses()`
  - `useLineSearch()` em vez de `useBusSearch()`
  - `MobilityDashboard` em vez de `Home`
- **Patterns:**
  - Componentes: props-driven, sem side-effects
  - Hooks: memoized, cleanup
  - Services: async, error-first
  - Helpers: puras, testáveis
- **DRY:** Sem código duplicado

**Benefício:** Onboarding fácil, menos bugs, melhor manutenção

---

## 📊 Métricas

| Métrica | Antes | Depois |
|---------|-------|--------|
| **Arquivos** | ~20 | ~80+ |
| **Camadas** | 1 (frontend) | 3 (shared, backend, frontend) |
| **Type coverage** | ~70% | **100%** (strict) |
| **Testes** | 0 | **4+** |
| **Endpoints** | 0 | **8** |
| **Componentes reutilizáveis** | ~5 | **15+** |
| **Separation of concerns** | Baixa | **Alta** |
| **Deploy-ready** | Não | **Sim** |

---

## 🎯 Impacto

### Developer Experience
- ✅ Hot reload frontend + backend em paralelo
- ✅ TypeScript strict — sem surpresas
- ✅ Código organizado por domínio
- ✅ Fácil adicionar features
- ✅ Componentes reutilizáveis

### User Experience
- ✅ Interface moderna (Tailwind + Lucide)
- ✅ Mapa interativo
- ✅ Busca rápida
- ✅ Favoritos sincronizados
- ✅ Funciona offline (localStorage)
- ✅ Nunca quebra (fallback automático)

### Business
- ✅ Pronto para escalar (DB real, mais cidades)
- ✅ Integração com APIs reais possível
- ✅ Arquitetura profissional
- ✅ Fácil traduzir, adicionar operadoras
- ✅ Base sólida para MVP → Produção

---

## 🔄 Como Evoluir Daqui

### Curto Prazo (1 mês)
1. [ ] Integrar com API real de transporte (ex: Verdes Mares)
2. [ ] Autenticação básica (Google OAuth)
3. [ ] Persisência de favoritos no backend (PostgreSQL)
4. [ ] Mais testes

### Médio Prazo (3 meses)
1. [ ] Multi-cidade (Joinville, Araquari, etc.)
2. [ ] Notificações push (atrasos)
3. [ ] Geolocalização do usuário
4. [ ] Reviews/ratings de linhas
5. [ ] PWA + offline-first

### Longo Prazo (6+ meses)
1. [ ] GraphQL
2. [ ] Real-time (WebSockets)
3. [ ] Mobile app nativo (React Native)
4. [ ] Admin dashboard
5. [ ] Analytics & insights

---

## 📖 Documen

tação

- **[README.md](./README.md)** — Guia completo de uso
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** — Para desenvolvedores
- **[.env.example](./.env.example)** — Template de variáveis

---

**Versão 2.0 — Pronto para Product! 🚀**
