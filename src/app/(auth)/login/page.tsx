'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link as UILink } from '@/components/ui/Link';

interface NoSSRProps {
  children: React.ReactNode;
}

const NoSSR = dynamic<NoSSRProps>(() => 
  Promise.resolve(({ children }: NoSSRProps) => <>{children}</>), 
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error: authError, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    console.log('Estado do usuário:', { user, loading });
    if (user && !loading) {
      console.log('Usuário já autenticado, redirecionando para dashboard...');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Limpar erro do formulário quando os dados mudam
  useEffect(() => {
    if (formError) {
      setFormError(null);
    }
  }, [formData]);

  // Atualizar erro do formulário quando o erro de autenticação mudar
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar erros anteriores
    setFormError(null);
    
    console.log('Iniciando tentativa de login com:', { email: formData.email });
    
    // Validação básica
    if (!formData.email || !formData.password) {
      setFormError('Preencha todos os campos');
      return;
    }
    
    try {
      // Tentar fazer login com Supabase
      console.log('Chamando função de login...');
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      console.log('Resultado do login:', result);
      
      if (!result.success) {
        setFormError(result.error || 'Falha ao fazer login');
      } else {
        console.log('Login bem-sucedido, aguardando redirecionamento...');
        // O redirecionamento será feito pelo useEffect quando o usuário for atualizado
      }
    } catch (error) {
      console.error('Erro ao processar login:', error);
      setFormError('Erro ao processar login. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Imagem de fundo com efeito de vidro fosco */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/casa-civil-6mb6d1/assets/zc6v3pfnr6yr/HOME.png")',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      </div>

      {/* Conteúdo */}
      <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg relative">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo de volta!</h1>
          <p className="mt-2 text-gray-600">
           Plataforma de gestão política
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{formError}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Seu e-mail"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Sua senha"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <NoSSR>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 font-medium"
                prefetch={false}
                key="forgot-password-link"
              >
                Esqueceu sua senha?
              </Link>
            </NoSSR>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <UILink href="/register">
              Cadastre-se
            </UILink>
          </p>

          <p className="text-center text-sm">
            <UILink href="/forgot-password" variant="secondary">
              Esqueceu sua senha?
            </UILink>
          </p>
        </form>
      </div>
    </div>
  );
} 
