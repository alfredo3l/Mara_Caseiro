# Resumo do Projeto - Mapa de Regiões

## Visão Geral

O Mapa de Regiões é um módulo da plataforma de gestão política que permite visualizar e gerenciar regiões geográficas do estado de Mato Grosso do Sul. O sistema utiliza Mapbox para renderização de mapas e pode ser integrado com o Supabase para armazenamento de dados.

## Principais Funcionalidades

- **Visualização de Mapa**: Exibe um mapa interativo com as regiões e municípios de MS
- **Gerenciamento de Regiões**: Permite atribuir coordenadores e personalizar cores das regiões
- **Estatísticas**: Apresenta dados demográficos e estatísticas sobre cada região
- **Integração com Backend**: Suporte para dados mockados (desenvolvimento) ou Supabase (produção)

## Estrutura do Projeto

### Arquivos Principais

- **`.env.local`**: Configurações de ambiente (Supabase e Mapbox)
- **`supabase_schema.sql`**: Esquema do banco de dados para o Supabase
- **`scripts/migrate-to-supabase.js`**: Script para migrar dados para o Supabase
- **`README_MAPA.md`**: Documentação detalhada do módulo de mapa

### Diretórios

- **`src/components`**: Componentes React do mapa
  - `MapBox.tsx`: Componente principal do mapa
  - `RegiaoDetalhes.tsx`: Exibe detalhes da região selecionada
  - `EstatisticasRegiaoModal.tsx`: Modal com estatísticas da região

- **`src/contexts`**: Contextos React
  - `MapaContext.tsx`: Contexto para compartilhar dados do mapa

- **`src/hooks`**: Hooks personalizados
  - `useMapaRegioes.ts`: Hook para carregar e manipular dados do mapa

- **`src/lib`**: Bibliotecas e utilitários
  - `supabase.ts`: Cliente Supabase (real ou mockado)
  - `mockSupabase.ts`: Implementação mockada do cliente Supabase
  - `mockData.ts`: Dados mockados para desenvolvimento

- **`src/types`**: Definições de tipos TypeScript
  - `mapa.ts`: Tipos relacionados ao mapa de regiões

- **`public/data`**: Dados geográficos
  - `municipios_ms.json`: GeoJSON com dados dos municípios
  - `ms_regioes.json`: JSON com dados das regiões

### Páginas

- **`src/app/regioes/mapa/page.tsx`**: Página principal do mapa de regiões

## Fluxo de Dados

1. O contexto `MapaContext` é inicializado na página do mapa
2. O hook `useMapaRegioes` carrega dados do Supabase ou usa dados mockados
3. Os componentes consomem dados do contexto e exibem o mapa e informações
4. Atualizações são enviadas de volta para o Supabase (ou armazenadas localmente)

## Configuração

### Desenvolvimento

Para desenvolvimento local, deixe as variáveis do Supabase vazias no `.env.local` para usar dados mockados:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Adicione seu token do Mapbox:

```
NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_mapbox_aqui
```

### Produção

Para ambiente de produção, configure as variáveis do Supabase com valores reais:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

Execute o script de migração para popular o banco de dados:

```
node scripts/migrate-to-supabase.js
```

## Próximos Passos

- Implementação de gráficos de distribuição populacional
- Adição de mais indicadores demográficos
- Funcionalidade de exportação de relatórios
- Integração com dados em tempo real 