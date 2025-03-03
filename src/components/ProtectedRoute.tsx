'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Mostrar nada enquanto verifica a autenticação
  if (loading) {
    return null;
  }
  
  // Se não estiver autenticado, não renderiza nada (o redirecionamento acontecerá no useEffect)
  if (!user) {
    return null;
  }
  
  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
} 