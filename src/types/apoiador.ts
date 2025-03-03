export interface Apoiador {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  titulo?: string;
  zona?: string;
  secao?: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    latitude?: number;
    longitude?: number;
  };
  contato: {
    telefone: string;
    email?: string;
    whatsapp?: string;
  };
  redesSociais?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  profissao?: string;
  observacoes?: string;
  fotoUrl?: string;
  liderancaId?: string;
  dataRegistro: string;
  ultimoContato?: string;
  nivelEngajamento: 'Baixo' | 'Médio' | 'Alto';
  status: 'Ativo' | 'Inativo';
  organizacaoId: string;
  tags?: string[];
}

export interface Lideranca {
  id: string;
  nome: string;
  cpf: string;
  contato: {
    telefone: string;
    email: string;
    whatsapp?: string;
  };
  endereco: {
    cidade: string;
    estado: string;
    bairro?: string;
  };
  fotoUrl?: string;
  qtdApoiadores: number;
  metaApoiadores?: number;
  regiaoId?: string;
  candidatoId?: string;
  dataRegistro: string;
  status: 'Ativo' | 'Inativo';
  organizacaoId: string;
} 