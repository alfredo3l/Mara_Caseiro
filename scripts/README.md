# Scripts de Utilidades

Este diretório contém scripts utilitários para ajudar no desenvolvimento e manutenção do projeto.

## Scripts Disponíveis

### Verificação de Buckets do Supabase

O script `create-buckets.js` verifica se os buckets necessários existem no Supabase e fornece instruções para criá-los manualmente caso não existam.

```bash
node scripts/create-buckets.js
```

#### Requisitos

- Node.js instalado
- Arquivo `.env.local` com as variáveis de ambiente do Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
  - `SUPABASE_SERVICE_ROLE_KEY` (opcional): Chave de serviço do Supabase, necessária para criar buckets automaticamente

#### Buckets Necessários

O script verifica a existência dos seguintes buckets:

1. **profile-photos**: Armazena fotos de perfil dos usuários (público)
   - Limite de tamanho: 2MB
   - Tipos MIME permitidos: image/jpeg, image/png, image/gif, image/webp

2. **documents**: Armazena documentos (privado)
   - Limite de tamanho: 10MB
   - Tipos MIME permitidos: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

3. **media**: Armazena arquivos de mídia (público)
   - Limite de tamanho: 10MB
   - Tipos MIME permitidos: image/jpeg, image/png, image/gif, image/webp, video/mp4, audio/mpeg

#### Criação Manual de Buckets

Se você não tiver a chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`), o script fornecerá instruções detalhadas para criar os buckets manualmente através do painel de administração do Supabase.

## Políticas de Acesso Recomendadas

Para que os buckets funcionem corretamente, configure as seguintes políticas de acesso no painel do Supabase:

### Para buckets públicos (profile-photos, media)

1. **Política de leitura pública**:
   - Nome: `Public Read`
   - Permissão: `SELECT`
   - Definição: `true`

2. **Política de upload para usuários autenticados**:
   - Nome: `Auth Insert`
   - Permissão: `INSERT`
   - Definição: `auth.role() = 'authenticated'`

3. **Política de atualização para proprietários**:
   - Nome: `Owner Update`
   - Permissão: `UPDATE`
   - Definição: `auth.uid() = SPLIT_PART(name, '/', 2)::uuid`

4. **Política de exclusão para proprietários**:
   - Nome: `Owner Delete`
   - Permissão: `DELETE`
   - Definição: `auth.uid() = SPLIT_PART(name, '/', 2)::uuid`

### Para buckets privados (documents)

1. **Política de leitura para proprietários**:
   - Nome: `Owner Read`
   - Permissão: `SELECT`
   - Definição: `auth.uid() = SPLIT_PART(name, '/', 2)::uuid`

2. **Política de upload para usuários autenticados**:
   - Nome: `Auth Insert`
   - Permissão: `INSERT`
   - Definição: `auth.role() = 'authenticated'`

3. **Política de atualização para proprietários**:
   - Nome: `Owner Update`
   - Permissão: `UPDATE`
   - Definição: `auth.uid() = SPLIT_PART(name, '/', 2)::uuid`

4. **Política de exclusão para proprietários**:
   - Nome: `Owner Delete`
   - Permissão: `DELETE`
   - Definição: `auth.uid() = SPLIT_PART(name, '/', 2)::uuid` 