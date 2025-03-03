import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VerificarPermissaoParams {
  recurso: string;
  acao?: 'ler' | 'criar' | 'editar' | 'excluir';
  redirecionarSeNaoAutorizado?: boolean;
  caminhoRedirecionamento?: string;
}

export function useAutorizacao() {
  const router = useRouter();
  const [usuarioAtual, setUsuarioAtual] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // Carregar dados do usuário atual
  useEffect(() => {
    const carregarUsuario = async () => {
      setCarregando(true);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dados mockados que viriam do backend
        const dadosUsuario = {
          id: '1',
          nome: 'João Silva',
          email: 'joao.silva@exemplo.com',
          perfil: 'super_admin',
          permissoes: [
            { recurso: 'dashboard', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'apoiadores', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'demandas', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'eventos', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'apoios', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'regioes', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'liderancas', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'coordenadores', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'candidatos', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'agenda-politica', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'resultados-eleicoes', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'ia', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'configuracoes', acoes: ['ler', 'criar', 'editar', 'excluir'] },
            { recurso: 'admin', acoes: ['ler', 'criar', 'editar', 'excluir'] }
          ]
        };
        
        setUsuarioAtual(dadosUsuario);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarUsuario();
  }, []);

  // Verificar se o usuário tem permissão para acessar um recurso
  const verificarPermissao = ({
    recurso,
    acao = 'ler',
    redirecionarSeNaoAutorizado = false,
    caminhoRedirecionamento = '/dashboard'
  }: VerificarPermissaoParams): boolean => {
    // Se ainda estiver carregando, não podemos verificar
    if (carregando) return false;
    
    // Se não há usuário, não tem permissão
    if (!usuarioAtual) {
      if (redirecionarSeNaoAutorizado) {
        router.push('/login');
      }
      return false;
    }
    
    // Super admin tem acesso a tudo
    if (usuarioAtual.perfil === 'super_admin') {
      return true;
    }
    
    // Verificar permissões específicas
    const permissao = usuarioAtual.permissoes.find((p: any) => p.recurso === recurso);
    
    if (!permissao || !permissao.acoes.includes(acao)) {
      if (redirecionarSeNaoAutorizado) {
        router.push(caminhoRedirecionamento);
      }
      return false;
    }
    
    return true;
  };

  // Verificar se o usuário é administrador
  const isAdmin = (): boolean => {
    if (!usuarioAtual) return false;
    return usuarioAtual.perfil === 'super_admin' || usuarioAtual.perfil === 'admin';
  };

  // Verificar se o usuário é super administrador
  const isSuperAdmin = (): boolean => {
    if (!usuarioAtual) return false;
    return usuarioAtual.perfil === 'super_admin';
  };

  // Obter o perfil do usuário atual
  const getPerfilUsuario = (): string | null => {
    if (!usuarioAtual) return null;
    return usuarioAtual.perfil;
  };

  return {
    usuarioAtual,
    carregando,
    verificarPermissao,
    isAdmin,
    isSuperAdmin,
    getPerfilUsuario
  };
} 