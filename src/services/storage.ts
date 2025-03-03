import { supabase } from '@/lib/supabase';
import { getOrganizacaoId } from '@/config/organizacao';

// Buckets disponíveis
const BUCKETS = {
  PERFIL: 'profile-photos',
  DOCUMENTOS: 'documents',
  MIDIAS: 'media'
};

// Opções para upload de arquivos
interface UploadOptions {
  fileName?: string;
  isPublic?: boolean;
  contentType?: string;
  metadata?: Record<string, string>;
}

// Classe base para gerenciar storage
class StorageService {
  protected bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  // Gera um nome de arquivo único
  protected generateFileName(file: File, customName?: string): string {
    if (customName) return customName;
    
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const extension = file.name.split('.').pop();
    
    return `${timestamp}-${randomString}.${extension}`;
  }

  // Gera o caminho completo do arquivo
  protected getFilePath(fileName: string, subFolder?: string): string {
    const organizacaoId = getOrganizacaoId();
    const basePath = `${organizacaoId}`;
    
    if (subFolder) {
      return `${basePath}/${subFolder}/${fileName}`;
    }
    
    return `${basePath}/${fileName}`;
  }

  // Faz upload de um arquivo
  async uploadFile(
    file: File,
    subFolder?: string,
    options: UploadOptions = {}
  ): Promise<string | null> {
    try {
      console.log('StorageService.uploadFile - Iniciando upload');
      console.log('Bucket:', this.bucket);
      console.log('Arquivo:', file.name, file.type, file.size);
      console.log('Subpasta:', subFolder);
      console.log('Opções:', options);
      
      const fileName = this.generateFileName(file, options.fileName);
      console.log('Nome do arquivo gerado:', fileName);
      
      const filePath = this.getFilePath(fileName, subFolder);
      console.log('Caminho completo do arquivo:', filePath);
      
      console.log('Enviando arquivo para o Supabase Storage...');
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: options.contentType || file.type
        });
      
      if (error) {
        console.error('Erro ao fazer upload:', error);
        return null;
      }
      
      console.log('Upload concluído com sucesso:', data);
      
      // Se for público, retorna a URL pública
      if (options.isPublic) {
        console.log('Gerando URL pública...');
        const { data: urlData } = supabase.storage
          .from(this.bucket)
          .getPublicUrl(filePath);
          
        console.log('URL pública gerada:', urlData.publicUrl);
        return urlData.publicUrl;
      }
      
      // Se não for público, retorna o caminho do arquivo
      console.log('Retornando caminho do arquivo:', data?.path);
      return data?.path || null;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  }

  // Exclui um arquivo
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      console.log('StorageService.deleteFile - Iniciando exclusão');
      console.log('Bucket:', this.bucket);
      console.log('Caminho do arquivo:', filePath);
      
      console.log('Enviando solicitação de exclusão para o Supabase Storage...');
      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([filePath]);
      
      if (error) {
        console.error('Erro ao excluir arquivo:', error);
        return false;
      }
      
      console.log('Arquivo excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      return false;
    }
  }

  // Obtém a URL de um arquivo
  async getFileUrl(filePath: string, expiresIn = 60): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) {
        console.error('Erro ao obter URL do arquivo:', error);
        return null;
      }
      
      return data?.signedUrl || null;
    } catch (error) {
      console.error('Erro ao obter URL do arquivo:', error);
      return null;
    }
  }

  // Lista arquivos em um diretório
  async listFiles(
    prefix?: string,
    limit = 100,
    offset = 0
  ): Promise<{ data: any[]; count: number } | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list(prefix, {
          limit,
          offset,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error('Erro ao listar arquivos:', error);
        return null;
      }
      
      return {
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return null;
    }
  }
}

// Serviço para gerenciar fotos de perfil
class ProfilePhotoService extends StorageService {
  constructor() {
    super(BUCKETS.PERFIL);
  }

