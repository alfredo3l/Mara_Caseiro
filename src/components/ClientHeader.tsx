'use client';

import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface ClientHeaderProps {
  title: string;
  onMenuClick?: () => void;
  showBackButton?: boolean;
  backUrl?: string;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  title,
  onMenuClick,
  showBackButton = false,
  backUrl = '/dashboard'
}) => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 lg:hidden"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        )}
        
        {showBackButton && (
          <Link 
            href={backUrl}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 flex items-center"
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 text-sm hidden sm:inline">Voltar</span>
          </Link>
        )}
        
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Espaço para botões adicionais, como notificações, perfil, etc. */}
      </div>
    </header>
  );
};

export default ClientHeader; 