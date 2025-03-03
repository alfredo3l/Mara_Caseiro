'use client';

import { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  ChevronDown,
  CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LayoutProtegido from '@/components/layout/LayoutProtegido';
import Carregando from '@/components/ui/Carregando';
import { useNotificacoes, Notificacao } from '@/hooks/useNotificacoes';

export default function PaginaNotificacoes() {
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroLida, setFiltroLida] = useState<string>('');
  
  const { 
    notificacoes, 
    carregando, 
    erro, 
    marcarComoLida, 
    marcarTodasComoLidas, 
    excluirNotificacao,
    getNotificacoesNaoLidas
  } = useNotificacoes();
  
  const notificacoesNaoLidas = getNotificacoesNaoLidas();
  
  // Renderizar ícone baseado no tipo da notificação
  const renderIconeTipo = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'sucesso':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'aviso':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'erro':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  
  // Aplicar filtros
  const notificacoesExibidas = () => {
    let resultado = notificacoes;
    
    // Filtrar por tipo
    if (filtroTipo) {
      resultado = resultado.filter(notificacao => notificacao.tipo === filtroTipo);
    }
    
    // Filtrar por status de leitura
    if (filtroLida === 'lida') {
      resultado = resultado.filter(notificacao => notificacao.lida);
    } else if (filtroLida === 'nao-lida') {
      resultado = resultado.filter(notificacao => !notificacao.lida);
    }
    
    return resultado;
  };
  
  // Limpar filtros
  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroLida('');
  };
  
  return (
    <LayoutProtegido>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Minhas Notificações</h1>
          
          {notificacoesNaoLidas.length > 0 && (
            <button 
              onClick={() => marcarTodasComoLidas()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas ({notificacoesNaoLidas.length})
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
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
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg p-2"
                          value={filtroTipo}
                          onChange={(e) => setFiltroTipo(e.target.value)}
                        >
                          <option value="">Todos os tipos</option>
                          <option value="info">Informação</option>
                          <option value="sucesso">Sucesso</option>
                          <option value="aviso">Aviso</option>
                          <option value="erro">Erro</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg p-2"
                          value={filtroLida}
                          onChange={(e) => setFiltroLida(e.target.value)}
                        >
                          <option value="">Todos os status</option>
                          <option value="lida">Lidas</option>
                          <option value="nao-lida">Não lidas</option>
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
          
          <div>
            {carregando ? (
              <div className="p-8 flex justify-center">
                <Carregando tamanhoCompleto={false} mensagem="Carregando notificações..." />
              </div>
            ) : erro ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{erro}</p>
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                  Tentar novamente
                </button>
              </div>
            ) : notificacoesExibidas().length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Nenhuma notificação encontrada</p>
                {(filtroTipo || filtroLida) && (
                  <button
                    onClick={limparFiltros}
                    className="mt-2 text-primary hover:text-primary-dark"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notificacoesExibidas().map((notificacao) => (
                  <li 
                    key={notificacao.id} 
                    className={`p-4 hover:bg-gray-50 ${!notificacao.lida ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {renderIconeTipo(notificacao.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="text-base font-medium text-gray-900">
                              {notificacao.titulo}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {notificacao.mensagem}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 md:flex-shrink-0">
                            {!notificacao.lida && (
                              <button
                                onClick={() => marcarComoLida(notificacao.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                                title="Marcar como lida"
                              >
                                <Check className="w-3 h-3" />
                                Marcar como lida
                              </button>
                            )}
                            <button
                              onClick={() => excluirNotificacao(notificacao.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                              title="Excluir notificação"
                            >
                              <Trash2 className="w-3 h-3" />
                              Excluir
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {format(new Date(notificacao.dataEnvio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                          
                          {notificacao.link && (
                            <a
                              href={notificacao.link}
                              onClick={() => !notificacao.lida && marcarComoLida(notificacao.id)}
                              className="text-sm text-primary hover:text-primary-dark"
                            >
                              {notificacao.acao || 'Ver detalhes'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </LayoutProtegido>
  );
} 