  // Faz upload de uma foto de perfil
  async uploadProfilePhoto(
    file: File,
    userId: string
  ): Promise<string | null> {
    console.log('ProfilePhotoService.uploadProfilePhoto - Iniciando upload');
    console.log('Arquivo:', file.name, file.type, file.size);
    console.log('ID do usuário:', userId);
    console.log('Bucket:', this.bucket);
    
    try {
      // Verifica se o arquivo é uma imagem
      if (!file.type.startsWith('image/')) {
        console.error('Erro: O arquivo não é uma imagem');
        throw new Error('O arquivo deve ser uma imagem');
      }
      
      // Verifica o tamanho máximo (2MB)
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_SIZE) {
        console.error('Erro: O arquivo excede o tamanho máximo');
        throw new Error('A imagem deve ter no máximo 2MB');
      }
      
      console.log('Arquivo validado, iniciando upload');
      
      // Fazer upload do arquivo
      const result = await this.uploadFile(file, userId, {
        isPublic: true
      });
      
      console.log('Resultado do upload:', result);
      return result;
    } catch (error) {
      console.error('Erro no uploadProfilePhoto:', error);
      throw error;
    }
  }

  // Exclui uma foto de perfil
  async deleteProfilePhoto(userId: string, fileName: string): Promise<boolean> {
    console.log('ProfilePhotoService.deleteProfilePhoto - Iniciando exclusão');
    console.log('ID do usuário:', userId);
    console.log('Nome do arquivo:', fileName);
    
    try {
      const filePath = this.getFilePath(fileName, userId);
      console.log('Caminho do arquivo para exclusão:', filePath);
      
      const result = await this.deleteFile(filePath);
      console.log('Resultado da exclusão:', result);
      
      return result;
    } catch (error) {
      console.error('Erro no deleteProfilePhoto:', error);
      return false;
    }
  }
}

// Serviço para gerenciar documentos
class DocumentsStorageService extends StorageService {
  constructor() {
    super(BUCKETS.DOCUMENTOS);
  }

  // Faz upload de um documento
  async uploadDocument(
    file: File,
    categoria: string,
    options: UploadOptions = {}
  ): Promise<string | null> {
    // Verifica o tamanho máximo (10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error('O documento deve ter no máximo 10MB');
    }
    
    return this.uploadFile(file, categoria, {
      ...options,
      isPublic: options.isPublic !== undefined ? options.isPublic : true
    });
  }

  // Lista documentos por categoria
  async listDocumentsByCategory(
    categoria: string,
    limit = 100,
    offset = 0
  ): Promise<{ data: any[]; count: number } | null> {
    const organizacaoId = getOrganizacaoId();
    const prefix = `${organizacaoId}/${categoria}`;
    
    return this.listFiles(prefix, limit, offset);
  }
}

// Serviço para gerenciar mídias
class MediaStorageService extends StorageService {
  constructor() {
    super(BUCKETS.MIDIAS);
  }

  // Faz upload de uma mídia
  async uploadMedia(
    file: File,
    tipo: string,
    options: UploadOptions = {}
  ): Promise<string | null> {
    // Verifica se é um tipo de mídia válido
    const tiposValidos = ['imagens', 'videos', 'audios'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error('Tipo de mídia inválido');
    }
    
    // Verifica o tamanho máximo (20MB)
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      throw new Error('A mídia deve ter no máximo 20MB');
    }
    
    return this.uploadFile(file, tipo, {
      ...options,
      isPublic: options.isPublic !== undefined ? options.isPublic : true
    });
  }

  // Lista mídias por tipo
  async listMediaByType(
    tipo: string,
    limit = 100,
    offset = 0
  ): Promise<{ data: any[]; count: number } | null> {
    const organizacaoId = getOrganizacaoId();
    const prefix = `${organizacaoId}/${tipo}`;
    
    return this.listFiles(prefix, limit, offset);
  }
}

// Instâncias dos serviços
export const profileStorage = new ProfilePhotoService();
export const documentsStorage = new DocumentsStorageService();
export const mediaStorage = new MediaStorageService();

// Exporta os buckets para uso em outros lugares
export { BUCKETS }; 