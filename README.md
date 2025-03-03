# Evolução Política - Sistema de Gestão de Campanha

Sistema completo para gestão de campanhas políticas, apoiadores, demandas, eventos e apoios políticos.

## Visão Geral

O Evolução Política é uma plataforma web desenvolvida com Next.js, React e TypeScript, projetada para auxiliar candidatos e equipes de campanha na gestão eficiente de todos os aspectos de uma campanha política. O sistema oferece funcionalidades para gerenciar apoiadores, demandas, eventos, apoios políticos e regiões, além de contar com um assistente de IA para análise de dados e geração de conteúdo.

## Funcionalidades Principais

- **Dashboard**: Visão geral da campanha com métricas e indicadores importantes
- **Apoiadores**: Cadastro e gestão de apoiadores, com filtros por cidade, liderança, nível de engajamento e status
- **Demandas**: Controle de solicitações e demandas da população, com categorização e priorização
- **Eventos**: Agendamento e gestão de eventos de campanha, com controle de participantes
- **Apoios Políticos**: Registro e acompanhamento de alianças e apoios políticos
- **Regiões**: Mapeamento de regiões, cidades e bairros com dados demográficos e cobertura da campanha
- **Assistente IA**: Ferramenta de inteligência artificial para análise de dados e geração de conteúdo

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Autenticação, Storage)
- **Integração IA**: OpenAI API
- **Estilização**: TailwindCSS, Lucide Icons
- **Gerenciamento de Estado**: React Hooks

## Estrutura do Projeto

```
src/
├── app/                  # Páginas da aplicação (Next.js App Router)
│   ├── apoiadores/       # Páginas de gestão de apoiadores
│   ├── apoios/           # Páginas de gestão de apoios políticos
│   ├── dashboard/        # Dashboard principal
│   ├── demandas/         # Páginas de gestão de demandas
│   ├── eventos/          # Páginas de gestão de eventos
│   ├── ia/               # Interface do assistente de IA
│   └── regioes/          # Páginas de gestão de regiões
├── components/           # Componentes reutilizáveis
│   ├── charts/           # Componentes de gráficos e visualizações
│   ├── forms/            # Componentes de formulários
│   ├── layout/           # Componentes de layout (Sidebar, Header)
│   └── modals/           # Componentes de modais e diálogos
├── hooks/                # Custom hooks para lógica de negócio
│   ├── useApoiadores.ts  # Hook para gestão de apoiadores
│   ├── useApoiosPoliticos.ts # Hook para gestão de apoios políticos
│   ├── useCandidatos.ts  # Hook para gestão de candidatos
│   ├── useDemandas.ts    # Hook para gestão de demandas
│   ├── useEventos.ts     # Hook para gestão de eventos
│   ├── useIA.ts          # Hook para integração com IA
│   ├── useLiderancas.ts  # Hook para gestão de lideranças
│   └── useRegioes.ts     # Hook para gestão de regiões
└── types/                # Definições de tipos TypeScript
```

## Hooks Implementados

Os hooks são responsáveis pela lógica de negócio e comunicação com o backend:

- **useApoiadores**: Gerencia operações CRUD para apoiadores, com filtros e paginação
- **useApoiosPoliticos**: Gerencia operações CRUD para apoios políticos
- **useCandidatos**: Gerencia operações CRUD para candidatos
- **useDemandas**: Gerencia operações CRUD para demandas, com filtros por status, categoria e prioridade
- **useEventos**: Gerencia operações CRUD para eventos, com funcionalidades para confirmar participação
- **useIA**: Gerencia conversações com o assistente de IA, incluindo histórico de mensagens
- **useLiderancas**: Gerencia operações CRUD para lideranças políticas
- **useRegioes**: Gerencia operações CRUD para regiões, cidades e bairros

## Páginas Implementadas

- **Dashboard**: Visão geral da campanha com cards para acesso rápido às principais funcionalidades
- **Apoiadores**: Lista de apoiadores com filtros e tabela detalhada
- **Demandas**: Lista de demandas com filtros por status, categoria e prioridade
- **Eventos**: Lista de eventos com filtros por status, tipo e local
- **Apoios Políticos**: Lista de apoios políticos com filtros por status e candidato
- **Regiões**: Lista de regiões com filtros por estado e tipo
- **Assistente IA**: Interface de chat para interação com o assistente de IA

## Componentes de Layout

- **Sidebar**: Menu lateral com navegação entre as diferentes seções do sistema
- **ClientHeader**: Cabeçalho com barra de pesquisa, notificações e menu do usuário

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.
