-- Script para criar políticas de acesso para o bucket de fotos de perfil
-- Execute este script no SQL Editor do Supabase

-- Verificar se o bucket existe antes de criar as políticas
DO $$
DECLARE
  bucket_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profile-photos'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    RAISE EXCEPTION 'O bucket profile-photos não existe. Crie o bucket antes de configurar as políticas.';
  END IF;
END $$;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir acesso público às fotos de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos de perfil para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de fotos de perfil para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de fotos de perfil para usuários autenticados" ON storage.objects;

-- Criar política de acesso público para o bucket de fotos de perfil
CREATE POLICY "Permitir acesso público às fotos de perfil" 
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Criar política para permitir que usuários autenticados façam upload de fotos de perfil
CREATE POLICY "Permitir upload de fotos de perfil para usuários autenticados" 
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

-- Criar política para permitir que usuários autenticados atualizem suas próprias fotos de perfil
CREATE POLICY "Permitir atualização de fotos de perfil para usuários autenticados" 
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos');

-- Criar política para permitir que usuários autenticados excluam suas próprias fotos de perfil
CREATE POLICY "Permitir exclusão de fotos de perfil para usuários autenticados" 
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');

-- Listar políticas criadas
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND policyname LIKE '%fotos de perfil%'; 