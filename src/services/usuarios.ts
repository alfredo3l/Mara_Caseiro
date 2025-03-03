import { usuariosService } from './supabase';
import { User } from '@supabase/supabase-js';
import { getOrganizacaoId, getOrganizacaoNome } from '@/config/organizacao';
import { supabase } from '@/lib/supabase';

export interface UsuarioData {
  id: string;
  auth_id: string;
  organizacao_id: string;
  nome: string;
  email: string;
  perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  status: 'ativo' | 'inativo' | 'pendente';
  telefone?: string;
  foto_url?: string;
  ultimo_acesso?: string;
}

export interface AtualizarUsuarioParams {
  nome?: string;
  perfil?: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  status?: 'ativo' | 'inativo' | 'pendente';
  telefone?: string;
  foto_url?: string;
  ultimo_acesso?: string;
}

/**
 * Obtém um usuário pelo ID de autenticação
 * @param authId ID de autenticação do usuário
 * @returns Dados do usuário ou null se não encontrado
 */
export async function obterUsuarioPorAuthId(authId: string): Promise<UsuarioData | null> {
  try {
    console.log('Buscando usuário pelo auth_id:', authId);
    
    // Fazer a consulta diretamente com o Supabase para ter mais controle
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', authId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Usuário não encontrado para o auth_id:', authId);
        return null;
      }
      
      // Verificar se o erro é relacionado a problemas de rede ou conexão
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('Erro de rede ao obter usuário por auth_id:', error);
        console.log('Tentando novamente com uma abordagem diferente...');
        
        // Tentar uma abordagem alternativa
        try {
          const { data: altData, error: altError } = await supabase
            .from('usuarios')
            .select('*')
            .filter('auth_id', 'eq', authId)
            .limit(1);
            
          if (altError) {
            console.error('Erro alternativo ao obter usuário por auth_id:', altError);
            return null;
          }
          
          if (altData && altData.length > 0) {
            console.log('Usuário encontrado com abordagem alternativa:', altData[0]);
            return altData[0] as UsuarioData;
          }
          
          console.log('Nenhum usuário encontrado com abordagem alternativa');
          return null;
        } catch (altCatchError) {
          console.error('Exceção na abordagem alternativa:', altCatchError);
          return null;
        }
      }
      
      console.error('Erro ao obter usuário por auth_id:', error);
      return null;
    }
    
    if (!data) {
      console.log('Nenhum dado retornado para o auth_id:', authId);
      return null;
    }
    
    console.log('Usuário encontrado:', data);
    return data as UsuarioData;
  } catch (error) {
    console.error('Exceção ao obter usuário por auth_id:', error);
    return null;
  }
}

/**
 * Obtém um usuário pelo ID
 * @param id ID do usuário
 * @returns Dados do usuário ou null se não encontrado
 */
export async function obterUsuarioPorId(id: string): Promise<UsuarioData | null> {
  try {
    return await usuariosService.getById<UsuarioData>(id);
  } catch (error) {
    console.error('Erro ao obter usuário por id:', error);
    return null;
  }
}

/**
 * Atualiza os dados de um usuário
 * @param id ID do usuário
 * @param dados Dados a serem atualizados
 * @returns Usuário atualizado ou null em caso de erro
 */
export async function atualizarUsuario(id: string, dados: AtualizarUsuarioParams): Promise<UsuarioData | null> {
  try {
    console.log('Atualizando usuário com ID:', id);
    console.log('Dados para atualização:', dados);
    
    const resultado = await usuariosService.update<UsuarioData>(id, dados);
    console.log('Resultado da atualização:', resultado);
    
    return resultado;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return null;
  }
}

/**
 * Cria um novo usuário
 * @param authUser Usuário autenticado
 * @param dados Dados do usuário
 * @returns Usuário criado ou null em caso de erro
 */
