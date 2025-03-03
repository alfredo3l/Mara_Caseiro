import { createClient } from '@supabase/supabase-js'
import { mockSupabaseClient } from './mockSupabase';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar se estamos usando o cliente real ou o mock
const isUsingMock = !supabaseUrl || !supabaseAnonKey;

// Criar o cliente Supabase (real ou mock)
export const supabase = isUsingMock 
  ? mockSupabaseClient 
  : createClient(supabaseUrl!, supabaseAnonKey!);

// Função para verificar se estamos usando o cliente real ou o mock
export const isRealSupabaseClient = () => !isUsingMock;

// Exibir aviso no console se estiver usando o mock
if (isUsingMock && typeof window !== 'undefined') {
  console.warn(
    '%c[ATENÇÃO] Usando cliente Supabase mockado!',
    'background: #FFA500; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
  );
  console.info(
    '%cPara usar o cliente real, configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local',
    'color: #666; font-style: italic;'
  );
} 