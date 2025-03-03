'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useApoiosPoliticos } from '@/hooks/useApoiosPoliticos';
import { useApoiadores } from '@/hooks/useApoiadores';
import { useCandidatos } from '@/hooks/useCandidatos';

export default function NovoApoioPolitico() {
  const router = useRouter();
  const { createApoioPolitico } = useApoiosPoliticos();
  const { apoiadores, fetchApoiadores } = useApoiadores();
  const { candidatos, fetchCandidatos } = useCandidatos();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    apoiadorId: '',
    candidatoId: '',
    tipoApoio: 'Público',
    dataApoio: '',
    nivelInfluencia: 3,
    status: 'Ativo',
    observacoes: '',
    documentos: [] as string[],
  });

  // Buscar apoiadores e candidatos ao carregar a página
  useEffect(() => {
    fetchApoiadores(1, 100, '');
    fetchCandidatos(1, 100, '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Preparar dados para envio
      const apoioData = {
        ...formData,
        dataRegistro: new Date().toISOString(),
        organizacaoId: '1', // Substitua pelo ID real da organização
        apoiador: {
          id: formData.apoiadorId,
          nome: apoiadores.find(a => a.id === formData.apoiadorId)?.nome || '',
          cargo: apoiadores.find(a => a.id === formData.apoiadorId)?.profissao || '',
        },
        candidato: {
          id: formData.candidatoId,
          nome: candidatos.find(c => c.id === formData.candidatoId)?.nome || '',
          partido: candidatos.find(c => c.id === formData.candidatoId)?.partido || '',
          cargo: candidatos.find(c => c.id === formData.candidatoId)?.cargo || '',
        }
      };

      // Enviar para a API
      const result = await createApoioPolitico(apoioData);
      
      if (result) {
        // Redirecionar para a lista de apoios políticos
        router.push('/apoios');
      } else {
        setFormError('Não foi possível registrar o apoio político. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao registrar apoio político:', error);
      setFormError('Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === 'nivelInfluencia' ? parseInt(value) : value,
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              href="/apoios" 
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para apoios políticos</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Novo Apoio Político</h1>
            <p className="text-gray-600">Preencha o formulário para registrar um novo apoio político</p>
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
                  <div>
                    <label htmlFor="apoiadorId" className="block text-sm font-medium text-gray-700 mb-1">
                      Apoiador *
                    </label>
                    <select
                      id="apoiadorId"
                      name="apoiadorId"
                      value={formData.apoiadorId}
                      onChange={handleChange}
                      required
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
                  
                  <div>
                    <label htmlFor="candidatoId" className="block text-sm font-medium text-gray-700 mb-1">
                      Candidato *
                    </label>
                    <select
                      id="candidatoId"
                      name="candidatoId"
                      value={formData.candidatoId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="">Selecione um candidato</option>
                      {candidatos.map((candidato) => (
                        <option key={candidato.id} value={candidato.id}>
                          {candidato.nome} - {candidato.partido} ({candidato.cargo})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="tipoApoio" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Apoio *
                    </label>
                    <select
                      id="tipoApoio"
                      name="tipoApoio"
                      value={formData.tipoApoio}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="Público">Público</option>
                      <option value="Privado">Privado</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Logístico">Logístico</option>
                      <option value="Mídias Sociais">Mídias Sociais</option>
                      <option value="Mobilização">Mobilização</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dataApoio" className="block text-sm font-medium text-gray-700 mb-1">
                      Data do Apoio *
                    </label>
                    <input
                      type="date"
                      id="dataApoio"
                      name="dataApoio"
                      value={formData.dataApoio}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nivelInfluencia" className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Influência (1-5) *
                    </label>
                    <input
                      type="range"
                      id="nivelInfluencia"
                      name="nivelInfluencia"
                      min="1"
                      max="5"
                      value={formData.nivelInfluencia}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Baixo</span>
                      <span>Médio</span>
                      <span>Alto</span>
                    </div>
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
                      <option value="Pendente">Pendente</option>
                      <option value="Suspenso">Suspenso</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
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
                    placeholder="Adicione informações complementares sobre o apoio político..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8 flex justify-end gap-4">
              <Link
                href="/apoios"
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
                    <span>Salvar Apoio</span>
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