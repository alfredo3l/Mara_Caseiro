export interface Candidato {
  id: string;
  nome: string;
  nomeUrna: string;
  cargo: 'Vereador' | 'Prefeito' | 'Deputado Estadual' | 'Deputado Federal' | 'Governador' | 'Senador' | 'Presidente';
  partido: {
    id: string;
    sigla: string;
    nome: string;
  };
  localCandidatura: {
    cidade: string;
    estado: string;
  };
  contato: {
    telefone: string;
    email: string;
    redesSociais?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
  biografia?: string;
  fotoUrl?: string;
  status: 'Pré-Candidato' | 'Candidato' | 'Eleito' | 'Não Eleito';
  qtdVotos?: number;
  metaVotos?: number;
  dataRegistro: string;
  organizacaoId: string;
}

export interface PartidoPolitico {
  id: string;
  sigla: string;
  nome: string;
  numero: number;
  logo?: string;
}

export interface Coligacao {
  id: string;
  nome: string;
  partidos: PartidoPolitico[];
  eleicaoId: string;
} 