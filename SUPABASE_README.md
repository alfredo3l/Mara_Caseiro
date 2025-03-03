# Configuração do Banco de Dados Supabase

Este documento explica como configurar e utilizar o banco de dados Supabase no sistema Evolução Política.

## Visão Geral

O sistema utiliza o Supabase como backend, aproveitando seus recursos de:
- Banco de dados PostgreSQL
- Autenticação de usuários
- Armazenamento de arquivos
- Segurança com Row Level Security (RLS)

Todas as tabelas do sistema incluem uma coluna `organizacao_id` para permitir a replicação do sistema para diferentes organizações.

## Estrutura do Banco de Dados

O esquema completo do banco de dados está definido no arquivo `supabase/schema.sql`. As principais tabelas são:

- **organizacoes**: Armazena informações sobre as organizações que utilizam o sistema
- **usuarios**: Usuários do sistema com seus perfis e permissões
- **permissoes**: Permissões de acesso por perfil
- **candidatos**: Candidatos políticos
- **liderancas**: Lideranças políticas
- **apoiadores**: Apoiadores da campanha
- **demandas**: Demandas e solicitações
- **eventos**: Eventos da campanha
- **documentos**: Documentos do sistema
- **regioes**: Regiões geográficas
- **municipios**: Municípios

Cada tabela possui índices otimizados para consultas frequentes e triggers para atualização automática do campo `updated_at`.

## Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a URL e a chave anônima do projeto

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Executar o Script de Criação do Banco de Dados

1. Acesse o Editor SQL no painel do Supabase
2. Copie e cole o conteúdo do arquivo `supabase/schema.sql`
3. Execute o script

## Configuração da Organização

O sistema está preparado para ser replicado para diferentes organizações. A configuração da organização atual é feita no arquivo `src/config/organizacao.ts`.

Para alterar a organização, edite a constante `ORGANIZACAO_ID` neste arquivo:

```typescript
// ID da organização atual
export const ORGANIZACAO_ID = "sua_organizacao_id";
```

O arquivo também fornece funções úteis:

```typescript
// Obtém o ID da organização atual
export const getOrganizacaoId = () => {
  return ORGANIZACAO_ID;
};

// Verifica se um ID de organização corresponde à organização atual
export const pertenceOrganizacaoAtual = (organizacaoId: string) => {
  return organizacaoId === ORGANIZACAO_ID;
};
```

## Serviços de Acesso ao Banco de Dados

O sistema utiliza uma camada de serviços para acessar o banco de dados, definida em `src/services/supabase.ts`. Esta camada:

1. Adiciona automaticamente o filtro de `organizacao_id` em todas as operações
2. Fornece métodos CRUD padronizados para todas as tabelas
3. Permite consultas personalizadas quando necessário

### Classe SupabaseService

A classe `SupabaseService` fornece uma interface genérica para operações CRUD:

```typescript
export class SupabaseService {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  // Métodos disponíveis:
  async getAll<T>(options): Promise<{ data: T[]; count: number }>
  async getById<T>(id: string, select?: string): Promise<T | null>
  async create<T>(data: Partial<T>): Promise<T>
  async update<T>(id: string, data: Partial<T>): Promise<T>
  async delete(id: string): Promise<boolean>
  async customQuery<T>(queryBuilder): Promise<T>
}
```

### Filtros Avançados

O método `getAll` suporta filtros avançados:

```typescript
// Filtros simples
const { data } = await service.getAll({
  filters: { status: 'Ativo', regiao_id: '123' }
});

// Filtros avançados
const { data } = await service.getAll({
  filters: {
    nome: { like: 'João' },  // Busca por ILIKE %João%
    idade: { gt: 18 },       // Maior que 18
    pontos: { lte: 100 },    // Menor ou igual a 100
    tags: { contains: ['importante'] }  // Contém o valor no array
  }
});
```

### Paginação e Ordenação

```typescript
// Paginação
const { data, count } = await service.getAll({
  page: 2,
  pageSize: 20
});

// Ordenação
const { data } = await service.getAll({
  orderBy: 'nome',
  orderDirection: 'asc'
});
```

### Exemplo de Uso Completo

