'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, User, MapPin, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';

interface CoordenadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coordenador: any) => void;
  coordenador?: any; // Para edição, opcional
  title?: string;
}

export default function CoordenadorModal({
  isOpen,
  onClose,
  onSave,
  coordenador,
  title = 'Novo Coordenador',
}: CoordenadorModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    regiao: '',
    cidade: '',
    estado: '',
    telefone: '',
    email: '',
    status: 'Ativo',
    observacoes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preencher o formulário se estiver editando um coordenador existente
  useEffect(() => {
    if (coordenador) {
      setFormData({
        nome: coordenador.nome || '',
        regiao: coordenador.regiao || '',
        cidade: coordenador.cidade || '',
        estado: coordenador.estado || '',
        telefone: coordenador.telefone || '',
        email: coordenador.email || '',
        status: coordenador.status || 'Ativo',
        observacoes: coordenador.observacoes || ''
      });
    } else {
      // Reset form quando abrir para novo cadastro
      setFormData({
        nome: '',
        regiao: '',
        cidade: '',
        estado: '',
        telefone: '',
        email: '',
        status: 'Ativo',
        observacoes: ''
      });
    }
    setErrors({});
  }, [coordenador, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.regiao.trim()) {
      newErrors.regiao = 'Região é obrigatória';
    }
    
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    
    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato inválido. Use (99) 99999-9999';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Aqui seria a chamada à API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedCoordenador = {
        ...formData,
        id: coordenador?.id || Date.now().toString(),
        dataRegistro: coordenador?.dataRegistro || new Date().toISOString().split('T')[0],
        totalApoiadores: coordenador?.totalApoiadores || 0
      };
      
      onSave(savedCoordenador);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar coordenador:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Ocorreu um erro ao salvar. Tente novamente.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-xl shadow-lg z-[9999] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {title}
              </Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </Dialog.Close>
            </div>

            <div className="px-6 py-4">
              {errors.form && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{errors.form}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Nome */}
                <div className="col-span-2">
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${errors.nome ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30`}
                      placeholder="Nome do coordenador"
                    />
                  </div>
                  {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
                </div>

                {/* Região */}
                <div>
                  <label htmlFor="regiao" className="block text-sm font-medium text-gray-700 mb-1">
                    Região*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="regiao"
                      name="regiao"
                      value={formData.regiao}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${errors.regiao ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30`}
                    >
                      <option value="">Selecione uma região</option>
                      <option value="Zona Norte">Zona Norte</option>
                      <option value="Zona Sul">Zona Sul</option>
                      <option value="Zona Leste">Zona Leste</option>
                      <option value="Zona Oeste">Zona Oeste</option>
                      <option value="Centro">Centro</option>
                    </select>
                  </div>
                  {errors.regiao && <p className="mt-1 text-sm text-red-600">{errors.regiao}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status*
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>

                {/* Cidade */}
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade*
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.cidade ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30`}
                    placeholder="Cidade"
                  />
                  {errors.cidade && <p className="mt-1 text-sm text-red-600">{errors.cidade}</p>}
                </div>

                {/* Estado */}
                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado*
                  </label>
                  <input
                    type="text"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.estado ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30`}
                    placeholder="UF"
                    maxLength={2}
                  />
                  {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado}</p>}
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${errors.telefone ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30`}
                      placeholder="(99) 99999-9999"
                    />
                  </div>
                  {errors.telefone && <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30`}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Observações */}
                <div className="col-span-2">
                  <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    placeholder="Informações adicionais sobre o coordenador..."
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <Dialog.Close className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Coordenador
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 