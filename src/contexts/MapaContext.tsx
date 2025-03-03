'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Coordenador, EstatisticasRegiao, MapaContextType, Municipio, Regiao } from '@/types/mapa';
import useMapaRegioes from '@/hooks/useMapaRegioes';

// Criar o contexto
const MapaContext = createContext<MapaContextType | null>(null);

// Hook para usar o contexto
export const useMapaContext = () => {
  const context = useContext(MapaContext);
  if (!context) {
    throw new Error('useMapaContext deve ser usado dentro de um MapaProvider');
  }
  return context;
};

// Props do Provider
interface MapaProviderProps {
  children: ReactNode;
}

// Provider
export const MapaProvider: React.FC<MapaProviderProps> = ({ children }) => {
  // Usar o hook para carregar dados
  const { 
    regioes, 
    municipios, 
    coordenadores, 
    loading, 
    error, 
    atualizarCorRegiao,
    atualizarCoordenadorRegiao
  } = useMapaRegioes();

  // Estados locais
  const [selectedRegiao, setSelectedRegiao] = useState<Regiao | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);

  // Função para calcular estatísticas de uma região
  const calcularEstatisticasRegiao = (regiaoId: string): EstatisticasRegiao => {
    // Encontrar a região
    const regiao = regioes.find(r => r.id === regiaoId);
    if (!regiao) {
      throw new Error(`Região com ID ${regiaoId} não encontrada`);
    }

    // Filtrar municípios da região
    const municipiosDaRegiao = municipios.filter(m => m.regiaoId === regiaoId);
    
    if (municipiosDaRegiao.length === 0) {
      return {
        totalMunicipios: 0,
        populacaoTotal: 0,
        areaTotalKm2: 0,
        densidadePopulacional: 0,
        municipioMaisPopuloso: { nome: 'N/A', populacao: 0 },
        municipioMenosPopuloso: { nome: 'N/A', populacao: 0 }
      };
    }

    // Calcular estatísticas
    const totalMunicipios = municipiosDaRegiao.length;
    const populacaoTotal = municipiosDaRegiao.reduce((total, m) => total + m.populacao, 0);
    const areaTotalKm2 = municipiosDaRegiao.reduce((total, m) => total + m.area, 0);
    const densidadePopulacional = areaTotalKm2 > 0 ? populacaoTotal / areaTotalKm2 : 0;

    // Encontrar município mais populoso
    const municipioMaisPopuloso = municipiosDaRegiao.reduce(
      (mais, atual) => atual.populacao > mais.populacao ? atual : mais,
      municipiosDaRegiao[0]
    );

    // Encontrar município menos populoso
    const municipioMenosPopuloso = municipiosDaRegiao.reduce(
      (menos, atual) => atual.populacao < menos.populacao ? atual : menos,
      municipiosDaRegiao[0]
    );

    return {
      totalMunicipios,
      populacaoTotal,
      areaTotalKm2,
      densidadePopulacional,
      municipioMaisPopuloso: {
        nome: municipioMaisPopuloso.nome,
        populacao: municipioMaisPopuloso.populacao
      },
      municipioMenosPopuloso: {
        nome: municipioMenosPopuloso.nome,
        populacao: municipioMenosPopuloso.populacao
      }
    };
  };

  // Valor do contexto
  const value: MapaContextType = {
    regioes,
    municipios,
    coordenadores,
    selectedRegiao,
    selectedMunicipio,
    loading,
    error,
    setSelectedRegiao,
    setSelectedMunicipio,
    atualizarCorRegiao,
    atualizarCoordenadorRegiao,
    calcularEstatisticasRegiao
  };

  return <MapaContext.Provider value={value}>{children}</MapaContext.Provider>;
};

export default MapaContext; 