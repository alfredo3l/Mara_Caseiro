-- Script para criar o bucket de fotos de perfil
-- Execute este script no SQL Editor do Supabase

-- Criar bucket para fotos de perfil se não existir
INSERT INTO storage.buckets (id, name, public)
SELECT 'profile-photos', 'profile-photos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-photos');

-- Verificar se o bucket foi criado
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'profile-photos'; 