import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Atendimento } from '@/types/atendimento';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export function useAtendimentos() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAtendimentos = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filters: Record<string, any> = {},
    orderConfig: OrderConfig = { column: 'dataAgendamento', direction: 'desc' }
  ) => {
    try {
      setLoading(true);
      
      // Calcular offset para paginação
      const offset = (page - 1) * perPage;
      
      // Iniciar a query
      let query = supabase
        .from('atendimentos')
        .select('*', { count: 'exact' });
      
      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }
      
      // Aplicar filtros adicionais
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'status') {
            if (Array.isArray(value)) {
              query = query.in('status', value);
            } else {
              query = query.eq('status', value);
            }
          } else if (key === 'tipo') {
            query = query.eq('tipo', value);
          } else if (key === 'categoria') {
            if (Array.isArray(value)) {
              query = query.in('categoria', value);
            } else {
              query = query.eq('categoria', value);
            }
          } else if (key === 'prioridade') {
            if (Array.isArray(value)) {
              query = query.in('prioridade', value);
            } else {
              query = query.eq('prioridade', value);
            }
          } else if (key === 'solicitanteId') {
            query = query.eq('solicitante->id', value);
          } else if (key === 'atendenteId') {
            query = query.eq('atendente->id', value);
          } else if (key === 'cidade') {
            query = query.eq('localizacao->cidade', value);
          } else if (key === 'estado') {
            query = query.eq('localizacao->estado', value);
          } else if (key === 'dataInicio' && key === 'dataFim') {
            query = query.gte('dataAgendamento', filters.dataInicio).lte('dataAgendamento', filters.dataFim);
          } else if (key === 'dataInicio') {
            query = query.gte('dataAgendamento', value);
          } else if (key === 'dataFim') {
            query = query.lte('dataAgendamento', value);
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
      
      setAtendimentos(data as Atendimento[]);
      setTotalCount(count || 0);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar atendimentos:', err);
      setError('Falha ao carregar atendimentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getAtendimentoById = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('atendimentos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Atendimento;
    } catch (err) {
      console.error('Erro ao buscar atendimento:', err);
      setError('Falha ao carregar atendimento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAtendimento = async (atendimento: Omit<Atendimento, 'id'>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('atendimentos')
        .insert([atendimento])
        .select();
      
      if (error) throw error;
      
      setAtendimentos(prev => [...prev, data[0] as Atendimento]);
      
      return data[0] as Atendimento;
    } catch (err) {
      console.error('Erro ao criar atendimento:', err);
      setError('Falha ao criar atendimento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAtendimento = async (id: string, updates: Partial<Atendimento>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('atendimentos')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      setAtendimentos(prev => 
        prev.map(item => item.id === id ? { ...item, ...data[0] } as Atendimento : item)
      );
      
      return data[0] as Atendimento;
    } catch (err) {
      console.error('Erro ao atualizar atendimento:', err);
      setError('Falha ao atualizar atendimento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAtendimento = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('atendimentos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAtendimentos(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir atendimento:', err);
      setError('Falha ao excluir atendimento. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adicionarEncaminhamento = async (
    id: string, 
    encaminhamento: { 
      data: string; 
      responsavel: string; 
      setor: string;
      descricao: string;
      status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
    }
  ) => {
    try {
      setLoading(true);
      
      // Primeiro, buscar o atendimento atual
      const { data: atendimentoAtual, error: errorBusca } = await supabase
        .from('atendimentos')
        .select('encaminhamentos')
        .eq('id', id)
        .single();
      
      if (errorBusca) throw errorBusca;
      
      // Adicionar o novo encaminhamento à lista existente
      const encaminhamentosAtualizados = [
        ...(atendimentoAtual?.encaminhamentos || []),
        encaminhamento
      ];
      
      // Atualizar o atendimento com a nova lista de encaminhamentos
      const { data, error } = await supabase
        .from('atendimentos')
        .update({ encaminhamentos: encaminhamentosAtualizados })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      setAtendimentos(prev => 
        prev.map(item => item.id === id ? { ...item, ...data[0] } as Atendimento : item)
      );
      
      return data[0] as Atendimento;
    } catch (err) {
      console.error('Erro ao adicionar encaminhamento:', err);
      setError('Falha ao adicionar encaminhamento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusAtendimento = async (
    id: string,
    novoStatus: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado',
    dataAtendimento?: string
  ) => {
    try {
      setLoading(true);
      
      const updates: Partial<Atendimento> = { status: novoStatus };
      
      // Se for concluído, adicionar a data de atendimento
      if (novoStatus === 'Concluído' && dataAtendimento) {
        updates.dataAtendimento = dataAtendimento;
      }
      
      const { data, error } = await supabase
        .from('atendimentos')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      setAtendimentos(prev => 
        prev.map(item => item.id === id ? { ...item, ...data[0] } as Atendimento : item)
      );
      
      return data[0] as Atendimento;
    } catch (err) {
      console.error('Erro ao atualizar status do atendimento:', err);
      setError('Falha ao atualizar status do atendimento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    atendimentos,
    loading,
    error,
    totalCount,
    fetchAtendimentos,
    getAtendimentoById,
    createAtendimento,
    updateAtendimento,
    deleteAtendimento,
    adicionarEncaminhamento,
    atualizarStatusAtendimento
  };
} 