# Implementação do Sistema de Banco de Dados com Supabase

## Visão Geral

Foi implementado um sistema completo de banco de dados utilizando o Supabase, com suporte para múltiplas organizações através da coluna `organizacao_id` em todas as tabelas. Isso permite que o sistema seja facilmente replicado para diferentes organizações, mantendo os dados isolados.

## Arquivos Criados/Modificados

1. **`supabase/schema.sql`**: Esquema completo do banco de dados com todas as tabelas necessárias para o sistema, incluindo:
   - Tabelas principais (organizacoes, usuarios, candidatos, apoiadores, etc.)
   - Relacionamentos entre tabelas
   - Políticas de segurança (Row Level Security)
   - Índices para otimização de performance
   - Triggers para atualização automática de campos

2. **`src/config/organizacao.ts`**: Arquivo de configuração que armazena o ID da organização atual, permitindo fácil replicação do sistema.

3. **`src/services/supabase.ts`**: Serviço genérico para operações CRUD no Supabase, que:
   - Adiciona automaticamente o filtro de `organizacao_id` em todas as operações
   - Fornece métodos padronizados para todas as tabelas
   - Suporta consultas personalizadas

4. **Hooks atualizados**:
   - `src/hooks/useApoiadores.ts`: Atualizado para usar o novo serviço
   - `src/hooks/useDemandas.ts`: Atualizado para usar o novo serviço
   - `src/hooks/useEventos.ts`: Atualizado para usar o novo serviço

5. **`SUPABASE_README.md`**: Documentação detalhada sobre como configurar e utilizar o sistema de banco de dados.

## Funcionalidades Implementadas

1. **Suporte para Múltiplas Organizações**:
   - Todas as tabelas incluem a coluna `organizacao_id`
   - Filtro automático por organização em todas as operações
   - Configuração centralizada do ID da organização

2. **Operações CRUD Completas**:
   - Criação de registros (Create)
   - Leitura de registros (Read)
   - Atualização de registros (Update)
   - Exclusão de registros (Delete)

3. **Segurança**:
   - Row Level Security (RLS) para garantir isolamento de dados
   - Políticas de acesso baseadas no perfil do usuário
   - Função auxiliar para verificar pertencimento à organização

4. **Otimização**:
   - Índices para campos frequentemente consultados
   - Paginação para consultas com muitos resultados
   - Filtros avançados para consultas específicas

## Como Utilizar

1. **Configuração Inicial**:
   - Criar projeto no Supabase
   - Configurar variáveis de ambiente
   - Executar script de criação do banco de dados

2. **Desenvolvimento**:
   - Utilizar os serviços específicos para cada entidade
   - Utilizar os hooks personalizados para lógica de negócio
   - Seguir o padrão de organização de código

3. **Replicação**:
   - Criar registro na tabela `organizacoes`
   - Atualizar o arquivo `src/config/organizacao.ts`
   - Criar usuários iniciais para a nova organização

## Próximos Passos

1. **Implementar os hooks restantes** para todas as entidades do sistema
2. **Criar interfaces administrativas** para gerenciamento de organizações
3. **Implementar sistema de migração de dados** entre organizações
4. **Adicionar monitoramento e logs** para operações críticas 