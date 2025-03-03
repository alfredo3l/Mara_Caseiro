/**
 * Arquivo de configuração de cores do sistema
 * 
 * Este arquivo centraliza todas as cores utilizadas no sistema,
 * facilitando a alteração global e manutenção.
 * 
 * As cores definidas aqui são utilizadas pelo TemaContext para
 * criar os temas do sistema.
 */

// Cores principais do sistema
export const COLORS = {
  // Cores primárias
  PRIMARY: '#F907A7',
  PRIMARY_LIGHT: '#3291ff',
  
  // Cores de fundo e texto
  BACKGROUND: '#ffffff',
  FOREGROUND: '#171717',
  BORDER: '#e5e5e5',
  
  // Cores de temas alternativos
  DARK: {
    BACKGROUND: '#121212',
    FOREGROUND: '#f5f5f5',
    PRIMARY: '#3B82F6',
    PRIMARY_LIGHT: '#60A5FA',
    BORDER: '#2e2e2e',
  },
  
  GREEN: {
    PRIMARY: '#10B981',
    PRIMARY_LIGHT: '#34D399',
  },
  
  // Cores de estados
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  
  // Cores predefinidas para personalização
  PRESETS: [
    { nome: 'Azul', valor: '#0F509C' },
    { nome: 'Verde', valor: '#10B981' },
    { nome: 'Vermelho', valor: '#EF4444' },
    { nome: 'Roxo', valor: '#8B5CF6' },
    { nome: 'Laranja', valor: '#F97316' },
    { nome: 'Rosa', valor: '#EC4899' },
    { nome: 'Amarelo', valor: '#F59E0B' },
    { nome: 'Cinza', valor: '#6B7280' },
  ],
};

// Função para obter uma cor com opacidade
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Verifica se a cor está no formato hexadecimal
  if (color.startsWith('#')) {
    // Converte para RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Retorna a cor com opacidade
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color;
};

export default COLORS; 