import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svhfleacmjvgkyotkgly.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aGZsZWFjbWp2Z2t5b3RrZ2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDMwMjYsImV4cCI6MjA1NjQxOTAyNn0.HnZ3pftUN6Y4Mo93zCOeQVoSrYFfIyKiq7i3Qs-0zAo';

// Log para debug
console.info(
  '%c[Supabase] Configuração:',
  'background: #3ECF8E; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
  {
    url: supabaseUrl,
    fromEnv: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  }
);

// Criar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para verificar se estamos usando o cliente real
export const isRealSupabaseClient = () => true;

// Log para debug
if (typeof window !== 'undefined') {
  console.info(
    '%c[Supabase] Cliente configurado com sucesso!',
    'background: #3ECF8E; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
  );
} 