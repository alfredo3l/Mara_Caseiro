export interface User {
  id: string;
  email: string;
  nome: string;
  perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  status: 'ativo' | 'inativo' | 'pendente';
  telefone?: string;
  fotoUrl?: string;
  ultimoAcesso?: string;
  dataCriacao: string;
  organizacaoId: string;
  metadata?: {
    candidatoId?: string;
    liderancaId?: string;
    apoiadorId?: string;
    regiaoId?: string;
  };
}

export interface Organizacao {
  id: string;
  nome: string;
  tipo: 'partido' | 'campanha' | 'coligacao' | 'outro';
  logo?: string;
  cores?: {
    primaria: string;
    secundaria: string;
    terciaria?: string;
  };
  contato?: {
    email: string;
    telefone: string;
    website?: string;
  };
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  plano: 'gratuito' | 'basico' | 'profissional' | 'enterprise';
  limites?: {
    usuarios: number;
    apoiadores: number;
    armazenamento: number; // em MB
    consultasIA: number;
  };
  dataRegistro: string;
  status: 'ativa' | 'inativa' | 'trial';
}

export interface Permissao {
  id: string;
  perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  recurso: string;
  acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
  organizacaoId: string;
} 