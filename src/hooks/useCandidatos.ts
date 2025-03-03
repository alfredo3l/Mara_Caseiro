import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Candidato {
  id: string;
  nome: string;
  partido: string;
  cargo: string;
  numero: string;
  biografia: string;
  fotoUrl: string;
  redesSociais: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    site?: string;
  };
  status: 'Ativo' | 'Inativo';
  dataRegistro: string;
  organizacaoId: string;
}

export function useCandidatos() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCandidatos = async (page = 1, pageSize = 10, searchTerm = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error, count } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact' })
        .ilike('nome', `%${searchTerm}%`)
        .order('nome', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (error) throw error;
      
      setCandidatos(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Erro ao buscar candidatos:', err);
      setError('Não foi possível carregar os candidatos.');
    } finally {
      setLoading(false);
    }
  };

  const getCandidatoById = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Candidato;
    } catch (err) {
      console.error('Erro ao buscar candidato:', err);
      setError('Não foi possível carregar o candidato.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCandidato = async (candidato: Omit<Candidato, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .insert([candidato])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Candidato;
    } catch (err) {
      console.error('Erro ao criar candidato:', err);
      setError('Não foi possível criar o candidato.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCandidato = async (id: string, candidato: Partial<Candidato>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .update(candidato)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Candidato;
    } catch (err) {
      console.error('Erro ao atualizar candidato:', err);
      setError('Não foi possível atualizar o candidato.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidato = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir candidato:', err);
      setError('Não foi possível excluir o candidato.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    candidatos,
    loading,
    error,
    totalCount,
    fetchCandidatos,
    getCandidatoById,
    createCandidato,
    updateCandidato,
    deleteCandidato
  };
} 