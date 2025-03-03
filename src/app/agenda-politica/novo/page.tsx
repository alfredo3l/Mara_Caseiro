'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEventos } from '@/hooks/useEventos';

// Definir interface para o endereço
interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Definir interface para o compromisso
interface Compromisso {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  endereco: Endereco;
  organizador: string;
  contato: string;
  status: string;
  observacoes: string;
  participantes: string[];
  dataRegistro: string;
  organizacaoId: string;
  local: string;
  notificar: boolean;
}

export default function NovoCompromissoAgendaPolitica() {
  const router = useRouter();
  const { createEvento } = useEventos();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'Reunião',
    dataInicio: '',
    horaInicio: '',
    dataFim: '',
    horaFim: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    organizador: '',
    contato: '',
    status: 'Agendado',
    observacoes: '',
    participantes: [] as string[],
    local: '',
    notificar: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Preparar dados para envio
      const compromissoData = {
        ...formData,
        dataRegistro: new Date().toISOString(),
        organizacaoId: '1', // Substitua pelo ID real da organização
      };

      // Enviar para a API
      const result = await createEvento(compromissoData);
      
      if (result) {
        // Redirecionar para a lista de compromissos
        router.push('/agenda-politica');
      } else {
        setFormError('Não foi possível criar o compromisso. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar compromisso:', error);
      setFormError('Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Lidar com campos aninhados
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prevData => ({
        ...prevData,
        [parent]: {
          ...prevData[parent as keyof typeof prevData] as Record<string, string>,
          [child]: value,
        },
      }));
    } else {
      // Lidar com checkbox
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({
          ...formData,
          [name]: checked,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              href="/agenda-politica" 
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para agenda política</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Novo Compromisso</h1>
            <p className="text-gray-600">Preencha o formulário para adicionar um novo compromisso à agenda política</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                      Título do Compromisso *
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Compromisso *
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="Reunião">Reunião</option>
                      <option value="Comício">Comício</option>
                      <option value="Debate">Debate</option>
                      <option value="Caminhada">Caminhada</option>
                      <option value="Carreata">Carreata</option>
                      <option value="Entrevista">Entrevista</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="Agendado">Agendado</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Data e Hora */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Data e Hora</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      id="dataInicio"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Início *
                    </label>
                    <input
                      type="time"
                      id="horaInicio"
                      name="horaInicio"
                      value={formData.horaInicio}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      id="dataFim"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="horaFim" className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Término
                    </label>
                    <input
                      type="time"
                      id="horaFim"
                      name="horaFim"
                      value={formData.horaFim}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Localização */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Localização</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Local *
                    </label>
                    <input
                      type="text"
                      id="local"
                      name="local"
                      value={formData.local}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Ex: Praça Central, Escola Municipal, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.cep" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="endereco.cep"
                      name="endereco.cep"
                      value={formData.endereco.cep}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="endereco.logradouro" className="block text-sm font-medium text-gray-700 mb-1">
                      Logradouro *
                    </label>
                    <input
                      type="text"
                      id="endereco.logradouro"
                      name="endereco.logradouro"
                      value={formData.endereco.logradouro}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.numero" className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      id="endereco.numero"
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.complemento" className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      id="endereco.complemento"
                      name="endereco.complemento"
                      value={formData.endereco.complemento}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.bairro" className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      id="endereco.bairro"
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.cidade" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      id="endereco.cidade"
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <input
                      type="text"
                      id="endereco.estado"
                      name="endereco.estado"
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Contato */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organizador" className="block text-sm font-medium text-gray-700 mb-1">
                      Organizador *
                    </label>
                    <input
                      type="text"
                      id="organizador"
                      name="organizador"
                      value={formData.organizador}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contato" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone de Contato *
                    </label>
                    <input
                      type="tel"
                      id="contato"
                      name="contato"
                      value={formData.contato}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notificar"
                      name="notificar"
                      checked={formData.notificar}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="notificar" className="ml-2 block text-sm text-gray-700">
                      Notificar participantes sobre este compromisso
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Observações */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Observações Adicionais</h2>
                <div>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                    placeholder="Adicione informações complementares sobre o compromisso..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8 flex justify-end gap-4">
              <Link
                href="/agenda-politica"
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Compromisso</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 