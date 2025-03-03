import { useState, useEffect } from 'react';
import { useAutorizacao } from './useAutorizacao';
import { supabase } from '../lib/supabase';

export interface LogAtividade {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  acao: 'criar' | 'editar' | 'excluir' | 'login' | 'logout' | 'alterar_permissao' | 'alterar_status' | 'alterar_perfil';
  recurso: string;
  detalhes: string;
  data: string;
  ip: string;
  dispositivo: string;
}

export function useLogs() {
  const [logs, setLogs] = useState<LogAtividade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const { usuarioAtual } = useAutorizacao();

  // Carregar logs
  useEffect(() => {
    const carregarLogs = async () => {
      setCarregando(true);
      setErro(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados mockados que viriam do backend
        const dadosLogs: LogAtividade[] = [
          {
            id: '1',
            usuarioId: '1',
            usuarioNome: 'João Silva',
            acao: 'login',
            recurso: 'sistema',
            detalhes: 'Login realizado com sucesso',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '2',
            usuarioId: '1',
            usuarioNome: 'João Silva',
            acao: 'editar',
            recurso: 'usuarios',
            detalhes: 'Alteração de permissões do usuário Maria Oliveira',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '3',
            usuarioId: '1',
            usuarioNome: 'João Silva',
            acao: 'criar',
            recurso: 'usuarios',
            detalhes: 'Criação de novo usuário: Carlos Santos',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '4',
            usuarioId: '2',
            usuarioNome: 'Maria Oliveira',
            acao: 'login',
            recurso: 'sistema',
            detalhes: 'Login realizado com sucesso',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '5',
            usuarioId: '2',
            usuarioNome: 'Maria Oliveira',
            acao: 'editar',
            recurso: 'apoiadores',
            detalhes: 'Atualização de dados do apoiador José Pereira',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '6',
            usuarioId: '3',
            usuarioNome: 'Carlos Santos',
            acao: 'login',
            recurso: 'sistema',
            detalhes: 'Login realizado com sucesso',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '7',
            usuarioId: '1',
            usuarioNome: 'João Silva',
            acao: 'alterar_permissao',
            recurso: 'permissoes',
            detalhes: 'Alteração de permissões do usuário Carlos Santos: adicionado acesso a Apoiadores',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '8',
            usuarioId: '1',
            usuarioNome: 'João Silva',
            acao: 'alterar_status',
            recurso: 'usuarios',
            detalhes: 'Alteração de status do usuário Pedro Alves: ativo -> inativo',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '9',
            usuarioId: '4',
            usuarioNome: 'Ana Souza',
            acao: 'criar',
            recurso: 'apoiadores',
            detalhes: 'Cadastro de novo apoiador: Roberto Ferreira',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '10',
            usuarioId: '1',
            usuarioNome: 'João Silva',
            acao: 'alterar_perfil',
            recurso: 'usuarios',
            detalhes: 'Alteração de perfil do usuário Ana Souza: coordenador -> admin',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '11',
            usuarioId: '5',
            usuarioNome: 'Pedro Alves',
            acao: 'excluir',
            recurso: 'apoiadores',
            detalhes: 'Exclusão do apoiador Marcos Silva',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          },
          {
            id: '12',
            usuarioId: '2',
            usuarioNome: 'Maria Oliveira',
            acao: 'logout',
            recurso: 'sistema',
            detalhes: 'Logout realizado com sucesso',
            data: new Date().toISOString(),
            ip: '127.0.0.1',
            dispositivo: 'Web'
          }
        ];
        
        setLogs(dadosLogs);
      } catch (error) {
        console.error('Erro ao carregar logs:', error);
        setErro('Não foi possível carregar os logs de atividades');
      } finally {
        setCarregando(false);
      }
    };
    
    carregarLogs();
  }, []);

  // Registrar nova atividade
  const registrarAtividade = async (
    acao: 'criar' | 'editar' | 'excluir' | 'login' | 'logout' | 'alterar_permissao' | 'alterar_status' | 'alterar_perfil',
    recurso: string,
    detalhes?: string
  ): Promise<boolean> => {
    if (!usuarioAtual) {
      console.error('Não é possível registrar atividade: usuário não autenticado');
      return false;
    }
    
    try {
      console.log(`Registrando atividade: ${acao} em ${recurso}`, { detalhes });
      
      // Criar novo log
      const novoLog: LogAtividade = {
        id: `${Date.now()}`,
        usuarioId: usuarioAtual.id,
        usuarioNome: usuarioAtual.nome,
        acao,
        recurso,
        detalhes: detalhes || '',
        data: new Date().toISOString(),
        ip: '127.0.0.1', // Em um ambiente real, seria o IP do cliente
        dispositivo: 'Web' // Em um ambiente real, seria detectado o dispositivo
      };
      
      // Em um ambiente real, aqui seria feito o registro no banco de dados
      const { error } = await supabase
        .from('logs_atividades')
        .insert([novoLog])
        .then(response => response);
      
      if (error) {
        console.error('Erro ao registrar atividade no banco de dados:', error);
        return false;
      }
      
      // Adicionar à lista local
      setLogs(logs => [novoLog, ...logs]);
      
      console.log('Atividade registrada com sucesso:', novoLog);
      return true;
    } catch (err) {
      console.error('Erro ao registrar atividade:', err);
      return false;
    }
  };

  // Filtrar logs por período
  const filtrarLogsPorPeriodo = (dias: number) => {
    if (dias === 0) return logs; // Retornar todos os logs
    
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    const dataLimiteISO = dataLimite.toISOString();
    
    return logs.filter(log => new Date(log.data) >= dataLimite);
  };

  // Filtrar logs por usuário
  const filtrarLogsPorUsuario = (usuarioId: string) => {
    return logs.filter(log => log.usuarioId === usuarioId);
  };

  // Filtrar logs por ação
  const filtrarLogsPorAcao = (acao: LogAtividade['acao']) => {
    return logs.filter(log => log.acao === acao);
  };

  // Filtrar logs por recurso
  const filtrarLogsPorRecurso = (recurso: string) => {
    return logs.filter(log => log.recurso === recurso);
  };

  return {
    logs,
    carregando,
    erro,
    registrarAtividade,
    filtrarLogsPorPeriodo,
    filtrarLogsPorUsuario,
    filtrarLogsPorAcao,
    filtrarLogsPorRecurso
  };
} 