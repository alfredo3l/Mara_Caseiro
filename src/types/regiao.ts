export interface Regiao {
  id: string;
  nome: string;
  tipo: 'Bairro' | 'Cidade' | 'Estado' | 'Zona Eleitoral' | 'Microrregião';
  cidade?: string;
  estado: string;
  populacao?: number;
  eleitores?: number;
  coordenador?: {
    id: string;
    nome: string;
  };
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Estratégica';
  metaApoiadores?: number;
  qtdApoiadores?: number;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  poligono?: {
    latitude: number;
    longitude: number;
  }[];
  observacoes?: string;
  dataRegistro: string;
  organizacaoId: string;
}

export interface Cidade {
  id: string;
  nome: string;
  estado: string;
  populacao?: number;
  eleitores?: number;
  prefeito?: string;
  partidoPrefeito?: string;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Estratégica';
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  dataRegistro: string;
  organizacaoId: string;
}

export interface Estado {
  id: string;
  nome: string;
  sigla: string;
  populacao?: number;
  eleitores?: number;
  governador?: string;
  partidoGovernador?: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  dataRegistro: string;
  organizacaoId: string;
} 