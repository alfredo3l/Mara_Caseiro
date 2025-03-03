'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/layout/Sidebar';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import UploadDocumento from '@/components/documentos/UploadDocumento';
import ListaDocumentos from '@/components/documentos/ListaDocumentos';
import { DocumentoData } from '@/services/documentos';
import { Loader2, FileText, Info } from 'lucide-react';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

// Categorias de documentos
const CATEGORIAS = [
  { id: 'todos', nome: 'Todos' },
  { id: 'documentos', nome: 'Documentos' },
  { id: 'relatorios', nome: 'Relatórios' },
  { id: 'planilhas', nome: 'Planilhas' },
  { id: 'apresentacoes', nome: 'Apresentações' },
  { id: 'outros', nome: 'Outros' }
];

export default function PaginaDocumentos() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('documentos');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { user, loading: authLoading } = useAuthContext();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Atualizar lista de documentos após upload
  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Abrir detalhes do documento
  const handleDocumentoClick = (documento: DocumentoData) => {
    setDocumentoSelecionado(documento);
  };

  // Fechar detalhes do documento
  const handleFecharDetalhes = () => {
    setDocumentoSelecionado(null);
  };

  // Formatar data
  const formatarData = (dataString?: string): string => {
    if (!dataString) return '-';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatar tamanho do arquivo
  const formatarTamanho = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Se estiver carregando a autenticação, mostrar tela de carregamento
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuItemClick={setActiveItem}
        activeItem={activeItem}
      />
      <ClientHeader 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMenuOpen={isSidebarOpen} 
      />

      <main className={`pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'} pt-16 transition-all duration-300`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Documentos</h1>
          
          {documentoSelecionado ? (
            // Detalhes do documento
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-primary mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{documentoSelecionado.titulo}</h2>
                    {documentoSelecionado.descricao && (
                      <p className="text-gray-600 mt-1">{documentoSelecionado.descricao}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFecharDetalhes}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Voltar
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Informações do Documento</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Categoria:</span>
                      <span className="text-sm font-medium text-gray-900">{documentoSelecionado.categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tipo:</span>
                      <span className="text-sm font-medium text-gray-900">{documentoSelecionado.tipo_arquivo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tamanho:</span>
                      <span className="text-sm font-medium text-gray-900">{formatarTamanho(documentoSelecionado.tamanho)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Data de Upload:</span>
                      <span className="text-sm font-medium text-gray-900">{formatarData(documentoSelecionado.created_at)}</span>
                    </div>
                    {documentoSelecionado.updated_at && documentoSelecionado.updated_at !== documentoSelecionado.created_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Última Atualização:</span>
                        <span className="text-sm font-medium text-gray-900">{formatarData(documentoSelecionado.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                  {documentoSelecionado.tags && documentoSelecionado.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {documentoSelecionado.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma tag adicionada</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <a
                  href={documentoSelecionado.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Visualizar Documento
                </a>
              </div>
            </div>
          ) : (
            // Lista de documentos e upload
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Tabs defaultValue="todos" value={categoriaAtiva} onValueChange={setCategoriaAtiva}>
                  <TabsList className="mb-6">
                    {CATEGORIAS.map((categoria) => (
                      <TabsTrigger key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {CATEGORIAS.map((categoria) => (
                    <TabsContent key={categoria.id} value={categoria.id}>
                      <ListaDocumentos
                        categoria={categoria.id === 'todos' ? undefined : categoria.id}
                        onDocumentoClick={handleDocumentoClick}
                        onDocumentoDelete={() => setRefreshTrigger(prev => prev + 1)}
                        refreshTrigger={refreshTrigger}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
              
              <div>
                <UploadDocumento
                  categoria={categoriaAtiva === 'todos' ? 'documentos' : categoriaAtiva}
                  onUploadSuccess={handleUploadSuccess}
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Dicas para Documentos</h4>
                      <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                        <li>Adicione tags para facilitar a busca</li>
                        <li>Use nomes descritivos para os arquivos</li>
                        <li>Tamanho máximo permitido: 10MB</li>
                        <li>Formatos recomendados: PDF, DOCX, XLSX, PPTX</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 