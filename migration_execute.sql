-- Script de migração para adicionar colunas necessárias à tabela usuarios
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna telefone à tabela usuarios (se não existir)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Adicionar coluna foto_url à tabela usuarios (se não existir)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Adicionar coluna ultimo_acesso à tabela usuarios (se não existir)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN public.usuarios.telefone IS 'Número de telefone do usuário';
COMMENT ON COLUMN public.usuarios.foto_url IS 'URL da foto de perfil do usuário';
COMMENT ON COLUMN public.usuarios.ultimo_acesso IS 'Data e hora do último acesso do usuário';

-- Verificar se as colunas foram adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'usuarios'
  AND column_name IN ('telefone', 'foto_url', 'ultimo_acesso'); 