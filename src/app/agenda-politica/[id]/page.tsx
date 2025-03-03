'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, User, Phone, Clock, FileText, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import dynamic from 'next/dynamic';
import { useEventos } from '@/hooks/useEventos';
import { ToastProvider } from '@/components/ui/Toast';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

// Componente principal encapsulado com ToastProvider
export default function CompromissoDetalhes() {
  return (
    <ToastProvider>
      <CompromissoDetalhesContent />
    </ToastProvider>
  );
}

// Componente de conteúdo que usa o contexto de toast
function CompromissoDetalhesContent() {
  const params = useParams();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('agenda-politica');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compromisso, setCompromisso] = useState<any>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { eventos } = useEventos();

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

  useEffect(() => {
    if (params.id) {
      fetchCompromisso(params.id as string);
    }
  }, [params.id]);

  // Mock de dados para simulação
  const compromissosMock = [
    {
      id: '1',
      titulo: 'Reunião com Lideranças Comunitárias',
      descricao: 'Discussão sobre as necessidades da comunidade e apresentação de propostas',
      tipo: 'Reunião',
      dataInicio: '2023-08-15T14:00:00',
      dataFim: '2023-08-15T16:00:00',
      endereco: {
        logradouro: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01001-000',
        complemento: 'Sala 45'
      },
      organizador: 'João Silva',
      contato: '(11) 98765-4321',
      status: 'Agendado',
      observacoes: 'Levar material de apresentação e propostas impressas',
      participantes: ['1', '2', '3'],
      dataRegistro: '2023-07-20T10:30:00',
      local: 'Associação de Moradores',
      cidade: 'São Paulo'
    },
    {
      id: '2',
      titulo: 'Debate sobre Políticas Públicas',
      descricao: 'Debate com outros candidatos sobre propostas para políticas públicas',
      tipo: 'Debate',
      dataInicio: '2023-08-20T19:00:00',
      dataFim: '2023-08-20T21:30:00',
      endereco: {
        logradouro: 'Avenida Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        complemento: 'Auditório Principal'
      },
      organizador: 'TV Cidade',
      contato: '(11) 3333-4444',
      status: 'Confirmado',
      observacoes: 'Preparar pontos principais para debate. Chegar com 1h de antecedência.',
      participantes: ['4', '5', '6', '7'],
      dataRegistro: '2023-07-25T14:20:00',
      local: 'Centro de Convenções',
      cidade: 'São Paulo'
    }
  ];

  const fetchCompromisso = (id: string) => {
    setLoading(true);
    setError(null);

    // Simulação de chamada à API
    setTimeout(() => {
      const foundCompromisso = compromissosMock.find(c => c.id === id);
      
      if (foundCompromisso) {
        setCompromisso(foundCompromisso);
        fetchParticipantes(foundCompromisso.participantes);
      } else {
        setError('Compromisso não encontrado');
      }
      
      setLoading(false);
    }, 1000);
  };

  const fetchParticipantes = (participantesIds: string[]) => {
    setLoadingParticipantes(true);

    // Simulação de chamada à API
    setTimeout(() => {
      // Mock de participantes
      const participantesMock = [
        { id: '1', nome: 'Ana Silva', cargo: 'Líder Comunitária', contato: '(11) 98765-1234' },
        { id: '2', nome: 'Carlos Oliveira', cargo: 'Presidente da Associação', contato: '(11) 97654-3210' },
        { id: '3', nome: 'Mariana Santos', cargo: 'Secretária de Educação', contato: '(11) 91234-5678' },
        { id: '4', nome: 'Roberto Almeida', cargo: 'Vereador', contato: '(11) 99876-5432' },
        { id: '5', nome: 'Juliana Costa', cargo: 'Candidata', contato: '(11) 95555-4444' },
        { id: '6', nome: 'Fernando Pereira', cargo: 'Candidato', contato: '(11) 94444-3333' },
        { id: '7', nome: 'Luciana Martins', cargo: 'Jornalista', contato: '(11) 93333-2222' }
      ];

      const filteredParticipantes = participantesMock.filter(p => participantesIds.includes(p.id));
      setParticipantes(filteredParticipantes);
      setLoadingParticipantes(false);
    }, 800);
  };

  const handleSaveCompromisso = (data: any) => {
    console.log('Salvando compromisso:', data);
    setCompromisso({ ...compromisso, ...data });
    setShowEditModal(false);
  };

  const handleDeleteCompromisso = async () => {
    setIsDeleting(true);
    
    // Simulação de chamada à API
    setTimeout(() => {
      console.log('Compromisso excluído:', compromisso.id);
      setIsDeleting(false);
      setShowDeleteModal(false);
      router.push('/agenda-politica');
    }, 1000);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarHora = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'Confirmado':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
      case 'Em Andamento':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'Concluído':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'Cancelado':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
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
          <Link 
            href="/agenda-politica" 
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para lista</span>
          </Link>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-sm text-gray-600">Carregando detalhes do compromisso...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link 
                href="/agenda-politica" 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Voltar para Agenda Política
              </Link>
            </div>
          ) : compromisso && (
            <>
              {/* Cabeçalho do Compromisso */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="text-xl font-bold text-gray-900">{compromisso.titulo}</h1>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(compromisso.status).bg} ${getStatusColor(compromisso.status).text}`}>
                            {compromisso.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">ID: {compromisso.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Informações do Compromisso */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1 - Informações Básicas */}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h2>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Descrição</h3>
                          <p className="mt-1 text-gray-600">{compromisso.descricao}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Tipo</h3>
                          <p className="mt-1 text-gray-600">{compromisso.tipo}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Data e Hora</h3>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Início: {formatarData(compromisso.dataInicio)} às {formatarHora(compromisso.dataInicio)}</span>
                            </div>
                            {compromisso.dataFim && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Término: {formatarData(compromisso.dataFim)} às {formatarHora(compromisso.dataFim)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Registrado em</h3>
                          <p className="mt-1 text-gray-600">{formatarData(compromisso.dataRegistro)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2 - Localização e Contato */}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Localização e Contato</h2>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Local</h3>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{compromisso.local}</span>
                            </div>
                            <p className="text-gray-600 pl-6">
                              {compromisso.endereco.logradouro}, {compromisso.endereco.numero}
                              {compromisso.endereco.complemento && `, ${compromisso.endereco.complemento}`}<br />
                              {compromisso.endereco.bairro}, {compromisso.endereco.cidade} - {compromisso.endereco.estado}<br />
                              {compromisso.endereco.cep}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Organizador</h3>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{compromisso.organizador}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Contato</h3>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{compromisso.contato}</span>
                            </div>
                          </div>
                        </div>
                        {compromisso.observacoes && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-700">Observações</h3>
                            <p className="mt-1 text-gray-600">{compromisso.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participantes */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Participantes</h2>
                      <p className="text-sm text-gray-600">Pessoas confirmadas neste compromisso</p>
                    </div>
                    <button className="inline-flex items-center gap-1 px-3 py-2 bg-white text-primary border border-primary/30 rounded-md hover:bg-primary/5 transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>Exportar Lista</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loadingParticipantes ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-sm text-gray-600">Carregando participantes...</p>
                    </div>
                  ) : participantes.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {participantes.map((participante) => (
                          <tr key={participante.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{participante.nome}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{participante.cargo}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{participante.contato}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Nenhum participante confirmado para este compromisso.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o compromisso "{compromisso?.titulo}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCompromisso}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição (placeholder) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Compromisso</h3>
            <p className="text-gray-600 mb-6">
              Formulário de edição seria implementado aqui, similar ao formulário de criação.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveCompromisso(compromisso)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 