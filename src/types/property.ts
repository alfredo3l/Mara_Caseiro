export interface Property {
  id: string;
  codigo: string;
  tipo: 'Residencial' | 'Comercial' | 'Industrial';
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  imobiliaria: {
    id: string;
    nome: string;
  };
  status: 'Disponível' | 'Alugado' | 'Vendido';
  valor: number;
  dataRegistro: string;
  ultimaVistoria?: string;
} 