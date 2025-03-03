'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useApoiadores } from '@/hooks/useApoiadores';
import { useLiderancas } from '@/hooks/useLiderancas';

// Definir interfaces para os tipos aninhados
interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Contato {
  telefone: string;
  email: string;
  whatsapp: string;
}

interface RedesSociais {
  instagram: string;
  facebook: string;
  twitter: string;
}

export default function NovoApoiador() {
  const router = useRouter();
  const { createApoiador } = useApoiadores();
  const { liderancas, fetchLiderancas } = useLiderancas();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    titulo: '',
    zona: '',
    secao: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    } as Endereco,
    contato: {
      telefone: '',
      email: '',
      whatsapp: '',
    } as Contato,
    redesSociais: {
      instagram: '',
      facebook: '',
      twitter: '',
    } as RedesSociais,
    profissao: '',
    observacoes: '',
    liderancaId: '',
    nivelEngajamento: 'Médio' as 'Baixo' | 'Médio' | 'Alto',
    status: 'Ativo' as 'Ativo' | 'Inativo',
    tags: [] as string[],
  });

  // Buscar lideranças ao carregar a página
  useEffect(() => {
    fetchLiderancas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Preparar dados para envio
      const apoiadorData = {
        ...formData,
        dataRegistro: new Date().toISOString(),
        organizacaoId: '1', // Substitua pelo ID real da organização
      };

      // Enviar para a API
      const result = await createApoiador(apoiadorData);
      
      if (result) {
        // Redirecionar para a lista de apoiadores
        router.push('/apoiadores');
      } else {
        setFormError('Não foi possível criar o apoiador. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar apoiador:', error);
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
              href="/apoiadores" 
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para apoiadores</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Novo Apoiador</h1>
            <p className="text-gray-600">Preencha o formulário para adicionar um novo apoiador</p>
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
              {/* Dados Pessoais */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      id="dataNascimento"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="profissao" className="block text-sm font-medium text-gray-700 mb-1">
                      Profissão
                    </label>
                    <input
                      type="text"
                      id="profissao"
                      name="profissao"
                      value={formData.profissao}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Título Eleitoral */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Título Eleitoral</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                      Número do Título
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zona" className="block text-sm font-medium text-gray-700 mb-1">
                      Zona
                    </label>
                    <input
                      type="text"
                      id="zona"
                      name="zona"
                      value={formData.zona}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="secao" className="block text-sm font-medium text-gray-700 mb-1">
                      Seção
                    </label>
                    <input
                      type="text"
                      id="secao"
                      name="secao"
                      value={formData.secao}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Endereço */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Endereço</h2>
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
                      Número *
                    </label>
                    <input
                      type="text"
                      id="endereco.numero"
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      required
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
                    <label htmlFor="contato.telefone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="contato.telefone"
                      name="contato.telefone"
                      value={formData.contato.telefone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contato.whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      id="contato.whatsapp"
                      name="contato.whatsapp"
                      value={formData.contato.whatsapp}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="contato.email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="contato.email"
                      name="contato.email"
                      value={formData.contato.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Redes Sociais */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Redes Sociais</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="redesSociais.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="redesSociais.instagram"
                      name="redesSociais.instagram"
                      value={formData.redesSociais.instagram}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="redesSociais.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      id="redesSociais.facebook"
                      name="redesSociais.facebook"
                      value={formData.redesSociais.facebook}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="redesSociais.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="redesSociais.twitter"
                      name="redesSociais.twitter"
                      value={formData.redesSociais.twitter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Informações Adicionais */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="liderancaId" className="block text-sm font-medium text-gray-700 mb-1">
                      Liderança
                    </label>
                    <select
                      id="liderancaId"
                      name="liderancaId"
                      value={formData.liderancaId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="">Selecione uma liderança</option>
                      {liderancas.map((lideranca) => (
                        <option key={lideranca.id} value={lideranca.id}>
                          {lideranca.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="nivelEngajamento" className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Engajamento *
                    </label>
                    <select
                      id="nivelEngajamento"
                      name="nivelEngajamento"
                      value={formData.nivelEngajamento}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="Baixo">Baixo</option>
                      <option value="Médio">Médio</option>
                      <option value="Alto">Alto</option>
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
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8 flex justify-end gap-4">
              <Link
                href="/apoiadores"
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
                    <span>Salvar Apoiador</span>
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