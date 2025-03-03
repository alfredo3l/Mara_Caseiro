/**
 * Tipos relacionados ao mapa de regiões
 */

// Tipo para coordenadores de regiões
export interface Coordenador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

// Tipo para regiões
export interface Regiao {
  id: string;
  nome: string;
  cor: string;
  coordenadorId: string | null;
  municipios: string[]; // Array de IDs de municípios
}

// Tipo para municípios
export interface Municipio {
  id: string;
  nome: string;
  regiaoId: string;
  populacao: number;
  area: number;
  geometry: GeoJSON.Geometry; // Geometria GeoJSON
}

// Tipo para estatísticas de região
export interface EstatisticasRegiao {
  totalMunicipios: number;
  populacaoTotal: number;
  areaTotalKm2: number;
  densidadePopulacional: number; // habitantes por km²
  municipioMaisPopuloso: {
    nome: string;
    populacao: number;
  };
  municipioMenosPopuloso: {
    nome: string;
    populacao: number;
  };
}

// Tipo para o contexto do mapa
export interface MapaContextType {
  regioes: Regiao[];
  municipios: Municipio[];
  coordenadores: Coordenador[];
  selectedRegiao: Regiao | null;
  selectedMunicipio: Municipio | null;
  loading: boolean;
  error: string | null;
  setSelectedRegiao: (regiao: Regiao | null) => void;
  setSelectedMunicipio: (municipio: Municipio | null) => void;
  atualizarCorRegiao: (id: string, cor: string) => Promise<void>;
  atualizarCoordenadorRegiao: (regiaoId: string, coordenadorId: string | null) => Promise<void>;
  calcularEstatisticasRegiao: (regiaoId: string) => EstatisticasRegiao;
}

// Tipo para propriedades do componente MapBox
export interface MapBoxProps {
  regioes: Regiao[];
  municipios: Municipio[];
  selectedRegiao: Regiao | null;
  onSelectRegiao: (regiao: Regiao) => void;
  onSelectMunicipio: (municipio: Municipio) => void;
}

// Tipo para propriedades do componente RegiaoDetalhes
export interface RegiaoDetalhesProps {
  regiao: Regiao;
  coordenador: Coordenador | null;
  coordenadores: Coordenador[];
  municipiosDaRegiao: Municipio[];
  onChangeColor: (cor: string) => void;
  onChangeCoordenador: (coordenadorId: string | null) => void;
  onViewEstatisticas: () => void;
}

// Tipo para propriedades do componente EstatisticasRegiaoModal
export interface EstatisticasRegiaoModalProps {
  regiao: Regiao;
  estatisticas: EstatisticasRegiao;
  municipios: Municipio[];
  isOpen: boolean;
  onClose: () => void;
} 