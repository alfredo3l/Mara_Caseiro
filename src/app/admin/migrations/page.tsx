'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function MigracoesPage() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { user, loading } = useAuthContext();
  const router = useRouter();

  // Verificar se o usuário é admin
  const isAdmin = user?.user_metadata?.perfil === 'super_admin' || user?.user_metadata?.perfil === 'admin';

  // Redirecionar se não for admin
  if (!loading && (!user || !isAdmin)) {
    router.push('/');
    return null;
  }

  const executarMigracao = async () => {
    setIsExecuting(true);
    setResult(null);

    try {
      // Adicionar coluna telefone
      const { error: errorTelefone } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;'
      });

      if (errorTelefone) {
        console.error('Erro ao adicionar coluna telefone:', errorTelefone);
        setResult({
          success: false,
          message: `Erro ao adicionar coluna telefone: ${errorTelefone.message}`
        });
        return;
      }

      // Adicionar coluna foto_url
      const { error: errorFotoUrl } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;'
      });

      if (errorFotoUrl) {
        console.error('Erro ao adicionar coluna foto_url:', errorFotoUrl);
        setResult({
          success: false,
          message: `Erro ao adicionar coluna foto_url: ${errorFotoUrl.message}`
        });
        return;
      }

      // Adicionar coluna ultimo_acesso
      const { error: errorUltimoAcesso } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP WITH TIME ZONE;'
      });

      if (errorUltimoAcesso) {
        console.error('Erro ao adicionar coluna ultimo_acesso:', errorUltimoAcesso);
        setResult({
          success: false,
          message: `Erro ao adicionar coluna ultimo_acesso: ${errorUltimoAcesso.message}`
        });
        return;
      }

      setResult({
        success: true,
        message: 'Migração executada com sucesso! As colunas telefone, foto_url e ultimo_acesso foram adicionadas à tabela usuarios.'
      });
    } catch (error) {
      console.error('Erro ao executar migração:', error);
      setResult({
        success: false,
        message: `Erro ao executar migração: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Migrações do Banco de Dados</h1>
        
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Adicionar Colunas à Tabela Usuários</h2>
          <p className="text-gray-600 mb-4">
            Esta migração irá adicionar as seguintes colunas à tabela de usuários:
          </p>
          
          <ul className="list-disc pl-6 mb-6 text-gray-600">
            <li>telefone (TEXT) - Para armazenar o número de telefone do usuário</li>
            <li>foto_url (TEXT) - Para armazenar a URL da foto de perfil do usuário</li>
            <li>ultimo_acesso (TIMESTAMP WITH TIME ZONE) - Para registrar o último acesso do usuário</li>
          </ul>
          
          <div className="flex justify-end">
            <button
              onClick={executarMigracao}
              disabled={isExecuting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white 
                ${isExecuting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'} 
                transition-colors`}
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Executando...
                </>
              ) : (
                'Executar Migração'
              )}
            </button>
          </div>
        </div>
        
        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          <p>
            <strong>Nota:</strong> Esta página só está disponível para administradores. 
            A execução de migrações pode afetar o funcionamento do sistema.
          </p>
        </div>
      </div>
    </div>
  );
} 