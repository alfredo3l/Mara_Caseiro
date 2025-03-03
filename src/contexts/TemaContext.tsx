'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import COLORS from '@/config/colors';

interface Tema {
  nome: string;
  cores: {
    background: string;
    foreground: string;
    primary: string;
    primaryLight: string;
    border: string;
  };
}

interface TemaContextType {
  temaAtual: Tema;
  temas: Tema[];
  alterarTema: (tema: Tema) => void;
  adicionarTema: (tema: Tema) => void;
  removerTema: (nomeTema: string) => void;
}

const temasIniciais: Tema[] = [
  {
    nome: 'Padrão',
    cores: {
      background: COLORS.BACKGROUND,
      foreground: COLORS.FOREGROUND,
      primary: COLORS.PRIMARY,
      primaryLight: COLORS.PRIMARY_LIGHT,
      border: COLORS.BORDER,
    },
  },
  {
    nome: 'Escuro',
    cores: {
      background: COLORS.DARK.BACKGROUND,
      foreground: COLORS.DARK.FOREGROUND,
      primary: COLORS.DARK.PRIMARY,
      primaryLight: COLORS.DARK.PRIMARY_LIGHT,
      border: COLORS.DARK.BORDER,
    },
  },
  {
    nome: 'Verde',
    cores: {
      background: COLORS.BACKGROUND,
      foreground: COLORS.FOREGROUND,
      primary: COLORS.GREEN.PRIMARY,
      primaryLight: COLORS.GREEN.PRIMARY_LIGHT,
      border: COLORS.BORDER,
    },
  },
];

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [temas, setTemas] = useState<Tema[]>(temasIniciais);
  const [temaAtual, setTemaAtual] = useState<Tema>(temasIniciais[0]);

  // Carregar temas salvos no localStorage
  useEffect(() => {
    const temasSalvos = localStorage.getItem('temas');
    const temaAtualSalvo = localStorage.getItem('temaAtual');
    
    if (temasSalvos) {
      setTemas(JSON.parse(temasSalvos));
    }
    
    if (temaAtualSalvo) {
      setTemaAtual(JSON.parse(temaAtualSalvo));
    }
  }, []);

  // Aplicar o tema atual ao documento
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--background', temaAtual.cores.background);
    root.style.setProperty('--foreground', temaAtual.cores.foreground);
    root.style.setProperty('--primary', temaAtual.cores.primary);
    root.style.setProperty('--primary-light', temaAtual.cores.primaryLight);
    root.style.setProperty('--border', temaAtual.cores.border);
    
    // Salvar tema atual no localStorage
    localStorage.setItem('temaAtual', JSON.stringify(temaAtual));
  }, [temaAtual]);

  // Alterar o tema atual
  const alterarTema = (tema: Tema) => {
    setTemaAtual(tema);
  };

  // Adicionar um novo tema
  const adicionarTema = (tema: Tema) => {
    const novosTemas = [...temas, tema];
    setTemas(novosTemas);
    localStorage.setItem('temas', JSON.stringify(novosTemas));
  };

  // Remover um tema
  const removerTema = (nomeTema: string) => {
    // Não permitir remover o tema padrão
    if (nomeTema === 'Padrão') return;
    
    const novosTemas = temas.filter(tema => tema.nome !== nomeTema);
    setTemas(novosTemas);
    localStorage.setItem('temas', JSON.stringify(novosTemas));
    
    // Se o tema removido for o atual, voltar para o tema padrão
    if (temaAtual.nome === nomeTema) {
      const temaPadrao = novosTemas.find(tema => tema.nome === 'Padrão') || novosTemas[0];
      setTemaAtual(temaPadrao);
    }
  };

  return (
    <TemaContext.Provider
      value={{
        temaAtual,
        temas,
        alterarTema,
        adicionarTema,
        removerTema,
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const context = useContext(TemaContext);
  if (context === undefined) {
    throw new Error('useTema deve ser usado dentro de um TemaProvider');
  }
  return context;
} 