'use client';

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  width?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  isOpen = true,
  onClose,
  width = '320px'
}) => {
  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-full overflow-y-auto transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
      style={{ width, minWidth: width, maxWidth: '100%' }}
    >
      <div className="flex flex-col h-full">
        {onClose && (
          <div className="flex justify-end p-2 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 