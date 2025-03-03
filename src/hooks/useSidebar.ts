import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('');
  const pathname = usePathname();

  // Ajustar o sidebar com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Definir o item ativo com base na rota atual
  useEffect(() => {
    if (pathname) {
      // Remover a barra inicial e qualquer parâmetro de rota
      const path = pathname.split('/')[1] || 'dashboard';
      setActiveItem(path);
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    activeItem,
    setIsOpen,
    setActiveItem,
    toggleSidebar
  };
} 