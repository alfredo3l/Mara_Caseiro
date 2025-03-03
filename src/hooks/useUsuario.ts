import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { obterUsuarioPorAuthId, atualizarUsuario, criarUsuario } from '@/services/usuarios';
import { profilePhotoStorage } from '@/services/storage/index';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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

  /**
   * Verifica se uma string é um UUID válido
   * @param id String a ser verificada
   * @returns true se for um UUID válido
   */
  const isValidUuid = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  /**
   * Verifica se o ID do usuário atual é válido
   * @throws Error se o ID não for válido
   */
  const validateUserId = (): void => {
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    
    if (!isValidUuid(usuario.id)) {
      console.error('ID do usuário não é um UUID válido:', usuario.id);
      throw new Error('ID do usuário inválido. Por favor, faça login novamente.');
    }
  };

  // Carregar dados do usuário
  useEffect(() => {
    const carregarUsuario = async () => {
      if (!user) {
        console.log('Nenhum usuário autenticado, não carregando dados');
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        console.log('Iniciando carregamento de dados do usuário com auth_id:', user.id);
        
        // Buscar dados do usuário no Supabase
        const usuarioData = await obterUsuarioPorAuthId(user.id);
        console.log('Dados do usuário obtidos do Supabase:', usuarioData);

        if (usuarioData) {
          // Verificar se o campo perfil existe
          if (!usuarioData.perfil) {
            console.error('Campo perfil não encontrado nos dados do usuário:', usuarioData);
          }
          
          // Verificar se as colunas telefone e foto_url existem
          if (!('telefone' in usuarioData)) {
            console.warn('A coluna telefone não existe na tabela usuarios. Execute o script de migração para adicioná-la.');
          }
          
          if (!('foto_url' in usuarioData)) {
            console.warn('A coluna foto_url não existe na tabela usuarios. Execute o script de migração para adicioná-la.');
          }
          
          // Mapear os dados do usuário para o formato esperado pelo hook
          const dadosUsuario: PerfilUsuario = {
            id: usuarioData.id,
            nome: usuarioData.nome,
            email: user.email || usuarioData.email || '',
            telefone: 'telefone' in usuarioData ? usuarioData.telefone || '' : '',
            cargo: usuarioData.perfil || '', // O campo cargo corresponde ao campo perfil na tabela usuarios
            fotoPerfil: 'foto_url' in usuarioData ? usuarioData.foto_url : undefined,
            isAdmin: ['super_admin', 'admin'].includes(usuarioData.perfil)
          };

          console.log('Dados do usuário mapeados para o hook:', dadosUsuario);
          console.log('Campo cargo (obtido de perfil):', dadosUsuario.cargo);
          
          // Salvar no localStorage para persistência
          localStorage.setItem('usuario', JSON.stringify(dadosUsuario));

          setUsuario(dadosUsuario);
        } else {
          console.log('Usuário não encontrado no Supabase, tentando criar...');
          
          // Tentar criar o usuário no Supabase
          try {
            if (typeof criarUsuario !== 'function') {
              console.error('Função criarUsuario não está definida. Importando a função...');
              // Importar a função diretamente
              const { criarUsuario: criarUsuarioFn } = await import('@/services/usuarios');
              
              if (typeof criarUsuarioFn !== 'function') {
                throw new Error('Função criarUsuario não pôde ser importada');
              }
              
              const novoUsuario = await criarUsuarioFn(user, {
                nome: user.user_metadata?.name || 'Usuário',
                perfil: 'apoiador' // Perfil padrão para novos usuários
              });
              
              if (novoUsuario) {
                console.log('Usuário criado com sucesso:', novoUsuario);
                
                // Mapear os dados do usuário para o formato esperado pelo hook
                const dadosUsuario: PerfilUsuario = {
                  id: novoUsuario.id,
                  nome: novoUsuario.nome,
                  email: user.email || novoUsuario.email || '',
                  telefone: 'telefone' in novoUsuario ? novoUsuario.telefone || '' : '',
                  cargo: novoUsuario.perfil || '',
                  fotoPerfil: 'foto_url' in novoUsuario ? novoUsuario.foto_url : undefined,
                  isAdmin: ['super_admin', 'admin'].includes(novoUsuario.perfil)
                };
                
                // Salvar no localStorage para persistência
                localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
                
                setUsuario(dadosUsuario);
                return;
              }
            } else {
              const novoUsuario = await criarUsuario(user, {
                nome: user.user_metadata?.name || 'Usuário',
                perfil: 'apoiador' // Perfil padrão para novos usuários
              });
              
              if (novoUsuario) {
                console.log('Usuário criado com sucesso:', novoUsuario);
                
                // Mapear os dados do usuário para o formato esperado pelo hook
                const dadosUsuario: PerfilUsuario = {
                  id: novoUsuario.id,
                  nome: novoUsuario.nome,
                  email: user.email || novoUsuario.email || '',
                  telefone: 'telefone' in novoUsuario ? novoUsuario.telefone || '' : '',
                  cargo: novoUsuario.perfil || '',
                  fotoPerfil: 'foto_url' in novoUsuario ? novoUsuario.foto_url : undefined,
                  isAdmin: ['super_admin', 'admin'].includes(novoUsuario.perfil)
                };
                
                // Salvar no localStorage para persistência
                localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
                
                setUsuario(dadosUsuario);
                return;
              }
            }
          } catch (createError) {
            console.error('Erro ao criar usuário:', createError);
            // Continuar com o fallback
          }
          
          // Fallback para dados mockados se não encontrar no Supabase
          const dadosUsuario: PerfilUsuario = {
            id: uuidv4(), // Gerar um UUID válido em vez de usar '1'
            nome: user.user_metadata?.name || 'Usuário',
            email: user.email || '',
            telefone: '',
            cargo: 'apoiador',
            fotoPerfil: '/images/avatar-default.svg'
          };

          console.log('Usuário não encontrado no Supabase, usando dados mockados com UUID válido:', dadosUsuario);
          localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
          setUsuario(dadosUsuario);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setErro('Não foi possível carregar os dados do usuário');

        // Verificar se já temos dados no localStorage como fallback
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
          try {
            const dadosSalvos = JSON.parse(usuarioSalvo);
            // Verificar se o ID é um UUID válido
            if (dadosSalvos.id && dadosSalvos.id === '1') {
              // Substituir ID inválido por um UUID válido
              dadosSalvos.id = uuidv4();
              localStorage.setItem('usuario', JSON.stringify(dadosSalvos));
            }
            setUsuario(dadosSalvos);
          } catch (e) {
            console.error('Erro ao processar dados do localStorage:', e);
          }
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
      
      // Verificar se o ID do usuário é um UUID válido
      try {
        validateUserId();
      } catch (error) {
        console.warn('ID do usuário inválido, mas continuando com auth_id:', user.id);
        // Continuar mesmo com ID inválido, usando auth_id
      }
      
      // Verificar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 2MB');
      }

      // Verificar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo deve ser uma imagem');
      }

      console.log('Arquivo validado, iniciando upload para o storage');
      console.log('ID do usuário:', usuario.id);
      console.log('Auth ID do usuário:', user.id);
      
      // Verificar se o bucket existe
      const bucketExists = await profilePhotoStorage.checkBucketExists();
      if (!bucketExists) {
        console.error('Bucket de fotos de perfil não existe');
        setErro('O sistema não está configurado para armazenar imagens. Entre em contato com o administrador.');
        return null;
      }
      
      // Upload para o storage
      const fotoUrl = await profilePhotoStorage.uploadProfilePhoto(file, user.id);
      console.log('Resultado do upload para o storage:', fotoUrl);

      if (!fotoUrl) {
        throw new Error('Falha ao fazer upload da imagem');
      }

      console.log('Upload concluído, atualizando no Supabase');
      
      // Atualizar no Supabase - Aqui está o ponto crítico
      let atualizacaoBemSucedida = false;
      
      try {
        // Primeiro, tentar atualizar usando o ID do usuário
        console.log('Tentando atualizar foto_url usando ID:', usuario.id);
        const { data: updateData, error: updateError } = await supabase
          .from('usuarios')
          .update({ foto_url: fotoUrl })
          .eq('id', usuario.id)
          .select();
        
        if (updateError) {
          console.error('Erro ao atualizar foto_url usando ID:', updateError);
          
          // Se falhar, tentar atualizar usando o auth_id
          console.log('Tentando atualizar foto_url usando auth_id:', user.id);
          const { data: authUpdateData, error: authUpdateError } = await supabase
            .from('usuarios')
            .update({ foto_url: fotoUrl })
            .eq('auth_id', user.id)
            .select();
          
          if (authUpdateError) {
            // Se o erro for relacionado à coluna não existir
            if (authUpdateError.message.includes('column "foto_url" of relation "usuarios" does not exist')) {
              console.warn('A coluna foto_url não existe na tabela usuarios. Execute o script de migração para adicioná-la.');
              setErro('A coluna foto_url não existe na tabela usuarios. Entre em contato com o administrador para executar o script de migração.');
            } else {
              console.error('Erro ao atualizar foto_url usando auth_id:', authUpdateError);
              throw new Error(`Erro ao atualizar foto: ${authUpdateError.message}`);
            }
          } else {
            console.log('Resultado da atualização usando auth_id:', authUpdateData);
            atualizacaoBemSucedida = true;
          }
        } else {
          console.log('Resultado da atualização usando ID:', updateData);
          atualizacaoBemSucedida = true;
        }
      } catch (error) {
        console.error('Erro ao atualizar registro do usuário:', error);
        // Mesmo com erro na atualização do banco, vamos atualizar o estado local
        // para que o usuário veja a foto, mas avisamos que ela não foi salva no banco
        setErro('A foto foi carregada, mas não foi possível salvá-la no banco de dados. Entre em contato com o administrador.');
      }
      
      // Atualizar estado local
      const perfilAtualizado: PerfilUsuario = {
        ...usuario,
        fotoPerfil: fotoUrl
      };

      // Salvar no localStorage para persistência
      localStorage.setItem('usuario', JSON.stringify(perfilAtualizado));

      setUsuario(perfilAtualizado);
      setCarregando(false);
      
      if (!atualizacaoBemSucedida) {
        console.warn('A foto foi salva localmente, mas pode não ter sido salva no banco de dados.');
      }
      
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
      
      // Verificar se o ID do usuário é um UUID válido
      validateUserId();
      
      // Mapear dados para o formato esperado pela API
      const dadosApi: Record<string, any> = {};
      
      if (dados.nome !== undefined) dadosApi.nome = dados.nome;
      if (dados.telefone !== undefined) dadosApi.telefone = dados.telefone;
      if (dados.cargo !== undefined) dadosApi.perfil = dados.cargo; // O campo cargo corresponde ao campo perfil na tabela usuarios
      if (dados.fotoPerfil !== undefined) dadosApi.foto_url = dados.fotoPerfil;
      
      console.log('Dados mapeados para API (cargo -> perfil):', dadosApi);
      console.log('ID do usuário para atualização:', usuario.id);
      console.log('Auth ID do usuário:', user.id);

      try {
        // Primeiro, tentar atualizar usando o ID do usuário
        const { data: updateData, error: updateError } = await supabase
          .from('usuarios')
          .update(dadosApi)
          .eq('id', usuario.id)
          .select();
        
        if (updateError) {
          console.error('Erro ao atualizar perfil usando ID:', updateError);
          
          // Se falhar, tentar atualizar usando o auth_id
          console.log('Tentando atualizar usando auth_id:', user.id);
          const { data: authUpdateData, error: authUpdateError } = await supabase
            .from('usuarios')
            .update(dadosApi)
            .eq('auth_id', user.id)
            .select();
          
          if (authUpdateError) {
            // Se o erro for relacionado à coluna não existir
            if (authUpdateError.message.includes('column "telefone" of relation "usuarios" does not exist')) {
              console.warn('A coluna telefone não existe na tabela usuarios. Execute o script de migração para adicioná-la.');
              
              // Tentar atualizar sem o campo telefone
              if (dadosApi.telefone) {
                delete dadosApi.telefone;
                console.log('Tentando atualizar sem o campo telefone:', dadosApi);
                
                const { data: retryData, error: retryError } = await supabase
                  .from('usuarios')
                  .update(dadosApi)
                  .eq('auth_id', user.id)
                  .select();
                
                if (retryError) {
                  console.error('Erro ao atualizar perfil sem o campo telefone:', retryError);
                  throw new Error(`Erro ao atualizar perfil: ${retryError.message}`);
                }
                
                console.log('Resultado da atualização sem o campo telefone:', retryData);
              }
            } else if (authUpdateError.message.includes('column "foto_url" of relation "usuarios" does not exist')) {
              console.warn('A coluna foto_url não existe na tabela usuarios. Execute o script de migração para adicioná-la.');
              
              // Tentar atualizar sem o campo foto_url
              if (dadosApi.foto_url) {
                delete dadosApi.foto_url;
                console.log('Tentando atualizar sem o campo foto_url:', dadosApi);
                
                const { data: retryData, error: retryError } = await supabase
                  .from('usuarios')
                  .update(dadosApi)
                  .eq('auth_id', user.id)
                  .select();
                
                if (retryError) {
                  console.error('Erro ao atualizar perfil sem o campo foto_url:', retryError);
                  throw new Error(`Erro ao atualizar perfil: ${retryError.message}`);
                }
                
                console.log('Resultado da atualização sem o campo foto_url:', retryData);
              }
            } else {
              console.error('Erro ao atualizar perfil usando auth_id:', authUpdateError);
              throw new Error(`Erro ao atualizar perfil: ${authUpdateError.message}`);
            }
          } else {
            console.log('Resultado da atualização usando auth_id:', authUpdateData);
          }
        } else {
          console.log('Resultado da atualização usando ID:', updateData);
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
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
      
      // Verificar se o ID do usuário é um UUID válido
      try {
        validateUserId();
      } catch (error) {
        console.warn('ID do usuário inválido, mas continuando com auth_id:', user.id);
        // Continuar mesmo com ID inválido, usando auth_id
      }
      
      // Se não tiver foto de perfil, não há o que remover
      if (!usuario.fotoPerfil) {
        console.log('Usuário não possui foto de perfil para remover');
        setCarregando(false);
        return true;
      }
      
      // Se tiver URL da foto, tentar excluir do storage
      try {
        const url = new URL(usuario.fotoPerfil);
        const filePath = url.pathname.split('/').slice(3).join('/');
        
        if (filePath) {
          console.log('Excluindo arquivo do storage:', filePath);
          await profilePhotoStorage.deleteFile(filePath);
          console.log('Arquivo excluído do storage com sucesso');
        } else {
          console.log('Não foi possível extrair o caminho do arquivo da URL:', usuario.fotoPerfil);
        }
      } catch (error) {
        console.error('Erro ao excluir arquivo do storage:', error);
        // Continuar mesmo se falhar a exclusão do arquivo
      }
      
      // Atualizar o registro no banco de dados
      let atualizacaoBemSucedida = false;
      
      try {
        // Primeiro, tentar atualizar usando o ID do usuário
        console.log('Tentando remover foto_url usando ID:', usuario.id);
        const { data: updateData, error: updateError } = await supabase
          .from('usuarios')
          .update({ foto_url: null })
          .eq('id', usuario.id)
          .select();
        
        if (updateError) {
          console.error('Erro ao remover foto_url usando ID:', updateError);
          
          // Se falhar, tentar atualizar usando o auth_id
          console.log('Tentando remover foto_url usando auth_id:', user.id);
          const { data: authUpdateData, error: authUpdateError } = await supabase
            .from('usuarios')
            .update({ foto_url: null })
            .eq('auth_id', user.id)
            .select();
          
          if (authUpdateError) {
            // Se o erro for relacionado à coluna não existir
            if (authUpdateError.message.includes('column "foto_url" of relation "usuarios" does not exist')) {
              console.warn('A coluna foto_url não existe na tabela usuarios. Execute o script de migração para adicioná-la.');
              // Não é um erro crítico, pois a coluna não existe
            } else {
              console.error('Erro ao remover foto_url usando auth_id:', authUpdateError);
              throw new Error(`Erro ao remover foto: ${authUpdateError.message}`);
            }
          } else {
            console.log('Resultado da remoção usando auth_id:', authUpdateData);
            atualizacaoBemSucedida = true;
          }
        } else {
          console.log('Resultado da remoção usando ID:', updateData);
          atualizacaoBemSucedida = true;
        }
      } catch (error) {
        console.error('Erro ao atualizar registro do usuário:', error);
        // Continuar mesmo com erro na atualização do banco
        setErro('A foto foi removida localmente, mas não foi possível atualizar o banco de dados. Entre em contato com o administrador.');
      }
      
      // Atualizar estado local
      const perfilAtualizado: PerfilUsuario = {
        ...usuario,
        fotoPerfil: undefined
      };

      // Salvar no localStorage para persistência
      localStorage.setItem('usuario', JSON.stringify(perfilAtualizado));

      setUsuario(perfilAtualizado);
      setCarregando(false);
      
      if (!atualizacaoBemSucedida) {
        console.warn('A foto foi removida localmente, mas pode não ter sido removida no banco de dados.');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao remover foto de perfil:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao remover foto de perfil');
      setCarregando(false);
      return false;
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