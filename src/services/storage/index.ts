import { supabase } from '@/lib/supabase';
import { getOrganizacaoId } from '@/config/organizacao';
import { v4 as uuidv4 } from 'uuid';

// Definição dos buckets disponíveis
export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  DOCUMENTS: 'documents',
  EVENTS: 'events',
  DEMANDS: 'demands',
};

/**
 * Serviço para gerenciar uploads e downloads de arquivos no Supabase Storage
 */
export class StorageService {
  private bucket: string;
  private bucketExists: boolean | null = null;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  /**
   * Verifica se o bucket existe
   * @returns true se o bucket existe
   */
  async checkBucketExists(): Promise<boolean> {
    // Se já verificamos, retornar o resultado em cache
    if (this.bucketExists !== null) {
      return this.bucketExists;
    }

    try {
      // Listar buckets
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Erro ao listar buckets:', error);
        return false;
      }
      
      // Verificar se o bucket existe
      this.bucketExists = buckets?.some(b => b.name === this.bucket) || false;
      
      if (!this.bucketExists) {
        console.warn(`Bucket '${this.bucket}' não existe. Uploads e downloads não funcionarão.`);
        console.info('Execute o script scripts/create-buckets.js para instruções sobre como criar os buckets necessários.');
      }
      
      return this.bucketExists;
    } catch (error) {
      console.error('Erro ao verificar bucket:', error);
      return false;
    }
  }

  /**
   * Faz upload de um arquivo para o storage
   * @param file Arquivo a ser enviado (File ou Blob)
   * @param options Opções adicionais
   * @returns URL pública do arquivo
   */
  async uploadFile(
    file: File | Blob,
    options: {
      fileName?: string;
      contentType?: string;
      path?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<string | null> {
    try {
      // Verificar se o bucket existe
      const bucketExists = await this.checkBucketExists();
      if (!bucketExists) {
        console.error(`Erro: Bucket '${this.bucket}' não existe. Upload não é possível.`);
        return null;
      }

      const organizacaoId = getOrganizacaoId();
      
      // Gerar nome de arquivo único se não for fornecido
      const fileName = options.fileName || `${uuidv4()}-${Date.now()}`;
      
      // Construir caminho completo do arquivo
      const filePath = options.path 
        ? `${organizacaoId}/${options.path}/${fileName}`
        : `${organizacaoId}/${fileName}`;
      
      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          contentType: options.contentType || 'application/octet-stream',
          upsert: true,
        });
      
      if (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        throw error;
      }
      
      // Obter URL pública se solicitado
      if (options.isPublic) {
        const { data: publicUrlData } = supabase.storage
          .from(this.bucket)
          .getPublicUrl(data.path);
        
        return publicUrlData.publicUrl;
      }
      
      // Retornar caminho do arquivo
      return data.path;
    } catch (error) {
      console.error('Erro no serviço de upload:', error);
      return null;
    }
  }

  /**
   * Faz upload de uma imagem de perfil
   * @param file Arquivo de imagem
   * @param userId ID do usuário
   * @returns URL pública da imagem
   */
  async uploadProfilePhoto(file: File | Blob, userId: string): Promise<string | null> {
    return this.uploadFile(file, {
      path: `users/${userId}`,
      isPublic: true,
      contentType: file.type || 'image/jpeg',
    });
  }

  /**
   * Faz upload de um documento
   * @param file Arquivo do documento
   * @param category Categoria do documento
   * @param options Opções adicionais
   * @returns URL pública do documento
   */
  async uploadDocument(
    file: File | Blob,
    category: string,
    options: {
      fileName?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<string | null> {
    return this.uploadFile(file, {
      path: `categories/${category}`,
      fileName: options.fileName,
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      contentType: file.type || 'application/octet-stream',
    });
  }

  /**
   * Exclui um arquivo do storage
   * @param filePath Caminho do arquivo a ser excluído
   * @returns true se excluído com sucesso
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      // Verificar se o bucket existe
      const bucketExists = await this.checkBucketExists();
      if (!bucketExists) {
        console.error(`Erro: Bucket '${this.bucket}' não existe. Exclusão não é possível.`);
        return false;
      }

      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([filePath]);
      
      if (error) {
        console.error('Erro ao excluir arquivo:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro no serviço de exclusão:', error);
      return false;
    }
  }

  /**
   * Obtém URL temporária para download de um arquivo
   * @param filePath Caminho do arquivo
   * @param expiresIn Tempo de expiração em segundos (padrão: 60)
   * @returns URL temporária
   */
  async getTemporaryUrl(filePath: string, expiresIn: number = 60): Promise<string | null> {
    try {
      // Verificar se o bucket existe
      const bucketExists = await this.checkBucketExists();
      if (!bucketExists) {
        console.error(`Erro: Bucket '${this.bucket}' não existe. Obtenção de URL temporária não é possível.`);
        return null;
      }

      const { data, error } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) {
        console.error('Erro ao gerar URL temporária:', error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Erro no serviço de URL temporária:', error);
      return null;
    }
  }
}

// Instâncias pré-configuradas dos serviços de storage
export const profilePhotoStorage = new StorageService(STORAGE_BUCKETS.PROFILE_PHOTOS);
export const documentsStorage = new StorageService(STORAGE_BUCKETS.DOCUMENTS);
export const eventsStorage = new StorageService(STORAGE_BUCKETS.EVENTS);
export const demandsStorage = new StorageService(STORAGE_BUCKETS.DEMANDS); 