'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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
      background: '#ffffff',
      foreground: '#171717',
      primary: '#0F509C',
      primaryLight: '#0F509C',
      border: '#e5e5e5',
    },
  },
  {
    nome: 'Escuro',
    cores: {
      background: '#121212',
      foreground: '#f5f5f5',
      primary: '#3B82F6',
      primaryLight: '#60A5FA',
      border: '#2e2e2e',
    },
  },
  {
    nome: 'Verde',
    cores: {
      background: '#ffffff',
      foreground: '#171717',
      primary: '#10B981',
      primaryLight: '#34D399',
      border: '#e5e5e5',
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