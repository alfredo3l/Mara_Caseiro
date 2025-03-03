import { supabase } from '@/lib/supabase';
import { getOrganizacaoId } from '@/config/organizacao';

/**
 * Serviço para gerenciar operações CRUD com o Supabase
 * Todas as operações incluem automaticamente o filtro de organizacaoId
 */
export class SupabaseService {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  /**
   * Obtém todos os registros da tabela com filtro de organização
   * @param options Opções de consulta (ordenação, filtros, etc.)
   * @returns Lista de registros
   */
  async getAll<T>(options: {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
    select?: string;
  } = {}): Promise<{ data: T[]; count: number }> {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'created_at',
      orderDirection = 'desc',
      filters = {},
      select = '*',
    } = options;

    // Adiciona o filtro de organização
    const organizacaoId = getOrganizacaoId();
    const allFilters = { ...filters, organizacao_id: organizacaoId };

    // Calcula o range para paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Constrói a consulta
    let query = supabase
      .from(this.table)
      .select(select, { count: 'exact' })
      .eq('organizacao_id', organizacaoId)
      .range(from, to)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    // Adiciona filtros adicionais
    Object.entries(allFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'organizacao_id') {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value !== null) {
          if ('contains' in value) {
            query = query.contains(key, value.contains);
          } else if ('like' in value) {
            query = query.ilike(key, `%${value.like}%`);
          } else if ('gt' in value) {
            query = query.gt(key, value.gt);
          } else if ('lt' in value) {
            query = query.lt(key, value.lt);
          } else if ('gte' in value) {
            query = query.gte(key, value.gte);
          } else if ('lte' in value) {
            query = query.lte(key, value.lte);
          } else if ('neq' in value) {
            query = query.neq(key, value.neq);
          }
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error, count } = await query;

    if (error) {
      console.error(`Erro ao buscar registros da tabela ${this.table}:`, error);
      throw error;
    }

    return { data: data as T[], count: count || 0 };
  }

  /**
   * Obtém um registro pelo ID
   * @param id ID do registro
   * @param select Campos a serem selecionados
   * @returns Registro encontrado ou null
   */
  async getById<T>(id: string, select: string = '*'): Promise<T | null> {
    const organizacaoId = getOrganizacaoId();

    const { data, error } = await supabase
      .from(this.table)
      .select(select)
      .eq('id', id)
      .eq('organizacao_id', organizacaoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Registro não encontrado
        return null;
      }
      console.error(`Erro ao buscar registro da tabela ${this.table}:`, error);
      throw error;
    }

    return data as T;
  }

  /**
   * Cria um novo registro
   * @param data Dados do registro
   * @returns Registro criado
   */
  async create<T>(data: Partial<T>): Promise<T | null> {
    try {
      console.log(`Iniciando criação na tabela ${this.table} com dados:`, data);
      
      const { data: createdData, error } = await supabase
        .from(this.table)
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao criar registro na tabela ${this.table}:`, error);
        return null;
      }

      if (!createdData) {
        console.error(`Nenhum dado retornado ao criar registro na tabela ${this.table}`);
        return null;
      }

      console.log(`Registro criado com sucesso na tabela ${this.table}:`, createdData);
      return createdData as T;
    } catch (error) {
      console.error(`Exceção ao criar registro na tabela ${this.table}:`, error);
      return null;
    }
  }

  /**
   * Atualiza um registro existente
   * @param id ID do registro
   * @param data Dados a serem atualizados
   * @returns Registro atualizado
   */
  async update<T>(id: string, data: Partial<T>): Promise<T> {
    const organizacaoId = getOrganizacaoId();
    
    console.log(`Atualizando registro na tabela ${this.table} com ID:`, id);
    console.log('Dados a serem atualizados:', data);
    console.log('ID da organização:', organizacaoId);

    const { data: updatedData, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .eq('organizacao_id', organizacaoId)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar registro na tabela ${this.table}:`, error);
      throw error;
    }
    
    console.log(`Registro atualizado na tabela ${this.table}:`, updatedData);

    return updatedData as T;
  }

  /**
   * Exclui um registro
   * @param id ID do registro
   * @returns Verdadeiro se a exclusão foi bem-sucedida
   */
  async delete(id: string): Promise<boolean> {
    const organizacaoId = getOrganizacaoId();

    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id)
      .eq('organizacao_id', organizacaoId);

    if (error) {
      console.error(`Erro ao excluir registro da tabela ${this.table}:`, error);
      throw error;
    }

    return true;
  }

  /**
   * Executa uma consulta personalizada
   * @param queryBuilder Função para construir a consulta
   * @returns Resultado da consulta
   */
  async customQuery<T>(
    queryBuilder: (query: any, organizacaoId: string) => any
  ): Promise<T> {
    const organizacaoId = getOrganizacaoId();
    const baseQuery = supabase.from(this.table);
    const query = queryBuilder(baseQuery, organizacaoId);
    
    const { data, error, count } = await query;

    if (error) {
      console.error(`Erro ao executar consulta personalizada na tabela ${this.table}:`, error);
      throw error;
    }

    return { data, count } as T;
  }
}

// Serviços específicos para cada entidade
export const usuariosService = new SupabaseService('usuarios');
export const permissoesService = new SupabaseService('permissoes');
export const partidosService = new SupabaseService('partidos');
export const candidatosService = new SupabaseService('candidatos');
export const regioesService = new SupabaseService('regioes');
export const municipiosService = new SupabaseService('municipios');
export const liderancasService = new SupabaseService('liderancas');
export const apoiadoresService = new SupabaseService('apoiadores');
export const apoiosPoliticosService = new SupabaseService('apoios_politicos');
export const demandasService = new SupabaseService('demandas');
export const demandasAtualizacoesService = new SupabaseService('demandas_atualizacoes');
export const demandasAnexosService = new SupabaseService('demandas_anexos');
export const eventosService = new SupabaseService('eventos');
export const eventosParticipantesService = new SupabaseService('eventos_participantes');
export const eventosRecursosService = new SupabaseService('eventos_recursos');
export const eventosAnexosService = new SupabaseService('eventos_anexos');
export const documentosService = new SupabaseService('documentos');
export const notificacoesService = new SupabaseService('notificacoes');
export const logsService = new SupabaseService('logs');
export const iaConversasService = new SupabaseService('ia_conversas');
export const iaMensagensService = new SupabaseService('ia_mensagens'); 