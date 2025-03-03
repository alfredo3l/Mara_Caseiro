'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';

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

interface InspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspector?: Inspector;
  onSubmit: (data: BaseInspector) => void;
}

export default function InspectorModal({
  isOpen,
  onClose,
  inspector,
  onSubmit,
}: InspectorModalProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<BaseInspector>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    avatar: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  });

  useEffect(() => {
    if (inspector) {
      setFormData({
        ...inspector,
        avatar: inspector.avatar || '',
        endereco: {
          ...inspector.endereco,
          complemento: inspector.endereco.complemento || '',
        },
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        avatar: '',
        endereco: {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
        },
      });
    }
  }, [inspector]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return <></>;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl max-h-[90vh] bg-white rounded-xl shadow-lg z-[9999] overflow-y-auto">
          <div className="p-6 border-b border-border sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {inspector ? 'Editar Vistoriador' : 'Adicionar Vistoriador'}
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
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                  Foto
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {formData.avatar && (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden">
                      <Image
                        src={formData.avatar}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label 
                    htmlFor="avatar-input"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Escolher arquivo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="avatar-input"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
              
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

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
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                {inspector ? 'Salvar Alterações' : 'Adicionar Vistoriador'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 