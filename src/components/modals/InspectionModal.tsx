'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InspectionFormData) => void;
}

export interface InspectionFormData {
  company: string;
  propertyCode: string;
  address: string;
  date: string;
  time: string;
  inspectionType: 'Entrada' | 'Saída' | 'Periódica';
  inspector?: string;
}

export default function InspectionModal({ isOpen, onClose, onSubmit }: InspectionModalProps) {
  const [formData, setFormData] = useState<InspectionFormData>({
    company: '',
    propertyCode: '',
    address: '',
    date: '',
    time: '',
    inspectionType: 'Entrada',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl max-h-[90vh] bg-white rounded-xl shadow-lg z-[9999] overflow-y-auto">
          <div className="p-6 border-b border-border sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Adicionar Vistoria
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Empresa/Imobiliária */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Imobiliária/Empresa
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Código do Imóvel */}
            <div>
              <label htmlFor="propertyCode" className="block text-sm font-medium text-gray-700 mb-1">
                Código do Imóvel
              </label>
              <input
                type="text"
                id="propertyCode"
                value={formData.propertyCode}
                onChange={(e) => setFormData({ ...formData, propertyCode: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço do Imóvel
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Tipo de Vistoria */}
            <div>
              <label htmlFor="inspectionType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vistoria
              </label>
              <select
                id="inspectionType"
                value={formData.inspectionType}
                onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value as InspectionFormData['inspectionType'] })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                required
              >
                <option value="Entrada">Entrada</option>
                <option value="Saída">Saída</option>
                <option value="Periódica">Periódica</option>
              </select>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg font-medium hover:shadow-md transition-all"
              >
                Adicionar Vistoria
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 