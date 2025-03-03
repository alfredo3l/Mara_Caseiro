'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Loader2, Plus, Filter, MapPin, Phone, Mail } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import { useApoiadores } from '@/hooks/useApoiadores';
import { useLiderancas } from '@/hooks/useLiderancas';
import Link from 'next/link';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function PaginaApoiadores() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('apoiadores');
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');
  const [filterCidade, setFilterCidade] = useState<string>('');
  const [filterLideranca, setFilterLideranca] = useState<string>('');
  const [filterNivelEngajamento, setFilterNivelEngajamento] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    apoiadores,
    loading: isLoadingApoiadores,
    error: errorApoiadores,
    totalCount,
    fetchApoiadores
  } = useApoiadores();

  const {
    liderancas,
    loading: isLoadingLiderancas,
    fetchLiderancas
  } = useLiderancas();

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
    fetchLiderancas();
  }, []);

  useEffect(() => {
    fetchApoiadores(
      currentPage,
      10,
      filterSearchTerm,
      {
        cidade: filterCidade || undefined,
        liderancaId: filterLideranca || undefined,
        nivelEngajamento: filterNivelEngajamento || undefined,
        status: filterStatus || undefined
      }
    );
  }, [currentPage, filterSearchTerm, filterCidade, filterLideranca, filterNivelEngajamento, filterStatus]);

  const handleGenerateReport = () => {
    console.log('Gerando relatório de apoiadores...');
  };

  const totalPages = Math.ceil(totalCount / 10);

  const getNivelEngajamentoColor = (nivel: string) => {
    switch (nivel) {
      case 'Alto':
        return 'bg-green-100 text-green-800';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          {/* Tabela de Apoiadores */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Apoiadores</h2>
                <p className="text-sm text-gray-600">Gerenciamento de apoiadores e voluntários</p>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/apoiadores/novo"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Apoiador
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
                    placeholder="Buscar apoiador..."
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
                    setFilterCidade('');
                    setFilterLideranca('');
                    setFilterNivelEngajamento('');
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  {/* Filtro de Cidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      placeholder="Filtrar por cidade..."
                      value={filterCidade}
                      onChange={(e) => setFilterCidade(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>

                  {/* Filtro de Liderança */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Liderança</label>
                    <select
                      value={filterLideranca}
                      onChange={(e) => setFilterLideranca(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      disabled={isLoadingLiderancas}
                    >
                      <option value="">Todas as lideranças</option>
                      {liderancas.map((lideranca) => (
                        <option key={lideranca.id} value={lideranca.id}>
                          {lideranca.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro de Nível de Engajamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Engajamento</label>
                    <select
                      value={filterNivelEngajamento}
                      onChange={(e) => setFilterNivelEngajamento(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todos os níveis</option>
                      <option value="Alto">Alto</option>
                      <option value="Médio">Médio</option>
                      <option value="Baixo">Baixo</option>
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
              {errorApoiadores && (
                <div className="p-4 text-center text-red-600">
                  {errorApoiadores}
                </div>
              )}
              
              {isLoadingApoiadores ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-sm text-gray-600">Carregando apoiadores...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endereço
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liderança
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engajamento
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {apoiadores.map((apoiador) => (
                      <tr key={apoiador.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <div className="font-medium text-gray-900">{apoiador.nome}</div>
                          <div className="text-sm text-gray-500">{apoiador.profissao || 'Não informado'}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{apoiador.telefone || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{apoiador.email || 'Não informado'}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{apoiador.bairro || 'Não informado'}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{apoiador.cidade || 'Não informado'}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {apoiador.lideranca?.nome || 'Sem liderança'}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getNivelEngajamentoColor(apoiador.nivelEngajamento)}`}>
                            {apoiador.nivelEngajamento}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(apoiador.status)}`}>
                            {apoiador.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Paginação */}
              {!isLoadingApoiadores && apoiadores.length > 0 && (
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
              {!isLoadingApoiadores && apoiadores.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhum apoiador encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 