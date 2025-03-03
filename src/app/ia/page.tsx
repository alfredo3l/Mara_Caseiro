'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Plus, Loader2, Bot, User, Trash2, Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import { useIA } from '@/hooks/useIA';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function PaginaIA() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('ia');
  const [mensagem, setMensagem] = useState('');
  const [conversacaoAtiva, setConversacaoAtiva] = useState<string | null>(null);
  const [novoTitulo, setNovoTitulo] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversas,
    mensagens,
    loading,
    error,
    fetchConversas,
    fetchMensagens,
    criarConversacao,
    enviarMensagem,
    excluirConversa
  } = useIA();

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
    fetchConversas();
  }, []);

  useEffect(() => {
    if (conversacaoAtiva) {
      fetchMensagens(conversacaoAtiva);
    }
  }, [conversacaoAtiva]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviarMensagem = async () => {
    if (!mensagem.trim()) return;
    
    if (!conversacaoAtiva) {
      const novaConversacao = await criarConversacao(novoTitulo || 'Nova conversa');
      if (novaConversacao) {
        setConversacaoAtiva(novaConversacao.id);
        await enviarMensagem(novaConversacao.id, mensagem);
      }
    } else {
      await enviarMensagem(conversacaoAtiva, mensagem);
    }
    
    setMensagem('');
  };

  const handleNovaConversacao = async () => {
    const novaConversacao = await criarConversacao('Nova conversa');
    if (novaConversacao) {
      setConversacaoAtiva(novaConversacao.id);
      setNovoTitulo('');
    }
  };

  const handleExcluirConversa = async (id: string) => {
    await excluirConversa(id);
    if (conversacaoAtiva === id) {
      setConversacaoAtiva(null);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const conversacaoAtual = conversas.find(c => c.id === conversacaoAtiva);

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
          <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar de Conversas */}
            <div className="w-64 border-r border-border bg-white hidden md:block">
              <div className="p-4 border-b border-border">
                <button
                  onClick={handleNovaConversacao}
                  className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Conversa
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-128px)]">
                {conversas.map((conversacao) => (
                  <div 
                    key={conversacao.id}
                    className={`p-3 border-b border-border cursor-pointer hover:bg-gray-50 transition-colors ${conversacaoAtiva === conversacao.id ? 'bg-gray-100' : ''}`}
                    onClick={() => setConversacaoAtiva(conversacao.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-gray-900 truncate max-w-[150px]">
                          {conversacao.titulo}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluirConversa(conversacao.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatarData(conversacao.dataCriacao)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Área de Chat */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Cabeçalho do Chat */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <h2 className="font-medium text-gray-900">
                    {conversacaoAtual ? conversacaoAtual.titulo : 'Nova Conversa'}
                  </h2>
                </div>
                {conversacaoAtiva && (
                  <button
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="Exportar conversa"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {!conversacaoAtiva && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <Bot className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Assistente IA</h3>
                    <p className="text-gray-600 max-w-md mb-6">
                      Utilize nosso assistente de IA para obter insights, gerar conteúdo e analisar dados da sua campanha política.
                    </p>
                    <div className="w-full max-w-md">
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Título da conversa"
                          value={novoTitulo}
                          onChange={(e) => setNovoTitulo(e.target.value)}
                          className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                      </div>
                      <button
                        onClick={handleNovaConversacao}
                        className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Iniciar Nova Conversa
                      </button>
                    </div>
                  </div>
                )}

                {conversacaoAtiva && (
                  <>
                    {loading && mensagens.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mensagens.map((msg) => (
                          <div 
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === 'user' 
                                  ? 'bg-primary text-white rounded-tr-none' 
                                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {msg.role === 'user' ? (
                                  <User className="w-4 h-4" />
                                ) : (
                                  <Bot className="w-4 h-4" />
                                )}
                                <span className="text-xs font-medium">
                                  {msg.role === 'user' ? 'Você' : 'Assistente IA'}
                                </span>
                              </div>
                              <div className="text-sm whitespace-pre-wrap">
                                {msg.content}
                              </div>
                              <div className="text-xs opacity-70 mt-1 text-right">
                                {formatarData(msg.timestamp || new Date().toISOString())}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviarMensagem();
                      }
                    }}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 h-12 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                  />
                  <button
                    onClick={handleEnviarMensagem}
                    disabled={!mensagem.trim() || loading}
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      !mensagem.trim() || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    } transition-colors`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Pressione Enter para enviar, Shift+Enter para quebrar linha
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 