'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Loader2, Plus, Filter, User, MapPin, Phone, Mail, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import CoordenadorModal from '@/components/modals/CoordenadorModal';
import ExportReportModal from '@/components/modals/ExportReportModal';
import Toast, { ToastProvider, useToast } from '@/components/ui/Toast';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

function PaginaCoordenadores() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('coordenadores');
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');
  const [filterRegiao, setFilterRegiao] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingCoordenadores, setIsLoadingCoordenadores] = useState(true);
  const [coordenadores, setCoordenadores] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [errorCoordenadores, setErrorCoordenadores] = useState<string | null>(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning', visible: boolean}>({
    message: '',
    type: 'info',
    visible: false
  });

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

  useEffect(() => {
    const fetchCoordenadores = async () => {
      setIsLoadingCoordenadores(true);
      setErrorCoordenadores(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados que viriam do backend
        const coordenadoresMock = [
          {
            id: '1',
            nome: 'Carlos Mendes',
            regiao: 'Zona Norte',
            cidade: 'São Paulo',
            estado: 'SP',
            telefone: '(11) 98765-4321',
            email: 'carlos.mendes@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 145,
            dataRegistro: '2023-10-15',
            observacoes: 'Coordenador experiente com bom relacionamento na comunidade.'
          },
          {
            id: '2',
            nome: 'Ana Ferreira',
            regiao: 'Zona Sul',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            telefone: '(21) 97654-3210',
            email: 'ana.ferreira@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 230,
            dataRegistro: '2023-09-22',
            observacoes: 'Coordenadora com forte atuação em projetos sociais.'
          },
          {
            id: '3',
            nome: 'Roberto Alves',
            regiao: 'Centro',
            cidade: 'Belo Horizonte',
            estado: 'MG',
            telefone: '(31) 96543-2109',
            email: 'roberto.alves@exemplo.com',
            status: 'Inativo',
            totalApoiadores: 78,
            dataRegistro: '2023-11-05',
            observacoes: 'Afastado temporariamente por motivos pessoais.'
          },
          {
            id: '4',
            nome: 'Juliana Costa',
            regiao: 'Zona Leste',
            cidade: 'Salvador',
            estado: 'BA',
            telefone: '(71) 95432-1098',
            email: 'juliana.costa@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 185,
            dataRegistro: '2023-08-30',
            observacoes: 'Especialista em mobilização de jovens.'
          },
          {
            id: '5',
            nome: 'Marcos Oliveira',
            regiao: 'Zona Oeste',
            cidade: 'Curitiba',
            estado: 'PR',
            telefone: '(41) 94321-0987',
            email: 'marcos.oliveira@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 112,
            dataRegistro: '2023-12-10',
            observacoes: 'Novo coordenador com grande potencial.'
          }
        ];
        
        // Filtragem dos dados
        const filteredCoordenadores = coordenadoresMock.filter(coordenador => {
          const matchesSearch = !filterSearchTerm || 
            coordenador.nome.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
            coordenador.email.toLowerCase().includes(filterSearchTerm.toLowerCase());
          
          const matchesRegiao = !filterRegiao || coordenador.regiao === filterRegiao;
          const matchesStatus = !filterStatus || coordenador.status === filterStatus;
          
          return matchesSearch && matchesRegiao && matchesStatus;
        });
        
        setCoordenadores(filteredCoordenadores);
        setTotalCount(filteredCoordenadores.length);
      } catch (error) {
        console.error('Erro ao carregar coordenadores:', error);
        setErrorCoordenadores('Ocorreu um erro ao carregar os coordenadores. Tente novamente mais tarde.');
      } finally {
        setIsLoadingCoordenadores(false);
      }
    };
    
    fetchCoordenadores();
  }, [filterSearchTerm, filterRegiao, filterStatus, currentPage]);

  const handleGenerateReport = () => {
    setShowExportModal(true);
  };

  const handleOpenCadastroModal = () => {
    setShowCadastroModal(true);
  };

  const handleSaveCoordenador = (coordenador: any) => {
    // Aqui seria feita a chamada à API para salvar o coordenador
    console.log('Coordenador salvo:', coordenador);
    
    // Atualizar a lista de coordenadores (simulação)
    setCoordenadores(prev => {
      const index = prev.findIndex(c => c.id === coordenador.id);
      if (index >= 0) {
        // Atualizar coordenador existente
        const updated = [...prev];
        updated[index] = coordenador;
        return updated;
      } else {
        // Adicionar novo coordenador
        return [...prev, coordenador];
      }
    });
    
    // Mostrar notificação de sucesso
    setToast({
      message: `Coordenador ${coordenador.id ? 'atualizado' : 'cadastrado'} com sucesso!`,
      type: 'success',
      visible: true
    });
    
    // Fechar o modal
    setShowCadastroModal(false);
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const totalPages = Math.ceil(totalCount / 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Inativo':
        return 'bg-gray-100 text-gray-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Cabeçalhos personalizados para exportação
  const exportHeaders = {
    id: 'ID',
    nome: 'Nome',
    regiao: 'Região',
    cidade: 'Cidade',
    estado: 'Estado',
    telefone: 'Telefone',
    email: 'Email',
    status: 'Status',
    totalApoiadores: 'Total de Lideranças',
    dataRegistro: 'Data de Registro'
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuItemClick={setActiveItem}
        activeItem={activeItem.toLowerCase()}
      />
      <ClientHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />

      <main className={`pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'} pt-16 transition-all duration-300`}>
        <div className="p-6">
          {/* Tabela de Coordenadores */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Coordenadores Políticos</h2>
                <p className="text-sm text-gray-600">Gerenciamento de coordenadores políticos</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleOpenCadastroModal}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Coordenador
                </button>
                <button 
                  onClick={handleGenerateReport}
                  className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-2 border border-primary/30 px-3 py-2 rounded-md"
                >
                  <FileText className="w-4 h-4" />
                  Gerar Relatório
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="p-4 md:p-6 border-b border-border bg-white/50 backdrop-blur-sm">
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <div className="relative flex-1 max-w-xl">
                  <input 
                    type="text"
                    placeholder="Buscar coordenador..."
                    value={filterSearchTerm}
                    onChange={(e) => setFilterSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>

                {/* Botão Limpar Filtros */}
                <button
                  onClick={() => {
                    setFilterSearchTerm('');
                    setFilterRegiao('');
                    setFilterStatus('');
                    setCurrentPage(1);
                  }}
                  className="h-10 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Limpar Filtros
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Filtro de Região */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Região</label>
                    <select
                      value={filterRegiao}
                      onChange={(e) => setFilterRegiao(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todas as regiões</option>
                      <option value="Zona Norte">Zona Norte</option>
                      <option value="Zona Sul">Zona Sul</option>
                      <option value="Zona Leste">Zona Leste</option>
                      <option value="Zona Oeste">Zona Oeste</option>
                      <option value="Centro">Centro</option>
                    </select>
                  </div>

                  {/* Filtro de Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todos os status</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              {errorCoordenadores && (
                <div className="p-4 text-center text-red-600">
                  {errorCoordenadores}
                </div>
              )}
              
              {isLoadingCoordenadores ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-sm text-gray-600">Carregando coordenadores...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordenador
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Região
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lideranças
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Registro
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {coordenadores.map((coordenador) => (
                      <tr key={coordenador.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{coordenador.nome}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{coordenador.regiao}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{coordenador.cidade}, {coordenador.estado}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{coordenador.telefone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{coordenador.email}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {coordenador.totalApoiadores}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {new Date(coordenador.dataRegistro).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(coordenador.status)}`}>
                            {coordenador.status}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm">
                          <Link 
                            href={`/coordenadores/${coordenador.id}`}
                            className="text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Paginação */}
              {!isLoadingCoordenadores && coordenadores.length > 0 && (
                <div className="px-4 md:px-6 py-4 flex items-center justify-between border-t border-border">
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> de <span className="font-medium">{totalCount}</span> resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}

              {/* Mensagem de nenhum resultado */}
              {!isLoadingCoordenadores && coordenadores.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhum coordenador encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Cadastro */}
      <CoordenadorModal
        isOpen={showCadastroModal}
        onClose={() => setShowCadastroModal(false)}
        onSave={handleSaveCoordenador}
      />

      {/* Modal de Exportação */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Coordenadores Políticos"
        data={coordenadores}
        filename="relatorio-coordenadores"
        headers={exportHeaders}
      />

      {/* Toast de Notificação */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={handleCloseToast}
      />
    </div>
  );
}

// Wrapper com o Provider de Toast
export default function PaginaCoordenadoresWrapper() {
  return (
    <ToastProvider>
      <PaginaCoordenadores />
    </ToastProvider>
  );
} 