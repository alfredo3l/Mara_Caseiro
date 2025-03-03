'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Loader2, Plus, Filter, MapPin, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import { useRegioes } from '@/hooks/useRegioes';
import Link from 'next/link';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function PaginaRegioes() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('regioes');
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    regioes,
    loading: isLoadingRegioes,
    error: errorRegioes,
    totalCount,
    fetchRegioes
  } = useRegioes();

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
    fetchRegioes(
      currentPage,
      10,
      filterSearchTerm,
      {
        estado: filterEstado || undefined,
        tipo: filterTipo || undefined
      }
    );
  }, [currentPage, filterSearchTerm, filterEstado, filterTipo]);

  const handleGenerateReport = () => {
    console.log('Gerando relatório de regiões...');
  };

  const totalPages = Math.ceil(totalCount / 10);

  const getTipoRegiaoColor = (tipo: string) => {
    switch (tipo) {
      case 'Bairro':
        return 'bg-blue-100 text-blue-800';
      case 'Cidade':
        return 'bg-green-100 text-green-800';
      case 'Zona':
        return 'bg-purple-100 text-purple-800';
      case 'Distrito':
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
          {/* Tabela de Regiões */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Regiões</h2>
                <p className="text-sm text-gray-600">Gerenciamento de regiões, cidades e bairros</p>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/regioes/nova"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Região
                </Link>
                <Link
                  href="/regioes/mapa"
                  className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-2 border border-primary/30 px-3 py-2 rounded-md"
                >
                  <MapPin className="w-4 h-4" />
                  Mapa de Regiões
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
                    placeholder="Buscar região..."
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
                    setFilterEstado('');
                    setFilterTipo('');
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
                  {/* Filtro de Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    >
                      <option value="">Todos os estados</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
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
                      <option value="Bairro">Bairro</option>
                      <option value="Cidade">Cidade</option>
                      <option value="Zona">Zona</option>
                      <option value="Distrito">Distrito</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              {errorRegioes && (
                <div className="p-4 text-center text-red-600">
                  {errorRegioes}
                </div>
              )}
              
              {isLoadingRegioes ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-sm text-gray-600">Carregando regiões...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localização
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        População
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apoiadores
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cobertura
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {regioes.map((regiao) => (
                      <tr key={regiao.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <div className="font-medium text-gray-900">{regiao.nome}</div>
                          <div className="text-sm text-gray-500">{regiao.codigo || 'Sem código'}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTipoRegiaoColor(regiao.tipo)}`}>
                            {regiao.tipo}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{regiao.cidade || regiao.nome}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{regiao.estado}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {regiao.populacao ? regiao.populacao.toLocaleString('pt-BR') : 'Não informado'}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{regiao.totalApoiadores || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${regiao.cobertura || 0}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {regiao.cobertura || 0}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Paginação */}
              {!isLoadingRegioes && regioes.length > 0 && (
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
              {!isLoadingRegioes && regioes.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Nenhuma região encontrada com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 