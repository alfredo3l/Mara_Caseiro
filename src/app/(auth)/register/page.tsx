'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Building, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link as UILink } from '@/components/ui/Link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Verificar se as senhas coincidem
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('As senhas não coincidem');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confirmPassword]);

  // Limpar erro do formulário quando os dados mudam
  useEffect(() => {
    if (formError) {
      setFormError(null);
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (passwordError) {
      return;
    }
    
    if (!formData.name || !formData.document || !formData.email || !formData.password) {
      setFormError('Preencha todos os campos');
      return;
    }
    
    // Limpar erro antes de tentar registrar
    setFormError(null);
    
    try {
      // Tentar registrar com Supabase
      const result = await register({
        name: formData.name,
        document: formData.document,
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        // Mostrar mensagem de sucesso antes do redirecionamento
        setFormError(null);
        // Exibir mensagem de sucesso
        alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
        
        // Redirecionar para a página de login usando window.location para garantir um redirecionamento completo
        window.location.href = '/login';
      } else {
        // Exibir mensagem de erro
        setFormError(result.error || 'Falha ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao processar o cadastro:', error);
      setFormError('Ocorreu um erro ao processar o cadastro. Por favor, tente novamente.');
    }
  };

  const formatDocument = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Verifica se é CPF ou CNPJ baseado no tamanho
    if (numbers.length <= 11) {
      // Formata como CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // Formata como CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .slice(0, 18);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setFormData(prev => ({ ...prev, document: formatted }));
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
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="mt-2 text-gray-600">
            Realize seu cadastro na plataforna
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
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.document}
                  onChange={handleDocumentChange}
                  placeholder="CPF/CNPJ"
                  maxLength={18}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="E-mail corporativo"
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
                  placeholder="Senha"
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white transition-colors ${
                    passwordError ? 'border-red-500' : 'border-gray-300 focus:border-primary'
                  }`}
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
                  placeholder="Confirmar senha"
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white transition-colors ${
                    passwordError ? 'border-red-500' : 'border-gray-300 focus:border-primary'
                  }`}
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
              {passwordError && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!!passwordError || loading}
            className={`w-full py-2.5 px-4 font-medium rounded-lg transition-colors flex items-center justify-center ${
              passwordError || loading
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
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <UILink href="/login">
              Faça login
            </UILink>
          </p>
        </form>
      </div>
    </div>
  );
} 
