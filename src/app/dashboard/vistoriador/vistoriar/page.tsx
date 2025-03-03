'use client';

import { useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, MessageCircle, Home, ArrowLeft, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import SidebarVistoriador from '../../../../components/layout/SidebarVistoriador';
import VistoriadorTabBar from '../../../../components/dashboard/VistoriadorTabBar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AmbienteModal from './components/AmbienteModal';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

type StatusType = 'pendente' | 'em_progresso' | 'concluido';

interface Ambiente {
  id: string;
  nome: string;
  status: StatusType;
  itens: Array<{
    id: string;
    nome: string;
    status: StatusType;
  }>;
  fotos: string[];
  observacoes: string;
}

export default function VistoriarPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAmbiente, setActiveAmbiente] = useState<string | null>(null);

  // Dados simulados dos ambientes
  const ambientes: Ambiente[] = [
    {
      id: '1',
      nome: 'Sala de Estar',
      status: 'pendente',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'pendente' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'janelas', nome: 'Janelas', status: 'pendente' },
        { id: 'iluminacao', nome: 'Iluminação', status: 'pendente' },
      ],
      fotos: [],
      observacoes: ''
    },
    {
      id: '2',
      nome: 'Cozinha',
      status: 'em_progresso',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'concluido' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'armarios', nome: 'Armários', status: 'pendente' },
        { id: 'pia', nome: 'Pia e Torneiras', status: 'pendente' },
      ],
      fotos: [],
      observacoes: 'Infiltração próxima à pia'
    },
    {
      id: '3',
      nome: 'Quarto Principal',
      status: 'pendente',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'pendente' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'janelas', nome: 'Janelas', status: 'pendente' },
        { id: 'iluminacao', nome: 'Iluminação', status: 'pendente' },
      ],
      fotos: [],
      observacoes: ''
    },
    {
      id: '4',
      nome: 'Banheiro Social',
      status: 'pendente',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'pendente' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'sanitarios', nome: 'Sanitários', status: 'pendente' },
        { id: 'box', nome: 'Box e Chuveiro', status: 'pendente' },
      ],
      fotos: [],
      observacoes: ''
    },
    {
      id: '5',
      nome: 'Área de Serviço',
      status: 'pendente',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'pendente' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'tanque', nome: 'Tanque', status: 'pendente' },
        { id: 'conexoes', nome: 'Conexões de Água', status: 'pendente' },
      ],
      fotos: [],
      observacoes: ''
    },
    {
      id: '6',
      nome: 'Varanda',
      status: 'pendente',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'pendente' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'grades', nome: 'Grades', status: 'pendente' },
        { id: 'iluminacao', nome: 'Iluminação', status: 'pendente' },
      ],
      fotos: [],
      observacoes: ''
    },
    {
      id: '7',
      nome: 'Quarto 2',
      status: 'pendente',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'pendente' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'janelas', nome: 'Janelas', status: 'pendente' },
        { id: 'iluminacao', nome: 'Iluminação', status: 'pendente' },
      ],
      fotos: [],
      observacoes: ''
    },
    {
      id: '8',
      nome: 'Banheiro Suíte',
      status: 'pendente',
      itens: [
        { id: 'piso', nome: 'Piso', status: 'pendente' },
        { id: 'parede', nome: 'Paredes', status: 'pendente' },
        { id: 'sanitarios', nome: 'Sanitários', status: 'pendente' },
        { id: 'box', nome: 'Box e Chuveiro', status: 'pendente' },
      ],
      fotos: [],
      observacoes: ''
    }
  ];

  const getStatusColor = (status: StatusType) => {
    const colors = {
      pendente: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      em_progresso: 'bg-blue-50 border-blue-200 text-blue-700',
      concluido: 'bg-green-50 border-green-200 text-green-700'
    } as const;
    return colors[status] || colors.pendente;
  };

  const getStatusIcon = (status: StatusType) => {
    const icons = {
      pendente: <AlertCircle className="w-4 h-4" />,
      em_progresso: <Camera className="w-4 h-4" />,
      concluido: <CheckCircle2 className="w-4 h-4" />
    } as const;
    return icons[status] || icons.pendente;
  };

  // Encontrar ambiente ativo
  const ambienteAtivo = activeAmbiente ? ambientes.find(a => a.id === activeAmbiente) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ClientHeader 
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
        fullWidth
      />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 mt-20">
        {/* Cabeçalho da Vistoria */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vistoria em Andamento</h1>
              <p className="text-gray-600 mt-1">Av. Paulista, 1000 - Apto 123</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveAmbiente(null)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Ambiente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Ambientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ambientes.map((ambiente) => (
            <div
              key={ambiente.id}
              className="bg-white rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
            >
              {/* Preview de Fotos ou Placeholder */}
              <div className="aspect-video bg-gray-100 relative group-hover:bg-gray-50 transition-colors">
                {ambiente.fotos.length > 0 ? (
                  <Image
                    src={ambiente.fotos[0]}
                    alt={ambiente.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs font-medium ${getStatusColor(ambiente.status)}`}>
                  {getStatusIcon(ambiente.status)}
                  <span>{ambiente.status === 'pendente' ? 'Pendente' : ambiente.status === 'em_progresso' ? 'Em Progresso' : 'Concluído'}</span>
                </div>
              </div>

              {/* Informações do Ambiente */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">{ambiente.nome}</h3>
                
                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className="text-primary font-medium">
                      {ambiente.itens.filter(item => item.status === 'concluido').length}/{ambiente.itens.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ 
                        width: `${(ambiente.itens.filter(item => item.status === 'concluido').length / ambiente.itens.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveAmbiente(ambiente.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Vistoriar</span>
                  </button>
                  {ambiente.observacoes && (
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de Vistoria */}
      {ambienteAtivo && (
        <AmbienteModal
          isOpen={!!activeAmbiente}
          onClose={() => setActiveAmbiente(null)}
          ambiente={ambienteAtivo}
        />
      )}
    </div>
  );
} 
