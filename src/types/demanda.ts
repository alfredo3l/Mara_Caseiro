export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'Interna' | 'Externa';
  categoria: 'Infraestrutura' | 'Saúde' | 'Educação' | 'Segurança' | 'Outros';
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Aberta' | 'Em Análise' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  solicitante: {
    id: string;
    nome: string;
    tipo: 'Liderança' | 'Apoiador' | 'Candidato' | 'Coordenador';
  };
  responsavel?: {
    id: string;
    nome: string;
  };
  localizacao?: {
    endereco?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    latitude?: number;
    longitude?: number;
  };
  dataRegistro: string;
  dataLimite?: string;
  dataConclusao?: string;
  atualizacoes?: {
    data: string;
    usuario: string;
    comentario: string;
    status?: 'Aberta' | 'Em Análise' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  }[];
  anexos?: {
    id: string;
    nome: string;
    url: string;
    tipo: string;
    dataUpload: string;
  }[];
  organizacaoId: string;
}

export type DemandaStatus = 'abertas' | 'em_analise' | 'em_andamento' | 'concluidas' | 'canceladas'; 