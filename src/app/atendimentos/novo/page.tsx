'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Calendar, Clock, User, Users, FileText, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import { useAtendimentos } from '@/hooks/useAtendimentos';
import Link from 'next/link';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function NovoAtendimento() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('atendimentos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { createAtendimento } = useAtendimentos();

  // Form state
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'Presencial' | 'Remoto' | 'Telefone'>('Presencial');
  const [categoria, setCategoria] = useState<'Solicitação' | 'Reclamação' | 'Sugestão' | 'Informação' | 'Outros'>('Solicitação');
  const [prioridade, setPrioridade] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Média');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horarioAgendamento, setHorarioAgendamento] = useState('');
  const [duracao, setDuracao] = useState('60');
  const [anotacoes, setAnotacoes] = useState('');
  
  // Solicitante
  const [solicitanteNome, setSolicitanteNome] = useState('');
  const [solicitanteTipo, setSolicitanteTipo] = useState<'Cidadão' | 'Liderança' | 'Apoiador' | 'Candidato' | 'Coordenador'>('Cidadão');
  const [solicitanteTelefone, setSolicitanteTelefone] = useState('');
  const [solicitanteEmail, setSolicitanteEmail] = useState('');
  
  // Atendente
  const [atendenteNome, setAtendenteNome] = useState('');
  const [atendenteCargo, setAtendenteCargo] = useState<'Político' | 'Coordenador' | 'Secretário' | 'Assessor' | 'Outros'>('Político');
  
  // Localização
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('MS');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!titulo || !solicitanteNome || !atendenteNome || !dataAgendamento) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Formatar data e hora
      const dataHoraAgendamento = horarioAgendamento 
        ? `${dataAgendamento}T${horarioAgendamento}:00` 
        : `${dataAgendamento}T00:00:00`;
      
      const novoAtendimento = {
        titulo,
        descricao,
        tipo,
        categoria,
        status: 'Agendado' as const,
        prioridade,
        solicitante: {
          id: `temp-${Date.now()}`, // Será substituído pelo ID real no backend
          nome: solicitanteNome,
          tipo: solicitanteTipo,
          telefone: solicitanteTelefone || undefined,
          email: solicitanteEmail || undefined
        },
        atendente: {
          id: `temp-${Date.now() + 1}`, // Será substituído pelo ID real no backend
          nome: atendenteNome,
          cargo: atendenteCargo
        },
        localizacao: {
          endereco: endereco || undefined,
          bairro: bairro || undefined,
          cidade,
          estado
        },
        dataAgendamento: dataHoraAgendamento,
        duracao: parseInt(duracao) || 60,
        anotacoes: anotacoes || undefined,
        organizacaoId: 'default' // Será substituído pelo ID real no backend
      };
      
      const resultado = await createAtendimento(novoAtendimento);
      
      if (resultado) {
        router.push('/atendimentos');
      } else {
        setFormError('Erro ao criar atendimento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      setFormError('Ocorreu um erro ao criar o atendimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuItemClick={setActiveItem}
        activeItem={activeItem.toLowerCase()}
      />
      <ClientHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />

      <main className={`pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'} pt-16 transition-all duration-300`}>
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/atendimentos" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Novo Atendimento</h1>
            </div>
          </div>

          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-medium text-gray-900">Informações do Atendimento</h2>
              <p className="text-sm text-gray-600">Preencha os dados para registrar um novo atendimento</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título e Descrição */}
              <div className="md:col-span-2">
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Ex: Atendimento sobre infraestrutura no bairro"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Descreva o assunto do atendimento..."
                />
              </div>

              {/* Tipo, Categoria e Prioridade */}
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Atendimento <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  required
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Telefone">Telefone</option>
                </select>
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  required
                >
                  <option value="Solicitação">Solicitação</option>
                  <option value="Reclamação">Reclamação</option>
                  <option value="Sugestão">Sugestão</option>
                  <option value="Informação">Informação</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade <span className="text-red-500">*</span>
                </label>
                <select
                  id="prioridade"
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  required
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              {/* Data, Horário e Duração */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="dataAgendamento" className="block text-sm font-medium text-gray-700 mb-1">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dataAgendamento"
                      value={dataAgendamento}
                      onChange={(e) => setDataAgendamento(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                      required
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="flex-1">
                  <label htmlFor="horarioAgendamento" className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      id="horarioAgendamento"
                      value={horarioAgendamento}
                      onChange={(e) => setHorarioAgendamento(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    />
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="duracao" className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  id="duracao"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  min="15"
                  step="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200 my-4"></div>

              {/* Solicitante */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  Dados do Solicitante
                </h3>
              </div>

              <div>
                <label htmlFor="solicitanteNome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Solicitante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="solicitanteNome"
                  value={solicitanteNome}
                  onChange={(e) => setSolicitanteNome(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <label htmlFor="solicitanteTipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  id="solicitanteTipo"
                  value={solicitanteTipo}
                  onChange={(e) => setSolicitanteTipo(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  required
                >
                  <option value="Cidadão">Cidadão</option>
                  <option value="Liderança">Liderança</option>
                  <option value="Apoiador">Apoiador</option>
                  <option value="Candidato">Candidato</option>
                  <option value="Coordenador">Coordenador</option>
                </select>
              </div>

              <div>
                <label htmlFor="solicitanteTelefone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="solicitanteTelefone"
                  value={solicitanteTelefone}
                  onChange={(e) => setSolicitanteTelefone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label htmlFor="solicitanteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="solicitanteEmail"
                  value={solicitanteEmail}
                  onChange={(e) => setSolicitanteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200 my-4"></div>

              {/* Atendente */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />
                  Dados do Atendente
                </h3>
              </div>

              <div>
                <label htmlFor="atendenteNome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Atendente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="atendenteNome"
                  value={atendenteNome}
                  onChange={(e) => setAtendenteNome(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <label htmlFor="atendenteCargo" className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo <span className="text-red-500">*</span>
                </label>
                <select
                  id="atendenteCargo"
                  value={atendenteCargo}
                  onChange={(e) => setAtendenteCargo(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  required
                >
                  <option value="Político">Político</option>
                  <option value="Coordenador">Coordenador</option>
                  <option value="Secretário">Secretário</option>
                  <option value="Assessor">Assessor</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200 my-4"></div>

              {/* Localização */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                  Localização
                </h3>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Nome da cidade"
                  required
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  required
                >
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200 my-4"></div>

              {/* Anotações */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-500" />
                  Anotações
                </h3>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="anotacoes" className="block text-sm font-medium text-gray-700 mb-1">
                  Anotações Adicionais
                </label>
                <textarea
                  id="anotacoes"
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Informações adicionais sobre o atendimento..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end">
              <Link 
                href="/atendimentos"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Atendimento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 