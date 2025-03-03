'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function RoutePage() {
  const router = useRouter();

  useEffect(() => {
    // Simula o processo de verificação
    const timer1 = setTimeout(() => {
      const verifyingElement = document.getElementById('verifying');
      const successElement = document.getElementById('success');
      
      if (verifyingElement) {
        verifyingElement.classList.remove('opacity-0');
        verifyingElement.classList.add('opacity-100');
      }
    }, 500);

    const timer2 = setTimeout(() => {
      const verifyingElement = document.getElementById('verifying');
      const successElement = document.getElementById('success');
      
      if (verifyingElement && successElement) {
        verifyingElement.classList.remove('opacity-100');
        verifyingElement.classList.add('opacity-0');
        successElement.classList.remove('opacity-0');
        successElement.classList.add('opacity-100');
      }
    }, 2000);

    // Redireciona para o dashboard após a animação
    const timer3 = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="mb-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary via-primary-light to-primary flex items-center justify-center overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_transparent_50%,_rgba(255,255,255,0.2)_100%)]"></div>
            <span className="text-white font-bold text-3xl">EV</span>
          </div>
        </div>
      </div>

      {/* Mensagens de Status */}
      <div className="space-y-4">
        <div id="verifying" className="flex items-center gap-2 text-gray-600 opacity-0 transition-opacity duration-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verificando usuário...</span>
        </div>
        
        <div id="success" className="flex items-center gap-2 text-primary opacity-0 transition-opacity duration-500">
          <CheckCircle2 className="w-5 h-5" />
          <span>Acesso verificado com sucesso!</span>
        </div>
      </div>
    </div>
  );
} 