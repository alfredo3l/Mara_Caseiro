-- Adicionar coluna telefone à tabela usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Adicionar coluna foto_url à tabela usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Adicionar coluna ultimo_acesso à tabela usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN public.usuarios.telefone IS 'Número de telefone do usuário';
COMMENT ON COLUMN public.usuarios.foto_url IS 'URL da foto de perfil do usuário';
COMMENT ON COLUMN public.usuarios.ultimo_acesso IS 'Data e hora do último acesso do usuário'; 