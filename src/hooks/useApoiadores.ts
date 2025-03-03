import { useState } from 'react';
import { Apoiador } from '@/types/apoiador';
import { apoiadoresService } from '@/services/supabase';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export function useApoiadores() {
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApoiadores = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filters: Record<string, any> = {},
    orderConfig: OrderConfig = { column: 'nome', direction: 'asc' }
  ) => {
    try {
      setLoading(true);
      
      // Preparar filtros
      const queryFilters: Record<string, any> = {};
      
      // Adicionar filtro de busca
      if (searchTerm) {
        queryFilters.nome = { like: searchTerm };
        // Nota: para busca em múltiplos campos, usaremos customQuery em uma implementação futura
      }
      
      // Aplicar filtros adicionais
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'liderancaId') {
            queryFilters.lideranca_id = value;
          } else if (key === 'cidade') {
            // Para campos JSONB, usaremos customQuery em uma implementação futura
            // Por enquanto, simplificamos para demonstração
            queryFilters['endereco->cidade'] = value;
          } else if (key === 'estado') {
            queryFilters['endereco->estado'] = value;
          } else if (key === 'nivelEngajamento') {
            if (Array.isArray(value)) {
              queryFilters.nivel_engajamento = value;
            } else {
              queryFilters.nivel_engajamento = value;
            }
          } else if (key === 'status') {
            queryFilters.status = value;
          } else if (key === 'tags' && Array.isArray(value)) {
            queryFilters.tags = { contains: value };
          }
        }
      });
      
      // Buscar apoiadores usando o serviço
      const result = await apoiadoresService.getAll<Apoiador>({
        page,
        pageSize: perPage,
        orderBy: orderConfig.column,
        orderDirection: orderConfig.direction,
        filters: queryFilters
      });
      
      setApoiadores(result.data);
      setTotalCount(result.count);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar apoiadores:', err);
      setError('Falha ao carregar apoiadores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getApoiadorById = async (id: string) => {
    try {
      setLoading(true);
      
      const apoiador = await apoiadoresService.getById<Apoiador>(id);
      
      return apoiador;
    } catch (err) {
      console.error('Erro ao buscar apoiador:', err);
      setError('Falha ao carregar dados do apoiador. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createApoiador = async (apoiador: Omit<Apoiador, 'id' | 'organizacaoId'>) => {
    try {
      setLoading(true);
      
      // O serviço já adiciona o organizacaoId automaticamente
      const novoApoiador = await apoiadoresService.create<Apoiador>(apoiador);
      
      return novoApoiador;
    } catch (err) {
      console.error('Erro ao criar apoiador:', err);
      setError('Falha ao criar apoiador. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateApoiador = async (id: string, updates: Partial<Apoiador>) => {
    try {
      setLoading(true);
      
      const apoiadorAtualizado = await apoiadoresService.update<Apoiador>(id, updates);
      
      return apoiadorAtualizado;
    } catch (err) {
      console.error('Erro ao atualizar apoiador:', err);
      setError('Falha ao atualizar apoiador. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteApoiador = async (id: string) => {
    try {
      setLoading(true);
      
      const sucesso = await apoiadoresService.delete(id);
      
      return sucesso;
    } catch (err) {
      console.error('Erro ao excluir apoiador:', err);
      setError('Falha ao excluir apoiador. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getApoiadoresByLideranca = async (liderancaId: string) => {
    try {
      setLoading(true);
      
      const result = await apoiadoresService.getAll<Apoiador>({
        filters: { lideranca_id: liderancaId },
        pageSize: 1000 // Buscar todos os apoiadores da liderança
      });
      
      setApoiadores(result.data);
      setTotalCount(result.count);
      return result.data;
    } catch (err) {
      console.error('Erro ao buscar apoiadores por liderança:', err);
      setError('Falha ao carregar apoiadores. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    apoiadores,
    loading,
    error,
    totalCount,
    fetchApoiadores,
    getApoiadorById,
    createApoiador,
    updateApoiador,
    deleteApoiador,
    getApoiadoresByLideranca
  };
} 