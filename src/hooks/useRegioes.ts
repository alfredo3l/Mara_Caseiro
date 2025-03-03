import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Regiao, Cidade, Estado } from '@/types/regiao';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export function useRegioes() {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRegioes = async (
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
        .from('regioes')
        .select('*', { count: 'exact' });
      
      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cidade.ilike.%${searchTerm}%`);
      }
      
      // Aplicar filtros adicionais
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'tipo') {
            if (Array.isArray(value)) {
              query = query.in('tipo', value);
            } else {
              query = query.eq('tipo', value);
            }
          } else if (key === 'cidade') {
            query = query.eq('cidade', value);
          } else if (key === 'estado') {
            query = query.eq('estado', value);
          } else if (key === 'prioridade') {
            if (Array.isArray(value)) {
              query = query.in('prioridade', value);
            } else {
              query = query.eq('prioridade', value);
            }
          } else if (key === 'coordenadorId') {
            query = query.eq('coordenador->id', value);
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
      
      setRegioes(data as Regiao[]);
      setTotalCount(count || 0);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar regiões:', err);
      setError('Falha ao carregar regiões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getRegiaoById = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('regioes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Regiao;
    } catch (err) {
      console.error('Erro ao buscar região:', err);
      setError('Falha ao carregar dados da região. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createRegiao = async (regiao: Omit<Regiao, 'id'>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('regioes')
        .insert([regiao])
        .select();
      
      if (error) throw error;
      
      return data[0] as Regiao;
    } catch (err) {
      console.error('Erro ao criar região:', err);
      setError('Falha ao criar região. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRegiao = async (id: string, updates: Partial<Regiao>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('regioes')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data[0] as Regiao;
    } catch (err) {
      console.error('Erro ao atualizar região:', err);
      setError('Falha ao atualizar região. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRegiao = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('regioes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir região:', err);
      setError('Falha ao excluir região. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar cidades
  const fetchCidades = async (
    estado?: string,
    searchTerm = '',
    orderConfig: OrderConfig = { column: 'nome', direction: 'asc' }
  ) => {
    try {
      setLoading(true);
      
      // Iniciar a query
      let query = supabase
        .from('cidades')
        .select('*', { count: 'exact' });
      
      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }
      
      if (estado) {
        query = query.eq('estado', estado);
      }
      
      // Aplicar ordenação
      query = query.order(orderConfig.column, { ascending: orderConfig.direction === 'asc' });
      
      // Executar a query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setCidades(data as Cidade[]);
      setTotalCount(count || 0);
      setError(null);
      return data as Cidade[];
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
      setError('Falha ao carregar cidades. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar estados
  const fetchEstados = async (
    searchTerm = '',
    orderConfig: OrderConfig = { column: 'nome', direction: 'asc' }
  ) => {
    try {
      setLoading(true);
      
      // Iniciar a query
      let query = supabase
        .from('estados')
        .select('*', { count: 'exact' });
      
      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,sigla.ilike.%${searchTerm}%`);
      }
      
      // Aplicar ordenação
      query = query.order(orderConfig.column, { ascending: orderConfig.direction === 'asc' });
      
      // Executar a query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setEstados(data as Estado[]);
      setTotalCount(count || 0);
      setError(null);
      return data as Estado[];
    } catch (err) {
      console.error('Erro ao buscar estados:', err);
      setError('Falha ao carregar estados. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRegioesByCoordenador = async (coordenadorId: string) => {
    try {
      setLoading(true);
      
      const { data, error, count } = await supabase
        .from('regioes')
        .select('*', { count: 'exact' })
        .eq('coordenador->id', coordenadorId);
      
      if (error) throw error;
      
      setRegioes(data as Regiao[]);
      setTotalCount(count || 0);
      return data as Regiao[];
    } catch (err) {
      console.error('Erro ao buscar regiões por coordenador:', err);
      setError('Falha ao carregar regiões. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    regioes,
    cidades,
    estados,
    loading,
    error,
    totalCount,
    fetchRegioes,
    getRegiaoById,
    createRegiao,
    updateRegiao,
    deleteRegiao,
    fetchCidades,
    fetchEstados,
    getRegioesByCoordenador
  };
} 