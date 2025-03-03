'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Save, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Image from 'next/image';
import { useUsuario } from '@/hooks';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { profilePhotoStorage } from '@/services/storage/index';

const ClientHeader = dynamic(() => import('@/components/layout/ClientHeader'), {
  ssr: false
});

export default function PaginaPerfil() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('perfil');
  const [fotoPerfilTemp, setFotoPerfilTemp] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [checkingBucket, setCheckingBucket] = useState(true);
  
  const { usuario, carregando, erro, uploadFotoPerfil, atualizarPerfil, removerFotoPerfil } = useUsuario();
  const { user, loading: authLoading } = useAuthContext();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
        nome: usuario.nome || '',
        email: user?.email || '',
        telefone: usuario.telefone || '',
        cargo: usuario.cargo || ''
      });
      
      if (usuario.fotoPerfil) {
        setFotoPerfilTemp(usuario.fotoPerfil);
      }
    }
  }, [usuario, user]);

  // Verificar se o bucket existe
  useEffect(() => {
    const checkBucket = async () => {
      setCheckingBucket(true);
      try {
        const exists = await profilePhotoStorage.checkBucketExists();
        setBucketExists(exists);
      } catch (error) {
        console.error('Erro ao verificar bucket:', error);
        setBucketExists(false);
      } finally {
        setCheckingBucket(false);
      }
    };

    checkBucket();
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Mostrar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfilTemp(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Fazer upload da imagem para o Supabase Storage
      setIsUploading(true);
      setErrorMessage('');
      setSaveError(false);
      
      console.log('Iniciando upload da imagem:', file.name, file.type, file.size);
      
      // Verificar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 2MB');
      }

      // Verificar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }
      
      // Fazer upload da imagem
      const fotoUrl = await uploadFotoPerfil(file);
      console.log('Resultado do upload:', fotoUrl);
      
      if (fotoUrl) {
        setFotoPerfilTemp(fotoUrl);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Falha ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao processar a imagem');
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
      
      // Restaurar a foto anterior se houver erro
      if (usuario?.fotoPerfil) {
        setFotoPerfilTemp(usuario.fotoPerfil);
      } else {
        setFotoPerfilTemp('');
      }
      
      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUploading(true);
      setErrorMessage('');
      setSaveError(false);
      
      console.log('Iniciando remoção da foto de perfil');
      
      // Guardar a foto atual para restaurar em caso de erro
      const fotoAnterior = fotoPerfilTemp;
      
      // Limpar a foto temporária imediatamente para feedback visual
      setFotoPerfilTemp('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Se já tinha foto de perfil, remover do servidor também
      if (usuario?.fotoPerfil) {
        console.log('Removendo foto do servidor:', usuario.fotoPerfil);
        
        const success = await removerFotoPerfil();
        console.log('Resultado da remoção:', success);
        
        if (success) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          // Restaurar a foto anterior em caso de erro
          setFotoPerfilTemp(fotoAnterior);
          throw new Error('Falha ao remover a foto do perfil');
        }
      } else {
        console.log('Nenhuma foto de perfil para remover do servidor');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao remover a imagem');
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
      
      // Restaurar a foto anterior se houver erro
      if (usuario?.fotoPerfil) {
        setFotoPerfilTemp(usuario.fotoPerfil);
      }
    } finally {
      setIsUploading(false);
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
    setSaveSuccess(false);
    setSaveError(false);
    setErrorMessage('');
    setIsSaving(true);
    
    try {
      if (!formData.nome.trim()) {
        throw new Error('O nome é obrigatório');
      }
      
      const dadosAtualizados: {
        nome: string;
        telefone: string;
        cargo: string;
      } = {
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim(),
        cargo: formData.cargo.trim()
      };
      
      console.log('Dados a serem atualizados:', dadosAtualizados);
      
      const sucesso = await atualizarPerfil(dadosAtualizados);
      console.log('Resultado da atualização:', sucesso);
      
      if (sucesso) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('Não foi possível atualizar o perfil');
        setSaveError(true);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar perfil');
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Se estiver carregando a autenticação, mostrar tela de carregamento
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>
          
          {/* Aviso de bucket não existente */}
          {!checkingBucket && bucketExists === false && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
              <p className="font-bold">Atenção</p>
              <p>
                O sistema não está configurado corretamente para armazenar imagens de perfil.
                Entre em contato com o administrador para resolver este problema.
              </p>
              <p className="text-sm mt-2">
                <a 
                  href="https://github.com/seu-usuario/seu-repositorio/blob/main/scripts/README.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Consulte a documentação para mais informações
                </a>
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Informações do Perfil</h3>
              
              {carregando || isUploading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ) : erro ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm">{erro}</p>
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
                            disabled={isUploading}
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
                        className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 
                          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} 
                          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all`}
                      >
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Escolher foto
                          </>
                        )}
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="foto-input"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Recomendado: JPG, PNG. Tamanho máximo 2MB.
                    </p>
                    
                    {/* Informações de debug */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Informações de Debug</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Foto atual: {fotoPerfilTemp ? 'Sim' : 'Não'}</p>
                          <p>Foto do usuário: {usuario?.fotoPerfil ? 'Sim' : 'Não'}</p>
                          <p>URL da foto: {fotoPerfilTemp ? fotoPerfilTemp.substring(0, 50) + '...' : 'N/A'}</p>
                          <p>URL da foto do usuário: {usuario?.fotoPerfil ? usuario.fotoPerfil.substring(0, 50) + '...' : 'N/A'}</p>
                          <p>Bucket: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'profile-photos' : 'mock-bucket'}</p>
                          <p>Usando mock: {!process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Sim' : 'Não'}</p>
                          <p>ID do usuário: {usuario?.id || 'N/A'}</p>
                          <p>Auth ID: {user?.id || 'N/A'}</p>
                          <button 
                            onClick={() => console.log('Dados do usuário:', usuario, 'Auth:', user)} 
                            className="mt-2 px-2 py-1 bg-gray-200 rounded text-xs"
                          >
                            Log dados no console
                          </button>
                        </div>
                      </div>
                    )}
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
                        className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!!user} // Email não pode ser alterado se estiver autenticado
                      />
                      {user && (
                        <p className="mt-1 text-xs text-gray-500">
                          O e-mail não pode ser alterado pois está vinculado à sua conta.
                        </p>
                      )}
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
                        className="w-full h-10 px-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                        value={formData.cargo}
                        onChange={handleInputChange}
                        disabled={!!user && !usuario?.isAdmin} // Cargo não pode ser alterado por usuários comuns
                      />
                      {user && !usuario?.isAdmin && (
                        <p className="mt-1 text-xs text-gray-500">
                          O cargo só pode ser alterado por administradores.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white 
                        ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'} 
                        transition-colors`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Mensagens de feedback */}
                  {saveSuccess && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <p className="text-green-700 text-sm">Perfil atualizado com sucesso!</p>
                      </div>
                    </div>
                  )}
                  
                  {saveError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700 text-sm">{errorMessage || 'Erro ao atualizar o perfil. Tente novamente.'}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 