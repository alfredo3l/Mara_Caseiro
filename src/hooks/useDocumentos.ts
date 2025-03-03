import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Documento, DocumentoStatus } from '@/types/documento';
import { useAutorizacao } from './useAutorizacao';
import { useLogs } from './useLogs';
import { useNotificacoes } from './useNotificacoes';

export type OrderDirection = 'asc' | 'desc';

export interface OrderConfig {
  column: string;
  direction: OrderDirection;
}

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { usuarioAtual, verificarPermissao } = useAutorizacao();
  const { registrarAtividade } = useLogs();
  const { criarNotificacao } = useNotificacoes();

  const fetchDocumentos = async (
    page = 1,
    perPage = 10,
    searchTerm = '',
    filters: Record<string, any> = {},
    orderConfig: OrderConfig = { column: 'dataRegistro', direction: 'desc' }
  ) => {
    try {
      setLoading(true);
      
      // Calcular offset para paginação
      const offset = (page - 1) * perPage;
      
      // Iniciar a query
      let query = supabase
        .from('documentos')
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
          } else if (key === 'autorId') {
            query = query.eq('autor->id', value);
          } else if (key === 'revisorId') {
            query = query.eq('revisor->id', value);
          } else if (key === 'acessoRestrito') {
            query = query.eq('acessoRestrito', value);
          } else if (key === 'tags') {
            if (Array.isArray(value) && value.length > 0) {
              query = query.contains('tags', value);
            }
          }
        }
      });
      
      // Aplicar ordenação
      query = query.order(orderConfig.column, { ascending: orderConfig.direction === 'asc' });
      
      // Aplicar paginação
      query = query.range(offset, offset + perPage - 1);
      
      // Executar a query
      const { data, error, count } = await query.then(response => response);
      
      if (error) throw error;
      
      // Filtrar documentos com base nas permissões do usuário
      const documentosFiltrados = data?.filter((doc: Documento) => {
        // Se o documento não tem acesso restrito, todos podem ver
        if (!doc.acessoRestrito) return true;
        
        // Se o usuário é o autor, pode ver
        if (doc.autor.id === usuarioAtual?.id) return true;
        
        // Se o usuário é o revisor, pode ver
        if (doc.revisor?.id === usuarioAtual?.id) return true;
        
        // Verificar permissões específicas
        const perfilUsuario = usuarioAtual?.perfil;
        if (!perfilUsuario) return false;
        
        const permissao = doc.permissoes.find(p => p.perfil === perfilUsuario);
        return permissao && permissao.acoes.includes('ler');
      });
      
      setDocumentos(documentosFiltrados as Documento[]);
      setTotalCount(documentosFiltrados?.length || 0);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      setError('Falha ao carregar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentoById = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Verificar se o usuário tem permissão para ver este documento
      const documento = data as Documento;
      
      if (documento.acessoRestrito) {
        // Se o usuário é o autor ou revisor, pode ver
        if (documento.autor.id === usuarioAtual?.id || documento.revisor?.id === usuarioAtual?.id) {
          return documento;
        }
        
        // Verificar permissões específicas
        const perfilUsuario = usuarioAtual?.perfil;
        if (!perfilUsuario) {
          throw new Error('Você não tem permissão para acessar este documento');
        }
        
        const permissao = documento.permissoes.find(p => p.perfil === perfilUsuario);
        if (!permissao || !permissao.acoes.includes('ler')) {
          throw new Error('Você não tem permissão para acessar este documento');
        }
      }
      
      return documento;
    } catch (err) {
      console.error('Erro ao buscar documento:', err);
      setError('Falha ao carregar documento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDocumento = async (documento: Omit<Documento, 'id'>) => {
    try {
      setLoading(true);
      
      // Verificar se o usuário tem permissão para criar documentos
      if (!verificarPermissao({ recurso: 'documentos', acao: 'criar' })) {
        console.error('Erro de permissão: Usuário não tem permissão para criar documentos');
        throw new Error('Você não tem permissão para criar documentos');
      }
      
      console.log('Enviando para o Supabase:', documento);
      
      // Verificar se o documento tem todos os campos obrigatórios
      if (!documento.titulo || !documento.categoria || !documento.tipo || !documento.arquivo) {
        console.error('Erro de validação: Campos obrigatórios ausentes', {
          titulo: !!documento.titulo,
          categoria: !!documento.categoria,
          tipo: !!documento.tipo,
          arquivo: !!documento.arquivo
        });
        throw new Error('Campos obrigatórios ausentes');
      }
      
      const { data, error } = await supabase
        .from('documentos')
        .insert([documento])
        .select()
        .then(response => response);
      
      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Resposta do Supabase:', data);
      
      // Registrar atividade - ajustado para compatibilidade com a interface
      await registrarAtividade(
        'criar',
        'documentos',
        `Documento "${documento.titulo}" criado`
      );
      
      // Notificar revisores se o status for "Em Revisão"
      if (documento.status === 'Em Revisão' && documento.revisor) {
        await criarNotificacao(
          'Documento para revisão',
          `O documento "${documento.titulo}" está aguardando sua revisão`,
          'info',
          documento.revisor.id
        );
      }
      
      // Retornar o primeiro item do array como documento criado
      return data && data.length > 0 ? data[0] as Documento : null;
    } catch (err) {
      console.error('Erro ao criar documento:', err);
      setError('Falha ao criar documento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocumento = async (id: string, updates: Partial<Documento>) => {
    try {
      setLoading(true);
      
      // Buscar documento atual para verificar permissões
      const documentoAtual = await getDocumentoById(id);
      if (!documentoAtual) {
        throw new Error('Documento não encontrado');
      }
      
      // Verificar se o usuário tem permissão para editar este documento
      if (documentoAtual.acessoRestrito) {
        // Se o usuário é o autor ou revisor, pode editar
        if (documentoAtual.autor.id !== usuarioAtual?.id && documentoAtual.revisor?.id !== usuarioAtual?.id) {
          // Verificar permissões específicas
          const perfilUsuario = usuarioAtual?.perfil;
          if (!perfilUsuario) {
            throw new Error('Você não tem permissão para editar este documento');
          }
          
          const permissao = documentoAtual.permissoes.find(p => p.perfil === perfilUsuario);
          if (!permissao || !permissao.acoes.includes('editar')) {
            throw new Error('Você não tem permissão para editar este documento');
          }
        }
      }
      
      // Adicionar entrada no histórico
      const historicoAtual = documentoAtual.historico || [];
      const novaEntradaHistorico = {
        data: new Date().toISOString(),
        usuario: usuarioAtual?.nome || 'Sistema',
        acao: 'Atualização',
        comentario: updates.status ? `Status alterado para ${updates.status}` : 'Documento atualizado',
        versao: updates.versao || documentoAtual.versao
      };
      
      const historicoAtualizado = [...historicoAtual, novaEntradaHistorico];
      
      // Atualizar documento
      const { data, error } = await supabase
        .from('documentos')
        .update({ ...updates, historico: historicoAtualizado })
        .eq('id', id)
        .select()
        .then(response => response);
      
      if (error) throw error;
      
      // Registrar atividade
      await registrarAtividade(
        'editar',
        'documentos',
        `Documento "${documentoAtual.titulo}" atualizado`
      );
      
      // Notificar usuários relevantes sobre a atualização
      if (updates.status === 'Em Revisão' && documentoAtual.revisor) {
        await criarNotificacao(
          'Documento para revisão',
          `O documento "${documentoAtual.titulo}" está aguardando sua revisão`,
          'info',
          documentoAtual.revisor.id
        );
      } else if (updates.status === 'Aprovado' && documentoAtual.autor) {
        await criarNotificacao(
          'Documento aprovado',
          `O documento "${documentoAtual.titulo}" foi aprovado`,
          'sucesso',
          documentoAtual.autor.id
        );
      }
      
      return data && data.length > 0 ? data[0] as Documento : null;
    } catch (err) {
      console.error('Erro ao atualizar documento:', err);
      setError('Falha ao atualizar documento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocumento = async (id: string) => {
    try {
      setLoading(true);
      
      // Buscar documento atual para verificar permissões
      const documentoAtual = await getDocumentoById(id);
      if (!documentoAtual) {
        throw new Error('Documento não encontrado');
      }
      
      // Verificar se o usuário tem permissão para excluir este documento
      if (documentoAtual.acessoRestrito) {
        // Se o usuário é o autor, pode excluir
        if (documentoAtual.autor.id !== usuarioAtual?.id) {
          // Verificar permissões específicas
          const perfilUsuario = usuarioAtual?.perfil;
          if (!perfilUsuario) {
            throw new Error('Você não tem permissão para excluir este documento');
          }
          
          const permissao = documentoAtual.permissoes.find(p => p.perfil === perfilUsuario);
          if (!permissao || !permissao.acoes.includes('excluir')) {
            throw new Error('Você não tem permissão para excluir este documento');
          }
        }
      }
      
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', id)
        .then(response => response);
      
      if (error) throw error;
      
      // Registrar atividade
      await registrarAtividade(
        'excluir',
        'documentos',
        `Documento "${documentoAtual.titulo}" excluído`
      );
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      setError('Falha ao excluir documento. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const compartilharDocumento = async (
    id: string,
    permissoes: {
      perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
      acoes: ('ler' | 'editar' | 'excluir')[];
    }[]
  ) => {
    try {
      setLoading(true);
      
      // Buscar documento atual para verificar permissões
      const documentoAtual = await getDocumentoById(id);
      if (!documentoAtual) {
        throw new Error('Documento não encontrado');
      }
      
      // Verificar se o usuário tem permissão para compartilhar este documento
      if (documentoAtual.autor.id !== usuarioAtual?.id && !verificarPermissao({ recurso: 'documentos', acao: 'editar' })) {
        throw new Error('Você não tem permissão para compartilhar este documento');
      }
      
      // Atualizar permissões do documento
      const { data, error } = await supabase
        .from('documentos')
        .update({ permissoes })
        .eq('id', id)
        .select()
        .then(response => response);
      
      if (error) throw error;
      
      // Registrar atividade
      await registrarAtividade(
        'editar',
        'documentos',
        `Permissões do documento "${documentoAtual.titulo}" atualizadas`
      );
      
      return data && data.length > 0 ? data[0] as Documento : null;
    } catch (err) {
      console.error('Erro ao compartilhar documento:', err);
      setError('Falha ao compartilhar documento. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    documentos,
    loading,
    error,
    totalCount,
    fetchDocumentos,
    getDocumentoById,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    compartilharDocumento
  };
} 