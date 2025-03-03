import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lideranca } from '@/types/apoiador';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export function useLiderancas() {
  const [liderancas, setLiderancas] = useState<Lideranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLiderancas = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filters: Record<string, any> = {},
    orderConfig: OrderConfig = { column: 'nome', direction: 'asc' }
  ) => {
    try {
      setLoading(true);
      
      // Calcular offset para paginação
      const offset = (page - 1) * perPage;
      
      // Iniciar a query
      let query = supabase
        .from('liderancas')
        .select('*', { count: 'exact' });
      
      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,endereco->>bairro.ilike.%${searchTerm}%`);
      }
      
      // Aplicar filtros adicionais
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'candidatoId') {
            query = query.eq('candidatoId', value);
          } else if (key === 'regiaoId') {
            query = query.eq('regiaoId', value);
          } else if (key === 'cidade') {
            query = query.eq('endereco->cidade', value);
          } else if (key === 'estado') {
            query = query.eq('endereco->estado', value);
          } else if (key === 'status') {
            query = query.eq('status', value);
          }
        }
      });
      
      // Aplicar ordenação
      query = query.order(orderConfig.column, { ascending: orderConfig.direction === 'asc' });
      
      // Aplicar paginação
      query = query.range(offset, offset + perPage - 1);
      
      // Executar a query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setLiderancas(data as Lideranca[]);
      setTotalCount(count || 0);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar lideranças:', err);
      setError('Falha ao carregar lideranças. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getLiderancaById = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('liderancas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Lideranca;
    } catch (err) {
      console.error('Erro ao buscar liderança:', err);
      setError('Falha ao carregar dados da liderança. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createLideranca = async (lideranca: Omit<Lideranca, 'id'>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('liderancas')
        .insert([lideranca])
        .select();
      
      if (error) throw error;
      
      return data[0] as Lideranca;
    } catch (err) {
      console.error('Erro ao criar liderança:', err);
      setError('Falha ao criar liderança. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateLideranca = async (id: string, updates: Partial<Lideranca>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('liderancas')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data[0] as Lideranca;
    } catch (err) {
      console.error('Erro ao atualizar liderança:', err);
      setError('Falha ao atualizar liderança. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteLideranca = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('liderancas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir liderança:', err);
      setError('Falha ao excluir liderança. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getLiderancasByCandidato = async (candidatoId: string) => {
    try {
      setLoading(true);
      
      const { data, error, count } = await supabase
        .from('liderancas')
        .select('*', { count: 'exact' })
        .eq('candidatoId', candidatoId);
      
      if (error) throw error;
      
      setLiderancas(data as Lideranca[]);
      setTotalCount(count || 0);
      return data as Lideranca[];
    } catch (err) {
      console.error('Erro ao buscar lideranças por candidato:', err);
      setError('Falha ao carregar lideranças. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getLiderancasByRegiao = async (regiaoId: string) => {
    try {
      setLoading(true);
      
      const { data, error, count } = await supabase
        .from('liderancas')
        .select('*', { count: 'exact' })
        .eq('regiaoId', regiaoId);
      
      if (error) throw error;
      
      setLiderancas(data as Lideranca[]);
      setTotalCount(count || 0);
      return data as Lideranca[];
    } catch (err) {
      console.error('Erro ao buscar lideranças por região:', err);
      setError('Falha ao carregar lideranças. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const atualizarQtdApoiadores = async (id: string) => {
    try {
      setLoading(true);
      
      // Contar apoiadores desta liderança
      const { count, error: countError } = await supabase
        .from('apoiadores')
        .select('id', { count: 'exact' })
        .eq('liderancaId', id);
      
      if (countError) throw countError;
      
      // Atualizar a liderança com a contagem
      const { data, error } = await supabase
        .from('liderancas')
        .update({ qtdApoiadores: count || 0 })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data[0] as Lideranca;
    } catch (err) {
      console.error('Erro ao atualizar quantidade de apoiadores:', err);
      setError('Falha ao atualizar quantidade de apoiadores. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    liderancas,
    loading,
    error,
    totalCount,
    fetchLiderancas,
    getLiderancaById,
    createLideranca,
    updateLideranca,
    deleteLideranca,
    getLiderancasByCandidato,
    getLiderancasByRegiao,
    atualizarQtdApoiadores
  };
} 