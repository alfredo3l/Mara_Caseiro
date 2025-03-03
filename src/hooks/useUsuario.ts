import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { obterUsuarioPorAuthId, atualizarUsuario } from '@/services/usuarios';
import { profilePhotoStorage } from '@/services/storage/index';

interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  fotoPerfil?: string;
  isAdmin?: boolean;
}

interface AtualizarPerfilParams {
  nome?: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  fotoPerfil?: string;
}

export function useUsuario() {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const { user } = useAuthContext();

  // Carregar dados do usuário
  useEffect(() => {
    const carregarUsuario = async () => {
      if (!user) {
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        // Buscar dados do usuário no Supabase
        const usuarioData = await obterUsuarioPorAuthId(user.id);
        console.log('Dados do usuário obtidos:', usuarioData);

        if (usuarioData) {
          // Mapear os dados do usuário para o formato esperado pelo hook
          const dadosUsuario: PerfilUsuario = {
            id: usuarioData.id,
            nome: usuarioData.nome,
            email: user.email || usuarioData.email || '',
            telefone: usuarioData.telefone || '',
            cargo: usuarioData.perfil || '', // O campo cargo corresponde ao campo perfil na tabela usuarios
            fotoPerfil: usuarioData.foto_url,
            isAdmin: ['super_admin', 'admin'].includes(usuarioData.perfil)
          };

          console.log('Dados do usuário mapeados:', dadosUsuario);
          
          // Salvar no localStorage para persistência
          localStorage.setItem('usuario', JSON.stringify(dadosUsuario));

          setUsuario(dadosUsuario);
        } else {
          // Fallback para dados mockados se não encontrar no Supabase
          const dadosUsuario: PerfilUsuario = {
            id: '1',
            nome: user.user_metadata?.name || 'Usuário',
            email: user.email || '',
            telefone: '',
            cargo: 'Usuário',
            fotoPerfil: '/images/avatar-default.svg'
          };

          localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
          setUsuario(dadosUsuario);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setErro('Não foi possível carregar os dados do usuário');

        // Verificar se já temos dados no localStorage como fallback
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
          setUsuario(JSON.parse(usuarioSalvo));
        }
      } finally {
        setCarregando(false);
      }
    };

    carregarUsuario();
  }, [user]);

  /**
   * Faz upload de uma foto de perfil
   * @param file Arquivo de imagem
   * @returns URL da imagem ou null em caso de erro
   */
  const uploadFotoPerfil = async (file: File): Promise<string | null> => {
    if (!usuario || !user) {
      console.error('Erro: Usuário não autenticado');
      return null;
    }

    setCarregando(true);
    setErro(null);

    try {
      console.log('Iniciando upload da foto de perfil');
      console.log('Arquivo:', file.name, file.type, file.size);
      
      // Verificar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 2MB');
      }

      // Verificar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }

      console.log('Arquivo validado, iniciando upload para o storage');
      console.log('ID do usuário:', user.id);
      
      // Verificar se o bucket existe
      const bucketExists = await profilePhotoStorage.checkBucketExists();
      if (!bucketExists) {
        throw new Error('O sistema não está configurado para armazenar imagens. Entre em contato com o administrador.');
      }
      
      // Upload para o storage
      const fotoUrl = await profilePhotoStorage.uploadProfilePhoto(file, user.id);
      console.log('Resultado do upload:', fotoUrl);

      if (!fotoUrl) {
        throw new Error('Falha ao fazer upload da imagem');
      }

      console.log('Upload concluído, atualizando no Supabase');
      
      // Atualizar no Supabase
      const dadosApi = { foto_url: fotoUrl };
      console.log('Dados para atualização:', dadosApi);
      console.log('ID do usuário para atualização:', usuario.id);
      
      const usuarioAtualizado = await atualizarUsuario(usuario.id, dadosApi);
      console.log('Resultado da atualização do usuário:', !!usuarioAtualizado);

      if (!usuarioAtualizado) {
        // Se falhar ao atualizar o usuário, tentar excluir a imagem que acabamos de fazer upload
        try {
          const url = new URL(fotoUrl);
          const filePath = url.pathname.split('/').slice(3).join('/');
          if (filePath) {
            await profilePhotoStorage.deleteFile(filePath);
            console.log('Imagem excluída após falha na atualização do usuário');
          }
        } catch (deleteError) {
          console.error('Erro ao excluir imagem após falha na atualização:', deleteError);
        }
        
        throw new Error('Falha ao atualizar a foto do perfil');
      }

      console.log('Perfil atualizado com sucesso, atualizando estado local');
      
      // Atualizar estado local
      const perfilAtualizado: PerfilUsuario = {
        ...usuario,
        fotoPerfil: fotoUrl
      };

      // Salvar no localStorage para persistência
      localStorage.setItem('usuario', JSON.stringify(perfilAtualizado));

      setUsuario(perfilAtualizado);
      setCarregando(false);
      return fotoUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao fazer upload da foto');
      setCarregando(false);
      return null;
    }
  };

  /**
   * Atualiza os dados do perfil do usuário
   * @param dados Dados a serem atualizados
   * @returns Verdadeiro se a operação foi bem-sucedida
   */
  const atualizarPerfil = async (dados: AtualizarPerfilParams): Promise<boolean> => {
    if (!usuario || !user) return false;

    setCarregando(true);
    setErro(null);

    try {
      console.log('Dados recebidos para atualização:', dados);
      
      // Mapear dados para o formato esperado pela API
      const dadosApi: Record<string, any> = {};
      
      if (dados.nome !== undefined) dadosApi.nome = dados.nome;
      if (dados.telefone !== undefined) dadosApi.telefone = dados.telefone;
      if (dados.cargo !== undefined) dadosApi.perfil = dados.cargo; // O campo cargo corresponde ao campo perfil na tabela usuarios
      if (dados.fotoPerfil !== undefined) dadosApi.foto_url = dados.fotoPerfil;
      
      console.log('Dados mapeados para API:', dadosApi);

      // Atualizar no Supabase
      const usuarioAtualizado = await atualizarUsuario(usuario.id, dadosApi);
      console.log('Resultado da atualização:', usuarioAtualizado);

      if (!usuarioAtualizado) {
        throw new Error('Falha ao atualizar o perfil');
      }

      // Atualizar estado local
      const perfilAtualizado: PerfilUsuario = {
        ...usuario,
        nome: dados.nome !== undefined ? dados.nome : usuario.nome,
        email: user.email || usuario.email, // Manter o email do usuário autenticado
        telefone: dados.telefone !== undefined ? dados.telefone : usuario.telefone,
        cargo: dados.cargo !== undefined ? dados.cargo : usuario.cargo,
        fotoPerfil: dados.fotoPerfil !== undefined ? dados.fotoPerfil : usuario.fotoPerfil
      };

      // Salvar no localStorage para persistência
      localStorage.setItem('usuario', JSON.stringify(perfilAtualizado));

      setUsuario(perfilAtualizado);
      setCarregando(false);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErro(error instanceof Error ? error.message : 'Não foi possível atualizar o perfil');
      setCarregando(false);
      return false;
    }
  };

  /**
   * Remove a foto de perfil do usuário
   * @returns Verdadeiro se a operação foi bem-sucedida
   */
  const removerFotoPerfil = async (): Promise<boolean> => {
    if (!usuario || !user) {
      console.error('Erro: Usuário não autenticado');
      return false;
    }

    setCarregando(true);
    setErro(null);

    try {
      console.log('Iniciando remoção da foto de perfil');
      console.log('Foto atual:', usuario.fotoPerfil);
      
      // Verificar se o bucket existe
      const bucketExists = await profilePhotoStorage.checkBucketExists();
      if (!bucketExists) {
        throw new Error('O sistema não está configurado para gerenciar imagens. Entre em contato com o administrador.');
      }
      
      // Se tiver uma URL de foto, tentar excluir o arquivo do storage
      if (usuario.fotoPerfil && usuario.fotoPerfil.includes('storage')) {
        try {
          // Extrair o caminho do arquivo da URL
          const url = new URL(usuario.fotoPerfil);
          const filePath = url.pathname.split('/').slice(3).join('/');
          
          console.log('Caminho do arquivo para exclusão:', filePath);

          if (filePath) {
            // Excluir arquivo do storage
            const deleteResult = await profilePhotoStorage.deleteFile(filePath);
            console.log('Resultado da exclusão do arquivo:', deleteResult);
            
            if (!deleteResult) {
              console.warn('Não foi possível excluir o arquivo do storage, mas continuaremos com a atualização do perfil');
            }
          }
        } catch (error) {
          console.error('Erro ao excluir arquivo do storage:', error);
          console.warn('Continuando com a atualização do perfil mesmo com erro na exclusão do arquivo');
        }
      } else {
        console.log('Nenhuma foto de perfil para excluir do storage');
      }

      console.log('Atualizando registro do usuário para remover a referência à foto');
      
      // Atualizar no Supabase
      const usuarioAtualizado = await atualizarUsuario(usuario.id, { foto_url: undefined });
      console.log('Resultado da atualização do usuário:', !!usuarioAtualizado);

      if (!usuarioAtualizado) {
        throw new Error('Falha ao remover a foto do perfil');
      }

      console.log('Perfil atualizado com sucesso, atualizando estado local');
      
      // Atualizar estado local
      const perfilAtualizado: PerfilUsuario = {
        ...usuario,
        fotoPerfil: undefined
      };

      // Salvar no localStorage para persistência
      localStorage.setItem('usuario', JSON.stringify(perfilAtualizado));

      setUsuario(perfilAtualizado);
      return true;
    } catch (error) {
      console.error('Erro ao remover foto do perfil:', error);
      setErro(error instanceof Error ? error.message : 'Não foi possível remover a foto do perfil');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  return {
    usuario,
    carregando,
    erro,
    uploadFotoPerfil,
    atualizarPerfil,
    removerFotoPerfil
  };
} 