```typescript
import { apoiadoresService } from '@/services/supabase';
import { Apoiador } from '@/types/apoiador';

// Buscar apoiadores com filtros, paginação e ordenação
const { data, count } = await apoiadoresService.getAll<Apoiador>({
  page: 1,
  pageSize: 10,
  orderBy: 'nome',
  orderDirection: 'asc',
  filters: {
    status: 'Ativo',
    lideranca_id: '123',
    nome: { like: 'Silva' }
  },
  select: 'id, nome, telefone, email, lideranca_id'
});

// Buscar um apoiador específico
const apoiador = await apoiadoresService.getById<Apoiador>('id_do_apoiador');

// Criar um novo apoiador
const novoApoiador = await apoiadoresService.create<Apoiador>({
  nome: 'Nome do Apoiador',
  telefone: '(67) 99999-9999',
  email: 'apoiador@exemplo.com',
  lideranca_id: '123',
  status: 'Ativo'
});

// Atualizar um apoiador
const apoiadorAtualizado = await apoiadoresService.update<Apoiador>(
  'id_do_apoiador',
  { 
    nome: 'Novo Nome',
    status: 'Inativo'
  }
);

// Excluir um apoiador
const sucesso = await apoiadoresService.delete('id_do_apoiador');

// Consulta personalizada
const resultado = await apoiadoresService.customQuery<Apoiador[]>(
  (query, organizacaoId) => {
    return query
      .from('apoiadores')
      .select('*, liderancas(nome)')
      .eq('organizacao_id', organizacaoId)
      .eq('status', 'Ativo')
      .order('nome');
  }
);
```

## Hooks Personalizados

Os hooks personalizados em `src/hooks` utilizam os serviços para fornecer funcionalidades específicas para cada entidade do sistema:

- **useApoiadores**: Gerencia operações CRUD para apoiadores
- **useDemandas**: Gerencia operações CRUD para demandas
- **useEventos**: Gerencia operações CRUD para eventos
- **useCandidatos**: Gerencia operações CRUD para candidatos
- **useRegioes**: Gerencia operações CRUD para regiões
- E outros...

### Estrutura Padrão dos Hooks

Cada hook segue uma estrutura padrão:

```typescript
export function useEntidade() {
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Função para buscar entidades com filtros, paginação e ordenação
  const fetchEntidades = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filters = {},
    orderConfig = { column: 'nome', direction: 'asc' }
  ) => { /* ... */ };

  // Função para buscar uma entidade por ID
  const getEntidadeById = async (id: string) => { /* ... */ };

  // Função para criar uma nova entidade
  const createEntidade = async (entidade: Omit<Entidade, 'id' | 'organizacaoId'>) => { /* ... */ };

  // Função para atualizar uma entidade
  const updateEntidade = async (id: string, updates: Partial<Entidade>) => { /* ... */ };

  // Função para excluir uma entidade
  const deleteEntidade = async (id: string) => { /* ... */ };

  // Funções específicas da entidade
  // ...

  return {
    entidades,
    loading,
    error,
    totalCount,
    fetchEntidades,
    getEntidadeById,
    createEntidade,
    updateEntidade,
    deleteEntidade,
    // Outras funções específicas
  };
}
```

### Exemplo de Uso do Hook useApoiadores

```tsx
import { useApoiadores } from '@/hooks/useApoiadores';
import { useState, useEffect } from 'react';

function ApoiadoresPage() {
  const { 
    apoiadores, 
    loading, 
    error, 
    totalCount, 
    fetchApoiadores,
    createApoiador,
    updateApoiador,
    deleteApoiador
  } = useApoiadores();
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'Ativo' });
  
  useEffect(() => {
    fetchApoiadores(page, perPage, searchTerm, filters);
  }, [page, perPage, searchTerm, filters]);

  const handleCreate = async () => {
    try {
      await createApoiador({
        nome: 'Novo Apoiador',
        telefone: '(67) 99999-9999',
        email: 'novo@exemplo.com',
        status: 'Ativo'
      });
      // Recarregar a lista após criar
      fetchApoiadores(page, perPage, searchTerm, filters);
    } catch (err) {
      console.error('Erro ao criar apoiador:', err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateApoiador(id, { status: 'Inativo' });
      // Recarregar a lista após atualizar
      fetchApoiadores(page, perPage, searchTerm, filters);
    } catch (err) {
      console.error('Erro ao atualizar apoiador:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este apoiador?')) {
      try {
        await deleteApoiador(id);
        // Recarregar a lista após excluir
        fetchApoiadores(page, perPage, searchTerm, filters);
      } catch (err) {
        console.error('Erro ao excluir apoiador:', err);
      }
    }
  };

  return (
    <div>
      <h1>Apoiadores</h1>
      
      <div className="filters">
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Buscar apoiadores..." 
        />
        <button onClick={() => fetchApoiadores(page, perPage, searchTerm, filters)}>
          Buscar
        </button>
        <button onClick={handleCreate}>Novo Apoiador</button>
      </div>
      
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>Erro: {error}</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {apoiadores.map(apoiador => (
                <tr key={apoiador.id}>
                  <td>{apoiador.nome}</td>
                  <td>{apoiador.telefone}</td>
                  <td>{apoiador.email}</td>
                  <td>{apoiador.status}</td>
                  <td>
                    <button onClick={() => handleUpdate(apoiador.id)}>Editar</button>
                    <button onClick={() => handleDelete(apoiador.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination">
            <span>Total: {totalCount} apoiadores</span>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span>Página {page}</span>
            <button 
              disabled={page * perPage >= totalCount} 
              onClick={() => setPage(p => p + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Exemplo de Uso do Hook useDemandas

```tsx
import { useDemandas } from '@/hooks/useDemandas';
import { useEffect } from 'react';

