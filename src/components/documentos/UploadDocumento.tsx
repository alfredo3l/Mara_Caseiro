'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadDocumento } from '@/services/documentos';
import { useUsuario } from '@/hooks/useUsuario';

interface UploadDocumentoProps {
  categoria: string;
  onUploadSuccess?: (documento: any) => void;
  onUploadError?: (error: Error) => void;
}

export default function UploadDocumento({ 
  categoria, 
  onUploadSuccess, 
  onUploadError 
}: UploadDocumentoProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { usuario } = useUsuario();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verificar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('O arquivo deve ter no máximo 10MB');
      setUploadError(true);
      setTimeout(() => setUploadError(false), 3000);
      return;
    }
    
    setArquivo(file);
    
    // Preencher o título automaticamente com o nome do arquivo
    if (!titulo) {
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setTitulo(fileName);
    }
  };

  const handleRemoveFile = () => {
    setArquivo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!arquivo) {
      setErrorMessage('Selecione um arquivo para upload');
      setUploadError(true);
      setTimeout(() => setUploadError(false), 3000);
      return;
    }
    
    if (!titulo.trim()) {
      setErrorMessage('O título é obrigatório');
      setUploadError(true);
      setTimeout(() => setUploadError(false), 3000);
      return;
    }
    
    if (!usuario?.id) {
      setErrorMessage('Usuário não autenticado');
      setUploadError(true);
      setTimeout(() => setUploadError(false), 3000);
      return;
    }
    
    setIsUploading(true);
    setUploadError(false);
    setErrorMessage('');
    
    try {
      const documento = await uploadDocumento(arquivo, {
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        categoria,
        tags: tags.length > 0 ? tags : undefined,
        usuario_id: usuario.id
      });
      
      if (documento) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        
        // Limpar formulário
        setArquivo(null);
        setTitulo('');
        setDescricao('');
        setTags([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Callback de sucesso
        if (onUploadSuccess) {
          onUploadSuccess(documento);
        }
      } else {
        throw new Error('Falha ao fazer upload do documento');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao fazer upload do documento');
      setUploadError(true);
      
      // Callback de erro
      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload de Documento</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção de arquivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arquivo
          </label>
          
          {arquivo ? (
            <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center flex-1 min-w-0">
                <File className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium text-gray-900 truncate">{arquivo.name}</p>
                  <p className="text-xs text-gray-500">
                    {(arquivo.size / 1024).toFixed(1)} KB • {arquivo.type || 'Arquivo'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-gray-500">
                    Tamanho máximo: 10MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          )}
        </div>
        
        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            required
          />
        </div>
        
        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div 
                key={tag} 
                className="flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Digite uma tag e pressione Enter"
            className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Pressione Enter para adicionar uma tag
          </p>
        </div>
        
        {/* Botão de envio */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white 
              ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'} 
              transition-colors`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Enviar Documento
              </>
            )}
          </button>
        </div>
        
        {/* Mensagens de feedback */}
        {uploadSuccess && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700 text-sm">Documento enviado com sucesso!</p>
            </div>
          </div>
        )}
        
        {uploadError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{errorMessage || 'Erro ao enviar o documento. Tente novamente.'}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 