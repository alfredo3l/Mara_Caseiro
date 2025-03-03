'use client';

import { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Verificar se o usuário está autenticado
    const usuarioSalvo = localStorage.getItem('usuario');
    
    if (usuarioSalvo) {
      // Se o usuário estiver autenticado, redirecionar para o dashboard
      router.push('/dashboard');
    } else {
      // Se não estiver autenticado, redirecionar para o login
      router.push('/login');
    }
  }, [router]);
  
  // Renderizar um estado de carregamento enquanto decide para onde redirecionar
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Carregando...</div>
    </div>
  );
} 