'use client';

import { LogOut, Settings, Building2, Sparkles, ChevronLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SidebarImobiliaria({ 
  isOpen, 
  onClose, 
  activeImobiliaria,
  onImobiliariaClick,
  onSettingsClick
}: SidebarImobiliariaProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <>
      {/* Overlay móvel */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1400] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-[1500] pt-2 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo do Governo de Mato Grosso do Sul */}
        <div className="p-3">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center">
              <Image 
                src="/LOGO_CASA_CIVIL.png" 
                alt="Logo do Governo de Mato Grosso do Sul" 
                width={150} 
                height={60} 
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-1 text-center">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                <div>Secretaria de Estado</div>
                <div>da Casa Civil</div>
              </span>
              <span className="block text-sm text-gray-600">Vistoria</span>
            </div>
          </div>
        </div>

        {/* Botão para recolher o sidebar */}
        <button 
          onClick={onClose}
          className="absolute -right-3 top-20 bg-white border border-border rounded-full p-1 text-gray-500 hover:bg-gray-100 shadow-sm"
          title="Recolher menu"
        >
          <ChevronLeftCircle className="w-5 h-5" />
        </button>

        {/* Lista de Imobiliárias */}
        // ... existing code ...
      </aside>
    </>
  );
} 