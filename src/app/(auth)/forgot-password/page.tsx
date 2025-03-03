'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link as UILink } from '@/components/ui/Link';

export default function ForgotPasswordPage() {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email) {
      setFormError('Informe seu e-mail');
      return;
    }
    
    // Tentar enviar email de recuperação
    const result = await resetPassword(email);
    
    if (result.success) {
      setSuccess(true);
      setFormError(null);
    } else {
      setFormError(result.error || 'Falha ao enviar email de recuperação');
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
          <h1 className="text-3xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="mt-2 text-gray-600">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Email enviado com sucesso! Verifique sua caixa de entrada.</span>
            </div>
            
            <Link 
              href="/login" 
              className="block w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors text-center"
            >
              Voltar para o login
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
            
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                />
              </div>
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
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
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