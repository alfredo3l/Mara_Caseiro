'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDemandas } from '@/hooks/useDemandas';
import { useApoiadores } from '@/hooks/useApoiadores';

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

// Definir interface para a demanda
interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  status: string;
  apoiadorId: string;
  endereco: Endereco;
  dataLimite: string;
  dataRegistro: string;
  observacoes: string;
  anexos: string[];
  organizacaoId: string;
  tipo: string;
  solicitante: string;
}

export default function NovaDemanda() {
  const router = useRouter();
  const { createDemanda } = useDemandas();
  const { apoiadores, fetchApoiadores } = useApoiadores();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'Infraestrutura',
    prioridade: 'Média',
    status: 'Pendente',
    apoiadorId: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    dataLimite: '',
    observacoes: '',
    anexos: [] as string[],
    tipo: 'Solicitação',
    solicitante: '',
  });

  // Buscar apoiadores ao carregar a página
  useEffect(() => {
    fetchApoiadores(1, 100, '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Preparar dados para envio
      const demandaData = {
        ...formData,
        dataRegistro: new Date().toISOString(),
        organizacaoId: '1', // Substitua pelo ID real da organização
      };

      // Enviar para a API
      const result = await createDemanda(demandaData);
      
      if (result) {
        // Redirecionar para a lista de demandas
        router.push('/demandas');
      } else {
        setFormError('Não foi possível criar a demanda. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar demanda:', error);
      setFormError('Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
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
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              href="/demandas" 
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para demandas</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Nova Demanda</h1>
            <p className="text-gray-600">Preencha o formulário para adicionar uma nova demanda</p>
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
                      Título da Demanda *
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
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Educação">Educação</option>
                      <option value="Segurança">Segurança</option>
                      <option value="Meio Ambiente">Meio Ambiente</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade *
                    </label>
                    <select
                      id="prioridade"
                      name="prioridade"
                      value={formData.prioridade}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
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
                      <option value="Pendente">Pendente</option>
                      <option value="Em Análise">Em Análise</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dataLimite" className="block text-sm font-medium text-gray-700 mb-1">
                      Data Limite
                    </label>
                    <input
                      type="date"
                      id="dataLimite"
                      name="dataLimite"
                      value={formData.dataLimite}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="apoiadorId" className="block text-sm font-medium text-gray-700 mb-1">
                      Solicitante
                    </label>
                    <select
                      id="apoiadorId"
                      name="apoiadorId"
                      value={formData.apoiadorId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="">Selecione um apoiador</option>
                      {apoiadores.map((apoiador) => (
                        <option key={apoiador.id} value={apoiador.id}>
                          {apoiador.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Endereço */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Localização da Demanda</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Logradouro
                    </label>
                    <input
                      type="text"
                      id="endereco.logradouro"
                      name="endereco.logradouro"
                      value={formData.endereco.logradouro}
                      onChange={handleChange}
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
                      Bairro
                    </label>
                    <input
                      type="text"
                      id="endereco.bairro"
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.cidade" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="endereco.cidade"
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endereco.estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      id="endereco.estado"
                      name="endereco.estado"
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
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
                    placeholder="Adicione informações complementares sobre a demanda..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8 flex justify-end gap-4">
              <Link
                href="/demandas"
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
                    <span>Salvar Demanda</span>
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