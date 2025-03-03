'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';

interface BaseRealEstate {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  logo?: string;
  prazoContestacao: number;
  status: 'ativo' | 'inativo';
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

interface RealEstate extends BaseRealEstate {
  id: string;
}

interface RealEstateModalProps {
  isOpen: boolean;
  onClose: () => void;
  realEstate?: RealEstate;
  onSubmit: (data: BaseRealEstate) => void;
}

export default function RealEstateModal({
  isOpen,
  onClose,
  realEstate,
  onSubmit,
}: RealEstateModalProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<BaseRealEstate>({
    nome: '',
    email: '',
    telefone: '',
    cnpj: '',
    logo: '',
    prazoContestacao: 7,
    status: 'ativo',
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
    if (realEstate) {
      setFormData({
        ...realEstate,
        logo: realEstate.logo || '',
        endereco: {
          ...realEstate.endereco,
          complemento: realEstate.endereco.complemento || '',
        },
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cnpj: '',
        logo: '',
        prazoContestacao: 7,
        status: 'ativo',
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
  }, [realEstate]);

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
        setFormData({ ...formData, logo: reader.result as string });
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
                {realEstate ? 'Editar Imobiliária' : 'Adicionar Imobiliária'}
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
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {formData.logo && (
                    <div className="relative w-16 h-16">
                      <Image
                        src={formData.logo}
                        alt="Preview"
                        width={64}
                        height={64}
                        className="rounded-lg object-cover border border-border"
                      />
                    </div>
                  )}
                  <label 
                    htmlFor="logo-input"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Escolher arquivo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="logo-input"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
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
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
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
                  name="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
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
                  name="cep"
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
                  name="logradouro"
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
                    name="numero"
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
                    name="complemento"
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
                  name="bairro"
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
                    name="cidade"
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
                    name="estado"
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

            {/* Prazo de Contestação */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="prazoContestacao">
                Prazo limite de contestação das vistorias
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  id="prazoContestacao"
                  name="prazoContestacao"
                  value={formData.prazoContestacao}
                  onChange={(e) => setFormData({
                    ...formData,
                    prazoContestacao: parseInt(e.target.value)
                  })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  title="Prazo em dias para contestação de vistorias"
                  placeholder="Dias"
                  aria-label="Prazo em dias para contestação de vistorias"
                />
                <span className="text-sm text-gray-600">dias após a finalização da vistoria</span>
              </div>
              <p className="text-xs text-gray-500">
                Define o período em que os envolvidos podrão contestar uma vistoria após sua finalização.
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({
                  ...formData,
                  status: e.target.value as 'ativo' | 'inativo'
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              <p className="text-xs text-gray-500">
                Define se a imobiliária está ativa ou inativa no sistema.
              </p>
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
                {realEstate ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 