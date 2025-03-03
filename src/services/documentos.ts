import { documentosService } from './supabase';
import { documentsStorage } from './storage';
import { getOrganizacaoId } from '@/config/organizacao';

export interface DocumentoData {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  url: string;
  tipo_arquivo: string;
  tamanho: number;
  usuario_id: string;
  tags?: string[];
  organizacao_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentoInput {
  titulo: string;
  descricao?: string;
  categoria: string;
  tags?: string[];
  usuario_id: string;
}

/**
 * Obtém todos os documentos com filtros opcionais
 */
export const obterDocumentos = async (
  page = 1,
  perPage = 10,
  searchTerm = '',
  filters: Record<string, any> = {},
  orderBy = 'created_at',
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<{ documentos: DocumentoData[]; total: number }> => {
  try {
    // Preparar filtros
    const queryFilters: Record<string, any> = { ...filters };
    
    // Adicionar filtro de busca se fornecido
    if (searchTerm) {
      queryFilters.titulo = { like: searchTerm };
    }
    
    // Buscar documentos
    const { data, count } = await documentosService.getAll<DocumentoData>({
      page,
      pageSize: perPage,
      filters: queryFilters,
      orderBy,
      orderDirection
    });
    
    return {
      documentos: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Erro ao obter documentos:', error);
    throw error;
  }
};

/**
 * Obtém um documento por ID
 */
export const obterDocumentoPorId = async (id: string): Promise<DocumentoData | null> => {
  try {
    return await documentosService.getById<DocumentoData>(id);
  } catch (error) {
    console.error(`Erro ao obter documento ${id}:`, error);
    throw error;
  }
};

/**
 * Faz upload de um documento e cria o registro no banco de dados
 */
export const uploadDocumento = async (
  file: File,
  dados: DocumentoInput
): Promise<DocumentoData | null> => {
  try {
    // Fazer upload do arquivo para o storage
    const fileUrl = await documentsStorage.uploadDocument(
      file,
      dados.categoria,
      {
        fileName: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        isPublic: true
      }
    );
    
    if (!fileUrl) {
      throw new Error('Falha ao fazer upload do arquivo');
    }
    
    // Criar registro no banco de dados
    const novoDocumento = await documentosService.create<DocumentoData>({
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      url: fileUrl,
      tipo_arquivo: file.type || 'application/octet-stream',
      tamanho: file.size,
      usuario_id: dados.usuario_id,
      tags: dados.tags || [],
      organizacao_id: getOrganizacaoId()
    });
    
    return novoDocumento;
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error);
    throw error;
  }
};

/**
 * Atualiza os metadados de um documento
 */
export const atualizarDocumento = async (
  id: string,
  dados: Partial<DocumentoInput>
): Promise<DocumentoData | null> => {
  try {
    // Atualizar apenas os metadados, não o arquivo
    const documentoAtualizado = await documentosService.update<DocumentoData>(id, {
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      tags: dados.tags
    });
    
    return documentoAtualizado;
  } catch (error) {
    console.error(`Erro ao atualizar documento ${id}:`, error);
    throw error;
  }
};

/**
 * Exclui um documento e seu arquivo
 */
export const excluirDocumento = async (id: string): Promise<boolean> => {
  try {
    // Obter documento para pegar a URL do arquivo
    const documento = await obterDocumentoPorId(id);
    
    if (!documento) {
      throw new Error('Documento não encontrado');
    }
    
    // Excluir arquivo do storage se tiver URL
    if (documento.url && documento.url.includes('storage')) {
      // Extrair o caminho do arquivo da URL
      const url = new URL(documento.url);
      const filePath = url.pathname.split('/').slice(3).join('/');
      
      if (filePath) {
        // Excluir arquivo do storage
        await documentsStorage.deleteFile(filePath);
      }
    }
    
    // Excluir registro do banco de dados
    const sucesso = await documentosService.delete(id);
    
    return sucesso;
  } catch (error) {
    console.error(`Erro ao excluir documento ${id}:`, error);
    throw error;
  }
};

/**
 * Obtém documentos por categoria
 */
export const obterDocumentosPorCategoria = async (
  categoria: string,
  page = 1,
  perPage = 10
): Promise<{ documentos: DocumentoData[]; total: number }> => {
  return obterDocumentos(page, perPage, '', { categoria });
};

/**
 * Obtém documentos por tags
 */
export const obterDocumentosPorTags = async (
  tags: string[],
  page = 1,
  perPage = 10
): Promise<{ documentos: DocumentoData[]; total: number }> => {
  return obterDocumentos(page, perPage, '', { tags: { contains: tags } });
}; 