function DemandasPage() {
  const { 
    demandas, 
    loading, 
    error, 
    fetchDemandas,
    createDemanda,
    updateDemanda,
    adicionarAtualizacao,
    getDemandasPorStatus
  } = useDemandas();
  
  useEffect(() => {
    // Buscar demandas com status 'Pendente' ou 'Em Andamento'
    fetchDemandas(1, 20, '', {
      status: ['Pendente', 'Em Andamento']
    });
    
    // Alternativamente, buscar estatísticas por status
    getDemandasPorStatus().then(estatisticas => {
      console.log('Estatísticas de demandas:', estatisticas);
    });
  }, []);
  
  const handleNovaDemanda = async () => {
    await createDemanda({
      titulo: 'Nova demanda',
      descricao: 'Descrição da demanda',
      solicitante_id: 'id_do_solicitante',
      responsavel_id: 'id_do_responsavel',
      prioridade: 'Média',
      status: 'Pendente'
    });
  };
  
  const handleAdicionarAtualizacao = async (demandaId: string) => {
    await adicionarAtualizacao(
      demandaId,
      'id_do_usuario',
      'Comentário sobre a atualização',
      'Em Andamento' // Novo status
    );
  };
  
  // Resto do componente...
}
```

### Exemplo de Uso do Hook useEventos

```tsx
import { useEventos } from '@/hooks/useEventos';
import { useEffect } from 'react';

function EventosPage() {
  const { 
    eventos, 
    loading, 
    error, 
    fetchEventos,
    getEventoById,
    createEvento,
    adicionarParticipante,
    confirmarParticipacao,
    getEventosPorPeriodo
  } = useEventos();
  
  useEffect(() => {
    // Buscar eventos futuros
    const hoje = new Date().toISOString().split('T')[0];
    fetchEventos(1, 20, '', {
      data_inicio: { gte: hoje }
    }, { column: 'data_inicio', direction: 'asc' });
    
    // Buscar eventos por período
    const dataInicio = '2023-01-01';
    const dataFim = '2023-12-31';
    getEventosPorPeriodo(dataInicio, dataFim).then(eventosPeriodo => {
      console.log('Eventos no período:', eventosPeriodo);
    });
  }, []);
  
  const handleNovoEvento = async () => {
    await createEvento({
      titulo: 'Novo evento',
      descricao: 'Descrição do evento',
      local: 'Local do evento',
      data_inicio: '2023-06-15T14:00:00',
      data_fim: '2023-06-15T16:00:00',
      status: 'Agendado',
      responsavel_id: 'id_do_responsavel'
    });
  };
  
  const handleAdicionarParticipante = async (eventoId: string) => {
    await adicionarParticipante(
      eventoId,
      'id_do_participante',
      'apoiador', // Tipo: apoiador, lideranca, candidato
      false // Não confirmado inicialmente
    );
  };
  
  // Resto do componente...
}
```

## Segurança

O sistema utiliza Row Level Security (RLS) do Supabase para garantir que cada organização tenha acesso apenas aos seus próprios dados. As políticas de segurança estão definidas no arquivo `supabase/schema.sql`.

### Função de Verificação de Organização

O sistema utiliza uma função auxiliar para verificar se um usuário pertence a uma organização:

```sql
CREATE OR REPLACE FUNCTION auth.user_belongs_to_organization(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  belongs BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.usuarios pu ON u.id = pu.auth_id
    WHERE u.id = auth.uid()
    AND pu.organizacao_id = org_id
  ) INTO belongs;
  
  RETURN belongs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Políticas RLS

