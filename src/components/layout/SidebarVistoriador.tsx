import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Calendar, Clock, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Dados de exemplo para vistorias
export const vistorias = [
  {
    id: '1',
    endereco: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'Campo Grande',
    data: '2023-06-15',
    hora: '14:00',
    status: 'Pendente',
    cliente: 'João Silva',
    telefone: '(67) 99999-8888',
    tipo: 'Residencial',
    ambientes: ['Sala', 'Cozinha', 'Quarto 1', 'Banheiro']
  },
  {
    id: '2',
    endereco: 'Av. Afonso Pena, 1500',
    bairro: 'Amambaí',
    cidade: 'Campo Grande',
    data: '2023-06-16',
    hora: '10:30',
    status: 'Agendada',
    cliente: 'Maria Oliveira',
    telefone: '(67) 98888-7777',
    tipo: 'Comercial',
    ambientes: ['Recepção', 'Escritório', 'Sala de Reunião', 'Copa']
  },
  {
    id: '3',
    endereco: 'Rua Bahia, 456',
    bairro: 'São Francisco',
    cidade: 'Campo Grande',
    data: '2023-06-14',
    hora: '09:00',
    status: 'Concluída',
    cliente: 'Carlos Pereira',
    telefone: '(67) 97777-6666',
    tipo: 'Residencial',
    ambientes: ['Sala', 'Cozinha', 'Quarto 1', 'Quarto 2', 'Banheiro']
  }
];

interface SidebarVistoriadorProps {
  isOpen: boolean;
  onClose: () => void;
  activeVistoria: string;
  setActiveVistoria: (id: string) => void;
  onShowSettings: () => void;
}

export default function SidebarVistoriador({
  isOpen,
  onClose,
  activeVistoria,
  setActiveVistoria,
  onShowSettings
}: SidebarVistoriadorProps) {
  const pathname = usePathname();
  const [expandedVistoria, setExpandedVistoria] = useState<string | null>(null);

  const toggleVistoriaExpand = (id: string) => {
    setExpandedVistoria(expandedVistoria === id ? null : id);
  };

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/dashboard/vistoriador" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold">EV</span>
              </div>
              <span className="font-semibold text-gray-900">Evolução Vistoria</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              <Link
                href="/dashboard/vistoriador"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  pathname === '/dashboard/vistoriador'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Início</span>
              </Link>

              {/* Vistorias */}
              <div className="pt-4">
                <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Minhas Vistorias
                </h3>
                <div className="space-y-1">
                  {vistorias.map((vistoria) => (
                    <div key={vistoria.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveVistoria(vistoria.id);
                          toggleVistoriaExpand(vistoria.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg ${
                          activeVistoria === vistoria.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{vistoria.endereco}</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            expandedVistoria === vistoria.id ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {expandedVistoria === vistoria.id && (
                        <div className="pl-10 space-y-1">
                          <div className="px-3 py-1 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(vistoria.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <div className="px-3 py-1 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{vistoria.hora}</span>
                            </div>
                          </div>
                          <div className="px-3 py-1 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span>{vistoria.cliente}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                onShowSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5" />
              <span>Meu Perfil</span>
            </button>
            <Link
              href="/login"
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
} 