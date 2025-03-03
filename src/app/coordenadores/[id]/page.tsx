'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, MapPin, Phone, Mail, Calendar, 
  Edit, Trash2, Users, FileText, Loader2, AlertTriangle 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import CoordenadorModal from '@/components/modals/CoordenadorModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

interface CoordenadorDetalhesProps {
  params: {
    id: string;
  };
}

export default function CoordenadorDetalhes({ params }: CoordenadorDetalhesProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('coordenadores');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordenador, setCoordenador] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [liderancas, setLiderancas] = useState<any[]>([]);
  const [isLoadingLiderancas, setIsLoadingLiderancas] = useState(true);

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
    const fetchCoordenador = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados que viriam do backend
        const coordenadoresMock = [
          {
            id: '1',
            nome: 'Carlos Mendes',
            regiao: 'Zona Norte',
            cidade: 'São Paulo',
            estado: 'SP',
            telefone: '(11) 98765-4321',
            email: 'carlos.mendes@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 145,
            dataRegistro: '2023-10-15',
            observacoes: 'Coordenador experiente com bom relacionamento na comunidade.'
          },
          {
            id: '2',
            nome: 'Ana Ferreira',
            regiao: 'Zona Sul',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            telefone: '(21) 97654-3210',
            email: 'ana.ferreira@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 230,
            dataRegistro: '2023-09-22',
            observacoes: 'Coordenadora com forte atuação em projetos sociais.'
          },
          {
            id: '3',
            nome: 'Roberto Alves',
            regiao: 'Centro',
            cidade: 'Belo Horizonte',
            estado: 'MG',
            telefone: '(31) 96543-2109',
            email: 'roberto.alves@exemplo.com',
            status: 'Inativo',
            totalApoiadores: 78,
            dataRegistro: '2023-11-05',
            observacoes: 'Afastado temporariamente por motivos pessoais.'
          },
          {
            id: '4',
            nome: 'Juliana Costa',
            regiao: 'Zona Leste',
            cidade: 'Salvador',
            estado: 'BA',
            telefone: '(71) 95432-1098',
            email: 'juliana.costa@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 185,
            dataRegistro: '2023-08-30',
            observacoes: 'Especialista em mobilização de jovens.'
          },
          {
            id: '5',
            nome: 'Marcos Oliveira',
            regiao: 'Zona Oeste',
            cidade: 'Curitiba',
            estado: 'PR',
            telefone: '(41) 94321-0987',
            email: 'marcos.oliveira@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 112,
            dataRegistro: '2023-12-10',
            observacoes: 'Novo coordenador com grande potencial.'
          }
        ];
        
        const coordenadorEncontrado = coordenadoresMock.find(c => c.id === params.id);
        
        if (coordenadorEncontrado) {
          setCoordenador(coordenadorEncontrado);
        } else {
          setError('Coordenador não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar coordenador:', error);
        setError('Ocorreu um erro ao carregar os dados do coordenador. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoordenador();
  }, [params.id]);

  useEffect(() => {
    const fetchLiderancas = async () => {
      if (!coordenador) return;
      
      setIsLoadingLiderancas(true);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dados mockados que viriam do backend
        const liderancasMock = [
          {
            id: '1',
            nome: 'João Silva',
            telefone: '(11) 91234-5678',
            bairro: 'Vila Mariana',
            dataRegistro: '2023-11-10'
          },
          {
            id: '2',
            nome: 'Maria Souza',
            telefone: '(11) 98765-4321',
            bairro: 'Moema',
            dataRegistro: '2023-10-22'
          },
          {
            id: '3',
            nome: 'Pedro Santos',
            telefone: '(11) 97654-3210',
            bairro: 'Itaim Bibi',
            dataRegistro: '2023-12-05'
          }
        ];
        
        setLiderancas(liderancasMock);
      } catch (error) {
        console.error('Erro ao carregar lideranças:', error);
      } finally {
        setIsLoadingLiderancas(false);
      }
    };
    
    fetchLiderancas();
  }, [coordenador]);

  const handleSaveCoordenador = (updatedCoordenador: any) => {
    setCoordenador(updatedCoordenador);
    // Aqui seria feita a chamada à API para atualizar o coordenador
    console.log('Coordenador atualizado:', updatedCoordenador);
  };

  const handleDeleteCoordenador = () => {
    // Aqui seria feita a chamada à API para excluir o coordenador
    console.log('Coordenador excluído:', coordenador?.id);
    router.push('/coordenadores');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Inativo':
        return 'bg-gray-100 text-gray-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          {/* Botão Voltar */}
          <div className="mb-6">
            <Link 
              href="/coordenadores"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para lista de coordenadores
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl border border-border shadow-sm p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-sm text-gray-600">Carregando dados do coordenador...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-border shadow-sm p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erro ao carregar dados</h3>
              <p className="mt-1 text-sm text-gray-600">{error}</p>
              <button
                onClick={() => router.push('/coordenadores')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
              >
                Voltar para lista
              </button>
            </div>
          ) : coordenador && (
            <>
              {/* Cabeçalho do Perfil */}
              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-6">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">{coordenador.nome}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(coordenador.status)}`}>
                          {coordenador.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          ID: {coordenador.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Informações do Coordenador */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h2>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Localização</p>
                            <p className="text-sm text-gray-600">{coordenador.cidade}, {coordenador.estado}</p>
                            <p className="text-sm text-gray-600">{coordenador.regiao}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Telefone</p>
                            <p className="text-sm text-gray-600">{coordenador.telefone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <p className="text-sm text-gray-600">{coordenador.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Data de Registro</p>
                            <p className="text-sm text-gray-600">{new Date(coordenador.dataRegistro).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h2>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="w-5 h-5 text-primary" />
                          <h3 className="text-sm font-medium text-gray-700">Total de Lideranças</h3>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{coordenador.totalApoiadores}</p>
                      </div>
                      
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Observações</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          {coordenador.observacoes || 'Nenhuma observação registrada.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Apoiadores */}
              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Lideranças Vinculadas</h2>
                      <p className="text-sm text-gray-600">Lideranças gerenciadas por este coordenador</p>
                    </div>
                    <Link 
                      href="/liderancas"
                      className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Ver Todas
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {isLoadingLiderancas ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-sm text-gray-600">Carregando lideranças...</p>
                    </div>
                  ) : liderancas.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Nenhuma liderança vinculada a este coordenador.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bairro
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data de Registro
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {liderancas.map((lideranca) => (
                          <tr key={lideranca.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{lideranca.nome}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{lideranca.telefone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{lideranca.bairro}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{new Date(lideranca.dataRegistro).toLocaleDateString('pt-BR')}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal de Edição */}
      {coordenador && (
        <CoordenadorModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveCoordenador}
          coordenador={coordenador}
          title="Editar Coordenador"
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCoordenador}
        title="Excluir Coordenador"
        description={`Tem certeza que deseja excluir o coordenador ${coordenador?.nome}? Todos os dados associados a este coordenador serão perdidos.`}
      />
    </div>
  );
} 