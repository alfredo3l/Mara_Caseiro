'use client';

import { X, Users, Building, MapPin, BarChart2 } from 'lucide-react';
import { EstatisticasRegiaoModalProps } from '@/types/mapa';

export default function EstatisticasRegiaoModal({
  isOpen,
  onClose,
  regiao,
  estatisticas,
  municipios
}: EstatisticasRegiaoModalProps) {
  if (!isOpen) return null;

  // Formatar números para exibição
  const formatarNumero = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Formatar densidade populacional
  const formatarDensidade = (densidade: number) => {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(densidade);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div 
              className="w-6 h-6 rounded-full mr-3" 
              style={{ backgroundColor: regiao.cor }}
            />
            <h2 className="text-xl font-semibold">Estatísticas: {regiao.nome}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da esquerda */}
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Resumo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Building size={14} className="mr-1" />
                    <span className="text-xs font-medium">Municípios</span>
                  </div>
                  <div className="text-lg font-semibold">{estatisticas.totalMunicipios}</div>
                </div>
                
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Users size={14} className="mr-1" />
                    <span className="text-xs font-medium">População</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {formatarNumero(estatisticas.populacaoTotal)}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center text-gray-500 mb-1">
                    <BarChart2 size={14} className="mr-1" />
                    <span className="text-xs font-medium">Média por Município</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {formatarNumero(estatisticas.totalMunicipios > 0 
                      ? Math.round(estatisticas.populacaoTotal / estatisticas.totalMunicipios) 
                      : 0)}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-xs font-medium">Maior Município</span>
                  </div>
                  <div className="text-sm font-semibold">{estatisticas.municipioMaisPopuloso.nome}</div>
                  <div className="text-xs text-gray-500">
                    {formatarNumero(estatisticas.municipioMaisPopuloso.populacao)} hab.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gráfico de distribuição (simulado) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Distribuição Populacional</h3>
              <div className="bg-white p-4 rounded-md shadow-sm h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart2 size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Gráfico de distribuição populacional</p>
                  <p className="text-sm">(Implementação futura)</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Coluna da direita */}
          <div className="space-y-6">
            {/* Lista de municípios */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Municípios</h3>
              <div className="bg-white rounded-md shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        População
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % do Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {municipios.sort((a, b) => b.populacao - a.populacao).map((municipio) => (
                      <tr key={municipio.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {municipio.nome}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatarNumero(municipio.populacao)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          {estatisticas.populacaoTotal > 0 
                            ? ((municipio.populacao / estatisticas.populacaoTotal) * 100).toFixed(1) + '%'
                            : '0%'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Indicadores */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Indicadores</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Densidade Populacional</span>
                    <span className="text-xs text-gray-500">Habitantes por km²</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {formatarDensidade(estatisticas.densidadePopulacional)} hab/km²
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Município Menos Populoso</span>
                    <span className="text-xs text-gray-500">Habitantes</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {estatisticas.municipioMenosPopuloso.nome} ({formatarNumero(estatisticas.municipioMenosPopuloso.populacao)} hab)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
} 