'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Loader2, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import LiderancaModal from '@/components/modals/LiderancaModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import Toast, { ToastProvider, useToast } from '@/components/ui/Toast';
import dynamic from 'next/dynamic';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function LiderancaDetalhes() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('liderancas');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lideranca, setLideranca] = useState<any | null>(null);
  
  const [isLoadingApoiadores, setIsLoadingApoiadores] = useState(true);
  const [apoiadores, setApoiadores] = useState<any[]>([]);
  const [errorApoiadores, setErrorApoiadores] = useState<string | null>(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    const fetchLideranca = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados que viriam do backend
        const liderancasMock = [
          {
            id: '1',
            nome: 'Maria Silva',
            regiao: 'Zona Norte',
            cidade: 'São Paulo',
            estado: 'SP',
            telefone: '(11) 98765-4321',
            email: 'maria.silva@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 120,
            dataRegistro: '2023-10-15',
            observacoes: 'Liderança comunitária com forte atuação no bairro.'
          },
          {
            id: '2',
            nome: 'João Pereira',
            regiao: 'Zona Sul',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            telefone: '(21) 97654-3210',
            email: 'joao.pereira@exemplo.com',
            status: 'Ativo',
            totalApoiadores: 185,
            dataRegistro: '2023-09-22',
            observacoes: 'Líder sindical com grande influência na região.'
          }
        ];
        
        const liderancaEncontrada = liderancasMock.find(c => c.id === params.id);
        
        if (liderancaEncontrada) {
          setLideranca(liderancaEncontrada);
        } else {
          setError('Liderança não encontrada');
        }
      } catch (error) {
        console.error('Erro ao carregar liderança:', error);
        setError('Ocorreu um erro ao carregar os dados da liderança. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLideranca();
  }, [params.id]);

  useEffect(() => {
    const fetchApoiadores = async () => {
      if (!lideranca) return;
      
      setIsLoadingApoiadores(true);
      setErrorApoiadores(null);
      
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dados mockados que viriam do backend
        const apoiadoresMock = [
          {
            id: '1',
            nome: 'Ana Oliveira',
            telefone: '(11) 91234-5678',
            bairro: 'Vila Madalena',
            dataRegistro: '2023-11-10'
          },
          {
            id: '2',
            nome: 'Carlos Santos',
            telefone: '(11) 92345-6789',
            bairro: 'Pinheiros',
            dataRegistro: '2023-11-15'
          },
          {
            id: '3',
            nome: 'Mariana Costa',
            telefone: '(11) 93456-7890',
            bairro: 'Perdizes',
            dataRegistro: '2023-11-20'
          }
        ];
        
        setApoiadores(apoiadoresMock);
      } catch (error) {
        console.error('Erro ao carregar apoiadores:', error);
        setErrorApoiadores('Ocorreu um erro ao carregar os apoiadores. Tente novamente mais tarde.');
      } finally {
        setIsLoadingApoiadores(false);
      }
    };
    
    fetchApoiadores();
  }, [lideranca]);

  const handleSaveLideranca = (updatedLideranca: any) => {
    // Aqui seria feita a chamada à API para atualizar a liderança
    console.log('Liderança atualizada:', updatedLideranca);
    
    // Atualizar o estado local
    setLideranca(updatedLideranca);
    
    // Mostrar notificação de sucesso
    showToast({
      message: 'Liderança atualizada com sucesso!',
      type: 'success'
    });
  };

  const handleDeleteLideranca = async () => {
    // Aqui seria feita a chamada à API para excluir a liderança
    console.log('Liderança excluída:', lideranca?.id);
    
    // Mostrar notificação de sucesso
    showToast({
      message: 'Liderança excluída com sucesso!',
      type: 'success'
    });
    
    // Redirecionar para a lista de lideranças
    router.push('/liderancas');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'Inativo':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      case 'Pendente':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
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
            href="/liderancas"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para a lista
          </Link>

          {isLoading ? (
            <div className="bg-white rounded-xl border border-border shadow-sm p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-sm text-gray-600">Carregando dados da liderança...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-border shadow-sm p-8 text-center">
              <AlertCircle className="w-6 h-6 mx-auto text-red-500" />
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                onClick={() => router.push('/liderancas')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
              >
                Voltar para Lideranças
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-xl font-semibold text-gray-900">{lideranca.nome}</h1>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(lideranca.status).bg} ${getStatusColor(lideranca.status).text}`}>
                            {lideranca.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">ID: {lideranca.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-white border border-red-200 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Localização</p>
                          <p className="text-sm text-gray-600">{lideranca.cidade}, {lideranca.estado}</p>
                          <p className="text-sm text-gray-600">{lideranca.regiao}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Telefone</p>
                          <p className="text-sm text-gray-600">{lideranca.telefone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-sm text-gray-600">{lideranca.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Data de Registro</p>
                          <p className="text-sm text-gray-600">{new Date(lideranca.dataRegistro).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h2>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="w-5 h-5 text-primary" />
                          <h3 className="text-sm font-medium text-gray-700">Total de Apoiadores</h3>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{lideranca.totalApoiadores}</p>
                      </div>
                      
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Observações</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          {lideranca.observacoes || 'Nenhuma observação registrada.'}
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
                      <h2 className="text-lg font-medium text-gray-900">Apoiadores Vinculados</h2>
                      <p className="text-sm text-gray-600">Apoiadores gerenciados por esta liderança</p>
                    </div>
                    <Link 
                      href="/apoiadores"
                      className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Ver Todos
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {isLoadingApoiadores ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-sm text-gray-600">Carregando apoiadores...</p>
                    </div>
                  ) : apoiadores.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Nenhum apoiador vinculado a esta liderança.</p>
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
                        {apoiadores.map((apoiador) => (
                          <tr key={apoiador.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{apoiador.nome}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{apoiador.telefone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{apoiador.bairro}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{new Date(apoiador.dataRegistro).toLocaleDateString('pt-BR')}</div>
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
      {lideranca && (
        <LiderancaModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveLideranca}
          lideranca={lideranca}
          title="Editar Liderança"
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteLideranca}
        title="Excluir Liderança"
        description={`Tem certeza que deseja excluir a liderança ${lideranca?.nome}? Todos os dados associados a esta liderança serão perdidos.`}
      />
    </div>
  );
} 