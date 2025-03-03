'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, X, AlertCircle, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NovoPaginaDocumento() {
  console.log('Renderizando página de novo documento com formulário');
  const router = useRouter();
  
  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Função para lidar com o upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setArquivo(files[0]);
      setNomeArquivo(files[0].name);
    }
  };

  // Função para remover o arquivo selecionado
  const handleRemoveFile = () => {
    setArquivo(null);
    setNomeArquivo('');
  };

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!titulo || !descricao || !categoria || !tipo || !arquivo) {
      setError('Por favor, preencha todos os campos obrigatórios e faça upload de um arquivo.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Aqui você implementaria a lógica para enviar os dados para a API
      // Simulando um envio bem-sucedido após 1.5 segundos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Documento enviado:', {
        titulo,
        descricao,
        categoria,
        tipo,
        arquivo: {
          nome: nomeArquivo,
          tamanho: arquivo.size,
          tipo: arquivo.type
        }
      });
      
      setSuccess(true);
      
      // Redirecionar para a lista de documentos após 2 segundos
      setTimeout(() => {
        router.push('/documentos');
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao enviar documento:', err);
      setError('Ocorreu um erro ao enviar o documento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo Documento</h1>
        <p className="text-gray-600">Crie um novo documento para sua campanha</p>
      </div>

      <div className="mb-6">
        <Link
          href="/documentos"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Documentos
        </Link>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start">
          <div className="flex-shrink-0">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800">Documento enviado com sucesso!</h3>
            <p className="mt-2 text-green-700">
              Seu documento foi cadastrado e está sendo redirecionado para a lista de documentos.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="ml-3 text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Título do documento */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Documento*
                </label>
                <input
                  type="text"
                  id="titulo"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o título do documento"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Descrição */}
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição*
                </label>
                <textarea
                  id="descricao"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva o conteúdo do documento"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              {/* Categoria e Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria*
                  </label>
                  <select
                    id="categoria"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Contrato">Contrato</option>
                    <option value="Ofício">Ofício</option>
                    <option value="Memorando">Memorando</option>
                    <option value="Relatório">Relatório</option>
                    <option value="Projeto">Projeto</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo*
                  </label>
                  <select
                    id="tipo"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione um tipo</option>
                    <option value="Interno">Interno</option>
                    <option value="Externo">Externo</option>
                  </select>
                </div>
              </div>
              
              {/* Upload de arquivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo do Documento*
                </label>
                
                {!arquivo ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Faça upload de um arquivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, XLS, XLSX até 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center p-4 border border-gray-300 rounded-lg">
                    <div className="flex-1 truncate">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3 flex-1 truncate">
                          <div className="text-sm font-medium text-gray-900 truncate">{nomeArquivo}</div>
                          <div className="text-xs text-gray-500">
                            {arquivo.size < 1024 * 1024
                              ? `${(arquivo.size / 1024).toFixed(2)} KB`
                              : `${(arquivo.size / (1024 * 1024)).toFixed(2)} MB`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none"
                        onClick={handleRemoveFile}
                        disabled={isSubmitting}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botões de ação */}
              <div className="flex justify-end space-x-4 pt-4">
                <Link
                  href="/documentos"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Salvar Documento'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 