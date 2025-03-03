# Regras Fundamentais do Projeto

Este documento contém as regras e diretrizes fundamentais que devem ser seguidas durante o desenvolvimento do sistema Evolução Política.

## Arquitetura e Estrutura

1. **Organização de Código**
   - Seguir a estrutura de diretórios definida no projeto
   - Manter componentes reutilizáveis na pasta `components`
   - Implementar lógica de negócio em hooks customizados na pasta `hooks`
   - Definir tipos TypeScript na pasta `types`

2. **Componentes**
   - Dividir componentes grandes em componentes menores e mais específicos
   - Utilizar composição de componentes para reutilização de código
   - Manter componentes com responsabilidade única
   - Implementar componentes como funções (não classes)

3. **Hooks**
   - Implementar lógica de negócio em hooks customizados
   - Seguir o padrão de nomenclatura `use[Entidade]` para hooks
   - Manter hooks com responsabilidade única
   - Implementar tratamento de erros adequado em todos os hooks

## Estilização e UI

1. **TailwindCSS**
   - Utilizar TailwindCSS para estilização
   - Seguir o sistema de design definido no projeto
   - Utilizar variáveis CSS para cores e espaçamentos consistentes
   - Implementar design responsivo para todas as telas

2. **Componentes de UI**
   - Utilizar componentes de UI consistentes em toda a aplicação
   - Seguir as diretrizes de acessibilidade (WCAG)
   - Implementar feedback visual para ações do usuário
   - Manter consistência visual em toda a aplicação

## Performance e Otimização

1. **Renderização**
   - Utilizar memoização (useMemo, useCallback) para otimizar renderização
   - Evitar re-renderizações desnecessárias
   - Implementar lazy loading para componentes grandes
   - Otimizar imagens e assets

2. **Requisições**
   - Implementar cache de dados quando apropriado
   - Utilizar paginação para listas grandes
   - Implementar tratamento de estados de loading e erro
   - Otimizar número de requisições ao backend

## Segurança e Validação

1. **Validação de Dados**
   - Validar dados de entrada em formulários
   - Implementar validação tanto no cliente quanto no servidor
   - Tratar erros de validação com mensagens claras para o usuário
   - Sanitizar dados antes de enviar ao backend

2. **Autenticação e Autorização**
   - Implementar autenticação segura
   - Verificar permissões de usuário para todas as operações
   - Proteger rotas que requerem autenticação
   - Implementar logout automático após inatividade

## Convenções de Código

1. **Nomenclatura**
   - Utilizar camelCase para variáveis, funções e propriedades
   - Utilizar PascalCase para componentes e tipos
   - Utilizar UPPER_CASE para constantes
   - Utilizar nomes descritivos e significativos

2. **Formatação**
   - Utilizar ESLint e Prettier para formatação consistente
   - Manter indentação de 2 espaços
   - Limitar linhas a 100 caracteres
   - Utilizar ponto e vírgula ao final de cada instrução

3. **Comentários**
   - Documentar funções complexas
   - Adicionar comentários para explicar lógica não óbvia
   - Utilizar JSDoc para documentar interfaces e tipos
   - Manter comentários atualizados com o código

## Gerenciamento de Estado

1. **React Hooks**
   - Utilizar useState para estado local
   - Utilizar useReducer para estados complexos
   - Utilizar useContext para estado global quando necessário
   - Evitar prop drilling excessivo

2. **Fluxo de Dados**
   - Manter fluxo de dados unidirecional
   - Passar dados via props de componentes pais para filhos
   - Utilizar callbacks para comunicação de filhos para pais
   - Implementar gerenciamento de estado global apenas quando necessário

## Testes

1. **Testes Unitários**
   - Implementar testes unitários para hooks e funções utilitárias
   - Utilizar Jest para testes unitários
   - Manter cobertura de testes adequada
   - Testar casos de sucesso e erro

2. **Testes de Componentes**
   - Implementar testes para componentes principais
   - Testar interações do usuário
   - Verificar renderização condicional
   - Testar estados de loading e erro

## Integração com Backend

1. **Supabase**
   - Utilizar Supabase para autenticação, banco de dados e storage
   - Implementar queries otimizadas
   - Utilizar RLS (Row Level Security) para segurança
   - Manter consistência nas operações de banco de dados

2. **API**
   - Implementar tratamento de erros para todas as chamadas de API
   - Utilizar tipagem forte para respostas de API
   - Implementar retry para falhas temporárias
   - Manter consistência no formato de requisições e respostas

## Acessibilidade

1. **Diretrizes WCAG**
   - Seguir diretrizes WCAG 2.1 nível AA
   - Implementar navegação por teclado
   - Utilizar atributos ARIA quando necessário
   - Manter contraste adequado para texto

2. **Responsividade**
   - Implementar design responsivo para todas as telas
   - Testar em diferentes tamanhos de tela
   - Otimizar para dispositivos móveis
   - Implementar layout adaptativo

## Versionamento e Deployment

1. **Git**
   - Seguir o fluxo de trabalho Git definido
   - Manter commits pequenos e focados
   - Escrever mensagens de commit descritivas
   - Utilizar branches para features e correções

2. **Deployment**
   - Implementar CI/CD para deployment automático
   - Testar em ambiente de staging antes de produção
   - Implementar rollback para deployments com problemas
   - Monitorar performance e erros em produção 