'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '../../../components/layout/Sidebar';
import { useEleicoes } from '@/hooks/useEleicoes';
import Image from 'next/image';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

interface Eleicao {
  id: string;
  created_at: string;
  updated_at: string;
  titulo: string;
  descricao: string;
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';
  data_inicio: string;
  data_fim: string;
  total_votos: number;
  participacao: number;
  user_id: string | null;
}

export default function PaginaEleicoes() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('eleições');
  const [filtroEleito, setFiltroEleito] = useState<boolean | undefined>(undefined);
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');
  const [filterCidade, setFilterCidade] = useState<string>('');
  const [filterPartido, setFilterPartido] = useState<string>('');
  const [filterCargo, setFilterCargo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    eleicoes,
    loading: isLoading,
    error,
    totalCount,
    fetchEleicoes
  } = useEleicoes();

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
    fetchEleicoes(
      currentPage,
      10,
      filterSearchTerm,
      filtroEleito,
      undefined,
      filterCidade,
      filterPartido,
      filterCargo
    );
  }, [currentPage, filtroEleito, filterSearchTerm, filterCidade, filterPartido, filterCargo]);

  const handleGenerateReport = () => {
    console.log('Gerando relatório de eleições...');
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
          {/* Tabela de Eleições */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Candidatos</h2>
                <p className="text-sm text-gray-600">Gerenciamento de candidatos do sistema</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Filtro de Status */}
                <select 
                  value={filtroEleito === undefined ? 'Eleito' : filtroEleito ? 'Eleito' : 'Não eleito'}
                  onChange={(e) => setFiltroEleito(e.target.value === 'Eleito')}
                  className="h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm"
                >
                  <option value="Eleito">Eleito</option>
                  <option value="Não eleito">Não eleito</option>
                </select>
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

                {/* Filtro de Cidade */}
                <input
                  type="text"
                  placeholder="Cidade..."
                  value={filterCidade}
                  onChange={(e) => setFilterCidade(e.target.value)}
                  className="h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />

                {/* Filtro de Partido */}
                <input
                  type="text"
                  placeholder="Partido..."
                  value={filterPartido}
                  onChange={(e) => setFilterPartido(e.target.value)}
                  className="h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />

                {/* Filtro de Cargo */}
                <input
                  type="text"
                  placeholder="Cargo..."
                  value={filterCargo}
                  onChange={(e) => setFilterCargo(e.target.value)}
                  className="h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />

                {/* Botão Limpar Filtros */}
                <button
                  onClick={() => {
                    setFilterSearchTerm('');
                    setFiltroEleito(undefined);
                    setFilterCidade('');
                    setFilterPartido('');
                    setFilterCargo('');
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
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              {error && (
                <div className="p-4 text-center text-red-600">
                  {error}
                </div>
              )}
              
              {isLoading ? (
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
                        Local
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partido
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Votos
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {eleicoes.map((eleicao) => (
                      <tr key={eleicao.nomeUrna} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center">
                            {eleicao.fotoUrl && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <Image
                                  src={eleicao.fotoUrl}
                                  alt={eleicao.nomeUrna || ''}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                  unoptimized
                                  loader={({ src }) => src}
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{eleicao.nomeUrna}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {eleicao.localCandidatura}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {eleicao.cargo}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {eleicao.siglaPartido}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {eleicao.qtdVotos?.toLocaleString('pt-BR') || '0'}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${eleicao.status === 'Eleito' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {eleicao.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 