'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Bell, Menu } from 'lucide-react';

export default function Header({ onMenuClick, isMenuOpen }: { onMenuClick: () => void, isMenuOpen: boolean }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Nova vistoria agendada',
      description: 'Imob Premium - Rua das Flores, 123',
      time: '5 minutos atrás',
      isNew: true,
    },
    {
      id: 2,
      title: 'Vistoria concluída',
      description: 'Imob Plus - Av. Principal, 456',
      time: '1 hora atrás',
      isNew: true,
    },
    {
      id: 3,
      title: 'Relatório disponível',
      description: 'Vistoria #123 - Imob Master',
      time: '2 horas atrás',
      isNew: false,
    },
  ];

  return (
    <header className={`h-14 bg-white border-b border-border fixed top-0 z-10 ${
      isMenuOpen ? 'left-64' : 'left-0'
    } right-0`}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <>
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Deputada Mara Caseiro
              </span>
            </>
          )}
          {!isMobile && (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                title="Abrir menu de perfis"
                aria-label="Abrir menu de seleção de perfis"
                aria-expanded={isProfileOpen ? "true" : "false"}
                id="profile-menu-button"
              >
                <span className="text-primary font-medium">Perfil Gestor</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {isProfileOpen && (
                <div 
                  className="absolute top-full mt-1 min-w-[280px] max-w-[350px] w-auto bg-white rounded-lg shadow-lg border border-border py-1 z-50"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="profile-menu-title"
                >
                  <h3 id="profile-menu-title" className="sr-only">Menu de perfis</h3>
                  <div role="group" aria-label="Opções de perfil">
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-600"
                      title="Mudar para Perfil Gestor"
                      aria-label="Mudar para Perfil Gestor"
                    >
                      Perfil Gestor
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-600"
                      title="Mudar para Perfil Imobiliária"
                      aria-label="Mudar para Perfil Imobiliária"
                    >
                      Perfil Imobiliária
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-600"
                      title="Mudar para Perfil Vistoriador"
                      aria-label="Mudar para Perfil Vistoriador"
                    >
                      Perfil Vistoriador
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-4">
          {/* Notificações */}
          <div ref={notificationsRef} className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors relative"
              title="Abrir notificações"
              aria-label="Abrir menu de notificações"
              aria-expanded={isNotificationsOpen ? "true" : "false"}
              id="notifications-menu-button"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Menu de Notificações */}
            {isNotificationsOpen && (
              <div 
                className="absolute top-full right-0 mt-1 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-border py-2 z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="notifications-title"
              >
                <div className="px-4 py-2 border-b border-border">
                  <h3 id="notifications-title" className="font-semibold text-gray-900">Notificações</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative"
                      role="listitem"
                    >
                      {notification.isNew && (
                        <span 
                          className="absolute right-4 top-3 w-2 h-2 bg-primary rounded-full"
                          role="status"
                          aria-label="Notificação não lida"
                        ></span>
                      )}
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{notification.description}</p>
                      <span className="text-xs text-gray-500 mt-1">{notification.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button 
                    className="text-sm text-primary hover:text-primary-light transition-colors w-full text-center"
                    title="Ver todas as notificações"
                    aria-label="Ver todas as notificações"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Mobile */}
          {isMobile ? (
            <div ref={mobileMenuRef} className="relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-8 h-8 rounded-full overflow-hidden"
                title="Abrir menu do usuário"
                aria-label="Abrir menu do usuário"
                aria-expanded={isMobileMenuOpen ? "true" : "false"}
                id="mobile-menu-button"
              >
                <img
                  src="https://media.licdn.com/dms/image/v2/C4E03AQFy5omIcTocVg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1657212319358?e=2147483647&v=beta&t=UsUia-5GvPBUz9AFC6nzzDe_bEuKB4sOxQxi0YzitVg"
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              </button>

              {isMobileMenuOpen && (
                <div 
                  className="absolute top-full right-0 mt-1 min-w-[280px] max-w-[350px] w-auto bg-white rounded-lg shadow-lg border border-border py-1 z-50"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mobile-menu-title"
                >
                  <h3 id="mobile-menu-title" className="sr-only">Menu do usuário</h3>
                  <div role="group" aria-label="Opções de perfil">
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-600"
                      title="Mudar para Perfil Gestor"
                      aria-label="Mudar para Perfil Gestor"
                    >
                      Perfil Gestor
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-600"
                      title="Mudar para Perfil Imobiliária"
                      aria-label="Mudar para Perfil Imobiliária"
                    >
                      Perfil Imobiliária
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-600"
                      title="Mudar para Perfil Vistoriador"
                      aria-label="Mudar para Perfil Vistoriador"
                    >
                      Perfil Vistoriador
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src="https://media.licdn.com/dms/image/v2/C4E03AQFy5omIcTocVg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1657212319358?e=2147483647&v=beta&t=UsUia-5GvPBUz9AFC6nzzDe_bEuKB4sOxQxi0YzitVg"
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 
