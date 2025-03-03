'use client';

import { useState, useEffect } from 'react';
import { 
  File, 
  Download, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { obterDocumentos, excluirDocumento, DocumentoData } from '@/services/documentos';
import { useUsuario } from '@/hooks/useUsuario';

interface ListaDocumentosProps {
  categoria?: string;
  tags?: string[];
  onDocumentoClick?: (documento: DocumentoData) => void;
  onDocumentoDelete?: (id: string) => void;
  refreshTrigger?: number;
}

export default function ListaDocumentos({
  categoria,
  tags,
  onDocumentoClick,
  onDocumentoDelete,
  refreshTrigger = 0
}: ListaDocumentosProps) {
  const [documentos, setDocumentos] = useState<DocumentoData[]>([]);
  const [totalDocumentos, setTotalDocumentos] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [excluindo, setExcluindo] = useState<string | null>(null);
  
  const { usuario } = useUsuario();
  
  // Carregar documentos
  const carregarDocumentos = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      const filtros: Record<string, any> = {};
      
      // Adicionar filtro de categoria se fornecido
      if (categoria) {
        filtros.categoria = categoria;
      }
      
      // Adicionar filtro de tags se fornecido
      if (tags && tags.length > 0) {
        filtros.tags = { contains: tags };
      }
      
      const { documentos, total } = await obterDocumentos(
        pagina,
        itensPorPagina,
        termoBusca,
        filtros
      );
      
      setDocumentos(documentos);
      setTotalDocumentos(total);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setErro('Não foi possível carregar os documentos');
    } finally {
      setCarregando(false);
    }
  };
  
  // Carregar documentos quando os filtros mudarem
  useEffect(() => {
    carregarDocumentos();
  }, [pagina, itensPorPagina, categoria, refreshTrigger]);
  
  // Buscar documentos quando o termo de busca mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagina === 1) {
        carregarDocumentos();
      } else {
        setPagina(1); // Isso vai disparar o carregamento
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [termoBusca]);
  
  // Formatar tamanho do arquivo
  const formatarTamanho = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Formatar data
  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Excluir documento
  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }
    
    setExcluindo(id);
    
    try {
      const sucesso = await excluirDocumento(id);
      
      if (sucesso) {
        // Atualizar lista de documentos
        setDocumentos(documentos.filter(doc => doc.id !== id));
        setTotalDocumentos(prev => prev - 1);
        
        // Callback de exclusão
        if (onDocumentoDelete) {
          onDocumentoDelete(id);
        }
      } else {
        throw new Error('Falha ao excluir o documento');
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert('Não foi possível excluir o documento');
    } finally {
      setExcluindo(null);
    }
  };
  
  // Verificar se o usuário pode excluir o documento
  const podeExcluir = (documento: DocumentoData): boolean => {
    if (!usuario) return false;
    
    // Administradores podem excluir qualquer documento
    if (usuario.isAdmin) return true;
    
    // Usuários comuns só podem excluir seus próprios documentos
    return documento.usuario_id === usuario.id;
  };
  
  // Calcular total de páginas
  const totalPaginas = Math.ceil(totalDocumentos / itensPorPagina);
  
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-medium text-gray-900">
          Documentos
          {categoria && <span className="ml-2 text-gray-500">({categoria})</span>}
        </h3>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full md:w-64 h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
      </div>
      
      {carregando ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : erro ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{erro}</p>
          </div>
        </div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
          <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum documento encontrado</p>
          {termoBusca && (
            <p className="text-gray-400 text-sm mt-1">
              Tente usar termos diferentes na busca
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Tamanho</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((documento) => (
                  <tr 
                    key={documento.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => onDocumentoClick && onDocumentoClick(documento)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <File className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{documento.titulo}</div>
                          {documento.descricao && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {documento.descricao}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {documento.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {formatarTamanho(documento.tamanho)}
                    </td>
                    <td className="px-4 py-3">
                      {documento.created_at && formatarData(documento.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={documento.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        
                        {podeExcluir(documento) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExcluir(documento.id);
                            }}
                            disabled={excluindo === documento.id}
                            className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 disabled:opacity-50"
                          >
                            {excluindo === documento.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {((pagina - 1) * itensPorPagina) + 1} a {Math.min(pagina * itensPorPagina, totalDocumentos)} de {totalDocumentos} documentos
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-sm text-gray-700">
                  Página {pagina} de {totalPaginas}
                </span>
                
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 