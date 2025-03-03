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
    loading: true, // Iniciar como true para evitar redirecionamentos indesejados
    error: null,
  });

  // Verificar sessão atual ao carregar o hook
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Verificando sessão atual...');
        
        // Obter sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          throw error;
        }
        
        const session = data?.session;
        
        console.log('Sessão obtida:', { 
          hasSession: !!session, 
          userId: session?.user?.id 
        });
        
        if (session?.user) {
          // Registrar acesso do usuário
          try {
            await registrarAcesso(session.user.id);
            console.log('Acesso registrado com sucesso');
          } catch (acessoError) {
            console.error('Erro ao registrar acesso:', acessoError);
            // Não falhar se o registro de acesso falhar
          }
          
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Mudança de estado de autenticação:', { event, userId: session?.user?.id });
        
        if (session?.user) {
          // Registrar acesso do usuário quando houver mudança de estado
          if (event === 'SIGNED_IN') {
            try {
              await registrarAcesso(session.user.id);
              console.log('Acesso registrado após evento:', event);
            } catch (acessoError) {
              console.error('Erro ao registrar acesso após evento:', acessoError);
              // Não falhar se o registro de acesso falhar
            }
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
      try {
        const acessoRegistrado = await registrarAcesso(data.user.id);
        
        if (!acessoRegistrado) {
          console.warn('Falha ao registrar acesso do usuário');
        }
      } catch (acessoError) {
        console.error('Erro ao registrar acesso:', acessoError);
        // Não falhar se o registro de acesso falhar
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
      let usuarioCriado = null;
      let erroTabela = null;
      
      try {
        usuarioCriado = await criarUsuario(authData.user, {
          nome: name,
          perfil: 'apoiador',
        });
        
        console.log('Resposta da criação do usuário:', usuarioCriado);
      } catch (error) {
        console.error('Erro ao criar registro na tabela:', error);
        erroTabela = error;
        // Não vamos lançar o erro aqui, apenas registrar
      }
      
      // 4. Verificar se o usuário foi criado na tabela
      if (!usuarioCriado) {
        console.warn('Falha ao criar registro na tabela usuarios, mas o usuário foi criado no Auth');
        // Mesmo com falha na tabela, consideramos o cadastro como sucesso parcial
        // já que o usuário foi criado no Auth e poderá tentar fazer login
      }
      
      // 5. Fazer logout para garantir que o usuário precise fazer login
      try {
        await supabase.auth.signOut();
      } catch (logoutError) {
        console.error('Erro ao fazer logout após registro:', logoutError);
        // Não vamos falhar aqui, apenas registrar o erro
      }
      
      // 6. Atualizar estado antes de retornar
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      return { 
        success: true, 
        message: 'Cadastro realizado com sucesso! Faça login para continuar.' 
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      
      let errorMessage = 'Falha ao registrar usuário';
      if (error instanceof AuthError) {
        console.log('Erro de autenticação:', error.message);
        
        // Tratar erros específicos do Supabase Auth
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está registrado';
        } else {
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
      console.log('Iniciando processo de logout...');
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }
      
      console.log('Logout realizado com sucesso');
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      // Redirecionar para a página de login
      router.push('/login');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      
      let errorMessage = 'Falha ao fazer logout';
      if (error instanceof Error) {
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

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      console.log('Iniciando processo de reset de senha para:', email);
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Erro ao solicitar reset de senha:', error);
        throw error;
      }
      
      console.log('Solicitação de reset de senha enviada com sucesso');
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
      
      return { 
        success: true, 
        message: 'Enviamos um email com instruções para redefinir sua senha' 
      };
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      
      let errorMessage = 'Falha ao solicitar redefinição de senha';
      if (error instanceof Error) {
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

  // Atualizar senha
  const updatePassword = async (password: string) => {
    try {
      console.log('Iniciando processo de atualização de senha...');
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        console.error('Erro ao atualizar senha:', error);
        throw error;
      }
      
      console.log('Senha atualizada com sucesso');
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
      
      return { 
        success: true, 
        message: 'Senha atualizada com sucesso' 
      };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      
      let errorMessage = 'Falha ao atualizar senha';
      if (error instanceof Error) {
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

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  };
} 