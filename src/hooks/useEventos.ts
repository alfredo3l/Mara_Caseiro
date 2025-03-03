import { useState } from 'react';
import { Evento, EventoStatus } from '@/types/evento';
import { 
  eventosService, 
  eventosParticipantesService, 
  eventosRecursosService, 
  eventosAnexosService 
} from '@/services/supabase';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEventos = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filters: Record<string, any> = {},
    orderConfig: OrderConfig = { column: 'data_inicio', direction: 'asc' }
  ) => {
    try {
      setLoading(true);
      
      // Preparar filtros
      const queryFilters: Record<string, any> = {};
      
      // Adicionar filtro de busca
      if (searchTerm) {
        queryFilters.titulo = { like: searchTerm };
        // Nota: para busca em múltiplos campos, usaremos customQuery em uma implementação futura
      }
      
      // Aplicar filtros adicionais
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'status') {
            // Mapear status para o formato do banco
            const statusMap: Record<EventoStatus, string> = {
              'agendados': 'Agendado',
              'confirmados': 'Confirmado',
              'em_andamento': 'Em Andamento',
              'concluidos': 'Concluído',
              'cancelados': 'Cancelado'
            };
            
            if (typeof value === 'string' && value in statusMap) {
              queryFilters.status = statusMap[value as EventoStatus];
            } else if (Array.isArray(value)) {
              queryFilters.status = value.map(s => statusMap[s as EventoStatus]);
            }
          } else if (key === 'tipo') {
            queryFilters.tipo = value;
          } else if (key === 'organizadorId') {
            queryFilters.organizador_id = value;
          } else if (key === 'dataInicio' && value) {
            queryFilters.data_inicio = { gte: value };
          } else if (key === 'dataFim' && value) {
            queryFilters.data_fim = { lte: value };
          } else if (key === 'cidade') {
            // Para campos JSONB, usaremos customQuery em uma implementação futura
            queryFilters['local->cidade'] = value;
          }
        }
      });
      
      // Buscar eventos usando o serviço
      const result = await eventosService.getAll<Evento>({
        page,
        pageSize: perPage,
        orderBy: orderConfig.column,
        orderDirection: orderConfig.direction,
        filters: queryFilters
      });
      
      setEventos(result.data);
      setTotalCount(result.count);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError('Falha ao carregar eventos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getEventoById = async (id: string) => {
    try {
      setLoading(true);
      
      const evento = await eventosService.getById<Evento>(id);
      
      if (evento) {
        // Buscar participantes do evento
        const participantes = await eventosParticipantesService.customQuery(
          (query, organizacaoId) => query
            .select('*')
            .eq('evento_id', id)
            .eq('organizacao_id', organizacaoId)
        );
        
        // Buscar recursos do evento
        const recursos = await eventosRecursosService.customQuery(
          (query, organizacaoId) => query
            .select('*')
            .eq('evento_id', id)
            .eq('organizacao_id', organizacaoId)
        );
        
        // Buscar anexos do evento
        const anexos = await eventosAnexosService.customQuery(
          (query, organizacaoId) => query
            .select('*')
            .eq('evento_id', id)
            .eq('organizacao_id', organizacaoId)
        );
        
        // Adicionar participantes, recursos e anexos ao evento
        return {
          ...evento,
          participantes: participantes.data || [],
          recursos: recursos.data || [],
          anexos: anexos.data || []
        } as Evento;
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao buscar evento:', err);
      setError('Falha ao carregar dados do evento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (evento: Omit<Evento, 'id' | 'organizacaoId' | 'dataRegistro' | 'participantes' | 'recursos' | 'anexos'>) => {
    try {
      setLoading(true);
      
      // O serviço já adiciona o organizacaoId automaticamente
      const novoEvento = await eventosService.create<Evento>({
        ...evento,
        dataRegistro: new Date().toISOString()
      });
      
      return novoEvento;
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      setError('Falha ao criar evento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEvento = async (id: string, updates: Partial<Evento>) => {
    try {
      setLoading(true);
      
      // Remover campos que não devem ser atualizados diretamente
      const { participantes, recursos, anexos, ...dadosAtualizacao } = updates;
      
      const eventoAtualizado = await eventosService.update<Evento>(id, dadosAtualizacao);
      
      return eventoAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      setError('Falha ao atualizar evento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      setLoading(true);
      
      const sucesso = await eventosService.delete(id);
      
      return sucesso;
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      setError('Falha ao excluir evento. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adicionarParticipante = async (
    eventoId: string,
    participanteId: string,
    participanteTipo: string,
    confirmado: boolean = false
  ) => {
    try {
      setLoading(true);
      
      const participante = await eventosParticipantesService.create({
        evento_id: eventoId,
        participante_id: participanteId,
        participante_tipo: participanteTipo,
        confirmado
      });
      
      return participante;
    } catch (err) {
      console.error('Erro ao adicionar participante:', err);
      setError('Falha ao adicionar participante. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmarParticipacao = async (
    eventoId: string,
    participanteId: string,
    participanteTipo: string
  ) => {
    try {
      setLoading(true);
      
      // Buscar o registro do participante
      const participantes = await eventosParticipantesService.customQuery(
        (query, organizacaoId) => query
          .select('id')
          .eq('evento_id', eventoId)
          .eq('participante_id', participanteId)
          .eq('participante_tipo', participanteTipo)
          .eq('organizacao_id', organizacaoId)
          .single()
      );
      
      if (participantes.data && participantes.data.id) {
        // Atualizar o status de confirmação
        const participanteAtualizado = await eventosParticipantesService.update(
          participantes.data.id,
          { confirmado: true }
        );
        
        return participanteAtualizado;
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao confirmar participação:', err);
      setError('Falha ao confirmar participação. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removerParticipante = async (
    eventoId: string,
    participanteId: string,
    participanteTipo: string
  ) => {
    try {
      setLoading(true);
      
      // Buscar o registro do participante
      const participantes = await eventosParticipantesService.customQuery(
        (query, organizacaoId) => query
          .select('id')
          .eq('evento_id', eventoId)
          .eq('participante_id', participanteId)
          .eq('participante_tipo', participanteTipo)
          .eq('organizacao_id', organizacaoId)
          .single()
      );
      
      if (participantes.data && participantes.data.id) {
        // Remover o participante
        const sucesso = await eventosParticipantesService.delete(participantes.data.id);
        
        return sucesso;
      }
      
      return false;
    } catch (err) {
      console.error('Erro ao remover participante:', err);
      setError('Falha ao remover participante. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adicionarRecurso = async (
    eventoId: string,
    nome: string,
    quantidade: number,
    responsavel?: string
  ) => {
    try {
      setLoading(true);
      
      const recurso = await eventosRecursosService.create({
        evento_id: eventoId,
        nome,
        quantidade,
        responsavel
      });
      
      return recurso;
    } catch (err) {
      console.error('Erro ao adicionar recurso:', err);
      setError('Falha ao adicionar recurso. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const adicionarAnexo = async (
    eventoId: string,
    usuarioId: string,
    nome: string,
    url: string,
    tipo: string
  ) => {
    try {
      setLoading(true);
      
      const anexo = await eventosAnexosService.create({
        evento_id: eventoId,
        usuario_id: usuarioId,
        nome,
        url,
        tipo
      });
      
      return anexo;
    } catch (err) {
      console.error('Erro ao adicionar anexo:', err);
      setError('Falha ao adicionar anexo. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getEventosPorPeriodo = async (dataInicio: string, dataFim: string) => {
    try {
      setLoading(true);
      
      const result = await eventosService.getAll<Evento>({
        filters: {
          data_inicio: { gte: dataInicio },
          data_fim: { lte: dataFim }
        },
        orderBy: 'data_inicio',
        orderDirection: 'asc',
        pageSize: 1000 // Buscar todos os eventos do período
      });
      
      return result.data;
    } catch (err) {
      console.error('Erro ao buscar eventos por período:', err);
      setError('Falha ao carregar eventos do período. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    eventos,
    loading,
    error,
    totalCount,
    fetchEventos,
    getEventoById,
    createEvento,
    updateEvento,
    deleteEvento,
    adicionarParticipante,
    confirmarParticipacao,
    removerParticipante,
    adicionarRecurso,
    adicionarAnexo,
    getEventosPorPeriodo
  };
} 