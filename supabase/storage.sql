-- Configuração dos buckets de storage no Supabase
-- Este script deve ser executado no SQL Editor do Supabase

-- Criar buckets para diferentes tipos de arquivos
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'Fotos de perfil dos usuários', true, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('documents', 'Documentos do sistema', true, false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/zip']),
  ('events', 'Arquivos relacionados a eventos', true, false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
  ('demands', 'Arquivos relacionados a demandas', true, false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Função para verificar se o usuário pertence à organização do arquivo
CREATE OR REPLACE FUNCTION storage.belongs_to_organization_file(bucket_id text, name text)
RETURNS boolean AS $$
DECLARE
  org_id text;
  file_org_id text;
BEGIN
  -- Extrair o ID da organização do caminho do arquivo
  -- Formato esperado: {organizacao_id}/[path/]filename
  file_org_id := split_part(name, '/', 1);
  
  -- Verificar se o usuário pertence a esta organização
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.usuarios pu ON u.id = pu.auth_id
    WHERE u.id = auth.uid()
    AND pu.organizacao_id::text = file_org_id
  ) INTO org_id;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para o bucket de fotos de perfil
CREATE POLICY "Usuários podem visualizar fotos de perfil de sua organização"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem fazer upload de suas fotos de perfil"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  storage.belongs_to_organization_file(bucket_id, name) AND
  (name ~ ('^' || auth.uid() || '/') OR name ~ ('/users/' || auth.uid() || '/'))
);

CREATE POLICY "Usuários podem atualizar suas fotos de perfil"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  storage.belongs_to_organization_file(bucket_id, name) AND
  (name ~ ('^' || auth.uid() || '/') OR name ~ ('/users/' || auth.uid() || '/'))
);

CREATE POLICY "Usuários podem excluir suas fotos de perfil"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  storage.belongs_to_organization_file(bucket_id, name) AND
  (name ~ ('^' || auth.uid() || '/') OR name ~ ('/users/' || auth.uid() || '/'))
);

-- Políticas para o bucket de documentos
CREATE POLICY "Usuários podem visualizar documentos de sua organização"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem fazer upload de documentos para sua organização"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem atualizar documentos de sua organização"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem excluir documentos de sua organização"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

-- Políticas para o bucket de eventos
CREATE POLICY "Usuários podem visualizar arquivos de eventos de sua organização"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'events' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem fazer upload de arquivos de eventos para sua organização"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem atualizar arquivos de eventos de sua organização"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'events' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem excluir arquivos de eventos de sua organização"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'events' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

-- Políticas para o bucket de demandas
CREATE POLICY "Usuários podem visualizar arquivos de demandas de sua organização"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'demands' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem fazer upload de arquivos de demandas para sua organização"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'demands' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem atualizar arquivos de demandas de sua organização"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'demands' AND
  storage.belongs_to_organization_file(bucket_id, name)
);

CREATE POLICY "Usuários podem excluir arquivos de demandas de sua organização"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'demands' AND
  storage.belongs_to_organization_file(bucket_id, name)
); 