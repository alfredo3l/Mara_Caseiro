import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, AuthError, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { registrarAcesso, criarUsuario } from '@/services/usuarios';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  document: string;
  email: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Verificar sessão atual ao carregar o hook
  useEffect(() => {
    const checkSession = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        // Obter sessão atual
        // @ts-ignore - Ignorando erro de tipagem do supabase mock
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          // Registrar acesso do usuário
          await registrarAcesso(session.user.id);
          
          setState({
            user: session.user as User,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setState({
          user: null,
          loading: false,
          error: 'Falha ao verificar autenticação',
        });
      }
    };
    
    checkSession();
    
    // Configurar listener para mudanças de autenticação
    // @ts-ignore - Ignorando erro de tipagem do supabase mock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          // Registrar acesso do usuário quando houver mudança de estado
          if (event === 'SIGNED_IN') {
            await registrarAcesso(session.user.id);
          }
        }
        
        setState({
          user: session?.user as User | null,
          loading: false,
          error: null,
        });
      }
    );
    
    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login com email e senha
  const login = async ({ email, password }: LoginCredentials) => {
    try {
      console.log('Iniciando processo de login:', { email });
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Tentar fazer login
      console.log('Tentando login no Supabase Auth...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Resposta do login:', { 
        success: !!data.user, 
        error: error?.message 
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Usuário não encontrado após login');
      }
      
      // Registrar acesso do usuário
      console.log('Registrando acesso do usuário...');
      const acessoRegistrado = await registrarAcesso(data.user.id);
      
      if (!acessoRegistrado) {
        console.warn('Falha ao registrar acesso do usuário');
      }
      
      // Atualizar estado
      setState({
        user: data.user,
        loading: false,
        error: null,
      });
      
      // Redirecionar para a página de validação
      console.log('Login bem sucedido, redirecionando...');
      router.push('/validate');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      let errorMessage = 'Falha ao fazer login';
      if (error instanceof AuthError) {
        console.log('Erro de autenticação:', error.message);
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email ou senha inválidos';
            break;
          case 'Email not confirmed':
            errorMessage = 'Email não confirmado';
            break;
          default:
            errorMessage = `Erro de autenticação: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // Registro de novo usuário
  const register = async ({ name, document, email, password }: RegisterCredentials) => {
    try {
      console.log('Iniciando processo de registro:', { name, email });
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // 1. Registrar usuário no Supabase Auth
      console.log('Tentando criar usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            document,
          },
        },
      });
      
      console.log('Resposta do Supabase Auth:', { 
        user: authData?.user ? 'Usuário criado' : 'Usuário não criado', 
        error: authError 
      });
      
      if (authError) {
        console.error('Erro no Supabase Auth:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('Usuário não foi criado no Auth');
        throw new Error('Falha ao criar usuário');
      }

      // 2. Aguardar um momento para garantir que o usuário foi criado no Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Criar usuário na tabela de usuários
      console.log('Tentando criar registro na tabela usuarios...');
      try {
        const usuarioCriado = await criarUsuario(authData.user, {
          nome: name,
          perfil: 'apoiador',
        });
        
        console.log('Resposta da criação do usuário:', usuarioCriado);
        
        if (!usuarioCriado) {
          console.error('Falha ao criar registro na tabela usuarios');
          throw new Error('Falha ao criar registro do usuário');
        }
        
        // 4. Atualizar estado e redirecionar
        console.log('Registro concluído com sucesso, atualizando estado...');
        setState({
          user: authData.user,
          loading: false,
          error: null,
        });
        
        router.push('/validate');
        return { success: true };
        
      } catch (error) {
        console.error('Erro ao criar registro na tabela:', error);
        // Não podemos deletar o usuário do Auth pois não temos acesso admin
        // O usuário ficará apenas no Auth até que seja criado na tabela em uma nova tentativa
        throw error;
      }
      
    } catch (error) {
      console.error('Erro no processo de registro:', error);
      
      let errorMessage = 'Falha ao criar conta';
      if (error instanceof AuthError) {
        console.log('Erro de autenticação:', error.message);
        switch (error.message) {
          case 'User already registered':
            errorMessage = 'Email já cadastrado';
            break;
          case 'Password should be at least 6 characters':
            errorMessage = 'A senha deve ter pelo menos 6 caracteres';
            break;
          default:
            errorMessage = `Erro de autenticação: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // @ts-ignore - Ignorando erro de tipagem do supabase mock
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      // Limpar dados do localStorage
      localStorage.removeItem('usuario');
      
      // Redirecionar para a página de login
      router.push('/login');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Falha ao fazer logout',
      }));
      
      return { success: false, error: 'Falha ao fazer logout' };
    }
  };

  // Recuperação de senha
  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // @ts-ignore - Ignorando erro de tipagem do supabase mock
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      
      let errorMessage = 'Falha ao solicitar recuperação de senha';
      if (error instanceof AuthError) {
        errorMessage = 'Erro ao solicitar recuperação de senha';
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    resetPassword,
  };
} 