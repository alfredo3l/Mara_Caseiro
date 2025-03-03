'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUsuario as useUsuarioHook } from '@/hooks/useUsuario';

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

interface UsuarioContextType {
  usuario: PerfilUsuario | null;
  carregando: boolean;
  erro: string | null;
  atualizarPerfil: (dados: AtualizarPerfilParams) => Promise<boolean>;
  removerFotoPerfil: () => Promise<boolean>;
}

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

export function UsuarioProvider({ children }: { children: ReactNode }) {
  // Usar o hook atualizado
  const usuarioHook = useUsuarioHook();
  
  return (
    <UsuarioContext.Provider value={usuarioHook}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  const context = useContext(UsuarioContext);
  if (context === undefined) {
    throw new Error('useUsuario deve ser usado dentro de um UsuarioProvider');
  }
  return context;
} 