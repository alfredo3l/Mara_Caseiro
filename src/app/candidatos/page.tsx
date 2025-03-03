'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Loader2, Plus, Filter, User, MapPin, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function PaginaCandidatos() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('candidatos');
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');
  const [filterPartido, setFilterPartido] = useState<string>('');
  const [filterCargo, setFilterCargo] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingCandidatos, setIsLoadingCandidatos] = useState(true);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [errorCandidatos, setErrorCandidatos] = useState<string | null>(null);

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
    const fetchCandidatos = async () => {
      setIsLoadingCandidatos(true);
      setErrorCandidatos(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados que viriam do backend
        const candidatosMock = [
          {
            id: '1',
            nome: 'João Silva',
            partido: 'PSD',
            numero: '12345',
            cargo: 'Vereador',
            cidade: 'São Paulo',
            estado: 'SP',
            status: 'Ativo',
            totalApoiadores: 245,
            metaApoiadores: 500
          },
          {
            id: '2',
            nome: 'Maria Oliveira',
            partido: 'PT',
            numero: '54321',
            cargo: 'Prefeito',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            status: 'Ativo',
            totalApoiadores: 1250,
            metaApoiadores: 2000
          },
          {
            id: '3',
            nome: 'Pedro Santos',
            partido: 'PSDB',
            numero: '98765',
            cargo: 'Vereador',
            cidade: 'Belo Horizonte',
            estado: 'MG',
            status: 'Inativo',
            totalApoiadores: 120,
            metaApoiadores: 300
          },
          {
            id: '4',
            nome: 'Ana Costa',
            partido: 'MDB',
            numero: '56789',
            cargo: 'Deputado Estadual',
            cidade: 'Salvador',
            estado: 'BA',
            status: 'Ativo',
            totalApoiadores: 780,
            metaApoiadores: 1500
          },
          {
            id: '5',
            nome: 'Carlos Ferreira',
            partido: 'NOVO',
            numero: '24680',
            cargo: 'Deputado Federal',
            cidade: 'Curitiba',
            estado: 'PR',
            status: 'Ativo',
            totalApoiadores: 950,
            metaApoiadores: 1200
          }
        ];
        
        // Filtragem dos dados
        const filteredCandidatos = candidatosMock.filter(candidato => {
          const matchesSearch = !filterSearchTerm || 
            candidato.nome.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
            candidato.numero.includes(filterSearchTerm);
          
          const matchesPartido = !filterPartido || candidato.partido === filterPartido;
          const matchesCargo = !filterCargo || candidato.cargo === filterCargo;
          const matchesStatus = !filterStatus || candidato.status === filterStatus;
          
          return matchesSearch && matchesPartido && matchesCargo && matchesStatus;
        });
        
        setCandidatos(filteredCandidatos);
        setTotalCount(filteredCandidatos.length);
      } catch (error) {
        console.error('Erro ao carregar candidatos:', error);
        setErrorCandidatos('Ocorreu um erro ao carregar os candidatos. Tente novamente mais tarde.');
      } finally {
        setIsLoadingCandidatos(false);
      }
    };
    
    fetchCandidatos();
  }, [filterSearchTerm, filterPartido, filterCargo, filterStatus, currentPage]);

  const handleGenerateReport = () => {
    console.log('Gerando relatório de candidatos...');
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
          {/* Tabela de Candidatos */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Candidatos</h2>
                <p className="text-sm text-gray-600">Gerenciamento de candidatos</p>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/candidatos/novo"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Candidato
                </Link>
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
                    placeholder="Buscar candidato..."
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
                    setFilterPartido('');
                    setFilterCargo('');
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Filtro de Partido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partido</label>
                    <select
                      value={filterPartido}
                      onChange={(e) => setFilterPartido(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todos os partidos</option>
                      <option value="PT">PT</option>
                      <option value="PSDB">PSDB</option>
                      <option value="MDB">MDB</option>
                      <option value="PSD">PSD</option>
                      <option value="NOVO">NOVO</option>
                    </select>
                  </div>

                  {/* Filtro de Cargo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <select
                      value={filterCargo}
                      onChange={(e) => setFilterCargo(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todos os cargos</option>
                      <option value="Vereador">Vereador</option>
                      <option value="Prefeito">Prefeito</option>
                      <option value="Deputado Estadual">Deputado Estadual</option>
                      <option value="Deputado Federal">Deputado Federal</option>
                      <option value="Senador">Senador</option>
                      <option value="Governador">Governador</option>
                      <option value="Presidente">Presidente</option>
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
              {errorCandidatos && (
                <div className="p-4 text-center text-red-600">
                  {errorCandidatos}
                </div>
              )}
              
              {isLoadingCandidatos ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-sm text-gray-600">Carregando candidatos...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidato
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partido/Número
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localização
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apoiadores
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {candidatos.map((candidato) => (
                      <tr key={candidato.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="font-medium text-gray-900">{candidato.nome}</div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          <div className="font-medium">{candidato.partido}</div>
                          <div className="text-xs text-gray-500">Nº {candidato.numero}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {candidato.cargo}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{candidato.cidade}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{candidato.estado}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{candidato.totalApoiadores} / {candidato.metaApoiadores}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (candidato.totalApoiadores / candidato.metaApoiadores) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(candidato.status)}`}>
                            {candidato.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Paginação */}
              {!isLoadingCandidatos && candidatos.length > 0 && (
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
              {!isLoadingCandidatos && candidatos.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhum candidato encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 