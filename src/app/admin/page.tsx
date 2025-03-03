'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  UserCog, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  Edit,
  Trash,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermissoes } from '@/hooks/usePermissoes';
import LayoutProtegido from '@/components/layout/LayoutProtegido';
import PermissoesModal from '@/components/modals/PermissoesModal';
import NovoUsuarioModal from '@/components/modals/NovoUsuarioModal';
import Carregando from '@/components/ui/Carregando';

export default function PaginaAdmin() {
  const router = useRouter();
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [modalPermissoesAberto, setModalPermissoesAberto] = useState(false);
  const [modalNovoUsuarioAberto, setModalNovoUsuarioAberto] = useState(false);
  const [filtroAberto, setFiltroAberto] = useState(false);
  
  const { 
    usuarios, 
    recursos, 
    perfis,
    carregando: carregandoPermissoes, 
    erro, 
    filtros, 
    setFiltros,
    atualizarPerfilUsuario,
    atualizarPermissoesUsuario,
    atualizarStatusUsuario,
    criarNovoUsuario
  } = usePermissoes();

  const handleAbrirModalPermissoes = (usuario: any) => {
    setUsuarioSelecionado(usuario);
    setModalPermissoesAberto(true);
  };

  const handleFecharModalPermissoes = () => {
    setModalPermissoesAberto(false);
    setUsuarioSelecionado(null);
  };

  const handleSalvarPermissoes = async (
    usuarioId: string,
    permissoes: {
      recurso: string;
      acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
    }[]
  ) => {
    return await atualizarPermissoesUsuario(usuarioId, permissoes);
  };

  const handleAtualizarPerfil = async (
    usuarioId: string,
    novoPerfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador'
  ) => {
    return await atualizarPerfilUsuario(usuarioId, novoPerfil);
  };

  const handleAtualizarStatus = async (
    usuarioId: string,
    novoStatus: 'ativo' | 'inativo' | 'pendente'
  ) => {
    return await atualizarStatusUsuario(usuarioId, novoStatus);
  };

  const handleAbrirModalNovoUsuario = () => {
    setModalNovoUsuarioAberto(true);
  };

  const handleFecharModalNovoUsuario = () => {
    setModalNovoUsuarioAberto(false);
  };

  const handleCriarNovoUsuario = async (dadosUsuario: {
    nome: string;
    email: string;
    perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  }) => {
    return await criarNovoUsuario(dadosUsuario);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-24">
            <CheckCircle className="w-3 h-3" />
            Ativo
          </span>
        );
      case 'inativo':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 w-24">
            <XCircle className="w-3 h-3" />
            Inativo
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-24">
            <AlertCircle className="w-3 h-3" />
            Pendente
          </span>
        );
      default:
        return null;
    }
  };

  const renderPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-40">
            <Shield className="w-3 h-3" />
            Super Administrador
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-40">
            <Shield className="w-3 h-3" />
            Administrador
          </span>
        );
      case 'coordenador':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 w-40">
            <UserCog className="w-3 h-3" />
            Coordenador
          </span>
        );
      case 'lideranca':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 w-40">
            <UserCog className="w-3 h-3" />
            Liderança
          </span>
        );
      case 'apoiador':
        return (
          <span className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-40">
            <UserCog className="w-3 h-3" />
            Apoiador
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <LayoutProtegido 
      recursoNecessario="admin"
      mensagemAcessoNegado="Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários e permissões."
    >
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Administração de Usuários</h1>
          
          <button 
            onClick={handleAbrirModalNovoUsuario}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                  value={filtros.busca || ''}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setFiltroAberto(!filtroAberto)}
                  className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtroAberto ? 'rotate-180' : ''}`} />
                </button>
                
                {filtroAberto && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Perfil
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg p-2"
                          value={filtros.perfil || ''}
                          onChange={(e) => setFiltros({ 
                            ...filtros, 
                            perfil: e.target.value ? e.target.value as any : undefined 
                          })}
                        >
                          <option value="">Todos os perfis</option>
                          {perfis.map(perfil => (
                            <option key={perfil.id} value={perfil.id}>
                              {perfil.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg p-2"
                          value={filtros.status || ''}
                          onChange={(e) => setFiltros({ 
                            ...filtros, 
                            status: e.target.value ? e.target.value as any : undefined 
                          })}
                        >
                          <option value="">Todos os status</option>
                          <option value="ativo">Ativo</option>
                          <option value="inativo">Inativo</option>
                          <option value="pendente">Pendente</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setFiltros({})}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          Limpar filtros
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {carregandoPermissoes ? (
              <div className="p-8 flex justify-center">
                <Carregando tamanhoCompleto={false} mensagem="Carregando usuários..." />
              </div>
            ) : erro ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{erro}</p>
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                  Tentar novamente
                </button>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Usuário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Perfil
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Permissões
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.usuarioId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {usuario.nome.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-40">
                            {renderPerfilBadge(usuario.perfil)}
                          </div>
                          <div className="flex-grow w-52">
                            <select
                              className="w-full text-sm border border-gray-200 rounded-md py-1.5 px-2 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                              value={usuario.perfil}
                              onChange={(e) => handleAtualizarPerfil(usuario.usuarioId, e.target.value as any)}
                              disabled={usuario.status === 'inativo'}
                            >
                              {perfis.map(perfil => (
                                <option key={perfil.id} value={perfil.id}>
                                  {perfil.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-24">
                            {renderStatusBadge(usuario.status)}
                          </div>
                          <div className="flex-grow w-32">
                            <select
                              className="w-full text-sm border border-gray-200 rounded-md py-1.5 px-2 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                              value={usuario.status}
                              onChange={(e) => handleAtualizarStatus(usuario.usuarioId, e.target.value as any)}
                            >
                              <option value="ativo">Ativo</option>
                              <option value="inativo">Inativo</option>
                              <option value="pendente">Pendente</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {usuario.permissoes.length} recursos configurados
                        </div>
                        <div className="text-xs text-gray-500">
                          {usuario.permissoes.length > 0 
                            ? `${Math.min(3, usuario.permissoes.length)} recursos principais: ${
                                usuario.permissoes
                                  .slice(0, 3)
                                  .map((p: any) => recursos.find(r => r.id === p.recurso)?.nome)
                                  .filter(Boolean)
                                  .join(', ')
                              }${usuario.permissoes.length > 3 ? '...' : ''}`
                            : 'Sem permissões configuradas'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAbrirModalPermissoes(usuario)}
                          className="text-primary hover:text-primary-dark mr-3"
                          disabled={usuario.status === 'inativo'}
                        >
                          <span className="sr-only">Editar permissões</span>
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          <span className="sr-only">Excluir usuário</span>
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações sobre Perfis de Acesso</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium text-purple-800">Super Administrador</h3>
              </div>
              <p className="text-sm text-purple-700">
                Acesso completo a todas as funcionalidades do sistema, incluindo gerenciamento de usuários e configurações avançadas.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-blue-800">Administrador</h3>
              </div>
              <p className="text-sm text-blue-700">
                Acesso a quase todas as funcionalidades, com algumas restrições em configurações avançadas do sistema.
              </p>
            </div>
            
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCog className="w-5 h-5 text-indigo-500" />
                <h3 className="font-medium text-indigo-800">Coordenador</h3>
              </div>
              <p className="text-sm text-indigo-700">
                Acesso para gerenciar equipes, eventos, demandas e apoiadores, com permissões de criação e edição.
              </p>
            </div>
            
            <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCog className="w-5 h-5 text-cyan-500" />
                <h3 className="font-medium text-cyan-800">Liderança</h3>
              </div>
              <p className="text-sm text-cyan-700">
                Acesso para gerenciar apoiadores e eventos em sua região, com permissões limitadas de criação.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCog className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium text-gray-800">Apoiador</h3>
              </div>
              <p className="text-sm text-gray-700">
                Acesso básico para visualizar informações públicas, eventos e participar de atividades.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <PermissoesModal
        isOpen={modalPermissoesAberto}
        onClose={handleFecharModalPermissoes}
        usuario={usuarioSelecionado}
        recursos={recursos}
        onSave={handleSalvarPermissoes}
      />

      <NovoUsuarioModal
        isOpen={modalNovoUsuarioAberto}
        onClose={handleFecharModalNovoUsuario}
        perfis={perfis}
        onSave={handleCriarNovoUsuario}
      />
    </LayoutProtegido>
  );
} 