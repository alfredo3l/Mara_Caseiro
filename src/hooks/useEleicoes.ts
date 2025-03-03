import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export interface Eleicao {
  nomeUrna: string | null;
  localCandidatura: string | null;
  fotoUrl: string | null;
  cargo: string | null;
  siglaPartido: string | null;
  qtdVotos: number | null;
  status: string | null;
  Resultado: string | null;
}

export function useEleicoes() {
  const [eleicoes, setEleicoes] = useState<Eleicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEleicoes = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filtroEleito?: boolean,
    orderConfig?: OrderConfig,
    filtroCidade = '',
    filtroPartido = '',
    filtroCargo = '',
    filtroNomeUrna = ''
  ) => {
    try {
      console.log('Iniciando busca de eleições com parâmetros:', {
        page,
        perPage,
        searchTerm,
        filtroEleito,
        orderConfig,
        filtroCidade,
        filtroPartido,
        filtroCargo,
        filtroNomeUrna
      });

      setLoading(true);
      setError(null);

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('eleicoes')
        .select(`
          "nomeUrna",
          "localCandidatura",
          "fotoUrl",
          cargo,
          "siglaPartido",
          "qtdVotos",
          status,
          "Resultado"
        `, { count: 'exact' });

      // Aplicar filtros específicos
      if (filtroCidade) {
        query = query.ilike('localCandidatura', `%${filtroCidade}%`);
      }

      if (filtroPartido) {
        query = query.ilike('siglaPartido', `%${filtroPartido}%`);
      }

      if (filtroCargo) {
        query = query.ilike('cargo', `%${filtroCargo}%`);
      }

      if (filtroNomeUrna) {
        query = query.ilike('nomeUrna', `%${filtroNomeUrna}%`);
      }

      if (searchTerm) {
        const searchFilter = [
          `"nomeUrna".ilike.%${searchTerm}%`,
          `"localCandidatura".ilike.%${searchTerm}%`,
          `"siglaPartido".ilike.%${searchTerm}%`,
          `cargo.ilike.%${searchTerm}%`,
          `status.ilike.%${searchTerm}%`
        ].join(',');
        
        query = query.or(searchFilter);
      }

      if (filtroEleito !== undefined) {
        query = query.eq('status', filtroEleito ? 'Eleito' : 'Não eleito');
      }

      // Aplica ordenação
      if (orderConfig?.column === 'qtdVotos') {
        query = query
          .order('qtdVotos', { 
            ascending: orderConfig.direction === 'asc',
            nullsFirst: false
          });
      } else if (orderConfig) {
        query = query
          .order(orderConfig.column, { 
            ascending: orderConfig.direction === 'asc',
            nullsFirst: orderConfig.direction === 'asc'
          });
      }

      // Aplica paginação
      query = query.range(from, to);

      console.log('Executando query na tabela eleicoes');
      const { data, error: supabaseError, count } = await query;

      if (supabaseError) {
        console.error('Erro detalhado na query:', {
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code
        });
        throw supabaseError;
      }

      console.log('Resultados da busca:', {
        total: count,
        encontrados: data?.length || 0,
        primeiroRegistro: data?.[0],
        ordenacao: orderConfig
      });

      setEleicoes(data || []);
      if (count !== null) setTotalCount(count);

    } catch (err: any) {
      console.error('Erro completo ao buscar eleições:', err);
      setError(err?.message || 'Erro ao carregar dados. Por favor, tente novamente.');
      setEleicoes([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateEleicao = async (nomeUrna: string, dadosAtualizados: Partial<Eleicao>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eleicoes')
        .update(dadosAtualizados)
        .eq('nomeUrna', nomeUrna)
        .select(`
          "nomeUrna",
          "localCandidatura",
          "fotoUrl",
          cargo,
          "siglaPartido",
          "qtdVotos",
          status,
          "Resultado"
        `)
        .single();

      if (error) throw error;

      setEleicoes(prev => prev.map(e => e.nomeUrna === nomeUrna ? { ...e, ...data } : e));
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao atualizar eleição:', err);
      return { success: false, error: err?.message || 'Erro ao atualizar dados. Por favor, tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteEleicao = async (nomeUrna: string | null) => {
    try {
      if (!nomeUrna) {
        throw new Error('Nome da urna não pode ser nulo');
      }

      setLoading(true);
      const { error } = await supabase
        .from('eleicoes')
        .delete()
        .eq('nomeUrna', nomeUrna);

      if (error) throw error;

      setEleicoes(prev => prev.filter(e => e.nomeUrna !== nomeUrna));
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao deletar eleição:', err);
      return { success: false, error: err?.message || 'Erro ao deletar registro. Por favor, tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const createEleicao = async (novaEleicao: Eleicao) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eleicoes')
        .insert(novaEleicao)
        .select(`
          "nomeUrna",
          "localCandidatura",
          "fotoUrl",
          cargo,
          "siglaPartido",
          "qtdVotos",
          status,
          "Resultado"
        `)
        .single();

      if (error) throw error;

      setEleicoes(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao criar eleição:', err);
      return { success: false, error: err?.message || 'Erro ao criar eleição. Por favor, tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  return {
    eleicoes,
    loading,
    error,
    totalCount,
    fetchEleicoes,
    updateEleicao,
    deleteEleicao,
    createEleicao
  };
} 