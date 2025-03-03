export interface Atendimento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'Presencial' | 'Remoto' | 'Telefone';
  categoria: 'Solicitação' | 'Reclamação' | 'Sugestão' | 'Informação' | 'Outros';
  status: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  solicitante: {
    id: string;
    nome: string;
    tipo: 'Cidadão' | 'Liderança' | 'Apoiador' | 'Candidato' | 'Coordenador';
    telefone?: string;
    email?: string;
  };
  atendente: {
    id: string;
    nome: string;
    cargo: 'Político' | 'Coordenador' | 'Secretário' | 'Assessor' | 'Outros';
  };
  localizacao?: {
    endereco?: string;
    bairro?: string;
    cidade: string;
    estado: string;
  };
  dataAgendamento: string;
  dataAtendimento?: string;
  duracao?: number; // em minutos
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  anotacoes?: string;
  encaminhamentos?: {
    data: string;
    responsavel: string;
    setor: string;
    descricao: string;
    status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
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

export type AtendimentoStatus = 'agendados' | 'em_andamento' | 'concluidos' | 'cancelados'; 