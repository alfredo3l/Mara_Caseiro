# Mapa de Regiões - Documentação

Este documento explica como configurar e utilizar o mapa de regiões no sistema de gestão política.

## Configuração Inicial

### 1. Token do Mapbox

Para que o mapa funcione corretamente, é necessário configurar um token do Mapbox:

1. Crie uma conta em [Mapbox](https://account.mapbox.com/)
2. Gere um token de acesso público
3. Adicione o token no arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_mapbox_aqui
```

### 2. Configuração do Supabase

O sistema pode funcionar com dados mockados (para desenvolvimento) ou com uma conexão real ao Supabase:

#### Usando dados mockados (recomendado para desenvolvimento)

Deixe as variáveis do Supabase vazias no arquivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Isso fará com que o sistema use automaticamente os dados mockados, que já incluem regiões, municípios e coordenadores.

#### Usando conexão real ao Supabase

Para conectar a um projeto Supabase real:

1. Crie um projeto no [Supabase](https://supabase.com/)
2. Obtenha a URL e a chave anônima do projeto
3. Adicione essas informações no arquivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Estrutura de Dados

O mapa utiliza dois arquivos GeoJSON principais:

- `/public/geojson/ms_municipios.json`: Contém os dados geográficos dos municípios
- `/public/geojson/ms_regioes.json`: Contém as informações das regiões e coordenadores

## Funcionalidades

### Visualização do Mapa

O mapa exibe os municípios de Mato Grosso do Sul coloridos de acordo com suas regiões. Ao clicar em um município, a região correspondente é selecionada e suas informações são exibidas no painel lateral.

### Gerenciamento de Regiões

No painel lateral, é possível:

- Visualizar informações básicas da região selecionada
- Ver a lista de municípios que compõem a região
- Verificar a população total da região
- Atribuir ou alterar o coordenador responsável pela região
- Editar a cor da região no mapa

### Estatísticas

Ao clicar no botão "Ver Estatísticas", um modal é exibido com informações detalhadas sobre a região:

- Resumo com número de municípios e população total
- Lista completa de municípios com suas respectivas populações
- Distribuição populacional
- Indicadores demográficos (a serem implementados)

## Personalização

### Adicionando Novos Municípios

Para adicionar novos municípios, edite o arquivo `/public/geojson/ms_municipios.json` seguindo o formato:

```json
{
  "type": "Feature",
  "properties": {
    "id": "ID_ÚNICO",
    "nome": "Nome do Município",
    "regiao": "Nome da Região",
    "populacao": 123456,
    "coordenadorId": null
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [longitude1, latitude1],
        [longitude2, latitude2],
        [longitude3, latitude3],
        [longitude4, latitude4],
        [longitude1, latitude1]
      ]
    ]
  }
}
```

### Adicionando Novas Regiões

Para adicionar novas regiões, edite o arquivo `/public/geojson/ms_regioes.json` seguindo o formato:

```json
{
  "regioes": [
    {
      "id": "ID_ÚNICO",
      "nome": "Nome da Região",
      "cor": "#CÓDIGO_HEX_COR",
      "coordenadorId": null,
      "municipios": ["ID_MUNICIPIO1", "ID_MUNICIPIO2"]
    }
  ]
}
```

## Integração com Backend

No ambiente de produção, os dados devem ser carregados do backend através da API. O hook `useMapaRegioes` já está preparado para essa integração, bastando configurar as variáveis de ambiente do Supabase e implementar as tabelas correspondentes.

### Estrutura de Tabelas no Supabase

Para uma integração completa, crie as seguintes tabelas no Supabase:

1. `coordenadores` - Armazena informações sobre os coordenadores
   - `id` (UUID, primary key)
   - `nome` (text, not null)
   - `email` (text, unique)
   - `telefone` (text)
   - `created_at` (timestamp with time zone)
   - `updated_at` (timestamp with time zone)

2. `regioes` - Armazena informações sobre as regiões
   - `id` (UUID, primary key)
   - `nome` (text, not null)
   - `cor` (text, not null, default '#CCCCCC')
   - `coordenador_id` (UUID, foreign key referenciando coordenadores.id)
   - `municipios` (UUID[], array de IDs de municípios)
   - `created_at` (timestamp with time zone)
   - `updated_at` (timestamp with time zone)

3. `municipios` - Armazena informações sobre os municípios
   - `id` (UUID, primary key)
   - `nome` (text, not null)
   - `regiao_id` (UUID, foreign key referenciando regioes.id)
   - `populacao` (integer, default 0)
   - `area` (numeric(10,3), default 0)
   - `coordenadas` (jsonb, para armazenar os dados geográficos)
   - `created_at` (timestamp with time zone)
   - `updated_at` (timestamp with time zone)

Um arquivo SQL com a estrutura completa do banco de dados, incluindo triggers, índices e políticas de segurança (RLS), está disponível em `supabase_schema.sql` na raiz do projeto. Este arquivo pode ser executado diretamente no editor SQL do Supabase para criar toda a estrutura necessária.

#### Políticas de Segurança (RLS)

O esquema inclui políticas de segurança em nível de linha (Row Level Security) que:

- Permitem leitura pública de todas as tabelas
- Restringem a escrita e atualização apenas para usuários autenticados

#### Índices

Para melhorar a performance das consultas, os seguintes índices são criados:

- `idx_regioes_coordenador_id` - Índice na coluna coordenador_id da tabela regioes
- `idx_municipios_regiao_id` - Índice na coluna regiao_id da tabela municipios
- `idx_municipios_nome` - Índice na coluna nome da tabela municipios

#### Triggers

Triggers automáticos são configurados para atualizar o campo `updated_at` sempre que um registro é modificado.

### Migrando de Dados Mockados para o Supabase

Para migrar dos dados mockados para o Supabase:

1. Execute o script SQL `supabase_schema.sql` no editor SQL do Supabase
2. Utilize a API do Supabase para inserir os dados dos arquivos GeoJSON:
   ```typescript
   // Exemplo de código para inserir municípios
   const { data, error } = await supabase
     .from('municipios')
     .insert([
       {
         nome: 'Campo Grande',
         regiao_id: 'id-da-regiao',
         populacao: 906092,
         area: 8092.951,
         coordenadas: { /* dados GeoJSON */ }
       }
     ]);
   ```
3. Atualize as variáveis de ambiente para apontar para seu projeto Supabase

### Script de Migração

Um script de migração está disponível em `scripts/migrate-to-supabase.js` para facilitar a transferência dos dados dos arquivos GeoJSON para o Supabase. Para utilizá-lo:

1. Instale as dependências necessárias:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Configure as variáveis de ambiente:
   ```bash
   export SUPABASE_URL=https://seu-projeto.supabase.co
   export SUPABASE_SERVICE_KEY=sua-chave-de-servico
   ```

3. Execute o script:
   ```bash
   node scripts/migrate-to-supabase.js
   ```

O script irá:
- Limpar as tabelas existentes (opcional)
- Inserir coordenadores de exemplo
- Processar e inserir regiões
- Processar e inserir municípios com seus dados geográficos
- Atualizar as referências entre regiões e municípios

## Arquitetura do Mapa

### Contexto React

O mapa utiliza um contexto React (`MapaContext`) para gerenciar o estado global e compartilhar dados entre componentes. O contexto é implementado em `src/contexts/MapaContext.tsx` e fornece:

- Dados de regiões, municípios e coordenadores
- Estado de seleção (região e município selecionados)
- Funções para atualizar cores e coordenadores
- Cálculo de estatísticas de regiões

Para usar o contexto em um componente:

```tsx
import { useMapaContext } from '@/contexts/MapaContext';

