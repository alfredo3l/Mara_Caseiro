'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SidebarVistoriador, { vistorias } from '../../../components/layout/SidebarVistoriador';
import VistoriadorTabBar from '../../../components/dashboard/VistoriadorTabBar';
import InspectionsList from '../../../components/dashboard/InspectionsList';
import type { VistoriadorTab } from '../../../components/dashboard/VistoriadorTabBar';
import { Home, MapPin, Calendar, Clock, Bell, Key, Camera, CheckSquare, AlertCircle, X, Play, CheckCircle2, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

// Importação dinâmica do componente de mapa para evitar erros de SSR
const Map = dynamic(
  () => import('../../../components/Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

interface AmbienteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ambiente: string;
}

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica de alteração de senha
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[1101] p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Alterar Senha
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                Alterar Senha
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AmbienteDialog({ isOpen, onClose, ambiente }: AmbienteDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-xl shadow-lg z-[1101] p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Vistoria do Ambiente: {ambiente}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* Status do Ambiente */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Pendente de Vistoria</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Itens para Verificação:</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Paredes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Piso</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Teto</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Iluminação</span>
                </label>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
                <Camera className="w-4 h-4" />
                <span>Adicionar Fotos</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors">
                <CheckSquare className="w-4 h-4" />
                <span>Marcar como Vistoriado</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type StatusType = 'Pendente' | 'Em andamento' | 'Concluída' | 'Agendada';

export default function DashVistoriador() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVistoria, setActiveVistoria] = useState('1');
  const [activeTab, setActiveTab] = useState<VistoriadorTab>('dados');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAmbiente, setSelectedAmbiente] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Encontra a vistoria ativa apenas se não estiver mostrando configurações
  const vistoriaAtiva = !showSettings ? vistorias.find(vistoria => vistoria.id === activeVistoria) : null;

  const handleStartInspection = () => {
    router.push('/dashboard/vistoriador/vistoriar');
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    setActiveVistoria(''); // Limpa a vistoria ativa
  };

  const renderContent = () => {
    if (showSettings) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notificações */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                  <p className="text-sm text-gray-600">Gerencie suas preferências de notificação</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Novas vistorias atribuídas</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Lembretes de vistoria</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Atualizações de status</span>
                </label>
              </div>
            </div>

            {/* Segurança */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Segurança</h3>
                  <p className="text-sm text-gray-600">Altere sua senha e configure a segurança</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChangePassword(true)}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Alterar senha
              </button>
            </div>
          </div>
          {showChangePassword && (
            <ChangePasswordDialog
              isOpen={showChangePassword}
              onClose={() => setShowChangePassword(false)}
            />
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'dados':
        const getStatusColor = (status: StatusType) => {
          const colors = {
            'Pendente': 'bg-yellow-50 border-yellow-200 text-yellow-700',
            'Em andamento': 'bg-blue-50 border-blue-200 text-blue-700',
            'Concluída': 'bg-green-50 border-green-200 text-green-700',
            'Agendada': 'bg-purple-50 border-purple-200 text-purple-700'
          } as const;
          return colors[status] || colors['Pendente'];
        };

        const getStatusIcon = (status: StatusType) => {
          const icons = {
            'Pendente': <AlertCircle className="w-5 h-5" />,
            'Em andamento': <Loader2 className="w-5 h-5 animate-spin" />,
            'Concluída': <CheckCircle2 className="w-5 h-5" />,
            'Agendada': <Calendar className="w-5 h-5" />
          } as const;
          return icons[status] || icons['Pendente'];
        };

        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            {/* Cabeçalho com Status */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Dados da Vistoria
              </h2>
              <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${getStatusColor(vistoriaAtiva?.status as StatusType || 'Pendente')}`}>
                {getStatusIcon(vistoriaAtiva?.status as StatusType || 'Pendente')}
                <span className="font-medium">{vistoriaAtiva?.status || 'Pendente'}</span>
              </div>
            </div>

            {/* Dados da Vistoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Data: {vistoriaAtiva?.data}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Horário: 14:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Endereço: {vistoriaAtiva?.endereco}</span>
                </div>
              </div>

              {/* Card de Progresso */}
              <div className="bg-gray-50 rounded-lg p-4 border border-border">
                <h3 className="font-medium text-gray-900 mb-3">Progresso da Vistoria</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ambientes Vistoriados</span>
                    <span className="font-medium text-primary">0/6</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="flex justify-center pt-4">
              {vistoriaAtiva?.status === 'Pendente' || vistoriaAtiva?.status === 'Agendada' ? (
                <button 
                  onClick={handleStartInspection}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors shadow-sm hover:shadow-md"
                >
                  <Play className="w-5 h-5" />
                  <span className="font-medium">Começar Vistoria</span>
                </button>
              ) : vistoriaAtiva?.status === 'Em andamento' ? (
                <button 
                  onClick={handleStartInspection}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors shadow-sm hover:shadow-md"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Continuar Vistoria</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Vistoria Concluída</span>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'ambientes':
        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ambientes a serem vistoriados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Sala', 'Cozinha', 'Quarto 1', 'Quarto 2', 'Banheiro', 'Área de Serviço'].map((ambiente) => (
                <button
                  key={ambiente}
                  onClick={() => setSelectedAmbiente(ambiente)}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                    <span className="font-medium text-gray-900">{ambiente}</span>
                  </div>
                </button>
              ))}
            </div>
            {selectedAmbiente && (
              <AmbienteDialog
                isOpen={!!selectedAmbiente}
                onClose={() => setSelectedAmbiente(null)}
                ambiente={selectedAmbiente}
              />
            )}
          </div>
        );

      case 'envolvidos':
        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pessoas Envolvidas
            </h2>
            <div className="space-y-4">
              {/* Lista de envolvidos simulada */}
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Proprietário</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>João Silva</p>
                  <p>joao.silva@email.com</p>
                  <p>(11) 99999-9999</p>
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Inquilino</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Maria Santos</p>
                  <p>maria.santos@email.com</p>
                  <p>(11) 98888-8888</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'localizacao':
        // Definindo coordenadas padrão caso não haja vistoria ativa
        const defaultCoords = { lat: -23.5505, lng: -46.6333 };
        const coords = vistoriaAtiva?.coordenadas || defaultCoords;
        const endereco = vistoriaAtiva?.endereco || 'Endereço não disponível';

        return (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Localização do Imóvel
            </h2>
            
            {/* Informações do Endereço */}
            <div className="bg-gray-50 rounded-lg p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Endereço Completo</h3>
                  <p className="text-gray-600 mt-1">{endereco}</p>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="h-[400px] rounded-lg overflow-hidden">
              <Map
                key={`map-${vistoriaAtiva?.id}`}
                center={coords}
                zoom={15}
                markers={[
                  {
                    position: coords,
                    title: endereco
                  }
                ]}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarVistoriador
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeVistoriaId={activeVistoria}
        onVistoriaClick={(id) => {
          setActiveVistoria(id);
          setShowSettings(false);
        }}
        onSettingsClick={handleShowSettings}
        showSettings={showSettings}
      />
      <ClientHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />
      
      <main className={`pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'} pt-16 transition-all duration-300`}>
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          {!showSettings && (
            <div className="mb-6">
              <div className="bg-white border border-border rounded-xl p-1.5 flex flex-wrap gap-2">
                {['dados', 'ambientes', 'envolvidos', 'localizacao'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as VistoriadorTab)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                        }
                      `}
                    >
                      <span className="capitalize">{tab}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
} 