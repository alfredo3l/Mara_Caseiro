'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useUsuario } from '@/contexts/UsuarioContext';

interface HeaderProps {
  onMenuClick: () => void;
  fullWidth?: boolean;
  isMenuOpen?: boolean;
  isMobile?: boolean;
}

export function Header({ onMenuClick, fullWidth = false, isMenuOpen = false, isMobile = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState('gestor');

  const pathname = usePathname();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { usuario } = useUsuario();

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

  // Detecta o perfil ativo baseado na URL
  useEffect(() => {
    if (pathname?.includes('/dashboard/imobiliaria')) {
      setActiveProfile('imobiliaria');
    } else if (pathname?.includes('/dashboard/vistoriador')) {
      setActiveProfile('vistoriador');
    } else if (pathname?.includes('/dashboard/gestor') || pathname === '/dashboard') {
      setActiveProfile('gestor');
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dados mockados de notificações
  const notifications = [
    {
      id: 1,
      title: 'Nova solicitação de vistoria',
      description: 'Imobiliária ABC solicitou uma nova vistoria para o imóvel XYZ.',
      time: 'Há 5 minutos',
      isNew: true,
    },
    {
      id: 2,
      title: 'Vistoria concluída',
      description: 'A vistoria do imóvel XYZ foi concluída pelo vistoriador João Silva.',
      time: 'Há 2 horas',
      isNew: true,
    },
    {
      id: 3,
      title: 'Novo contrato aprovado',
      description: 'O contrato do imóvel ABC foi aprovado e está pronto para assinatura.',
      time: 'Há 1 dia',
      isNew: false,
    },
  ];

  const handleLogout = (): void => {
    // Simulação de logout - em uma aplicação real, você chamaria uma API de logout
    localStorage.removeItem('usuario');
    router.push('/');
  };

  const handleProfileChange = (profile: string) => {
    setActiveProfile(profile);
    setIsMobileMenuOpen(false);

    switch (profile) {
      case 'gestor':
        router.push('/dashboard/gestor');
        break;
      case 'imobiliaria':
        router.push('/dashboard/imobiliaria');
        break;
      case 'vistoriador':
        router.push('/dashboard/vistoriador');
        break;
      default:
        router.push('/dashboard');
        break;
    }
  };

  return (
    <header className={`h-14 bg-white border-b border-border fixed top-0 right-0 z-[900] ${
      isMenuOpen ? 'left-64' : 'left-0'
    }`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mostra o menu apenas quando não for fullWidth e estiver em mobile */}
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Alternar menu lateral"
              title="Alternar menu lateral"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
          {/* Logo visível apenas quando for fullWidth (sem sidebar) */}
          {fullWidth && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Deputada Mara Caseiro
            </span>
          )}
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-4">
          {/* Informações do Usuário Logado */}
          <div className="hidden md:flex items-center">
            <span className="text-sm font-medium text-gray-700">
              {usuario?.cargo && (
                <span className="text-gray-500 mr-1">{usuario.cargo}:</span>
              )}
              {usuario?.nome || 'Usuário não identificado'}
            </span>
          </div>
          
          {/* Notificações */}
          <div ref={notificationsRef} className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors relative"
              aria-label="Abrir notificações"
              title="Abrir notificações"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Menu de Notificações */}
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-1 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-border py-2 z-[1001]">
                <div className="px-4 py-2 border-b border-border">
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative"
                    >
                      {notification.isNew && (
                        <span className="absolute right-4 top-3 w-2 h-2 bg-primary rounded-full"></span>
                      )}
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{notification.description}</p>
                      <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-sm text-primary hover:text-primary-light transition-colors w-full text-center">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu do Perfil */}
          <div ref={mobileMenuRef} className="relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden border border-gray-200"
              aria-label="Abrir menu do perfil"
              title="Abrir menu do perfil"
              aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
              aria-haspopup="true"
              ref={profileButtonRef}
              id="profile-button"
            >
              <div className="relative w-8 h-8">
                {usuario?.fotoPerfil ? (
                  <Image
                    src={usuario.fotoPerfil}
                    alt={usuario.nome || 'Foto de perfil'}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                    {userInitials}
                  </div>
                )}
              </div>
            </button>

            {isMobileMenuOpen && (
              <div 
                className="absolute top-full right-0 mt-1 min-w-[280px] max-w-[350px] w-auto bg-white rounded-lg shadow-lg border border-border py-1 z-[1001]"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="profile-button"
              >
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-gray-900">{usuario?.nome || 'Usuário'}</p>
                  <p className="text-xs text-gray-600">{usuario?.email || 'usuario@exemplo.com'}</p>
                </div>
                <button 
                  onClick={() => handleProfileChange('gestor')}
                  className={`w-full px-4 py-2 text-left ${
                    activeProfile === 'gestor' 
                      ? 'bg-primary text-white hover:bg-primary-light' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  role="menuitem"
                  title="Mudar para Perfil Gestor"
                  aria-label="Mudar para Perfil Gestor"
                  aria-current={activeProfile === 'gestor' ? "true" : "false"}
                >
                  Perfil Gestor
                </button>
                <button 
                  onClick={() => handleProfileChange('imobiliaria')}
                  className={`w-full px-4 py-2 text-left ${
                    activeProfile === 'imobiliaria' 
                      ? 'bg-primary text-white hover:bg-primary-light' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  role="menuitem"
                  title="Mudar para Perfil Imobiliária"
                  aria-label="Mudar para Perfil Imobiliária"
                  aria-current={activeProfile === 'imobiliaria' ? "true" : "false"}
                >
                  Perfil Imobiliária
                </button>
                <button 
                  onClick={() => handleProfileChange('vistoriador')}
                  className={`w-full px-4 py-2 text-left ${
                    activeProfile === 'vistoriador' 
                      ? 'bg-primary text-white hover:bg-primary-light' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  role="menuitem"
                  title="Mudar para Perfil Vistoriador"
                  aria-label="Mudar para Perfil Vistoriador"
                  aria-current={activeProfile === 'vistoriador' ? "true" : "false"}
                >
                  Perfil Vistoriador
                </button>
                <div className="border-t border-border mt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-600"
                    role="menuitem"
                    title="Sair da conta"
                    aria-label="Sair da conta"
                  >
                    Sair
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