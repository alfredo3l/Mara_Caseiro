'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity,
  Database,
  ChevronDown,
  Calendar,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LayoutProtegido from '@/components/layout/LayoutProtegido';
import Carregando from '@/components/ui/Carregando';
import { useLogs, LogAtividade } from '@/hooks/useLogs';

export default function PaginaLogs() {
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState<number>(7); // 7 dias por padrão
  const [filtroAcao, setFiltroAcao] = useState<string>('');
  const [filtroRecurso, setFiltroRecurso] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  
  const { 
    logs, 
    carregando, 
    erro,
    filtrarLogsPorPeriodo,
    filtrarLogsPorAcao,
    filtrarLogsPorRecurso
  } = useLogs();

  // Aplicar filtros
  const logsExibidos = () => {
    let resultado = logs;
    
    // Filtrar por período
    if (filtroPeriodo > 0) {
      resultado = filtrarLogsPorPeriodo(filtroPeriodo);
    }
    
    // Filtrar por ação
    if (filtroAcao) {
      resultado = resultado.filter(log => log.acao === filtroAcao);
    }
    
    // Filtrar por recurso
    if (filtroRecurso) {
      resultado = resultado.filter(log => log.recurso === filtroRecurso);
    }
    
    // Filtrar por busca (nome de usuário ou detalhes)
    if (busca) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(
        log => 
          log.usuarioNome.toLowerCase().includes(termoBusca) || 
          (log.detalhes && log.detalhes.toLowerCase().includes(termoBusca))
      );
    }
    
    return resultado;
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroPeriodo(7);
    setFiltroAcao('');
    setFiltroRecurso('');
    setBusca('');
  };

  // Exportar logs para CSV
  const exportarCSV = () => {
    const logs = logsExibidos();
    
    if (logs.length === 0) {
      alert('Não há logs para exportar');
      return;
    }
    
    // Cabeçalhos
    let csv = 'ID,Usuário,Ação,Recurso,Detalhes,Data/Hora,IP\n';
    
    // Dados
    logs.forEach(log => {
      const row = [
        log.id,
        log.usuarioNome,
        log.acao,
        log.recurso,
        log.detalhes || '',
        format(new Date(log.data), 'dd/MM/yyyy HH:mm:ss'),
        log.ip || ''
      ].map(value => `"${value.replace(/"/g, '""')}"`).join(',');
      
      csv += row + '\n';
    });
    
    // Criar blob e link para download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizar ícone de ação
  const renderIconeAcao = (acao: LogAtividade['acao']) => {
    switch (acao) {
      case 'criar':
        return <span className="bg-green-100 text-green-800 p-1 rounded">Criar</span>;
      case 'editar':
        return <span className="bg-blue-100 text-blue-800 p-1 rounded">Editar</span>;
      case 'excluir':
        return <span className="bg-red-100 text-red-800 p-1 rounded">Excluir</span>;
      case 'login':
        return <span className="bg-purple-100 text-purple-800 p-1 rounded">Login</span>;
      case 'logout':
        return <span className="bg-gray-100 text-gray-800 p-1 rounded">Logout</span>;
      case 'alterar_permissao':
        return <span className="bg-indigo-100 text-indigo-800 p-1 rounded">Alterar Permissão</span>;
      case 'alterar_status':
        return <span className="bg-yellow-100 text-yellow-800 p-1 rounded">Alterar Status</span>;
      case 'alterar_perfil':
        return <span className="bg-cyan-100 text-cyan-800 p-1 rounded">Alterar Perfil</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 p-1 rounded">{acao}</span>;
    }
  };

  return (
    <LayoutProtegido 
      recursoNecessario="admin"
      mensagemAcessoNegado="Você não tem permissão para acessar esta página. Apenas administradores podem visualizar logs de atividades."
    >
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Logs de Atividades</h1>
          
          <button 
            onClick={exportarCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
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
                  placeholder="Buscar por usuário ou detalhes..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
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
                          Período
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg p-2"
                          value={filtroPeriodo}
                          onChange={(e) => setFiltroPeriodo(Number(e.target.value))}
                        >
                          <option value="1">Últimas 24 horas</option>
                          <option value="7">Últimos 7 dias</option>
                          <option value="30">Últimos 30 dias</option>
                          <option value="0">Todos os registros</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ação
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg p-2"
                          value={filtroAcao}
                          onChange={(e) => setFiltroAcao(e.target.value)}
                        >
                          <option value="">Todas as ações</option>
                          <option value="criar">Criar</option>
                          <option value="editar">Editar</option>
                          <option value="excluir">Excluir</option>
                          <option value="login">Login</option>
                          <option value="logout">Logout</option>
                          <option value="alterar_permissao">Alterar Permissão</option>
                          <option value="alterar_status">Alterar Status</option>
                          <option value="alterar_perfil">Alterar Perfil</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recurso
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg p-2"
                          value={filtroRecurso}
                          onChange={(e) => setFiltroRecurso(e.target.value)}
                        >
                          <option value="">Todos os recursos</option>
                          <option value="usuarios">Usuários</option>
                          <option value="sistema">Sistema</option>
                          <option value="permissoes">Permissões</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={limparFiltros}
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
            {carregando ? (
              <div className="p-8 flex justify-center">
                <Carregando tamanhoCompleto={false} mensagem="Carregando logs..." />
              </div>
            ) : erro ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{erro}</p>
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                  Tentar novamente
                </button>
              </div>
            ) : logsExibidos().length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Nenhum log encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurso
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsExibidos().map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {format(new Date(log.data), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(log.data), 'HH:mm:ss', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{log.usuarioNome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 text-gray-400 mr-2" />
                          {renderIconeAcao(log.acao)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Database className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 capitalize">{log.recurso}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{log.detalhes}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{log.ip}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </LayoutProtegido>
  );
} 