function MeuComponente() {
  const { regioes, municipios, selectedRegiao } = useMapaContext();
  
  // Seu código aqui
}
```

### Tipos TypeScript

Os tipos utilizados no mapa estão definidos em `src/types/mapa.ts` e incluem:

- `Regiao` - Estrutura de uma região
- `Municipio` - Estrutura de um município
- `Coordenador` - Estrutura de um coordenador
- `EstatisticasRegiao` - Estatísticas calculadas para uma região
- Tipos para props de componentes

### Hook de Dados

O hook `useMapaRegioes` em `src/hooks/useMapaRegioes.ts` é responsável por:

- Carregar dados do Supabase (ou usar dados mockados)
- Fornecer funções para atualizar dados
- Gerenciar estados de carregamento e erro

Este hook é utilizado pelo contexto para fornecer dados a toda a aplicação.

## Troubleshooting

### Mapa não carrega

- Verifique se o token do Mapbox está configurado corretamente
- Certifique-se de que os arquivos GeoJSON estão no formato correto
- Verifique se há erros no console do navegador

### Dados não aparecem

- Verifique se os IDs dos municípios nas regiões correspondem aos IDs nos dados dos municípios
- Certifique-se de que as coordenadas geográficas estão corretas

### Erro "Failed to construct 'URL': Invalid URL"

Este erro pode ocorrer quando:
- As variáveis de ambiente do Supabase estão configuradas incorretamente
- A URL do Supabase não é uma URL válida

Solução:
- Deixe as variáveis vazias para usar o cliente mockado
- Ou configure URLs válidas para o Supabase

## Próximos Passos

- Implementação de gráficos de distribuição populacional
- Adição de mais indicadores demográficos
- Funcionalidade de exportação de relatórios
- Integração com dados em tempo real 