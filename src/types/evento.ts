export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'Reunião' | 'Comício' | 'Caminhada' | 'Debate' | 'Entrevista' | 'Outro';
  dataInicio: string;
  dataFim: string;
  local: {
    nome?: string;
    endereco?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    cep?: string;
    latitude?: number;
    longitude?: number;
  };
  organizador: {
    id: string;
    nome: string;
    tipo: 'Candidato' | 'Coordenador' | 'Liderança';
  };
  participantes?: {
    id: string;
    nome: string;
    tipo: 'Candidato' | 'Coordenador' | 'Liderança' | 'Apoiador';
    confirmado: boolean;
  }[];
  recursos?: {
    id: string;
    nome: string;
    quantidade: number;
    responsavel?: string;
  }[];
  status: 'Agendado' | 'Confirmado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  anexos?: {
    id: string;
    nome: string;
    url: string;
    tipo: string;
    dataUpload: string;
  }[];
  notificar: boolean;
  dataRegistro: string;
  organizacaoId: string;
}

export type EventoStatus = 'agendados' | 'confirmados' | 'em_andamento' | 'concluidos' | 'cancelados'; 