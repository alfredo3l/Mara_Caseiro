'use client';

import { useState } from 'react';
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import InspectorModal from '@/components/modals/InspectorModal';
import DeleteConfirm from '@/components/modals/DeleteConfirm';

interface BaseInspector {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  avatar?: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

interface Inspector extends BaseInspector {
  id: string;
  pendingInspections: number;
  completedInspections: number;
}

const mockInspectors: Inspector[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 456',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 5,
    completedInspections: 128,
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '(11) 98888-8888',
    cpf: '987.654.321-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '04321-765',
      logradouro: 'Av. Principal',
      numero: '789',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 3,
    completedInspections: 95,
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    telefone: '(11) 97777-7777',
    cpf: '456.789.123-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '05678-901',
      logradouro: 'Rua dos Pinheiros',
      numero: '456',
      complemento: 'Casa 2',
      bairro: 'Pinheiros',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 7,
    completedInspections: 156,
  },
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    telefone: '(11) 96666-6666',
    cpf: '789.123.456-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '06789-012',
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: 'Sala 502',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 2,
    completedInspections: 78,
  },
  {
    id: '5',
    nome: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    telefone: '(11) 95555-5555',
    cpf: '321.654.987-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '07890-123',
      logradouro: 'Rua Augusta',
      numero: '789',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 4,
    completedInspections: 112,
  },
  {
    id: '6',
    nome: 'Carla Rodrigues',
    email: 'carla.rodrigues@email.com',
    telefone: '(11) 94444-4444',
    cpf: '654.987.321-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '08901-234',
      logradouro: 'Rua Oscar Freire',
      numero: '123',
      complemento: 'Apto 1001',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 6,
    completedInspections: 143,
  },
  {
    id: '7',
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@email.com',
    telefone: '(11) 93333-3333',
    cpf: '147.258.369-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '09012-345',
      logradouro: 'Av. Brigadeiro Faria Lima',
      numero: '4500',
      complemento: 'Conj. 1502',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 1,
    completedInspections: 67,
  },
  {
    id: '8',
    nome: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    telefone: '(11) 92222-2222',
    cpf: '369.258.147-00',
    avatar: 'https://consultoriodehipnose.com.br/wp-content/uploads/2021/05/as-9-necessidades-basicas-do-ser-humano.jpg',
    endereco: {
      cep: '10123-456',
      logradouro: 'Rua Joaquim Floriano',
      numero: '1000',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    pendingInspections: 8,
    completedInspections: 189,
  },
];

export default function InspectorsList(): React.JSX.Element {
  const [inspectors, setInspectors] = useState<Inspector[]>(mockInspectors);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInspector, setSelectedInspector] = useState<Inspector | undefined>(undefined);

  const handleAdd = (data: BaseInspector): void => {
    const newInspector: Inspector = {
      ...data,
      id: String(inspectors.length + 1),
      pendingInspections: 0,
      completedInspections: 0,
    };
    setInspectors([...inspectors, newInspector]);
    setIsAddModalOpen(false);
  };

  const handleEdit = (data: BaseInspector): void => {
    if (selectedInspector) {
      const updatedInspector: Inspector = {
        ...data,
        id: selectedInspector.id,
        pendingInspections: selectedInspector.pendingInspections,
        completedInspections: selectedInspector.completedInspections,
      };
      setInspectors(inspectors.map(insp => insp.id === selectedInspector.id ? updatedInspector : insp));
      setIsAddModalOpen(false);
      setSelectedInspector(undefined);
    }
  };

  const handleDelete = (): void => {
    if (selectedInspector) {
      setInspectors(inspectors.filter(insp => insp.id !== selectedInspector.id));
      setIsDeleteModalOpen(false);
      setSelectedInspector(undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vistoriadores</h1>
          <p className="text-gray-600">Gerencie os vistoriadores cadastrados</p>
        </div>
        <button
          onClick={() => {
            setSelectedInspector(undefined);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar vistoriador</span>
        </button>
      </div>

      {/* Lista de Vistoriadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inspectors.map((inspector) => (
          <div
            key={inspector.id}
            className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
          >
            {/* Cabeçalho com Avatar e Nome */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="relative w-20 h-20 mb-3">
                {inspector.avatar && (
                  <Image
                    src={inspector.avatar}
                    alt={inspector.nome}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border border-border"
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{inspector.nome}</h3>
              <p className="text-sm text-gray-600">{inspector.email}</p>
            </div>

            {/* Informações */}
            <div className="space-y-3 py-3 border-t border-b border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Telefone</p>
                  <p className="text-sm text-gray-600 truncate">{inspector.telefone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">CPF</p>
                  <p className="text-sm text-gray-600 truncate">{inspector.cpf}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Endereço</p>
                <p className="text-sm text-gray-600">
                  {inspector.endereco.logradouro}, {inspector.endereco.numero}
                  {inspector.endereco.complemento && ` - ${inspector.endereco.complemento}`}
                  <br />
                  {inspector.endereco.bairro} - {inspector.endereco.cidade}/{inspector.endereco.estado}
                </p>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Vistorias Pendentes</p>
                <p className="text-sm text-gray-600">{inspector.pendingInspections}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Vistorias Realizadas</p>
                <p className="text-sm text-gray-600">{inspector.completedInspections}</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button 
                className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => {
                  setSelectedInspector(inspector);
                  setIsAddModalOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => {
                  setSelectedInspector(inspector);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Adicionar/Editar */}
      <InspectorModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedInspector(undefined);
        }}
        inspector={selectedInspector}
        onSubmit={selectedInspector ? handleEdit : handleAdd}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInspector(undefined);
        }}
        onConfirm={handleDelete}
        title="Excluir Vistoriador"
        description={`Tem certeza que deseja excluir o vistoriador "${selectedInspector?.nome}"? Esta ação não poderá ser desfeita.`}
      />
    </div>
  );
} 