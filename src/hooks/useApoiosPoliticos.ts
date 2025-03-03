import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Candidato {
  id: string;
  nome: string;
  partido: string;
  cargo: string;
}

interface Apoiador {
  id: string;
  nome: string;
  cargo: string;
}

export interface ApoioPolitico {
  id: string;
  apoiadorId: string;
  candidatoId: string;
  tipoApoio: string;
  dataApoio: string;
  dataRegistro: string;
  nivelInfluencia: number;
  status: string;
  observacoes: string;
  documentos: string[];
  organizacaoId: string;
  apoiador: Apoiador;
  candidato: Candidato;
}

export function useApoiosPoliticos() {
  const [apoios, setApoios] = useState<ApoioPolitico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApoios = async (page = 1, pageSize = 10, searchTerm = '', filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('apoios_politicos')
        .select('*', { count: 'exact' });
      
      if (searchTerm) {
        query = query.ilike('tipoApoio', `%${searchTerm}%`);
      }
      
      // Aplicar filtros adicionais
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Usar await diretamente na query final para resolver o erro de tipo
      const result = await query
        .order('dataRegistro', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      const { data, error, count } = result;
      
      if (error) throw error;
      
      setApoios(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Erro ao buscar apoios políticos:', err);
      setError('Não foi possível carregar os apoios políticos.');
    } finally {
      setLoading(false);
    }
  };

  const getApoioPoliticoById = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await supabase
        .from('apoios_politicos')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = result;
      
      if (error) throw error;
      
      return data as ApoioPolitico;
    } catch (err) {
      console.error('Erro ao buscar apoio político:', err);
      setError('Não foi possível carregar o apoio político.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createApoioPolitico = async (apoioPolitico: Omit<ApoioPolitico, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await supabase
        .from('apoios_politicos')
        .insert([apoioPolitico])
        .select();
      
      const { data, error } = result;
      
      if (error) throw error;
      
      return data?.[0] as ApoioPolitico;
    } catch (err) {
      console.error('Erro ao criar apoio político:', err);
      setError('Não foi possível criar o apoio político.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateApoioPolitico = async (id: string, apoioPolitico: Partial<ApoioPolitico>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await supabase
        .from('apoios_politicos')
        .update(apoioPolitico)
        .eq('id', id)
        .select();
      
      const { data, error } = result;
      
      if (error) throw error;
      
      return data?.[0] as ApoioPolitico;
    } catch (err) {
      console.error('Erro ao atualizar apoio político:', err);
      setError('Não foi possível atualizar o apoio político.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteApoioPolitico = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await supabase
        .from('apoios_politicos')
        .delete()
        .eq('id', id);
      
      const { error } = result;
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir apoio político:', err);
      setError('Não foi possível excluir o apoio político.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    apoios,
    loading,
    error,
    totalCount,
    fetchApoios,
    getApoioPoliticoById,
    createApoioPolitico,
    updateApoioPolitico,
    deleteApoioPolitico
  };
} 