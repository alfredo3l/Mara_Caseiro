/**
 * Cliente mockado do Supabase
 * Usado quando as variáveis de ambiente não estão configuradas
 */

import { getMockData } from './mockData';
import { Coordenador, Municipio, Regiao } from '@/types/mapa';

// Tipo para os parâmetros de consulta
type QueryParams = {
  eq?: [string, any];
  neq?: [string, any];
  order?: string;
  select?: string;
};

// Tipo para o resultado de uma operação
type OperationResult<T> = {
  data: T | null;
  error: Error | null;
};

// Classe para simular uma tabela do Supabase
class MockTable<T extends Record<string, any>> {
  private data: T[];
  private tableName: string;
  private queryParams: QueryParams = {};

  constructor(tableName: string, initialData: T[]) {
    this.data = [...initialData];
    this.tableName = tableName;
  }

  // Selecionar campos
  select(fields: string = '*'): MockTable<T> {
    this.queryParams.select = fields;
    return this;
  }

  // Ordenar resultados
  order(field: string): MockTable<T> {
    this.queryParams.order = field;
    return this;
  }

  // Filtrar por igualdade
  eq(field: string, value: any): MockTable<T> {
    this.queryParams.eq = [field, value];
    return this;
  }

  // Filtrar por desigualdade
  neq(field: string, value: any): MockTable<T> {
    this.queryParams.neq = [field, value];
    return this;
  }

  // Executar a consulta e retornar os resultados
  async then(resolve: (result: OperationResult<T[]>) => void): Promise<void> {
    try {
      let result = [...this.data];

      // Aplicar filtros
      if (this.queryParams.eq) {
        const [field, value] = this.queryParams.eq;
        result = result.filter(item => item[field] === value);
      }

      if (this.queryParams.neq) {
        const [field, value] = this.queryParams.neq;
        result = result.filter(item => item[field] !== value);
      }

      // Aplicar ordenação
      if (this.queryParams.order) {
        const field = this.queryParams.order.replace(/^-/, '');
        const isDesc = this.queryParams.order.startsWith('-');
        
        result.sort((a, b) => {
          if (a[field] < b[field]) return isDesc ? 1 : -1;
          if (a[field] > b[field]) return isDesc ? -1 : 1;
          return 0;
        });
      }

      // Resetar parâmetros de consulta
      this.queryParams = {};

      resolve({ data: result, error: null });
    } catch (error) {
      resolve({ data: null, error: error instanceof Error ? error : new Error('Erro desconhecido') });
    }
  }

