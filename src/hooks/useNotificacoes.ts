import { useState, useEffect } from 'react';
import { useAutorizacao } from './useAutorizacao';
import { supabase } from '../lib/supabase';

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  lida: boolean;
  paraUsuarioId: string;
  dataEnvio: string;
  link?: string;
  acao?: string;
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const { usuarioAtual } = useAutorizacao();

  // Carregar notificações do usuário atual
  useEffect(() => {
    const carregarNotificacoes = async () => {
      if (!usuarioAtual) return;
      
      setCarregando(true);
      setErro(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados mockados que viriam do backend
        const dadosNotificacoes: Notificacao[] = [
          {
            id: '1',
            titulo: 'Novo usuário cadastrado',
            mensagem: 'O usuário Carlos Santos foi cadastrado no sistema.',
            tipo: 'info',
            lida: false,
            paraUsuarioId: usuarioAtual.id,
            dataEnvio: new Date().toISOString(),
            link: '/admin',
            acao: 'Ver usuários'
          },
          {
            id: '2',
            titulo: 'Permissões atualizadas',
            mensagem: 'Suas permissões de acesso foram atualizadas por um administrador.',
            tipo: 'info',
            lida: false,
            paraUsuarioId: usuarioAtual.id,
            dataEnvio: new Date().toISOString()
          },
          {
            id: '3',
            titulo: 'Erro no sistema',
            mensagem: 'Ocorreu um erro ao processar sua última solicitação. Por favor, tente novamente.',
            tipo: 'erro',
            lida: true,
            paraUsuarioId: usuarioAtual.id,
            dataEnvio: new Date().toISOString()
          },
          {
            id: '4',
            titulo: 'Bem-vindo ao sistema',
            mensagem: 'Bem-vindo ao sistema de Evolução Política. Explore as funcionalidades disponíveis.',
            tipo: 'sucesso',
            lida: true,
            paraUsuarioId: usuarioAtual.id,
            dataEnvio: new Date().toISOString(),
            link: '/dashboard',
            acao: 'Ir para Dashboard'
          }
        ];
        
        setNotificacoes(dadosNotificacoes);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        setErro('Não foi possível carregar as notificações');
      } finally {
        setCarregando(false);
      }
    };
    
    carregarNotificacoes();
  }, [usuarioAtual]);

  // Marcar notificação como lida
  const marcarComoLida = async (notificacaoId: string): Promise<boolean> => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotificacoes(prevNotificacoes => 
        prevNotificacoes.map(notificacao => 
          notificacao.id === notificacaoId 
            ? { ...notificacao, lida: true } 
            : notificacao
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  // Marcar todas as notificações como lidas
  const marcarTodasComoLidas = async (): Promise<boolean> => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotificacoes(prevNotificacoes => 
        prevNotificacoes.map(notificacao => ({ ...notificacao, lida: true }))
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      return false;
    }
  };

  // Excluir notificação
  const excluirNotificacao = async (notificacaoId: string): Promise<boolean> => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotificacoes(prevNotificacoes => 
        prevNotificacoes.filter(notificacao => notificacao.id !== notificacaoId)
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      return false;
    }
  };

  // Criar nova notificação (para uso interno do sistema)
  const criarNotificacao = async (
    titulo: string,
    mensagem: string,
    tipo: 'info' | 'sucesso' | 'aviso' | 'erro',
    paraUsuarioId: string,
    link?: string,
    acao?: string
  ): Promise<boolean> => {
    try {
      console.log(`Criando notificação: ${titulo}`, { 
        mensagem, 
        tipo, 
        paraUsuarioId,
        link,
        acao
      });
      
      // Criar nova notificação
      const novaNotificacao: Notificacao = {
        id: `${Date.now()}`,
        titulo,
        mensagem,
        tipo,
        dataEnvio: new Date().toISOString(),
        lida: false,
        paraUsuarioId,
        link,
        acao
      };
      
      // Em um ambiente real, aqui seria feito o registro no banco de dados
      const { error } = await supabase
        .from('notificacoes')
        .insert([novaNotificacao])
        .then(response => response);
      
      if (error) {
        console.error('Erro ao criar notificação no banco de dados:', error);
        return false;
      }
      
      // Adicionar à lista local se for para o usuário atual
      if (paraUsuarioId === usuarioAtual?.id) {
        setNotificacoes(notificacoes => [novaNotificacao, ...notificacoes]);
      }
      
      console.log('Notificação criada com sucesso:', novaNotificacao);
      return true;
    } catch (err) {
      console.error('Erro ao criar notificação:', err);
      return false;
    }
  };

  // Obter contagem de notificações não lidas
  const getNotificacoesNaoLidas = () => {
    return notificacoes.filter(notificacao => !notificacao.lida);
  };

  return {
    notificacoes,
    carregando,
    erro,
    marcarComoLida,
    marcarTodasComoLidas,
    excluirNotificacao,
    criarNotificacao,
    getNotificacoesNaoLidas
  };
} 