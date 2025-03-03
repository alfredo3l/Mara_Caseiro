'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, MapPin, Calendar, Clock, Settings, LogOut, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Dados mockados de vistorias para exemplo
export const vistorias = [
  {
    id: '1',
    endereco: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'Campo Grande',
    data: '2023-06-15',
    hora: '09:00',
    status: 'Pendente',
    tipo: 'Residencial'
  },
  {
    id: '2',
    endereco: 'Av. Afonso Pena, 1500',
    bairro: 'Centro',
    cidade: 'Campo Grande',
    data: '2023-06-16',
    hora: '14:30',
    status: 'Agendada',
    tipo: 'Comercial'
  },
  {
    id: '3',
    endereco: 'Rua Bahia, 320',
    bairro: 'Jardim dos Estados',
    cidade: 'Campo Grande',
    data: '2023-06-14',
    hora: '10:15',
    status: 'Concluída',
    tipo: 'Residencial'
  }
];

interface SidebarVistoriadorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarVistoriador({ isOpen = true, onClose }: SidebarVistoriadorProps) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const menuItems = [
    { href: '/dashboard/vistoriador', icon: <Home size={20} />, label: 'Início' },
    { href: '/dashboard/vistoriador/mapa', icon: <MapPin size={20} />, label: 'Mapa' },
    { href: '/dashboard/vistoriador/agenda', icon: <Calendar size={20} />, label: 'Agenda' },
    { href: '/dashboard/vistoriador/historico', icon: <Clock size={20} />, label: 'Histórico' },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Botão de menu mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowMobileMenu(true)}
          className="p-2 bg-white rounded-full shadow-md"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar para desktop */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-40 transition-all duration-300 w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Vistoriador</h2>
            <button
              onClick={() => {
                setShowMobileMenu(false);
                if (onClose) onClose();
              }}
              className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu de navegação */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Rodapé com botões de configuração e logout */}
          <div className="p-4 border-t">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/vistoriador/configuracoes"
                  className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings size={20} className="mr-3" />
                  <span>Configurações</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    // Lógica de logout aqui
                    console.log('Logout');
                  }}
                  className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Sair</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Overlay para fechar o menu no mobile */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
} 