export async function criarUsuario(
  authUser: User,
  dados: {
    nome: string;
    perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador';
  }
): Promise<UsuarioData | null> {
  try {
    console.log('Iniciando criação de usuário para:', authUser.email);
    
    const organizacaoId = getOrganizacaoId();
    const organizacaoNome = getOrganizacaoNome();
    
    console.log('Dados da organização:', { organizacaoId, organizacaoNome });
    
    if (!authUser.id || !authUser.email) {
      console.error('Dados do usuário auth inválidos:', authUser);
      return null;
    }
    
    // Verificar se já existe um usuário com este auth_id
    try {
      const usuarioExistente = await obterUsuarioPorAuthId(authUser.id);
      if (usuarioExistente) {
        console.log('Usuário já existe na tabela usuarios:', usuarioExistente);
        return usuarioExistente;
      }
    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
      // Continuar mesmo se houver erro na verificação
    }
    
    // Criar usuário na tabela usuarios
    const novoUsuario = {
      auth_id: authUser.id,
      organizacao_id: organizacaoId,
      nome: dados.nome,
      email: authUser.email,
      perfil: dados.perfil,
      status: 'ativo' as const,
      ultimo_acesso: new Date().toISOString()
    };
    
    console.log('Tentando criar novo usuário com dados:', novoUsuario);
    
    try {
      // Tentar criar o usuário diretamente com o Supabase
      const { data: createdData, error } = await supabase
        .from('usuarios')
        .insert(novoUsuario)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar usuário na tabela usuarios:', error);
        
        // Verificar se o erro é de conflito (usuário já existe)
        if (error.code === '23505') { // Código de erro de violação de chave única
          console.log('Usuário já existe na tabela, tentando obter...');
          const usuarioExistente = await obterUsuarioPorAuthId(authUser.id);
          if (usuarioExistente) {
            console.log('Usuário recuperado com sucesso:', usuarioExistente);
            return usuarioExistente;
          }
        }
        
        // Se não for um erro de conflito ou não conseguir recuperar o usuário, retornar null
        return null;
      }
      
      if (!createdData) {
        console.error('Nenhum dado retornado ao criar usuário');
        return null;
      }
      
      console.log('Usuário criado com sucesso:', createdData);
      
      // Atualizar os metadados do usuário no auth
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            organizacao_id: organizacaoId,
            organizacao_nome: organizacaoNome,
            nome: dados.nome,
            perfil: dados.perfil
          }
        });
        
        if (updateError) {
          console.error('Erro ao atualizar metadados do usuário:', updateError);
          // Não vamos falhar aqui, pois o usuário já foi criado na tabela usuarios
        } else {
          console.log('Metadados do usuário atualizados com sucesso');
        }
      } catch (updateError) {
        console.error('Exceção ao atualizar metadados do usuário:', updateError);
        // Não vamos falhar aqui, pois o usuário já foi criado na tabela usuarios
      }
      
      return createdData as UsuarioData;
    } catch (createError) {
      console.error('Exceção ao criar usuário na tabela usuarios:', createError);
      return null;
    }
  } catch (error) {
    console.error('Erro geral ao criar usuário:', error);
    return null;
  }
}

/**
 * Atualiza o status de um usuário
 * @param id ID do usuário
 * @param status Novo status
 * @returns Usuário atualizado ou null em caso de erro
 */
export async function atualizarStatusUsuario(
  id: string, 
  status: 'ativo' | 'inativo' | 'pendente'
): Promise<UsuarioData | null> {
  return await atualizarUsuario(id, { status });
}

/**
 * Atualiza o perfil de um usuário
 * @param id ID do usuário
 * @param perfil Novo perfil
 * @returns Usuário atualizado ou null em caso de erro
 */
export async function atualizarPerfilUsuario(
  id: string,
  perfil: 'super_admin' | 'admin' | 'coordenador' | 'lideranca' | 'apoiador'
): Promise<UsuarioData | null> {
  return await atualizarUsuario(id, { perfil });
}

/**
 * Registra o último acesso do usuário
 * @param authId ID de autenticação do usuário
 * @returns Verdadeiro se a operação foi bem-sucedida
 */
export async function registrarAcesso(authId: string): Promise<boolean> {
  try {
    const usuario = await obterUsuarioPorAuthId(authId);
    
    if (!usuario) {
      return false;
    }
    
    await usuariosService.update<UsuarioData>(usuario.id, {
      ultimo_acesso: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
    return false;
  }
} 