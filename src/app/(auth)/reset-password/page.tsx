'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link as UILink } from '@/components/ui/Link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Verificar se as senhas coincidem
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setFormError('As senhas não coincidem');
      } else {
        setFormError(null);
      }
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (formError) {
      return;
    }
    
    if (!formData.password || !formData.confirmPassword) {
      setFormError('Preencha todos os campos');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    // Simulação de redefinição de senha bem-sucedida
    // Em um ambiente real, você usaria o método updatePassword do Supabase
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setFormError(null);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setFormError('Falha ao redefinir senha');
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
          <h1 className="text-3xl font-bold text-gray-900">Redefinir Senha</h1>
          <p className="mt-2 text-gray-600">
            Crie uma nova senha para sua conta
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Senha redefinida com sucesso!</span>
            </div>
            
            <Link 
              href="/login" 
              className="block w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors text-center"
            >
              Ir para o login
            </Link>
          </div>
        ) : (
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
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nova senha"
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

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirmar nova senha"
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!!formError || loading}
              className={`w-full py-2.5 px-4 font-medium rounded-lg transition-colors flex items-center justify-center ${
                formError || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Lembrou sua senha?{' '}
              <UILink href="/login">
                Faça login
              </UILink>
            </p>
          </form>
        )}
      </div>
    </div>
  );
} 