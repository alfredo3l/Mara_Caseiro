'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Lock, User, Palette, Save, Upload, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Image from 'next/image';
import { useUsuario } from '@/contexts/UsuarioContext';
import { useTema } from '@/contexts/TemaContext';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function PaginaConfiguracoes() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('configuracoes');
  const [activeTab, setActiveTab] = useState<'perfil' | 'notificacoes' | 'seguranca' | 'aparencia'>('perfil');
  const [fotoPerfilTemp, setFotoPerfilTemp] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [corRapida, setCorRapida] = useState('');
  
  const { usuario, carregando, erro, atualizarPerfil, removerFotoPerfil } = useUsuario();
  const { temaAtual, temas, alterarTema, adicionarTema, removerTema } = useTema();
  
  const [novoTema, setNovoTema] = useState({
    nome: '',
    cores: {
      background: '#ffffff',
      foreground: '#171717',
      primary: '#0F509C',
      primaryLight: '#0F509C',
      border: '#e5e5e5',
    }
  });
  
  const [mostrarFormNovoTema, setMostrarFormNovoTema] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [temaOriginal, setTemaOriginal] = useState('');

  const coresPredefinidas = [
    { nome: 'Azul', valor: '#0F509C' },
    { nome: 'Verde', valor: '#10B981' },
    { nome: 'Vermelho', valor: '#EF4444' },
    { nome: 'Roxo', valor: '#8B5CF6' },
    { nome: 'Laranja', valor: '#F97316' },
    { nome: 'Rosa', valor: '#EC4899' },
    { nome: 'Amarelo', valor: '#F59E0B' },
    { nome: 'Cinza', valor: '#6B7280' },
  ];

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

  // Atualizar o estado local quando o usuário for carregado
  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cargo: usuario.cargo
      });
      
      if (usuario.fotoPerfil) {
        setFotoPerfilTemp(usuario.fotoPerfil);
      }
    }
  }, [usuario]);

  useEffect(() => {
    // Inicializar a cor rápida com a cor primária do tema atual
    if (temaAtual) {
      setCorRapida('#f907a7');
      // Criar um novo tema baseado no tema atual, mas com a cor primária alterada
      const novoTemaRapido = {
        ...temaAtual,
        nome: `${temaAtual.nome} (Modificado)`,
        cores: {
          ...temaAtual.cores,
          primary: '#f907a7',
          primaryLight: '#f907a7'
        }
      };
      
      // Aplicar o tema
      alterarTema(novoTemaRapido);
    }
  }, [temaAtual]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfilTemp(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFotoPerfilTemp('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const fotoAlterada = usuario?.fotoPerfil !== fotoPerfilTemp;
      
      const dadosAtualizados: {
        nome: string;
        email: string;
        telefone: string;
        cargo: string;
        fotoPerfil?: string;
      } = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cargo: formData.cargo
      };
      
      // Se a foto foi alterada, incluir no update
      if (fotoAlterada) {
        dadosAtualizados.fotoPerfil = fotoPerfilTemp || undefined;
      }
      
      const sucesso = await atualizarPerfil(dadosAtualizados);
      
      if (sucesso) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const iniciarEdicaoTema = (tema) => {
    setNovoTema({...tema});
    setModoEdicao(true);
    setTemaOriginal(tema.nome);
    setMostrarFormNovoTema(true);
  };
  
  const cancelarEdicao = () => {
    setNovoTema({
      nome: '',
      cores: {
        background: '#ffffff',
        foreground: '#171717',
        primary: '#0F509C',
        primaryLight: '#0F509C',
        border: '#e5e5e5',
      }
    });
    setModoEdicao(false);
    setTemaOriginal('');
    setMostrarFormNovoTema(false);
  };
  
  const salvarTema = () => {
    if (novoTema.nome.trim() === '') {
      alert('Por favor, informe um nome para o tema');
      return;
    }
    
    if (modoEdicao) {
      // Remover o tema original
      const novosTemas = temas.filter(tema => tema.nome !== temaOriginal);
      // Adicionar o tema editado
      const temasAtualizados = [...novosTemas, novoTema];
      localStorage.setItem('temas', JSON.stringify(temasAtualizados));
      
      // Atualizar o tema atual se for o que está sendo editado
      if (temaAtual.nome === temaOriginal) {
        alterarTema(novoTema);
      }
      
      // Atualizar a lista de temas
      setTemas(temasAtualizados);
    } else {
      adicionarTema(novoTema);
    }
    
    // Resetar o formulário
    setNovoTema({
      nome: '',
      cores: {
        background: '#ffffff',
        foreground: '#171717',
        primary: '#0F509C',
        primaryLight: '#0F509C',
        border: '#e5e5e5',
      }
    });
    setModoEdicao(false);
    setTemaOriginal('');
    setMostrarFormNovoTema(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Informações do Perfil</h3>
            
            {carregando ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Campo de foto do usuário */}
                <div className="mb-6">
                  <label htmlFor="foto-perfil" className="block text-sm font-medium text-gray-700 mb-2">
                    Foto do Perfil
                  </label>
                  <div className="flex items-center gap-4">
                    {fotoPerfilTemp ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 group">
                        <Image
                          src={fotoPerfilTemp}
                          alt="Foto de perfil"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remover foto"
                        >
                          <X className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <label 
                      htmlFor="foto-input"
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 cursor-pointer transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Escolher foto
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="foto-input"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Recomendado: JPG, PNG. Tamanho máximo 2MB.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="nome"
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      value={formData.nome}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      value={formData.telefone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      id="cargo"
                      className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      value={formData.cargo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving || carregando}
                    className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 ${(isSaving || carregando) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  {saveSuccess && (
                    <p className="mt-2 text-sm text-green-600">Alterações salvas com sucesso!</p>
                  )}
                  {erro && (
                    <p className="mt-2 text-sm text-red-600">{erro}</p>
                  )}
                </div>
              </>
            )}
          </div>
        );
      case 'notificacoes':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Preferências de Notificações</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">Notificações por E-mail</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                    <span className="text-sm text-gray-600">Novos apoiadores cadastrados</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                    <span className="text-sm text-gray-600">Eventos próximos</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm text-gray-600">Relatórios semanais</span>
                  </label>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">Notificações no Sistema</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                    <span className="text-sm text-gray-600">Novas demandas</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                    <span className="text-sm text-gray-600">Atualizações de status</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                    <span className="text-sm text-gray-600">Mensagens de outros usuários</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Preferências
              </button>
            </div>
          </div>
        );
      case 'seguranca':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Segurança da Conta</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Alterar Senha</h4>
                <div>
                  <label htmlFor="senha-atual" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="senha-atual"
                    className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="nova-senha" className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="nova-senha"
                    className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="confirmar-senha" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    id="confirmar-senha"
                    className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    Alterar Senha
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Autenticação de Dois Fatores</h4>
                <p className="text-sm text-gray-600">
                  Adicione uma camada extra de segurança à sua conta ativando a autenticação de dois fatores.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status: <span className="text-red-500">Desativado</span></span>
                  <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                    Ativar 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'aparencia':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Aparência do Sistema</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Tema</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {temas.map((tema) => (
                    <div 
                      key={tema.nome}
                      className={`border rounded-lg p-4 bg-white cursor-pointer transition-all hover:shadow-md ${
                        temaAtual.nome === tema.nome ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => alterarTema(tema)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{tema.nome}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          temaAtual.nome === tema.nome ? 'border-primary' : 'border-gray-300'
                        }`}>
                          {temaAtual.nome === tema.nome && (
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-md mb-3" style={{ 
                        backgroundColor: tema.cores.background,
                        border: `1px solid ${tema.cores.border}`
                      }}>
                        <div className="h-6 rounded-md mb-2 flex items-center justify-center text-white text-xs" style={{ backgroundColor: tema.cores.primary }}>
                          Botão
                        </div>
                        <p className="text-xs" style={{ color: tema.cores.foreground }}>
                          Exemplo de texto
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 mb-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">Cor primária</div>
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tema.cores.primary }}></div>
                            <span className="text-xs text-gray-700">{tema.cores.primary}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">Cor de texto</div>
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tema.cores.foreground }}></div>
                            <span className="text-xs text-gray-700">{tema.cores.foreground}</span>
                          </div>
                        </div>
                      </div>
                      
                      {usuario?.isAdmin && (
                        <div className="mt-2 flex justify-between">
                          {tema.nome !== 'Padrão' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removerTema(tema.nome);
                              }}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remover
                            </button>
                          )}
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              iniciarEdicaoTema(tema);
                            }}
                            className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 ml-auto"
                          >
                            <Palette className="w-3 h-3" />
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {usuario?.isAdmin && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Personalizar Cores</h4>
                    {!mostrarFormNovoTema ? (
                      <button 
                        onClick={() => {
                          setModoEdicao(false);
                          setMostrarFormNovoTema(true);
                        }}
                        className="text-sm flex items-center gap-1 text-primary hover:text-primary-dark"
                      >
                        <Plus className="w-4 h-4" />
                        Novo Tema
                      </button>
                    ) : (
                      <button 
                        onClick={cancelarEdicao}
                        className="text-sm flex items-center gap-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    )}
                  </div>
                  
                  {!mostrarFormNovoTema && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                      <h5 className="text-sm font-medium mb-3">Aplicar Cor Rápida</h5>
                      <p className="text-xs text-gray-600 mb-3">
                        Escolha uma cor primária e aplique-a ao tema atual sem criar um novo tema.
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="cor-rapida"
                          className="h-10 w-14 border border-gray-200 rounded cursor-pointer"
                          value={corRapida}
                          onChange={(e) => {
                            setCorRapida(e.target.value);
                            const corInput = document.getElementById('cor-rapida-texto') as HTMLInputElement;
                            corInput.value = e.target.value;
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Digite um código de cor (#RRGGBB)"
                          className="flex-1 h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                          value={corRapida}
                          id="cor-rapida-texto"
                          onChange={(e) => {
                            setCorRapida(e.target.value);
                            // Tentar atualizar o seletor de cor apenas se for um valor hexadecimal válido
                            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                              const corPicker = document.getElementById('cor-rapida') as HTMLInputElement;
                              corPicker.value = e.target.value;
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            // Validar se é uma cor hexadecimal válida
                            if (!/^#[0-9A-F]{6}$/i.test(corRapida)) {
                              alert('Por favor, insira um código de cor hexadecimal válido (ex: #FF0000)');
                              return;
                            }
                            
                            // Criar um novo tema baseado no tema atual, mas com a cor primária alterada
                            const novoTemaRapido = {
                              ...temaAtual,
                              nome: `${temaAtual.nome} (Modificado)`,
                              cores: {
                                ...temaAtual.cores,
                                primary: corRapida,
                                primaryLight: corRapida
                              }
                            };
                            
                            // Aplicar o tema
                            alterarTema(novoTemaRapido);
                          }}
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Aplicar
                        </button>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Cores predefinidas:</p>
                        <div className="flex flex-wrap gap-2">
                          {coresPredefinidas.map((cor) => (
                            <button
                              key={cor.valor}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden tooltip-container"
                              style={{ backgroundColor: cor.valor }}
                              onClick={() => setCorRapida(cor.valor)}
                              title={cor.nome}
                            >
                              {corRapida === cor.valor && (
                                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cor.valor }}></div>
                                </div>
                              )}
                              <span className="tooltip">{cor.nome}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                        <h6 className="text-xs font-medium mb-2">Visualização:</h6>
                        <div className="flex space-x-2">
                          <button 
                            className="px-3 py-1.5 rounded text-white text-xs font-medium"
                            style={{ backgroundColor: corRapida }}
                          >
                            Botão Primário
                          </button>
                          <div 
                            className="px-3 py-1.5 rounded text-xs font-medium flex-1 text-center"
                            style={{ 
                              backgroundColor: 'white',
                              color: corRapida,
                              border: `1px solid ${corRapida}`
                            }}
                          >
                            Texto Colorido
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 mr-2">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                        <span className="text-xs text-gray-500">
                          Esta alteração não será salva como um novo tema
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {mostrarFormNovoTema && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900">
                          {modoEdicao ? `Editando: ${temaOriginal}` : 'Novo Tema'}
                        </h5>
                      </div>
                      
                      <div>
                        <label htmlFor="nome-tema" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Tema
                        </label>
                        <input
                          type="text"
                          id="nome-tema"
                          className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                          value={novoTema.nome}
                          onChange={(e) => setNovoTema({...novoTema, nome: e.target.value})}
                          placeholder="Ex: Tema Personalizado"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="cor-primary" className="block text-sm font-medium text-gray-700 mb-1">
                            Cor Primária (botões e elementos de destaque)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              id="cor-primary"
                              className="h-10 w-14 border border-gray-200 rounded cursor-pointer"
                              value={novoTema.cores.primary}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, primary: e.target.value, primaryLight: e.target.value}
                              })}
                            />
                            <input
                              type="text"
                              className="flex-1 h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                              value={novoTema.cores.primary}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, primary: e.target.value, primaryLight: e.target.value}
                              })}
                              placeholder="#0F509C"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Esta cor será usada em botões, links e elementos de destaque
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="cor-background" className="block text-sm font-medium text-gray-700 mb-1">
                            Cor de Fundo
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              id="cor-background"
                              className="h-10 w-14 border border-gray-200 rounded cursor-pointer"
                              value={novoTema.cores.background}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, background: e.target.value}
                              })}
                            />
                            <input
                              type="text"
                              className="flex-1 h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                              value={novoTema.cores.background}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, background: e.target.value}
                              })}
                              placeholder="#ffffff"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Esta cor será usada como fundo principal do sistema
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="cor-foreground" className="block text-sm font-medium text-gray-700 mb-1">
                            Cor do Texto
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              id="cor-foreground"
                              className="h-10 w-14 border border-gray-200 rounded cursor-pointer"
                              value={novoTema.cores.foreground}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, foreground: e.target.value}
                              })}
                            />
                            <input
                              type="text"
                              className="flex-1 h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                              value={novoTema.cores.foreground}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, foreground: e.target.value}
                              })}
                              placeholder="#171717"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Esta cor será usada para textos e ícones
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="cor-border" className="block text-sm font-medium text-gray-700 mb-1">
                            Cor da Borda
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              id="cor-border"
                              className="h-10 w-14 border border-gray-200 rounded cursor-pointer"
                              value={novoTema.cores.border}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, border: e.target.value}
                              })}
                            />
                            <input
                              type="text"
                              className="flex-1 h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                              value={novoTema.cores.border}
                              onChange={(e) => setNovoTema({
                                ...novoTema, 
                                cores: {...novoTema.cores, border: e.target.value}
                              })}
                              placeholder="#e5e5e5"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Esta cor será usada para bordas de cards e separadores
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                        <h5 className="text-sm font-medium mb-3">Visualização:</h5>
                        <div className="space-y-3">
                          <div className="h-10 rounded-md flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: novoTema.cores.primary }}>
                            Botão Primário
                          </div>
                          <div className="p-4 rounded-md" style={{ 
                            backgroundColor: novoTema.cores.background,
                            color: novoTema.cores.foreground,
                            border: `1px solid ${novoTema.cores.border}`
                          }}>
                            <h6 className="font-medium mb-2" style={{ color: novoTema.cores.foreground }}>Exemplo de Card</h6>
                            <p className="text-sm" style={{ color: novoTema.cores.foreground }}>
                              Este é um exemplo de como o texto e os elementos ficarão com as cores selecionadas.
                            </p>
                            <div className="mt-3">
                              <button className="px-3 py-1 text-xs rounded" style={{ 
                                backgroundColor: novoTema.cores.primary,
                                color: '#ffffff'
                              }}>
                                Ação
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 mr-2">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <span className="text-xs text-gray-500">
                            Você pode inserir códigos de cores em formato hexadecimal (#RRGGBB)
                          </span>
                        </div>
                        <button 
                          onClick={salvarTema}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {modoEdicao ? 'Atualizar Tema' : 'Salvar Tema'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Densidade</h4>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="densidade" className="text-primary focus:ring-primary mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Confortável</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="densidade" className="text-primary focus:ring-primary mr-2" />
                    <span className="text-sm text-gray-700">Compacto</span>
                  </label>
                </div>
              </div>
              
              {!usuario?.isAdmin && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-1">Acesso restrito</h5>
                      <p className="text-sm text-yellow-700">
                        A personalização de cores está disponível apenas para administradores do sistema.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Preferências
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <style jsx global>{`
        .tooltip-container {
          position: relative;
        }
        
        .tooltip {
          visibility: hidden;
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          z-index: 10;
        }
        
        .tooltip-container:hover .tooltip {
          visibility: visible;
        }
      `}</style>
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMenuItemClick={setActiveItem}
        activeItem={activeItem}
      />
      <ClientHeader 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMenuOpen={isSidebarOpen} 
      />

      <main className={`pl-0 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'} pt-16 transition-all duration-300`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Tabs de navegação */}
            <div className="w-full md:w-64 bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-medium text-gray-900">Preferências</h2>
              </div>
              <div className="divide-y divide-border">
                <button
                  onClick={() => setActiveTab('perfil')}
                  className={`w-full p-3 flex items-center gap-3 text-left ${
                    activeTab === 'perfil' ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Perfil</span>
                </button>
                <button
                  onClick={() => setActiveTab('notificacoes')}
                  className={`w-full p-3 flex items-center gap-3 text-left ${
                    activeTab === 'notificacoes' ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">Notificações</span>
                </button>
                <button
                  onClick={() => setActiveTab('seguranca')}
                  className={`w-full p-3 flex items-center gap-3 text-left ${
                    activeTab === 'seguranca' ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Segurança</span>
                </button>
                <button
                  onClick={() => setActiveTab('aparencia')}
                  className={`w-full p-3 flex items-center gap-3 text-left ${
                    activeTab === 'aparencia' ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <Palette className="w-5 h-5" />
                  <span className="font-medium">Aparência</span>
                </button>
              </div>
            </div>
            
            {/* Conteúdo da tab ativa */}
            <div className="flex-1 bg-white rounded-xl border border-border p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 