import { useState } from 'react';
import { Demanda, DemandaStatus } from '@/types/demanda';
import { demandasService, demandasAtualizacoesService, demandasAnexosService } from '@/services/supabase';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export function useDemandas() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDemandas = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filters: Record<string, any> = {},
    orderConfig: OrderConfig = { column: 'dataRegistro', direction: 'desc' }
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
            const statusMap: Record<DemandaStatus, string> = {
              'abertas': 'Aberta',
              'em_analise': 'Em Análise',
              'em_andamento': 'Em Andamento',
              'concluidas': 'Concluída',
              'canceladas': 'Cancelada'
            };
            
            if (typeof value === 'string' && value in statusMap) {
              queryFilters.status = statusMap[value as DemandaStatus];
            } else if (Array.isArray(value)) {
              queryFilters.status = value.map(s => statusMap[s as DemandaStatus]);
            }
          } else if (key === 'categoria') {
            queryFilters.categoria = value;
          } else if (key === 'prioridade') {
            queryFilters.prioridade = value;
          } else if (key === 'tipo') {
            queryFilters.tipo = value;
          } else if (key === 'solicitanteId') {
            queryFilters.solicitante_id = value;
          } else if (key === 'responsavelId') {
            queryFilters.responsavel_id = value;
          } else if (key === 'dataInicio' && key === 'dataFim') {
            // Para filtros de data, usaremos customQuery em uma implementação futura
          }
        }
      });
      
      // Buscar demandas usando o serviço
      const result = await demandasService.getAll<Demanda>({
        page,
        pageSize: perPage,
        orderBy: orderConfig.column,
        orderDirection: orderConfig.direction,
        filters: queryFilters
      });
      
      setDemandas(result.data);
      setTotalCount(result.count);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar demandas:', err);
      setError('Falha ao carregar demandas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getDemandaById = async (id: string) => {
    try {
      setLoading(true);
      
      const demanda = await demandasService.getById<Demanda>(id);
      
      if (demanda) {
        // Buscar atualizações da demanda
        const atualizacoes = await demandasAtualizacoesService.customQuery(
          (query, organizacaoId) => query
            .select('*')
            .eq('demanda_id', id)
            .eq('organizacao_id', organizacaoId)
            .order('created_at', { ascending: false })
        );
        
        // Buscar anexos da demanda
        const anexos = await demandasAnexosService.customQuery(
          (query, organizacaoId) => query
            .select('*')
            .eq('demanda_id', id)
            .eq('organizacao_id', organizacaoId)
            .order('created_at', { ascending: false })
        );
        
        // Adicionar atualizações e anexos à demanda
        return {
          ...demanda,
          atualizacoes: atualizacoes.data || [],
          anexos: anexos.data || []
        } as Demanda;
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao buscar demanda:', err);
      setError('Falha ao carregar dados da demanda. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDemanda = async (demanda: Omit<Demanda, 'id' | 'organizacaoId' | 'dataRegistro' | 'atualizacoes' | 'anexos'>) => {
    try {
      setLoading(true);
      
      // O serviço já adiciona o organizacaoId automaticamente
      const novaDemanda = await demandasService.create<Demanda>({
        ...demanda,
        dataRegistro: new Date().toISOString()
      });
      
      return novaDemanda;
    } catch (err) {
      console.error('Erro ao criar demanda:', err);
      setError('Falha ao criar demanda. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDemanda = async (id: string, updates: Partial<Demanda>) => {
    try {
      setLoading(true);
      
      // Remover campos que não devem ser atualizados diretamente
      const { atualizacoes, anexos, ...dadosAtualizacao } = updates;
      
      const demandaAtualizada = await demandasService.update<Demanda>(id, dadosAtualizacao);
      
      return demandaAtualizada;
    } catch (err) {
      console.error('Erro ao atualizar demanda:', err);
      setError('Falha ao atualizar demanda. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDemanda = async (id: string) => {
    try {
      setLoading(true);
      
      const sucesso = await demandasService.delete(id);
      
      return sucesso;
    } catch (err) {
      console.error('Erro ao excluir demanda:', err);
      setError('Falha ao excluir demanda. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adicionarAtualizacao = async (
    demandaId: string, 
    usuarioId: string, 
    comentario: string, 
    novoStatus?: string
  ) => {
    try {
      setLoading(true);
      
      // Adicionar atualização
      const atualizacao = await demandasAtualizacoesService.create({
        demanda_id: demandaId,
        usuario_id: usuarioId,
        comentario,
        status: novoStatus
      });
      
      // Se houver mudança de status, atualizar a demanda
      if (novoStatus) {
        await demandasService.update(demandaId, { status: novoStatus });
      }
      
      return atualizacao;
    } catch (err) {
      console.error('Erro ao adicionar atualização:', err);
      setError('Falha ao adicionar atualização. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const adicionarAnexo = async (
    demandaId: string,
    usuarioId: string,
    nome: string,
    url: string,
    tipo: string
  ) => {
    try {
      setLoading(true);
      
      const anexo = await demandasAnexosService.create({
        demanda_id: demandaId,
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

  const getDemandasPorStatus = async () => {
    try {
      setLoading(true);
      
      // Usar customQuery para agrupar demandas por status
      const result = await demandasService.customQuery(
        (query, organizacaoId) => query
          .select('status, count(*)')
          .eq('organizacao_id', organizacaoId)
          .group('status')
      );
      
      return result.data || [];
    } catch (err) {
      console.error('Erro ao buscar demandas por status:', err);
      setError('Falha ao carregar estatísticas de demandas. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    demandas,
    loading,
    error,
    totalCount,
    fetchDemandas,
    getDemandaById,
    createDemanda,
    updateDemanda,
    deleteDemanda,
    adicionarAtualizacao,
    adicionarAnexo,
    getDemandasPorStatus
  };
} 