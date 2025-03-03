'use client';

import { X, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Property } from '@/types/property';

interface PropertyInspection {
  id: string;
  data: string;
  horario: string;
  vistoriador: string;
  status: 'concluída' | 'pendente' | 'cancelada';
  observacoes?: string;
}

// Mock data para demonstração
const mockInspections: PropertyInspection[] = [
  {
    id: '1',
    data: '2024-03-15',
    horario: '09:00',
    vistoriador: 'João Silva',
    status: 'concluída',
    observacoes: 'Vistoria realizada com sucesso. Imóvel em boas condições.'
  },
  {
    id: '2',
    data: '2024-02-20',
    horario: '14:30',
    vistoriador: 'Maria Santos',
    status: 'concluída',
    observacoes: 'Necessária manutenção no sistema hidráulico.'
  },
  {
    id: '3',
    data: '2024-03-25',
    horario: '10:00',
    vistoriador: 'Pedro Costa',
    status: 'pendente'
  }
];

interface PropertyInspectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function PropertyInspectionsModal({
  isOpen,
  onClose,
  property
}: PropertyInspectionsModalProps) {
  const getStatusColor = (status: PropertyInspection['status']) => {
    switch (status) {
      case 'concluída':
        return 'bg-green-50 text-green-700 border border-green-100';
      case 'pendente':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'cancelada':
        return 'bg-red-50 text-red-700 border border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-lg z-[9999] overflow-hidden">
          <div className="p-6 border-b border-border sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Histórico de Vistorias - {property.codigo}
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {property.endereco.logradouro}, {property.endereco.numero}
              {property.endereco.complemento && ` - ${property.endereco.complemento}`}
            </p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="space-y-4">
              {mockInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="bg-white rounded-lg border border-border p-4 hover:shadow-sm transition-shadow"
                >
                  {/* Cabeçalho da Vistoria */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(inspection.data).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-600">{inspection.horario}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                      {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                    </span>
                  </div>

                  {/* Informações da Vistoria */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Vistoriador: <span className="font-medium text-gray-900">{inspection.vistoriador}</span>
                      </span>
                    </div>

                    {inspection.observacoes && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-600">{inspection.observacoes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {mockInspections.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhuma vistoria registrada para este imóvel.</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 