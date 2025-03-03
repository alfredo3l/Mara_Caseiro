export interface ApoioPolitico {
  id: string;
  candidato: {
    id: string;
    nome: string;
    nomeUrna: string;
    cargo: 'Vereador' | 'Prefeito' | 'Deputado Estadual' | 'Deputado Federal' | 'Governador' | 'Senador' | 'Presidente';
    partido: {
      sigla: string;
    };
    fotoUrl?: string;
  };
  candidatoApoiado: {
    id: string;
    nome: string;
    nomeUrna: string;
    cargo: 'Vereador' | 'Prefeito' | 'Deputado Estadual' | 'Deputado Federal' | 'Governador' | 'Senador' | 'Presidente';
    partido: {
      sigla: string;
    };
    fotoUrl?: string;
  };
  dataInicio: string;
  dataFim?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  observacoes?: string;
  publicoUrl?: string;
  dataRegistro: string;
  organizacaoId: string;
}

export interface RedeApoio {
  candidatoId: string;
  candidatoNome: string;
  candidatoCargo: string;
  candidatoPartido: string;
  candidatoFoto?: string;
  apoiadores: {
    id: string;
    nome: string;
    cargo: string;
    partido: string;
    foto?: string;
  }[];
  apoiados: {
    id: string;
    nome: string;
    cargo: string;
    partido: string;
    foto?: string;
  }[];
} 