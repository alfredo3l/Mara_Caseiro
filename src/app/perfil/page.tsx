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
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  
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
      console.log('Atualizando formulário com dados do usuário:', usuario);
      console.log('Campo cargo (vem do campo perfil na tabela):', usuario.cargo);
      
      setFormData({
        nome: usuario.nome || '',
        email: user?.email || '',
        telefone: usuario.telefone || '',
        cargo: usuario.cargo || ''
      });
      
      if (usuario.fotoPerfil) {
        console.log('Definindo foto de perfil:', usuario.fotoPerfil);
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

  // Verificar se as colunas necessárias existem
  useEffect(() => {
    if (usuario) {
      const missing: string[] = [];
      
      // Verificar se o campo telefone existe
      if (!('telefone' in usuario)) {
        missing.push('telefone');
      }
      
      // Verificar se o campo fotoPerfil existe
      if (!('fotoPerfil' in usuario)) {
        missing.push('foto_url');
      }
      
      setMissingColumns(missing);
    }
  }, [usuario]);

  // Remover avisos de debug da interface
  useEffect(() => {
    // Limpar mensagens de erro relacionadas a colunas faltantes ou buckets não existentes
    if (erro) {
      if (
        erro.includes('coluna') || 
        erro.includes('Execute o script de migração') ||
        erro.includes('bucket') ||
        erro.includes('não existe')
      ) {
        // Limpar erro após 1 segundo para não mostrar ao usuário
        const timer = setTimeout(() => {
          // Não temos acesso direto à função setErro, então vamos usar outra abordagem
          setErrorMessage('');
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [erro]);

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
      
      // Verificar se o bucket existe
      const bucketExists = await profilePhotoStorage.checkBucketExists();
      if (!bucketExists) {
        throw new Error('O sistema não está configurado para armazenar imagens. Entre em contato com o administrador.');
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
      
      // Verificar se o usuário existe e tem um ID válido
      if (!usuario || !usuario.id) {
        throw new Error('Dados do usuário não encontrados. Por favor, faça login novamente.');
      }
      
      // Verificar se o ID do usuário é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(usuario.id)) {
        console.error('ID do usuário não é um UUID válido:', usuario.id);
        throw new Error('ID do usuário inválido. Por favor, faça login novamente.');
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
      
      console.log('Dados a serem atualizados (cargo será mapeado para perfil na API):', dadosAtualizados);
      console.log('Campo cargo atual:', formData.cargo);
      console.log('ID do usuário:', usuario.id);
      
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
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
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Seção da foto de perfil */}
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  {fotoPerfilTemp ? (
                    <Image
                      src={fotoPerfilTemp}
                      alt="Foto de perfil"
                      fill
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                  
                  {fotoPerfilTemp && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Remover</span>
                    </button>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Seção dos dados do perfil */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      id="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                  </div>
                  
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      id="cargo"
                      value={formData.cargo}
                      onChange={handleInputChange}
                      disabled={!usuario?.isAdmin}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        !usuario?.isAdmin ? 'bg-gray-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                      }`}
                    />
                    {!usuario?.isAdmin && (
                      <p className="text-xs text-gray-500 mt-1">Apenas administradores podem alterar o cargo</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar alterações</span>
                      </>
                    )}
                  </button>
                  
                  {saveSuccess && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span>Alterações salvas com sucesso!</span>
                    </div>
                  )}
                  
                  {saveError && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-5 h-5 mr-1" />
                      <span>{errorMessage || 'Erro ao salvar alterações'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 