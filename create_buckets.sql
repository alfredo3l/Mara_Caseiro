-- Script para criar buckets no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- Função para criar bucket se não existir
CREATE OR REPLACE FUNCTION create_bucket_if_not_exists(bucket_name text, is_public boolean DEFAULT false)
RETURNS text AS $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Verificar se o bucket já existe
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = bucket_name
  ) INTO bucket_exists;
  
  -- Se não existir, criar o bucket
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (bucket_name, bucket_name, is_public);
    RETURN 'Bucket ' || bucket_name || ' criado com sucesso.';
  ELSE
    RETURN 'Bucket ' || bucket_name || ' já existe.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar buckets necessários (apenas executar se necessário)
-- Comentar estas linhas se os buckets já existirem
-- SELECT create_bucket_if_not_exists('profile-photos', true);
-- SELECT create_bucket_if_not_exists('documents', false);
-- SELECT create_bucket_if_not_exists('events', true);
-- SELECT create_bucket_if_not_exists('demands', false);

-- Função para criar ou substituir políticas
CREATE OR REPLACE FUNCTION create_or_replace_policy(
  policy_name text,
  table_name text,
  schema_name text,
  operation text,
  role_name text,
  using_expr text,
  check_expr text DEFAULT NULL
) RETURNS text AS $$
DECLARE
  policy_exists boolean;
  sql_command text;
BEGIN
  -- Verificar se a política já existe
  SELECT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = schema_name 
      AND tablename = table_name 
      AND policyname = policy_name
  ) INTO policy_exists;
  
  -- Se existir, remover a política
  IF policy_exists THEN
    EXECUTE 'DROP POLICY "' || policy_name || '" ON ' || schema_name || '.' || table_name;
  END IF;
  
  -- Criar a política
  sql_command := 'CREATE POLICY "' || policy_name || '" ON ' || schema_name || '.' || table_name || 
                 ' FOR ' || operation;
  
  -- Adicionar role se especificada
  IF role_name IS NOT NULL AND role_name != '' THEN
    sql_command := sql_command || ' TO ' || role_name;
  END IF;
  
  -- Adicionar expressão USING
  sql_command := sql_command || ' USING (' || using_expr || ')';
  
  -- Adicionar expressão WITH CHECK se fornecida
  IF check_expr IS NOT NULL THEN
    sql_command := sql_command || ' WITH CHECK (' || check_expr || ')';
  END IF;
  
  -- Executar o comando
  EXECUTE sql_command;
  
  RETURN 'Política "' || policy_name || '" criada com sucesso.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar políticas para o bucket de fotos de perfil
SELECT create_or_replace_policy(
  'Permitir acesso público às fotos de perfil',
  'objects',
  'storage',
  'SELECT',
  NULL,
  'bucket_id = ''profile-photos'''
);

SELECT create_or_replace_policy(
  'Permitir upload de fotos de perfil para usuários autenticados',
  'objects',
  'storage',
  'INSERT',
  'authenticated',
  'bucket_id = ''profile-photos''',
  'bucket_id = ''profile-photos'''
);

SELECT create_or_replace_policy(
  'Permitir atualização de fotos de perfil para usuários autenticados',
  'objects',
  'storage',
  'UPDATE',
  'authenticated',
  'bucket_id = ''profile-photos'''
);

SELECT create_or_replace_policy(
  'Permitir exclusão de fotos de perfil para usuários autenticados',
  'objects',
  'storage',
  'DELETE',
  'authenticated',
  'bucket_id = ''profile-photos'''
);

-- Listar buckets existentes
SELECT name, public FROM storage.buckets;

-- Listar políticas existentes para o bucket de fotos de perfil
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND policyname LIKE '%fotos de perfil%'; 