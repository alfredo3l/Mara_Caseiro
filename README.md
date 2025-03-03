# Plataforma Mara Caseiro

## Resolução de Problemas de Salvamento no Banco de Dados

Este documento contém instruções para resolver problemas relacionados ao salvamento de dados no banco de dados Supabase.

### Problemas Identificados

1. **Colunas Faltantes na Tabela Usuários**:
   - A tabela `usuarios` pode não ter as colunas `telefone` e `foto_url` necessárias para o funcionamento correto do perfil de usuário.

2. **Buckets de Armazenamento Inexistentes**:
   - O bucket `profile-photos` necessário para armazenar fotos de perfil pode não existir no Supabase Storage.

3. **Problemas de Referência de Função**:
   - A função `criarUsuario` pode não estar sendo importada corretamente em alguns componentes.

4. **Erros de Sintaxe em Scripts SQL**:
   - A sintaxe `IF NOT EXISTS` não é suportada para a criação de políticas no PostgreSQL.
   - Podem ocorrer erros de chave duplicada ao tentar criar buckets que já existem.

### Soluções

#### 1. Executar Migrações de Banco de Dados

Execute o script SQL `migration_execute.sql` no SQL Editor do Supabase para adicionar as colunas necessárias:

```sql
-- Adicionar coluna telefone à tabela usuarios (se não existir)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Adicionar coluna foto_url à tabela usuarios (se não existir)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Adicionar coluna ultimo_acesso à tabela usuarios (se não existir)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP WITH TIME ZONE;
```

#### 2. Criar Buckets de Armazenamento (se não existirem)

Se os buckets já existirem, você pode pular esta etapa. Caso contrário, execute o seguinte SQL:

```sql
-- Criar bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public)
SELECT 'profile-photos', 'profile-photos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-photos');
```

#### 3. Configurar Políticas de Acesso

Execute o script SQL `create_policies.sql` para configurar as políticas de acesso para o bucket de fotos de perfil:

```sql
-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir acesso público às fotos de perfil" ON storage.objects;

-- Criar política de acesso público para o bucket de fotos de perfil
CREATE POLICY "Permitir acesso público às fotos de perfil" 
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Criar política para permitir que usuários autenticados façam upload de fotos de perfil
CREATE POLICY "Permitir upload de fotos de perfil para usuários autenticados" 
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');
```

#### 4. Atualizar o Código

As seguintes melhorias foram implementadas no código:

- Adicionada importação correta da função `criarUsuario` no hook `useUsuario`
- Melhorado o tratamento de erros nas funções de upload e remoção de fotos de perfil
- Adicionados logs adicionais para diagnóstico de problemas
- Implementado fallback para usar `auth_id` quando o ID do usuário não é válido

### Verificação

Após executar as migrações e configurar as políticas, verifique se:

1. As colunas `telefone` e `foto_url` existem na tabela `usuarios`
2. O bucket `profile-photos` existe no Supabase Storage
3. As políticas de acesso para o bucket estão configuradas corretamente

### Solução de Problemas Comuns

#### Erro: "duplicate key value violates unique constraint"

Este erro ocorre quando você tenta criar um bucket que já existe. Verifique se o bucket já existe antes de tentar criá-lo:

```sql
SELECT * FROM storage.buckets WHERE id = 'profile-photos';
```

#### Erro: "syntax error at or near 'NOT'"

Este erro ocorre porque a sintaxe `IF NOT EXISTS` não é suportada para a criação de políticas no PostgreSQL. Use `DROP POLICY IF EXISTS` seguido de `CREATE POLICY` em vez disso.

### Suporte

Se os problemas persistirem, verifique os logs do console para identificar erros específicos e entre em contato com o administrador do sistema. 