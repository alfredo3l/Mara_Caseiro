import { useState, useEffect } from 'react';
import { User, Permissao } from '@/types/user';
import { useLogs } from './useLogs';
import { useNotificacoes } from './useNotificacoes';
import { useAutorizacao } from './useAutorizacao';

interface PermissaoUsuario {
  usuarioId: string;
  nome: string;
  email: string;
  perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  status: 'ativo' | 'inativo' | 'pendente';
  permissoes: {
    recurso: string;
    acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
  }[];
}

interface FiltrosPermissoes {
  perfil?: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  status?: 'ativo' | 'inativo' | 'pendente';
  busca?: string;
}

export function usePermissoes() {
  const [usuarios, setUsuarios] = useState<PermissaoUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosPermissoes>({});
  const { registrarAtividade } = useLogs();
  const { criarNotificacao } = useNotificacoes();
  const { usuarioAtual } = useAutorizacao();

  // Recursos disponíveis no sistema
  const recursos = [
    { id: 'dashboard', nome: 'Dashboard' },
    { id: 'apoiadores', nome: 'Apoiadores' },
    { id: 'demandas', nome: 'Demandas' },
    { id: 'eventos', nome: 'Eventos' },
    { id: 'apoios', nome: 'Apoios Políticos' },
    { id: 'regioes', nome: 'Regiões' },
    { id: 'liderancas', nome: 'Lideranças' },
    { id: 'coordenadores', nome: 'Coordenadores' },
    { id: 'candidatos', nome: 'Candidatos' },
    { id: 'agenda-politica', nome: 'Agenda Política' },
    { id: 'resultados-eleicoes', nome: 'Resultados Eleições' },
    { id: 'ia', nome: 'Assistente IA' },
    { id: 'configuracoes', nome: 'Configurações' },
    { id: 'admin', nome: 'Administração' }
  ];

  // Perfis disponíveis no sistema
  const perfis = [
    { id: 'super_admin', nome: 'Super Administrador' },
    { id: 'admin', nome: 'Administrador' },
    { id: 'coordenador', nome: 'Coordenador' },
    { id: 'lideranca', nome: 'Liderança' },
    { id: 'apoiador', nome: 'Apoiador' }
  ];

  // Carregar usuários e suas permissões
  useEffect(() => {
    const carregarUsuarios = async () => {
      setCarregando(true);
      setErro(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados que viriam do backend
        const dadosUsuarios: PermissaoUsuario[] = [
          {
            usuarioId: '1',
            nome: 'João Silva',
            email: 'joao.silva@exemplo.com',
            perfil: 'super_admin',
            status: 'ativo',
            permissoes: recursos.map(recurso => ({
              recurso: recurso.id,
              acoes: ['ler', 'criar', 'editar', 'excluir']
            }))
          },
          {
            usuarioId: '2',
            nome: 'Maria Oliveira',
            email: 'maria.oliveira@exemplo.com',
            perfil: 'admin',
            status: 'ativo',
            permissoes: recursos.map(recurso => ({
              recurso: recurso.id,
              acoes: recurso.id === 'admin' ? ['ler'] : ['ler', 'criar', 'editar', 'excluir']
            }))
          },
          {
            usuarioId: '3',
            nome: 'Carlos Santos',
            email: 'carlos.santos@exemplo.com',
            perfil: 'coordenador',
            status: 'ativo',
            permissoes: recursos
              .filter(recurso => !['admin', 'configuracoes'].includes(recurso.id))
              .map(recurso => ({
                recurso: recurso.id,
                acoes: ['ler', 'criar', 'editar']
              }))
          },
          {
            usuarioId: '4',
            nome: 'Ana Pereira',
            email: 'ana.pereira@exemplo.com',
            perfil: 'lideranca',
            status: 'ativo',
            permissoes: recursos
              .filter(recurso => !['admin', 'configuracoes', 'resultados-eleicoes'].includes(recurso.id))
              .map(recurso => ({
                recurso: recurso.id,
                acoes: ['ler', 'criar']
              }))
          },
          {
            usuarioId: '5',
            nome: 'Roberto Almeida',
            email: 'roberto.almeida@exemplo.com',
            perfil: 'apoiador',
            status: 'ativo',
            permissoes: recursos
              .filter(recurso => ['dashboard', 'eventos', 'apoiadores'].includes(recurso.id))
              .map(recurso => ({
                recurso: recurso.id,
                acoes: ['ler']
              }))
          },
          {
            usuarioId: '6',
            nome: 'Fernanda Lima',
            email: 'fernanda.lima@exemplo.com',
            perfil: 'coordenador',
            status: 'inativo',
            permissoes: []
          }
        ];
        
        setUsuarios(dadosUsuarios);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setErro('Não foi possível carregar os usuários');
      } finally {
        setCarregando(false);
      }
    };
    
    carregarUsuarios();
  }, []);

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    // Filtrar por perfil
    if (filtros.perfil && usuario.perfil !== filtros.perfil) {
      return false;
    }
    
    // Filtrar por status
    if (filtros.status && usuario.status !== filtros.status) {
      return false;
    }
    
    // Filtrar por busca (nome ou email)
    if (filtros.busca) {
      const termoBusca = filtros.busca.toLowerCase();
      return (
        usuario.nome.toLowerCase().includes(termoBusca) ||
        usuario.email.toLowerCase().includes(termoBusca)
      );
    }
    
    return true;
  });

  // Atualizar perfil de um usuário
  const atualizarPerfilUsuario = async (
    usuarioId: string,
    novoPerfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador'
  ): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Encontrar o usuário
      const usuarioIndex = usuarios.findIndex(u => u.usuarioId === usuarioId);
      if (usuarioIndex === -1) {
        setErro('Usuário não encontrado');
        return false;
      }
      
      const usuario = usuarios[usuarioIndex];
      const perfilAntigo = usuario.perfil;
      
      // Atualizar o perfil
      const usuariosAtualizados = [...usuarios];
      usuariosAtualizados[usuarioIndex] = {
        ...usuario,
        perfil: novoPerfil
      };
      
      setUsuarios(usuariosAtualizados);
      
      // Registrar atividade
      registrarAtividade(
        'alterar_perfil',
        'usuarios',
        `Alteração de perfil do usuário ${usuario.nome}: ${perfilAntigo} -> ${novoPerfil}`
      );
      
      // Enviar notificação para o usuário afetado
      if (usuarioAtual) {
        criarNotificacao(
          'Perfil atualizado',
          `Seu perfil foi alterado de ${perfilAntigo} para ${novoPerfil} por ${usuarioAtual.nome}.`,
          'info',
          usuarioId
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      setErro('Não foi possível atualizar o perfil do usuário');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  // Atualizar permissões de um usuário
  const atualizarPermissoesUsuario = async (
    usuarioId: string,
    novasPermissoes: {
      recurso: string;
      acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
    }[]
  ): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Encontrar o usuário
      const usuarioIndex = usuarios.findIndex(u => u.usuarioId === usuarioId);
      if (usuarioIndex === -1) {
        setErro('Usuário não encontrado');
        return false;
      }
      
      const usuario = usuarios[usuarioIndex];
      
      // Atualizar as permissões
      const usuariosAtualizados = [...usuarios];
      usuariosAtualizados[usuarioIndex] = {
        ...usuario,
        permissoes: novasPermissoes
      };
      
      setUsuarios(usuariosAtualizados);
      
      // Registrar atividade
      registrarAtividade(
        'alterar_permissao',
        'permissoes',
        `Alteração de permissões do usuário ${usuario.nome}`
      );
      
      // Enviar notificação para o usuário afetado
      if (usuarioAtual) {
        criarNotificacao(
          'Permissões atualizadas',
          `Suas permissões de acesso foram atualizadas por ${usuarioAtual.nome}.`,
          'info',
          usuarioId
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar permissões do usuário:', error);
      setErro('Não foi possível atualizar as permissões do usuário');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  // Atualizar status de um usuário
  const atualizarStatusUsuario = async (
    usuarioId: string,
    novoStatus: 'ativo' | 'inativo' | 'pendente'
  ): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Encontrar o usuário
      const usuarioIndex = usuarios.findIndex(u => u.usuarioId === usuarioId);
      if (usuarioIndex === -1) {
        setErro('Usuário não encontrado');
        return false;
      }
      
      const usuario = usuarios[usuarioIndex];
      const statusAntigo = usuario.status;
      
      // Atualizar o status
      const usuariosAtualizados = [...usuarios];
      usuariosAtualizados[usuarioIndex] = {
        ...usuario,
        status: novoStatus
      };
      
      setUsuarios(usuariosAtualizados);
      
      // Registrar atividade
      registrarAtividade(
        'alterar_status',
        'usuarios',
        `Alteração de status do usuário ${usuario.nome}: ${statusAntigo} -> ${novoStatus}`
      );
      
      // Enviar notificação para o usuário afetado
      if (usuarioAtual) {
        criarNotificacao(
          'Status atualizado',
          `Seu status foi alterado de ${statusAntigo} para ${novoStatus} por ${usuarioAtual.nome}.`,
          novoStatus === 'ativo' ? 'sucesso' : novoStatus === 'inativo' ? 'aviso' : 'info',
          usuarioId
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      setErro('Não foi possível atualizar o status do usuário');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  // Criar novo usuário
  const criarNovoUsuario = async (
    dadosUsuario: {
      nome: string;
      email: string;
      perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
    }
  ): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o email já existe
      if (usuarios.some(u => u.email === dadosUsuario.email)) {
        setErro('Já existe um usuário com este email');
        return false;
      }
      
      // Gerar ID único
      const novoId = `${usuarios.length + 1}`;
      
      // Definir permissões com base no perfil
      let permissoesIniciais: {
        recurso: string;
        acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
      }[] = [];
      
      switch (dadosUsuario.perfil) {
        case 'super_admin':
          permissoesIniciais = recursos.map(recurso => ({
            recurso: recurso.id,
            acoes: ['ler', 'criar', 'editar', 'excluir'] as ('ler' | 'criar' | 'editar' | 'excluir')[]
          }));
          break;
        case 'admin':
          permissoesIniciais = recursos.map(recurso => ({
            recurso: recurso.id,
            acoes: recurso.id === 'admin' ? ['ler'] as ('ler' | 'criar' | 'editar' | 'excluir')[] : ['ler', 'criar', 'editar', 'excluir'] as ('ler' | 'criar' | 'editar' | 'excluir')[]
          }));
          break;
        case 'coordenador':
          permissoesIniciais = recursos
            .filter(recurso => !['admin', 'configuracoes'].includes(recurso.id))
            .map(recurso => ({
              recurso: recurso.id,
              acoes: ['ler', 'criar', 'editar'] as ('ler' | 'criar' | 'editar' | 'excluir')[]
            }));
          break;
        case 'lideranca':
          permissoesIniciais = recursos
            .filter(recurso => !['admin', 'configuracoes', 'resultados-eleicoes'].includes(recurso.id))
            .map(recurso => ({
              recurso: recurso.id,
              acoes: ['ler', 'criar'] as ('ler' | 'criar' | 'editar' | 'excluir')[]
            }));
          break;
        case 'apoiador':
          permissoesIniciais = recursos
            .filter(recurso => ['dashboard', 'eventos', 'apoiadores'].includes(recurso.id))
            .map(recurso => ({
              recurso: recurso.id,
              acoes: ['ler'] as ('ler' | 'criar' | 'editar' | 'excluir')[]
            }));
          break;
      }
      
      // Criar novo usuário
      const novoUsuario: PermissaoUsuario = {
        usuarioId: novoId,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        perfil: dadosUsuario.perfil,
        status: 'pendente',
        permissoes: permissoesIniciais
      };
      
      // Adicionar à lista de usuários
      setUsuarios(prevUsuarios => [...prevUsuarios, novoUsuario]);
      
      // Registrar atividade
      registrarAtividade(
        'criar',
        'usuarios',
        `Criação de novo usuário: ${dadosUsuario.nome} (${dadosUsuario.email}) com perfil ${dadosUsuario.perfil}`
      );
      
      // Enviar notificação para todos os administradores
      if (usuarioAtual) {
        // Encontrar todos os administradores
        const admins = usuarios.filter(u => 
          (u.perfil === 'admin' || u.perfil === 'super_admin') && 
          u.status === 'ativo' &&
          u.usuarioId !== usuarioAtual.usuarioId
        );
        
        // Enviar notificação para cada admin
        admins.forEach(admin => {
          criarNotificacao(
            'Novo usuário cadastrado',
            `O usuário ${dadosUsuario.nome} foi cadastrado no sistema com o perfil ${dadosUsuario.perfil}.`,
            'info',
            admin.usuarioId,
            '/admin',
            'Ver usuários'
          );
        });
      }
      
      // Simular envio de email com senha temporária
      console.log(`Email enviado para ${dadosUsuario.email} com senha temporária`);
      
      return true;
    } catch (error) {
      console.error('Erro ao criar novo usuário:', error);
      setErro('Não foi possível criar o novo usuário');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  return {
    usuarios: usuariosFiltrados,
    recursos,
    perfis,
    carregando,
    erro,
    filtros,
    setFiltros,
    atualizarPerfilUsuario,
    atualizarPermissoesUsuario,
    atualizarStatusUsuario,
    criarNovoUsuario
  };
} 