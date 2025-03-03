'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUsuario } from '@/contexts/UsuarioContext';
import NotificacoesDropdown from '@/components/ui/NotificacoesDropdown';

interface ClientHeaderProps {
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

export default function ClientHeader({ 
  onMenuClick, 
  isMenuOpen
}: ClientHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { usuario } = useUsuario();
  
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Obter as iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = usuario?.nome ? getInitials(usuario.nome) : 'US';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-user-menu-toggle]')
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Fechar o menu do usuário
    setShowUserMenu(false);
    
    // Simulação de logout - em uma aplicação real, você chamaria uma API de logout
    localStorage.removeItem('usuario');
    
    // Redirecionar para a página inicial
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-border z-20 pl-0 md:pl-20">
      <div className="flex items-center justify-between h-full px-4">
        {/* Menu Toggle e Título */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="md:hidden">
            <h1 className="text-lg font-semibold text-gray-900">Deputada Mara Caseiro</h1>
          </div>
        </div>

        {/* Ações do Usuário */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Informações do Usuário Logado */}
          <div className="hidden md:flex items-center mr-2">
            <span className="text-sm font-medium text-gray-700">
              {usuario?.cargo && (
                <span className="text-gray-500 mr-1">{usuario.cargo}:</span>
              )}
              {usuario?.nome || 'Usuário não identificado'}
            </span>
          </div>
          
          {/* Notificações */}
          <NotificacoesDropdown />

          {/* Menu do Usuário */}
          <div className="relative">
            <button
              className="flex items-center gap-2 p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
              data-user-menu-toggle
            >
              {usuario?.fotoPerfil ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={usuario.fotoPerfil}
                    alt={usuario.nome}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {userInitials}
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown do Usuário */}
            {showUserMenu && (
              <div 
                ref={userMenuRef}
                className="absolute top-full right-0 mt-2 min-w-[280px] max-w-[350px] w-auto bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
              >
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    {usuario?.fotoPerfil ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={usuario.fotoPerfil}
                          alt={usuario.nome}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        {userInitials}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{usuario?.nome || 'Usuário'}</div>
                      <div className="text-sm text-gray-600">{usuario?.email || 'usuario@exemplo.com'}</div>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Meu Perfil</span>
                  </Link>
                  <Link
                    href="/configuracoes"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Configurações</span>
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    onClick={handleLogout}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 