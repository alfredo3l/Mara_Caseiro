import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export interface Politico {
  nomeUrna: string | null;
  localCandidatura: string | null;
  fotoUrl: string | null;
  cargo: string | null;
  siglaPartido: string | null;
  qtdVotos: number | null;
  status: string | null;
  Resultado: string | null;
}

export function usePrefeitos() {
  const [prefeitos, setPrefeitos] = useState<Politico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPrefeitos = async (
    page = 1, 
    perPage = 5, 
    searchTerm = '', 
    filtroEleito?: boolean,
    orderConfig?: OrderConfig,
    filtroCidade = '',
    filtroPartido = '',
    filtroCargo = '',
    filtroNomeUrna = ''
  ) => {
    try {
      console.log('Iniciando busca de prefeitos com parâmetros:', {
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
        `, { 
          count: 'exact' 
        });

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

      // Aplica ordenação conforme a coluna selecionada
      if (orderConfig?.column === 'qtdVotos') {
        query = query
          .order('qtdVotos', { 
            ascending: orderConfig.direction === 'asc',
            nullsFirst: false
          })
          .range(from, to);
      } else if (orderConfig) {
        query = query
          .order(orderConfig.column, { 
            ascending: orderConfig.direction === 'asc',
            nullsFirst: orderConfig.direction === 'asc'
          })
          .range(from, to);
      } else {
        query = query.range(from, to);
      }

      console.log('Executando query na tabela eleicoes com ordenação:', orderConfig);
      const { data, error, count } = await query;

      if (error) {
        console.error('Erro detalhado na query:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Resultados da busca:', {
        total: count,
        encontrados: data?.length || 0,
        primeiroRegistro: data?.[0],
        ordenacao: orderConfig
      });

      setPrefeitos(data || []);
      if (count !== null) setTotalCount(count);

    } catch (err: any) {
      console.error('Erro completo ao buscar políticos:', err);
      setError(err?.message || 'Erro ao carregar dados. Por favor, tente novamente.');
      setPrefeitos([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updatePrefeito = async (nomeUrna: string, dadosAtualizados: Partial<Politico>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eleicoes')
        .update(dadosAtualizados)
        .eq('"nomeUrna"', nomeUrna)
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

      setPrefeitos(prev => prev.map(p => p.nomeUrna === nomeUrna ? { ...p, ...data } : p));
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao atualizar político:', err);
      return { success: false, error: err?.message || 'Erro ao atualizar dados. Por favor, tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const deletePrefeito = async (nomeUrna: string | null) => {
    try {
      if (!nomeUrna) {
        throw new Error('Nome da urna não pode ser nulo');
      }

      setLoading(true);
      const { error } = await supabase
        .from('eleicoes')
        .delete()
        .eq('"nomeUrna"', nomeUrna);

      if (error) throw error;

      setPrefeitos(prev => prev.filter(p => p.nomeUrna !== nomeUrna));
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao deletar político:', err);
      return { success: false, error: err?.message || 'Erro ao deletar registro. Por favor, tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  return {
    prefeitos,
    loading,
    error,
    totalCount,
    fetchPrefeitos,
    updatePrefeito,
    deletePrefeito
  };
} 