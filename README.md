# 🚍 Cityline

![Status](https://img.shields.io/badge/status-em%20desenvolvimento%20avancado-f4b400?style=for-the-badge)
![Backend](https://img.shields.io/badge/backend-funcional-34a853?style=for-the-badge)
![Mapa](https://img.shields.io/badge/mapa-integrado-1a73e8?style=for-the-badge)
![Dados](https://img.shields.io/badge/dados-em%20consolidacao-fbbc05?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-111111?style=for-the-badge&logo=nextdotjs)
![Node.js](https://img.shields.io/badge/Node.js-Express-2d6a4f?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-2d3748?style=for-the-badge&logo=prisma)

## 📌 Visão Geral

O **Cityline** é uma aplicação de mobilidade urbana criada para centralizar informações de transporte público em uma experiência visual mais clara, moderna e escalável.

O projeto integra dados de:

- ônibus urbano
- ônibus intermunicipal
- ferry boat

Hoje, o Cityline já conecta **frontend + backend + banco + mapa**, e está evoluindo para um fluxo mais realista de dados, com **coleta manual, normalização e importação estruturada**.

O foco do projeto é construir uma base sólida para algo que possa crescer como produto real, priorizando:

- escalabilidade
- organização de dados
- arquitetura desacoplada
- integração com fontes reais
- experiência do usuário

## 🎯 Objetivo do Projeto

O objetivo do Cityline é permitir que o usuário visualize:

- linhas disponíveis
- sentidos de cada linha
- paradas reais
- horários por direção
- rotas em mapa interativo
- favoritos e localizações salvas

Além disso, o projeto está sendo preparado para evoluir para recursos mais avançados, como:

- recomendação da melhor parada
- reaproveitamento global de paradas entre linhas
- expansão para mais cidades
- atualização dinâmica de dados

## 🧱 Stack Utilizada

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Leaflet / React Leaflet

### Backend

- Node.js
- Express
- TypeScript
- Zod

### Banco e Dados

- Prisma
- SQLite
- manifests `collected`
- datasets `normalized`

### Qualidade

- Vitest
- Testing Library
- ESLint

## ✅ O Que Já Foi Implementado

### 🧠 Backend estruturado

- API REST para transporte já funcional
- endpoints para linhas, sentidos, paradas, horários e path de rota
- validação com Zod
- respostas padronizadas
- estrutura preparada para múltiplos modos de transporte

Principais endpoints:

- `GET /lines`
- `GET /lines/:id`
- `GET /lines/:id/directions`
- `GET /lines/:id/directions/:directionId/stops`
- `GET /lines/:id/directions/:directionId/schedules`
- `GET /lines/:id/directions/:directionId/path`

### 🗄️ Modelagem de dados em nível mais profissional

- separação clara entre linha, direção, parada, horário, tarifa e rota
- uso de IDs determinísticos e normalizados
- estratégia de importação por manifests
- upsert de registros para evitar duplicações
- suporte ao domínio de transporte no Prisma

Entidades principais já modeladas:

- `TransportLine`
- `RouteDirection`
- `Stop`
- `LineStop`
- `Schedule`
- `Fare`
- `RoutePath`
- `StopTimePrediction`

### 🔄 Pipeline de ingestão de dados

O projeto deixou de depender apenas de seed manual e já possui uma pipeline de ingestão em andamento:

- `collected` → arquivos coletados manualmente
- `normalized` → dataset canônico
- `database` → importação estruturada para o Prisma

Isso já permite:

- validar manifests com schema
- normalizar dados coletados
- importar conjuntos de dados sem duplicação
- preparar expansão para novas linhas e cidades

### 🗺️ Integração com mapa

- mapa funcional com Leaflet
- renderização de paradas reais
- popup com informações da parada
- path dinâmico da rota via backend
- `fitBounds` para ajuste automático de foco
- fallback quando faltam dados

O mapa já responde a:

- linha selecionada
- direção selecionada
- dados retornados pela API

### 🔌 Integração real entre frontend e backend

- remoção da dependência principal de mocks para a visualização das linhas
- consumo real da API
- frontend desacoplado do backend
- hooks e serviços separados por responsabilidade

### 👤 Base para autenticação e personalização

Já existe estrutura para:

- autenticação
- favoritos
- localizações salvas
- recomendação operacional de embarque com base na direção ativa

## 📍 Dados Reais em Construção

Uma das partes mais importantes do Cityline hoje é a consolidação de dados reais.

O projeto já possui coleta iniciada para **São Francisco do Sul**, incluindo:

- linha `0100` da Verdes Mares
- dados de ferry boat
- arquivos `collected` e `normalized` no backend

Essa etapa inclui:

- ajuste fino de coordenadas
- revisão da posição das paradas
- melhoria da aderência entre paradas e path da rota
- consolidação dos identificadores das entidades

## 🧩 Decisões Arquiteturais Importantes

Algumas decisões de arquitetura já foram tomadas para evitar retrabalho no futuro:

- separação entre frontend, backend e camada compartilhada
- domínio de transporte independente da interface
- preparo para reutilização de paradas entre múltiplas linhas
- suporte a ônibus urbano, intermunicipal e ferry no mesmo sistema
- fallback local quando o banco não estiver disponível

Essas decisões deixam o projeto pronto para crescer sem precisar refazer a base.

## ⚠️ Problemas Já Identificados

Durante a evolução do projeto, alguns problemas apareceram e já foram total ou parcialmente tratados:

- paradas desalinhadas com a rota
- duplicação de paradas
- dependência excessiva de dados mockados
- rotas sem aderência visual às ruas
- inconsistências entre IDs antigos e IDs canônicos

Boa parte disso já foi mitigada com:

- coordenadas reais
- estratégia de ID estável
- importação normalizada
- backend servindo path e stops reais

## 🚧 O Que Ainda Falta Implementar

### 🗺️ Mapa

- melhorar a precisão total das paradas
- revisar integralmente a linha `0100`
- destacar visualmente linha ativa e direção ativa
- evoluir zoom, foco e interação do mapa

### 🔁 Reutilização de paradas

- implementar reaproveitamento real de `stops` entre múltiplas linhas
- padronizar IDs globais de paradas
- evitar duplicações no banco em cenário de escala

### 🧠 Inteligência de rota

- cálculo da melhor parada para o usuário
- recomendação baseada em distância e tempo de caminhada
- recomendação considerando o próximo horário disponível
- futuro suporte para conexão entre linhas

### ⏱️ Tempo real

- integração com API oficial, se disponível
- ou simulação de tempo real
- atualização dinâmica no mapa

### 👤 Experiência do usuário

- evolução do fluxo de login
- preferências do usuário
- histórico de rotas
- recursos desbloqueados por autenticação

### 📊 Dashboard e UX

- melhoria do layout geral
- refinamento da exibição de horários
- feedback visual mais claro
- estados de carregamento melhores
- melhoria de performance em transições e filtros

### 📦 Escala do sistema

- adicionar novas linhas
- adicionar transporte intermunicipal com mais profundidade
- completar o ferry boat com dados mais robustos
- preparar expansão para mais cidades

## 🎯 Próximos Passos Imediatos

- finalizar a linha `0100`
- validar o mapa com dados reais revisados
- iniciar a segunda linha como teste de escala
- implementar melhor reaproveitamento de paradas
- evoluir a UX do mapa

## 💡 Diferenciais do Projeto

- integração com dados reais, não apenas mockados
- backend desacoplado e preparado para escalar
- modelagem de domínio mais madura
- arquitetura preparada para múltiplos tipos de transporte
- base pronta para crescer em direção a tempo real e múltiplas cidades
- projeto com potencial de produto real

## 🚀 Status Atual

- 🟡 Em desenvolvimento avançado
- 🟢 Backend funcional
- 🟢 Mapa integrado
- 🟡 Dados em fase de consolidação
- 🔜 Escala e inteligência de rota

## 🕰️ Histórico do Projeto

### Fase 1

O projeto começou como uma aplicação voltada para visualização de linhas e horários, com foco em montar a experiência base de transporte urbano.

### Fase 2

Depois disso, a arquitetura foi evoluindo para separar melhor:

- frontend
- backend
- domínio compartilhado
- persistência com Prisma

### Fase 3

Com a base estabilizada, o foco passou a ser a substituição de dados mockados por dados mais realistas, incluindo:

- rotas dinâmicas
- paradas reais
- integração com mapa
- estrutura de ingestão

### Fase Atual

Hoje, o Cityline está na fase de consolidação dos dados reais e preparação para escala, especialmente na linha `0100` e na expansão do fluxo `collected → normalized → database`.

## 🔮 Futuro de Aprimorações

O projeto ainda está em desenvolvimento e a ideia é continuar evoluindo em várias frentes:

- consolidar uma base de dados mais confiável
- permitir reutilização global de paradas
- melhorar a inteligência do sistema para recomendação de embarque
- ampliar a cobertura para mais linhas e cidades
- estudar integração com dados mais próximos de tempo real
- transformar o Cityline em um case cada vez mais forte de produto + arquitetura + dados

## ⚙️ Como Rodar o Projeto

### Instalação

```bash
npm install
```

### Rodar frontend e backend

```bash
npm run dev
```

### Rodar somente o frontend

```bash
npm run dev:frontend
```

### Rodar somente o backend

```bash
npm run dev:backend
```

### Banco e ingestão

```bash
npm run db:generate --workspace @cityline/backend
npm run db:push --workspace @cityline/backend
npm run db:seed --workspace @cityline/backend
npm run ingestion:normalize --workspace @cityline/backend -- --input data/collected
npm run ingestion:import --workspace @cityline/backend -- --input data/normalized
```

### Qualidade

```bash
npm run type-check
npm run lint
npm run test
```

## 📁 Estrutura Principal

```text
cityline-main/
|-- apps/
|   |-- backend/
|   |   |-- data/
|   |   |-- prisma/
|   |   `-- src/
|   `-- frontend/
|       |-- app/
|       |-- features/
|       |-- hooks/
|       |-- services/
|       `-- components/
|-- packages/
|   `-- shared/
|-- README.md
`-- package.json
```

## 📬 Contato

Se quiser acompanhar minha evolução ou entrar em contato:

- GitHub: [github.com/Luanagroth](https://github.com/Luanagroth)
- LinkedIn: [linkedin.com/in/luana-groth](https://www.linkedin.com/in/luana-groth/)

---

Feito com foco em evolução real de produto, arquitetura e dados. Este projeto continua em desenvolvimento.