Cada tabela possui políticas RLS que garantem que os usuários só possam acessar dados de sua própria organização:

```sql
-- Exemplo de política para a tabela apoiadores
ALTER TABLE apoiadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY apoiadores_select_policy ON apoiadores
  FOR SELECT
  USING (auth.user_belongs_to_organization(organizacao_id));

CREATE POLICY apoiadores_insert_policy ON apoiadores
  FOR INSERT
  WITH CHECK (auth.user_belongs_to_organization(organizacao_id));

CREATE POLICY apoiadores_update_policy ON apoiadores
  FOR UPDATE
  USING (auth.user_belongs_to_organization(organizacao_id));

CREATE POLICY apoiadores_delete_policy ON apoiadores
  FOR DELETE
  USING (auth.user_belongs_to_organization(organizacao_id));
```

## Índices para Otimização

O sistema utiliza índices para otimizar as consultas mais frequentes:

```sql
-- Índices para a tabela apoiadores
CREATE INDEX idx_apoiadores_organizacao_id ON apoiadores(organizacao_id);
CREATE INDEX idx_apoiadores_lideranca_id ON apoiadores(lideranca_id);

-- Índices para a tabela demandas
CREATE INDEX idx_demandas_organizacao_id ON demandas(organizacao_id);
CREATE INDEX idx_demandas_status ON demandas(status);

-- Índices para a tabela eventos
CREATE INDEX idx_eventos_organizacao_id ON eventos(organizacao_id);
CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_status ON eventos(status);
```

## Replicação para Novas Organizações

Para replicar o sistema para uma nova organização:

1. Crie um registro na tabela `organizacoes` no Supabase:
   ```sql
   INSERT INTO organizacoes (nome, descricao, logo_url, status)
   VALUES ('Nome da Organização', 'Descrição', 'https://url-do-logo.png', 'Ativo')
   RETURNING id;
   ```

2. Atualize o arquivo `src/config/organizacao.ts` com o novo ID:
   ```typescript
   export const ORGANIZACAO_ID = "id_retornado_no_passo_anterior";
   ```

3. Crie os usuários iniciais para a nova organização:
   ```sql
   -- Primeiro crie o usuário no auth do Supabase
   -- Depois associe à organização:
   INSERT INTO usuarios (
     auth_id, nome, email, telefone, perfil, status, organizacao_id
   ) VALUES (
     'auth_id_do_usuario', 'Nome do Usuário', 'email@exemplo.com',
     '(67) 99999-9999', 'admin', 'Ativo', 'id_da_organizacao'
   );
   ```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com o Supabase**:
   - Verifique se as variáveis de ambiente estão configuradas corretamente
   - Verifique se o projeto Supabase está ativo
   - Teste a conexão com um endpoint simples:
     ```typescript
     const { data, error } = await supabase.from('organizacoes').select('count()');
     console.log('Teste de conexão:', data, error);
     ```

2. **Erro de permissão**:
   - Verifique se o usuário tem as permissões necessárias
   - Verifique se as políticas RLS estão configuradas corretamente
   - Verifique se o usuário está autenticado:
     ```typescript
     const { data: { user } } = await supabase.auth.getUser();
     console.log('Usuário atual:', user);
     ```

3. **Dados não aparecem**:
   - Verifique se o `organizacao_id` está configurado corretamente
   - Verifique se os dados foram inseridos com o `organizacao_id` correto
   - Faça uma consulta direta para verificar:
     ```typescript
     const { data, error } = await supabase
       .from('tabela')
       .select('*')
       .eq('organizacao_id', getOrganizacaoId());
     console.log('Dados brutos:', data, error);
     ```

4. **Erros nos hooks**:
   - Verifique se os tipos estão corretamente definidos
   - Verifique se os nomes das colunas no banco correspondem aos campos nos tipos
   - Adicione logs para depurar:
     ```typescript
     console.log('Parâmetros da consulta:', { page, perPage, filters });
     console.log('Resultado da consulta:', data, error);
     ```

5. **Problemas de performance**:
   - Verifique se os índices estão criados corretamente
   - Utilize a paginação para limitar o número de registros retornados
   - Selecione apenas os campos necessários:
     ```typescript
     const { data } = await service.getAll({
       select: 'id, nome, email', // Apenas os campos necessários
       page: 1,
       pageSize: 20
     });
     ```

## Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Referência da API do PostgreSQL](https://www.postgresql.org/docs/current/index.html) 