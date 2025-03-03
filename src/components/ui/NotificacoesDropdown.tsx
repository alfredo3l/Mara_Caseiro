'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotificacoes, Notificacao } from '@/hooks/useNotificacoes';

export default function NotificacoesDropdown() {
  const [aberto, setAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
  
  // Formatar tempo relativo
  const formatarTempoRelativo = (data: string) => {
    const dataObj = new Date(data);
    const agora = new Date();
    const diffMs = agora.getTime() - dataObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Agora mesmo';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffDay < 7) {
      return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return dataObj.toLocaleDateString('pt-BR');
    }
  };
  
  // Manipular clique em notificação
  const handleNotificacaoClick = async (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de notificações */}
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notificações"
      >
        <Bell className="w-6 h-6" />
        {notificacoesNaoLidas.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {notificacoesNaoLidas.length > 9 ? '9+' : notificacoesNaoLidas.length}
          </span>
        )}
      </button>
      
      {/* Dropdown de notificações */}
      {aberto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
            {notificacoesNaoLidas.length > 0 && (
              <button
                onClick={() => marcarTodasComoLidas()}
                className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas como lidas
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {carregando ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full mb-2"></div>
                <p>Carregando notificações...</p>
              </div>
            ) : erro ? (
              <div className="p-4 text-center text-red-500">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p>{erro}</p>
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-6 h-6 mx-auto mb-2" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <ul>
                {notificacoes.map((notificacao) => (
                  <li 
                    key={notificacao.id} 
                    className={`border-b border-gray-100 last:border-b-0 ${!notificacao.lida ? 'bg-blue-50' : ''}`}
                  >
                    <div className="p-3 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {renderIconeTipo(notificacao.tipo)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notificacao.titulo}
                            </p>
                            <div className="flex items-center gap-1">
                              {!notificacao.lida && (
                                <button
                                  onClick={() => marcarComoLida(notificacao.id)}
                                  className="text-gray-400 hover:text-primary"
                                  title="Marcar como lida"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => excluirNotificacao(notificacao.id)}
                                className="text-gray-400 hover:text-red-500"
                                title="Excluir notificação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            {notificacao.mensagem}
                          </p>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatarTempoRelativo(notificacao.dataEnvio)}
                            </span>
                            
                            {notificacao.link && (
                              <Link
                                href={notificacao.link}
                                onClick={() => handleNotificacaoClick(notificacao)}
                                className="text-xs text-primary hover:text-primary-dark"
                              >
                                {notificacao.acao || 'Ver detalhes'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {notificacoes.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <Link
                href="/notificacoes"
                className="block w-full text-center text-sm text-primary hover:text-primary-dark py-1"
                onClick={() => setAberto(false)}
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 