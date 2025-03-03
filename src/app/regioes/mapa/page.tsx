'use client';

import React, { useState, useCallback, useEffect } from 'react';
import LayoutProtegido from '@/components/layout/LayoutProtegido';
import MapBox from '@/components/MapBox';
import RegiaoDetalhes from '@/components/RegiaoDetalhes';
import EstatisticasRegiaoModal from '@/components/modals/EstatisticasRegiaoModal';
import { MapaProvider, useMapaContext } from '@/contexts/MapaContext';

// Interface para passar o estado de tela cheia para o componente interno
interface MapaContentProps {
  isFullscreen: boolean;
}

// Componente interno que usa o contexto
const MapaContent = ({ isFullscreen }: MapaContentProps) => {
  const {
    regioes,
    municipios,
    coordenadores,
    selectedRegiao,
    loading,
    error,
    setSelectedRegiao,
    setSelectedMunicipio,
    atualizarCorRegiao,
    atualizarCoordenadorRegiao,
    calcularEstatisticasRegiao
  } = useMapaContext();

  const [isEstatisticasModalOpen, setIsEstatisticasModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filtroRegiao, setFiltroRegiao] = useState<string | null>(null);
  const [filtroCoordenador, setFiltroCoordenador] = useState<string | null>(null);
  const [filtroMunicipio, setFiltroMunicipio] = useState<string | null>(null);
  const [mostrarRotulos, setMostrarRotulos] = useState(true);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'padrao' | 'coordenadores' | 'populacao'>('padrao');

  // Encontrar o coordenador da região selecionada
  const selectedCoordenador = selectedRegiao?.coordenadorId
    ? coordenadores.find(c => c.id === selectedRegiao.coordenadorId) || null
    : null;

  // Filtrar municípios da região selecionada
  const municipiosDaRegiao = selectedRegiao
    ? municipios.filter(m => m.regiaoId === selectedRegiao.id)
    : [];

  // Calcular estatísticas da região selecionada
  const estatisticasRegiao = selectedRegiao
    ? calcularEstatisticasRegiao(selectedRegiao.id)
    : null;

  // Filtrar municípios com base no filtro de município
  const municipiosFiltrados = filtroMunicipio
    ? municipios.filter(m => m.id === filtroMunicipio)
    : municipios;

  // Aplicar filtros às regiões
  const regioesFiltradas = regioes.filter(regiao => {
    // Filtrar por região
    if (filtroRegiao && regiao.id !== filtroRegiao) {
      return false;
    }
    
    // Filtrar por coordenador
    if (filtroCoordenador && regiao.coordenadorId !== filtroCoordenador) {
      return false;
    }
    
    // Filtrar por município (mostrar apenas a região que contém o município selecionado)
    if (filtroMunicipio) {
      const municipio = municipios.find(m => m.id === filtroMunicipio);
      if (municipio && municipio.regiaoId !== regiao.id) {
        return false;
      }
    }
    
    return true;
  });

  // Manipuladores de eventos
  const handleSelectRegiao = (regiao: any) => {
    setSelectedRegiao(regiao);
    setShowDetails(true);
  };

  const handleSelectMunicipio = (municipio: any) => {
    setSelectedMunicipio(municipio);
    // Encontrar a região do município e selecioná-la
    const regiao = regioes.find(r => r.id === municipio.regiaoId);
    if (regiao) {
      setSelectedRegiao(regiao);
      setShowDetails(true);
    }
  };

  const handleChangeColor = async (cor: string) => {
    if (selectedRegiao) {
      await atualizarCorRegiao(selectedRegiao.id, cor);
    }
  };

  const handleChangeCoordenador = async (coordenadorId: string | null) => {
    if (selectedRegiao) {
      await atualizarCoordenadorRegiao(selectedRegiao.id, coordenadorId);
    }
  };

  const handleViewEstatisticas = () => {
    setIsEstatisticasModalOpen(true);
  };

  const handleCloseEstatisticasModal = () => {
    setIsEstatisticasModalOpen(false);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const handleFiltroRegiao = (regiaoId: string | null) => {
    setFiltroRegiao(regiaoId);
    if (regiaoId) {
      const regiao = regioes.find(r => r.id === regiaoId);
      if (regiao) {
        setSelectedRegiao(regiao);
      }
      // Limpar filtro de município se mudar a região
      setFiltroMunicipio(null);
    } else {
      setSelectedRegiao(null);
    }
  };

  const handleFiltroCoordenador = (coordenadorId: string | null) => {
    setFiltroCoordenador(coordenadorId);
  };

  const handleFiltroMunicipio = (municipioId: string | null) => {
    setFiltroMunicipio(municipioId);
    if (municipioId) {
      const municipio = municipios.find(m => m.id === municipioId);
      if (municipio) {
        // Selecionar automaticamente a região do município
        const regiao = regioes.find(r => r.id === municipio.regiaoId);
        if (regiao) {
          setFiltroRegiao(regiao.id);
          setSelectedRegiao(regiao);
        }
      }
    }
  };

  const handleLimparFiltros = () => {
    setFiltroRegiao(null);
    setFiltroCoordenador(null);
    setFiltroMunicipio(null);
    setSelectedRegiao(null);
  };

  // Efeito para redimensionar o mapa quando o modo de tela cheia mudar
  useEffect(() => {
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'));
    };
    
    // Pequeno atraso para garantir que a transição de tamanho seja concluída
    setTimeout(handleResize, 100);
  }, [isFullscreen]);

  // Filtrar municípios com base na região selecionada para o dropdown
  const municipiosFiltradosPorRegiao = filtroRegiao
    ? municipios.filter(m => m.regiaoId === filtroRegiao)
    : municipios;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando mapa de regiões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro ao carregar o mapa</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra de filtros */}
      <div className="bg-gray-50 p-3 border-b border-gray-200">
        {/* Todos os filtros em uma única linha com layout consistente */}
        <div className="flex flex-wrap gap-y-2 gap-x-3 md:gap-4 items-start">
          <div className="flex items-center w-full sm:w-auto">
            <label htmlFor="filtroRegiao" className="text-sm font-medium text-gray-700 mr-2 w-24 sm:w-auto whitespace-nowrap">
              Região:
            </label>
            <select
              id="filtroRegiao"
              value={filtroRegiao || ''}
              onChange={(e) => handleFiltroRegiao(e.target.value || null)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary min-w-[120px] flex-1 max-w-full"
            >
              <option value="">Todas</option>
              {regioes.map(regiao => (
                <option key={regiao.id} value={regiao.id}>
                  {regiao.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center w-full sm:w-auto">
            <label htmlFor="filtroMunicipio" className="text-sm font-medium text-gray-700 mr-2 w-24 sm:w-auto whitespace-nowrap">
              Município:
            </label>
            <select
              id="filtroMunicipio"
              value={filtroMunicipio || ''}
              onChange={(e) => handleFiltroMunicipio(e.target.value || null)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary min-w-[120px] flex-1 max-w-full"
            >
              <option value="">Todos</option>
              {municipiosFiltradosPorRegiao.sort((a, b) => a.nome.localeCompare(b.nome)).map(municipio => (
                <option key={municipio.id} value={municipio.id}>
                  {municipio.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center w-full sm:w-auto">
            <label htmlFor="filtroCoordenador" className="text-sm font-medium text-gray-700 mr-2 w-24 sm:w-auto whitespace-nowrap">
              Coordenador:
            </label>
            <select
              id="filtroCoordenador"
              value={filtroCoordenador || ''}
              onChange={(e) => handleFiltroCoordenador(e.target.value || null)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary min-w-[120px] flex-1 max-w-full"
            >
              <option value="">Todos</option>
              {coordenadores.map(coordenador => (
                <option key={coordenador.id} value={coordenador.id}>
                  {coordenador.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center w-full sm:w-auto">
            <label htmlFor="tipoVisualizacao" className="text-sm font-medium text-gray-700 mr-2 w-24 sm:w-auto whitespace-nowrap">
              Visualização:
            </label>
            <select
              id="tipoVisualizacao"
              value={tipoVisualizacao}
              onChange={(e) => setTipoVisualizacao(e.target.value as any)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary min-w-[120px] flex-1 max-w-full"
            >
              <option value="padrao">Padrão</option>
              <option value="coordenadores">Por coordenador</option>
              <option value="populacao">Por população</option>
            </select>
          </div>
          
          <div className="flex items-center w-full sm:w-auto sm:ml-2">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={mostrarRotulos} 
                onChange={(e) => setMostrarRotulos(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              <span className="ms-2 text-sm font-medium text-gray-700 whitespace-nowrap">Mostrar rótulos</span>
            </label>
          </div>
          
          {(filtroRegiao || filtroCoordenador || filtroMunicipio) && (
            <button
              onClick={handleLimparFiltros}
              className="text-sm px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 flex items-center w-full sm:w-auto sm:ml-auto justify-center sm:justify-start mt-2 sm:mt-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="inline">Limpar filtros</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative">
        {/* Detalhes da região selecionada (exibido como modal/drawer em vez de sidebar) */}
        {selectedRegiao && showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:p-0">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Detalhes da Região</h2>
                <button 
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <RegiaoDetalhes
                  regiao={selectedRegiao}
                  coordenador={selectedCoordenador}
                  coordenadores={coordenadores}
                  municipiosDaRegiao={municipiosDaRegiao}
                  onChangeColor={handleChangeColor}
                  onChangeCoordenador={handleChangeCoordenador}
                  onViewEstatisticas={handleViewEstatisticas}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Mapa */}
        <div className="flex-1 h-full">
          <MapBox
            regioes={regioesFiltradas.length > 0 ? regioesFiltradas : regioes}
            coordenadores={coordenadores}
            selectedRegiao={selectedRegiao ? selectedRegiao.id : null}
            onSelectRegiao={handleSelectRegiao}
            onSelectMunicipio={handleSelectMunicipio}
            municipios={municipiosFiltrados}
            isFullscreen={isFullscreen}
            mostrarRotulos={mostrarRotulos}
            tipoVisualizacao={tipoVisualizacao}
          />
        </div>

        {selectedRegiao && estatisticasRegiao && (
          <EstatisticasRegiaoModal
            regiao={selectedRegiao}
            estatisticas={estatisticasRegiao}
            municipios={municipiosDaRegiao}
            isOpen={isEstatisticasModalOpen}
            onClose={handleCloseEstatisticasModal}
          />
        )}
      </div>
    </div>
  );
};

// Componente principal que fornece o contexto
export default function MapaPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Adicionar/remover classe no body para evitar scroll quando em tela cheia
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isFullscreen]);

  // Adicionar manipulador de tecla Esc para sair do modo de tela cheia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <MapaProvider>
      <LayoutProtegido recursoNecessario="regioes">
        <div 
          className={`
            bg-white rounded-xl border border-border shadow-sm overflow-hidden 
            transition-all duration-300 ease-in-out
            ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : ''}
          `}
        >
          <div className="p-2 md:p-3 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Mapa de Regiões</h2>
              <p className="text-xs text-gray-600">Visualização geográfica das regiões e municípios</p>
            </div>
            <button 
              onClick={toggleFullscreen}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-colors
                ${isFullscreen 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                  : 'bg-primary text-white hover:bg-primary/90'}
              `}
              title={isFullscreen ? "Sair da tela cheia" : "Expandir visualização"}
            >
              {isFullscreen ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                  <span className="hidden sm:inline">Sair da tela cheia</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Expandir visualização</span>
                </>
              )}
            </button>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${isFullscreen ? "h-[calc(100vh-3rem)]" : "h-[calc(100vh-12rem)]"}`}>
            <MapaContent isFullscreen={isFullscreen} />
          </div>
        </div>
      </LayoutProtegido>
    </MapaProvider>
  );
} 