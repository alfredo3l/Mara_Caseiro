'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Property } from '@/types/property';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSubmit: (data: Property) => void;
}

export default function PropertyModal({
  isOpen,
  onClose,
  property,
  onSubmit,
}: PropertyModalProps) {
  const [formData, setFormData] = useState<Omit<Property, 'id'>>({
    codigo: '',
    tipo: 'Residencial',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    area: 0,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    imobiliaria: {
      id: '',
      nome: '',
    },
    status: 'Disponível',
    valor: 0,
    dataRegistro: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        endereco: {
          ...property.endereco,
          complemento: property.endereco.complemento || '',
        },
      });
    } else {
      setFormData({
        codigo: '',
        tipo: 'Residencial',
        endereco: {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
        },
        area: 0,
        quartos: 0,
        banheiros: 0,
        vagas: 0,
        imobiliaria: {
          id: '',
          nome: '',
        },
        status: 'Disponível',
        valor: 0,
        dataRegistro: new Date().toISOString().split('T')[0],
      });
    }
  }, [property]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: property?.id || String(Date.now()),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl max-h-[90vh] bg-white rounded-xl shadow-lg z-[9999] overflow-y-auto">
          <div className="p-6 border-b border-border sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {property ? 'Editar Imóvel' : 'Adicionar Imóvel'}
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
              
              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Property['tipo'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    id="valor"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="quartos" className="block text-sm font-medium text-gray-700 mb-1">
                    Quartos
                  </label>
                  <input
                    type="number"
                    id="quartos"
                    value={formData.quartos}
                    onChange={(e) => setFormData({ ...formData, quartos: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="banheiros" className="block text-sm font-medium text-gray-700 mb-1">
                    Banheiros
                  </label>
                  <input
                    type="number"
                    id="banheiros"
                    value={formData.banheiros}
                    onChange={(e) => setFormData({ ...formData, banheiros: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="vagas" className="block text-sm font-medium text-gray-700 mb-1">
                    Vagas
                  </label>
                  <input
                    type="number"
                    id="vagas"
                    value={formData.vagas}
                    onChange={(e) => setFormData({ ...formData, vagas: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Property['status'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Alugado">Alugado</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Endereço</h3>

              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  value={formData.endereco.cep}
                  onChange={(e) => setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, cep: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700 mb-1">
                  Logradouro
                </label>
                <input
                  type="text"
                  id="logradouro"
                  value={formData.endereco.logradouro}
                  onChange={(e) => setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, logradouro: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    id="numero"
                    value={formData.endereco.numero}
                    onChange={(e) => setFormData({
                      ...formData,
                      endereco: { ...formData.endereco, numero: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    id="complemento"
                    value={formData.endereco.complemento}
                    onChange={(e) => setFormData({
                      ...formData,
                      endereco: { ...formData.endereco, complemento: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) => setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, bairro: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    value={formData.endereco.cidade}
                    onChange={(e) => setFormData({
                      ...formData,
                      endereco: { ...formData.endereco, cidade: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="estado"
                    value={formData.endereco.estado}
                    onChange={(e) => setFormData({
                      ...formData,
                      endereco: { ...formData.endereco, estado: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-4">
              <Dialog.Close className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                {property ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 