  // Inserir dados
  async insert(items: Partial<T>[]): Promise<OperationResult<T[]>> {
    try {
      const newItems = items.map((item, index) => {
        const id = `mock-${this.tableName}-${Date.now()}-${index}`;
        return { id, ...item } as T;
      });

      this.data.push(...newItems);
      return { data: newItems, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Erro ao inserir dados') };
    }
  }

  // Atualizar dados
  async update(updates: Partial<T>): Promise<OperationResult<T[]>> {
    try {
      let result: T[] = [];
      
      if (this.queryParams.eq) {
        const [field, value] = this.queryParams.eq;
        this.data = this.data.map(item => {
          if (item[field] === value) {
            const updated = { ...item, ...updates };
            result.push(updated);
            return updated;
          }
          return item;
        });
      }

      // Resetar parâmetros de consulta
      this.queryParams = {};

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Erro ao atualizar dados') };
    }
  }

  // Excluir dados
  async delete(): Promise<OperationResult<T[]>> {
    try {
      let deleted: T[] = [];
      
      if (this.queryParams.eq) {
        const [field, value] = this.queryParams.eq;
        deleted = this.data.filter(item => item[field] === value);
        this.data = this.data.filter(item => item[field] !== value);
      } else if (this.queryParams.neq) {
        const [field, value] = this.queryParams.neq;
        deleted = this.data.filter(item => item[field] !== value);
        this.data = this.data.filter(item => item[field] === value);
      } else {
        deleted = [...this.data];
        this.data = [];
      }

      // Resetar parâmetros de consulta
      this.queryParams = {};

      return { data: deleted, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Erro ao excluir dados') };
    }
  }
}

// Mock para autenticação
const mockAuth = () => {
  // Armazenar usuário atual
  let currentUser = null;
  let currentSession = null;
  
  // Lista de usuários mockados
  const mockUsers = [
    {
      id: 'mock-user-1',
      email: 'admin@exemplo.com',
      password: 'senha123',
      user_metadata: {
        name: 'Administrador',
        document: '123.456.789-00'
      }
    }
  ];
  
  // Lista de listeners de mudança de estado
  const stateChangeListeners = [];
  
  return {
    // Obter sessão atual
    getSession: async () => {
      return {
        data: {
          session: currentSession
        },
        error: null
      };
    },
    
    // Registrar listener para mudanças de estado
    onAuthStateChange: (callback) => {
      const subscription = {
        unsubscribe: () => {
          const index = stateChangeListeners.indexOf(callback);
          if (index !== -1) {
            stateChangeListeners.splice(index, 1);
          }
        }
      };
      
      stateChangeListeners.push(callback);
      
      return {
        data: {
          subscription
        }
      };
    },
    
    // Login com email e senha
    signInWithPassword: async ({ email, password }) => {
      // Verificar credenciais
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return {
          data: { user: null, session: null },
          error: new Error('Invalid login credentials')
        };
      }
      
      // Criar sessão
      const { password: _, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword;
      currentSession = {
        user: currentUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000 // 1 hora
      };
      
      // Notificar listeners
      stateChangeListeners.forEach(callback => {
        callback('SIGNED_IN', currentSession);
      });
      
      return {
        data: {
          user: currentUser,
          session: currentSession
        },
        error: null
      };
    },
    
    // Registrar novo usuário
    signUp: async ({ email, password, options }) => {
      // Verificar se o email já está em uso
      if (mockUsers.some(u => u.email === email)) {
        return {
          data: { user: null, session: null },
          error: new Error('User already registered')
        };
      }
      
      // Verificar tamanho da senha
      if (password.length < 6) {
        return {
          data: { user: null, session: null },
          error: new Error('Password should be at least 6 characters')
        };
      }
      
      // Criar novo usuário
      const newUser = {
        id: `mock-user-${Date.now()}`,
        email,
        password,
        user_metadata: options?.data || {}
      };
      
      mockUsers.push(newUser);
      
      // Criar sessão
      const { password: _, ...userWithoutPassword } = newUser;
      currentUser = userWithoutPassword;
      currentSession = {
        user: currentUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000 // 1 hora
      };
      
      // Notificar listeners
      stateChangeListeners.forEach(callback => {
        callback('SIGNED_IN', currentSession);
      });
      
      return {
        data: {
          user: currentUser,
          session: currentSession
        },
        error: null
      };
    },
    
    // Logout
    signOut: async () => {
      currentUser = null;
      currentSession = null;
      
      // Notificar listeners
      stateChangeListeners.forEach(callback => {
        callback('SIGNED_OUT', null);
      });
      
      return {
        error: null
      };
    },
    
    // Recuperação de senha
    resetPasswordForEmail: async (email, options) => {
      // Verificar se o email existe
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        return {
          error: new Error('Email not found')
        };
      }
      
      console.log(`[MOCK] Link de recuperação de senha enviado para ${email}`);
      console.log(`[MOCK] URL de redirecionamento: ${options.redirectTo}`);
      
      return {
        error: null
      };
    }
  };
};

// Cliente mockado do Supabase
export const mockSupabaseClient = {
  from: (tableName: string) => {
    const { coordenadores, regioes, municipios } = getMockData();
    
    switch (tableName) {
      case 'coordenadores':
        return new MockTable<Coordenador>('coordenadores', coordenadores);
      case 'regioes':
        return new MockTable<Regiao>('regioes', regioes);
      case 'municipios':
        return new MockTable<Municipio>('municipios', municipios);
      default:
        return new MockTable(tableName, []);
    }
  },
  
  // Função SQL para simular operações SQL
  sql: (strings: TemplateStringsArray, ...values: any[]) => {
    // Simples implementação para array_append
    if (strings[0].includes('array_append')) {
      return {
        toString: () => `array_append(${values[0]})`
      };
    }
    return {
      toString: () => strings.join('')
    };
  },
  
  // Adicionar autenticação mockada
  auth: mockAuth(),
  
  // Adicionar storage mockado
  storage: {
    // Método para obter referência a um bucket
    from: (bucketName: string) => {
      return {
        // Upload de arquivo
        upload: (path: string, file: File | Blob, options?: any) => {
          console.log(`[MOCK] Upload de arquivo para ${bucketName}/${path}`);
          console.log(`[MOCK] Tipo do arquivo: ${file.type}, Tamanho: ${file.size} bytes`);
          
          // Simular sucesso no upload
          return {
            data: {
              path: path,
              id: `mock-file-${Date.now()}`,
              fullPath: `${bucketName}/${path}`
            },
            error: null
          };
        },
        
        // Remover arquivo
        remove: (paths: string[]) => {
          console.log(`[MOCK] Removendo arquivos de ${bucketName}:`, paths);
          
          // Simular sucesso na remoção
          return {
            data: { count: paths.length },
            error: null
          };
        },
        
        // Obter URL pública
        getPublicUrl: (path: string) => {
          const publicUrl = `https://mock-supabase-storage.com/${bucketName}/${path}`;
          console.log(`[MOCK] URL pública gerada: ${publicUrl}`);
          
          return {
            data: {
              publicUrl: publicUrl
            }
          };
        },
        
        // Criar URL assinada
        createSignedUrl: (path: string, expiresIn: number) => {
          const signedUrl = `https://mock-supabase-storage.com/${bucketName}/${path}?token=mock-signed-token&expires=${Date.now() + expiresIn * 1000}`;
          console.log(`[MOCK] URL assinada gerada: ${signedUrl}`);
          
          return {
            data: {
              signedUrl: signedUrl
            },
            error: null
          };
        },
        
        // Listar arquivos
        list: (prefix?: string, options?: any) => {
          console.log(`[MOCK] Listando arquivos em ${bucketName}/${prefix || ''}`);
          
          // Simular lista de arquivos
          const mockFiles = [
            {
              name: 'mock-file-1.jpg',
              id: 'mock-file-1',
              metadata: {
                size: 1024,
                mimetype: 'image/jpeg',
                lastModified: new Date().toISOString()
              }
            },
            {
              name: 'mock-file-2.pdf',
              id: 'mock-file-2',
              metadata: {
                size: 2048,
                mimetype: 'application/pdf',
                lastModified: new Date().toISOString()
              }
            }
          ];
          
          return {
            data: mockFiles,
            error: null
          };
        }
      };
    }
  }
};

export default mockSupabaseClient; 