# Desenvolvimento — CityLine 2.0

Guia enxuto para trabalhar no projeto após a limpeza do repositório.

---

## 📁 Estrutura real do projeto

```text
apps/
├── backend/   # API Express + TypeScript
└── frontend/  # App Next.js 15

packages/
└── shared/    # Tipos e dados compartilhados
```

> A pasta raiz agora serve só para **orquestração**, scripts do monorepo e documentação.

---

## 🚀 Comandos principais

```bash
npm install              # instala as dependências
npm run dev              # sobe frontend + backend
npm run dev:frontend     # sobe só o frontend
npm run dev:backend      # sobe só o backend
npm run type-check       # valida TypeScript
npm run test             # roda os testes
npm run build            # build completo
```

---

## 💻 Fluxo recomendado de desenvolvimento

### Frontend
- editar arquivos em `apps/frontend/`
- interface principal em `apps/frontend/app/page.tsx`
- componentes por feature em `apps/frontend/features/`

### Backend
- editar arquivos em `apps/backend/src/`
- rotas em `apps/backend/src/modules/`
- providers/config em `apps/backend/src/providers/` e `config/`

### Tipos compartilhados
- editar em `packages/shared/src/`
- usados pelo frontend e backend

---

## ✅ Checklist antes de commit

```bash
npm run type-check
npm run test
npm run build
```

Se os três passarem, o projeto está saudável.

---

## 🔧 Variáveis de ambiente

Use o arquivo de exemplo da raiz:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
TRANSPORT_CACHE_TTL_MS=300000
CITYLINE_EXTERNAL_API_URL=
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 📝 Observação importante

Os arquivos antigos da raiz (`app/`, `components/`, `src/`, configs duplicadas etc.) eram do MVP anterior e foram removidos porque **não fazem mais parte da aplicação ativa**.

- Digite "Centro" para buscar por nome
- Digite "Araquari" para buscar por destino

### Favoritos
- Clique na estrela para adicionar/remover
- Verifique se persiste ao recarregar (localStorage)
- Acesse aba "Favoritos" para ver salvos

### Horários
- Clique numa linha para ver detalhes
- Próximas partidas devem estar destacadas
- Horários cheios em vermelho

### Responsividade
- Teste em mobile (640px), tablet (1024px), desktop (1920px)
- Verifique TabBar em mobile
- Botões devem ser clicáveis

## 🚨 Troubleshooting

### Porta 3000 em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Problemas com dependências
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
```

### Hot reload não funciona
- Verifique se arquivo está salvo
- Reinicie servidor: Ctrl+C e `npm run dev`

## 📈 Performance

- Next.js otimiza automaticamente
- Imagens com `next/image` (usar no futuro)
- Componentes lazy loading (usar `React.lazy`)
- CSS crítico inlined automaticamente

## 🔐 Segurança

- Inputs sanitizados
- XSS proteção nativa
- CSRF com Next.js automático
- Environment variables protegidas

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [React Hooks](https://react.dev/reference/react/hooks)

## 🎓 Aprendizado

Conceitos implementados:
- App Router do Next.js
- TypeScript strict mode
- Componentes funcionais com Hooks
- State management com useState/useCallback
- Effects com useEffect
- localStorage API
- Tailwind CSS com @apply
- Responsive design mobile-first
- Acessibilidade web

## 🤖 Melhorias Futuras

### Próximo Sprint
1. Integração com API real
2. Geolocalização
3. Modo offline
4. Testes unitários

### Sprint Seguinte  
1. Mapa com linhas
2. Rotas inteligentes
3. Notificações
4. Dark mode

---

**Última atualização:** 30 de Março de 2026
