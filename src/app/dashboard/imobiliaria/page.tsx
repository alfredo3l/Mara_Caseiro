'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, ClipboardList, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar, MapPin, Clock, Hash, ArrowRight, Search, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '../../../components/layout/Sidebar';
import Charts from '../../../components/dashboard/Charts';
import InspectionsList from '../../../components/dashboard/InspectionsList';
import InspectionsTabBar, { InspectionStatus } from '../../../components/dashboard/InspectionsTabBar';
import SettingsManager from '../../../components/dashboard/SettingsManager';
import InspectionModal, { InspectionFormData } from '../../../components/modals/InspectionModal';
import DeleteConfirm from '../../../components/modals/DeleteConfirm';
import { Inspection } from '@/types/inspection';
import ImobiliariaTabBar, { ImobiliariaInspectionStatus } from '../../../components/dashboard/ImobiliariaTabBar';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

const mockInspections: Inspection[] = [
  // Agendadas
  {
    id: 1,
    company: 'Imob Premium',
    propertyCode: 'APT-123',
    address: 'Rua das Flores, 123 - Centro',
    date: '25/03/2024',
    time: '14:30',
    type: 'Entrada',
    status: 'agendadas',
    isContestacao: true
  },
  {
    id: 2,
    company: 'Imob Plus',
    propertyCode: 'CASA-456',
    address: 'Av. Principal, 456 - Jardins',
    date: '26/03/2024',
    time: '09:00',
    type: 'Saída',
    status: 'agendadas',
    isContestacao: false
  },
  {
    id: 3,
    company: 'Imob Master',
    propertyCode: 'SALA-789',
    address: 'Rua do Comércio, 789 - Centro',
    date: '26/03/2024',
    time: '15:45',
    type: 'Periódica',
    status: 'agendadas',
    isContestacao: false
  },
  // Em Andamento
  {
    id: 4,
    company: 'Imob Elite',
    propertyCode: 'APT-789',
    address: 'Av. das Palmeiras, 321 - Jardim América',
    date: '25/03/2024',
    time: '10:00',
    type: 'Entrada',
    status: 'andamento',
    isContestacao: true
  },
  {
    id: 5,
    company: 'Imob Prime',
    propertyCode: 'CASA-321',
    address: 'Rua dos Ipês, 567 - Vila Nova',
    date: '25/03/2024',
    time: '11:30',
    type: 'Saída',
    status: 'andamento',
    isContestacao: false
  },
  {
    id: 6,
    company: 'Imob Select',
    propertyCode: 'SALA-456',
    address: 'Av. Central, 890 - Centro',
    date: '25/03/2024',
    time: '13:15',
    type: 'Periódica',
    status: 'andamento',
    isContestacao: false
  },
  // Finalizadas
  {
    id: 7,
    company: 'Imob Gold',
    propertyCode: 'APT-456',
    address: 'Rua das Acácias, 234 - Jardim Europa',
    date: '24/03/2024',
    time: '15:00',
    type: 'Entrada',
    status: 'finalizadas',
    isContestacao: true
  },
  {
    id: 8,
    company: 'Imob Diamond',
    propertyCode: 'CASA-789',
    address: 'Av. dos Pinheiros, 678 - Alto da Boa Vista',
    date: '24/03/2024',
    time: '16:30',
    type: 'Saída',
    status: 'finalizadas',
    isContestacao: false
  },
  {
    id: 9,
    company: 'Imob Platinum',
    propertyCode: 'SALA-123',
    address: 'Rua do Parque, 901 - Moema',
    date: '24/03/2024',
    time: '17:45',
    type: 'Periódica',
    status: 'finalizadas',
    isContestacao: false
  }
];

export default function DashImobiliaria() {
  const [activeTab, setActiveTab] = useState<ImobiliariaInspectionStatus>('agendadas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isContestacao, setIsContestacao] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleAddInspection = () => {
    setIsModalOpen(true);
  };

  const handleSubmitInspection = (data: InspectionFormData) => {
    console.log('Nova vistoria:', data);
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedInspection) {
      // Aqui você implementaria a lógica real de exclusão
      console.log('Excluindo vistoria:', selectedInspection.id);
      setIsDeleteModalOpen(false);
      setSelectedInspection(null);
    }
  };

  // Filtra as vistorias baseado no termo de busca, tipo selecionado e aba ativa
  const filteredInspections = mockInspections.filter(inspection => {
    const matchesSearch = searchTerm === '' || 
      inspection.propertyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || inspection.type === selectedType;
    
    return matchesSearch && matchesType && inspection.status === activeTab;
  });

  const getStatusColor = (status: ImobiliariaInspectionStatus) => {
    const colors = {
      agendadas: 'bg-yellow-50 text-yellow-700',
      andamento: 'bg-purple-50 text-purple-700',
      finalizadas: 'bg-green-50 text-green-700',
      imoveis: 'bg-blue-50 text-blue-700'
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ClientHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />

      <main className={`pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'} pt-16 transition-all duration-300`}>
        <div className="p-6">
          {/* Barra de Tabs */}
          <ImobiliariaTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddInspection={handleAddInspection}
          />

          {/* Campo de Pesquisa e Filtros */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Pesquisar por código ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 text-sm placeholder:text-gray-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="w-56">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-3 px-4 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 text-sm appearance-none"
                aria-label="Filtrar por tipo de vistoria"
              >
                <option value="">Todos os tipos</option>
                <option value="Entrada">Entrada</option>
                <option value="Saída">Saída</option>
                <option value="Conferência">Conferência</option>
              </select>
            </div>

            <label className="flex items-center gap-3 py-1 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isContestacao}
                  onChange={(e) => setIsContestacao(e.target.checked)}
                />
                <div className={`w-12 h-7 rounded-full transition-colors ${
                  isContestacao ? 'bg-primary' : 'bg-gray-200'
                }`}>
                  <div className={`absolute w-5 h-5 rounded-full bg-white top-1 transition-transform ${
                    isContestacao ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">Contestação</span>
            </label>
          </div>

          {/* Lista de Vistorias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInspections.map((inspection) => (
              <div
                key={inspection.id}
                className={`bg-white rounded-xl p-4 hover:shadow-md transition-shadow space-y-4 ${
                  inspection.isContestacao 
                    ? 'border-2 border-red-200' 
                    : 'border border-border'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{inspection.company}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {inspection.isContestacao && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span>Contestação</span>
                        </div>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(activeTab)}`}>
                        {activeTab === 'andamento' ? 'Em Andamento' : activeTab}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Hash className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{inspection.propertyCode}</span>
                  </div>
                  <div className="flex items-start gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{inspection.address}</span>
                  </div>
                </div>

                {/* Informações da Vistoria */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{inspection.date}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{inspection.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span>
                    <span>{inspection.type}</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors py-2">
                    <span>Ver Detalhes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  {activeTab === 'agendadas' && (
                    <button
                      onClick={() => {
                        setSelectedInspection(inspection);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Excluir vistoria"
                      title="Excluir vistoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Modal de Adicionar Vistoria */}
          <InspectionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmitInspection}
          />

          {/* Modal de Confirmação de Exclusão */}
          <DeleteConfirm
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedInspection(null);
            }}
            onConfirm={handleDelete}
            title="Excluir Vistoria"
            description={`Tem certeza que deseja excluir esta vistoria? Esta ação não poderá ser desfeita.`}
          />
        </div>
      </main>
    </div>
  );
} 