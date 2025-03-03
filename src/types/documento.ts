export interface Documento {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'Contrato' | 'Ofício' | 'Memorando' | 'Relatório' | 'Projeto' | 'Outros';
  tipo: 'Interno' | 'Externo';
  status: 'Rascunho' | 'Em Revisão' | 'Aprovado' | 'Publicado' | 'Arquivado';
  autor: {
    id: string;
    nome: string;
    cargo: string;
  };
  revisor?: {
    id: string;
    nome: string;
    cargo: string;
  };
  dataRegistro: string;
  dataPublicacao?: string;
  dataExpiracao?: string;
  versao: string;
  tags?: string[];
  acessoRestrito: boolean;
  permissoes: {
    perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
    acoes: ('ler' | 'editar' | 'excluir')[];
  }[];
  historico?: {
    data: string;
    usuario: string;
    acao: string;
    comentario?: string;
    versao?: string;
  }[];
  arquivo: {
    id: string;
    nome: string;
    url: string;
    tipo: string;
    tamanho: number;
    dataUpload: string;
  };
  anexos?: {
    id: string;
    nome: string;
    url: string;
    tipo: string;
    tamanho: number;
    dataUpload: string;
  }[];
  organizacaoId: string;
}

export type DocumentoStatus = 'rascunho' | 'em_revisao' | 'aprovado' | 'publicado' | 'arquivado'; 