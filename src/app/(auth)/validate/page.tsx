'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ValidatePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Verificar se o usuário está autenticado
    if (loading) {
      return; // Aguardar carregamento do estado de autenticação
    }
    
    if (!user) {
      console.log('Usuário não autenticado, redirecionando para login...');
      router.push('/login');
      return;
    }
    
    console.log('Usuário autenticado, iniciando validação...', user);
    
    // Simular progresso mais rápido
    timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 25; // Aumentar em 25% a cada 200ms
      });
    }, 200);

    // Limpar timer ao desmontar
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user, loading, router]);

  useEffect(() => {
    if (progress === 100) {
      console.log('Validação concluída, redirecionando para dashboard...');
      // Redirecionar imediatamente
      router.push('/dashboard');
    }
  }, [progress, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md space-y-4 bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-red-600">Erro</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Validando seu acesso...
          </h2>
          <p className="text-gray-600">
            Por favor, aguarde enquanto validamos suas credenciais.
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
} 