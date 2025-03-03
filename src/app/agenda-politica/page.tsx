'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Loader2, Plus, Filter, Calendar, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import { useEventos } from '@/hooks/useEventos';
import Link from 'next/link';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function PaginaAgendaPolitica() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('agenda-politica');
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterLocal, setFilterLocal] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    eventos,
    loading: isLoadingEventos,
    error: errorEventos,
    totalCount,
    fetchEventos
  } = useEventos();

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
    fetchEventos(
      currentPage,
      10,
      filterSearchTerm,
      {
        status: filterStatus || undefined,
        tipo: filterTipo || undefined,
        local: filterLocal || undefined
      }
    );
  }, [currentPage, filterSearchTerm, filterStatus, filterTipo, filterLocal]);

  const handleGenerateReport = () => {
    console.log('Gerando relatório da agenda política...');
  };

  const totalPages = Math.ceil(totalCount / 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Em Andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarHora = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {/* Tabela de Agenda Política */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Agenda Política</h2>
                <p className="text-sm text-gray-600">Gerenciamento de compromissos e eventos políticos</p>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/agenda-politica/novo"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Compromisso
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
                    placeholder="Buscar na agenda política..."
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
                    setFilterStatus('');
                    setFilterTipo('');
                    setFilterLocal('');
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
                  {/* Filtro de Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todos os status</option>
                      <option value="Agendado">Agendado</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Filtro de Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={filterTipo}
                      onChange={(e) => setFilterTipo(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todos os tipos</option>
                      <option value="Reunião">Reunião</option>
                      <option value="Comício">Comício</option>
                      <option value="Visita">Visita</option>
                      <option value="Debate">Debate</option>
                      <option value="Entrevista">Entrevista</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {/* Filtro de Local */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                    <input
                      type="text"
                      placeholder="Filtrar por local..."
                      value={filterLocal}
                      onChange={(e) => setFilterLocal(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              {errorEventos && (
                <div className="p-4 text-center text-red-600">
                  {errorEventos}
                </div>
              )}
              
              {isLoadingEventos ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-sm text-gray-600">Carregando agenda política...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data e Hora
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Local
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participantes
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {eventos.map((evento) => (
                      <tr key={evento.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <div className="font-medium text-gray-900">{evento.titulo}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{evento.descricao}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {evento.tipo}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatarData(evento.dataInicio)}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{formatarHora(evento.dataInicio)}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{evento.local}</span>
                          </div>
                          {evento.cidade && (
                            <div className="text-xs text-gray-500 mt-1">{evento.cidade}</div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{evento.participantes?.length || 0}</span>
                            <span className="text-gray-500">confirmados</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(evento.status)}`}>
                            {evento.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Paginação */}
              {!isLoadingEventos && eventos.length > 0 && (
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
              {!isLoadingEventos && eventos.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhum compromisso encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 