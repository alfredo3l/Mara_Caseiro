'use client';

import { FileText, Home, Users, MapPin } from 'lucide-react';

export type VistoriadorTab = 'dados' | 'ambientes' | 'envolvidos' | 'localizacao';

interface VistoriadorTabBarProps {
  activeTab: VistoriadorTab;
  onTabChange: (tab: VistoriadorTab) => void;
}

const tabs = [
  { id: 'dados', label: 'Dados Gerais', icon: FileText },
  { id: 'ambientes', label: 'Ambientes', icon: Home },
  { id: 'envolvidos', label: 'Envolvidos', icon: Users },
  { id: 'localizacao', label: 'Localização', icon: MapPin },
] as const;

export default function VistoriadorTabBar({ activeTab, onTabChange }: VistoriadorTabBarProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-1.5 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as VistoriadorTab)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive 
                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
} 