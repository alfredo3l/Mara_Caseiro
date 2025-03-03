'use client';

import { Calendar, Loader2, CheckCircle2, Plus, Building2 } from 'lucide-react';

export type ImobiliariaInspectionStatus = 'agendadas' | 'andamento' | 'finalizadas' | 'imoveis';

interface ImobiliariaTabBarProps {
  activeTab: ImobiliariaInspectionStatus;
  onTabChange: (tab: ImobiliariaInspectionStatus) => void;
  onAddInspection?: () => void;
}

const tabs = [
  { id: 'agendadas', label: 'Agendadas', icon: Calendar },
  { id: 'andamento', label: 'Em Andamento', icon: Loader2 },
  { id: 'finalizadas', label: 'Finalizadas', icon: CheckCircle2 },
  { id: 'imoveis', label: 'Imóveis', icon: Building2 },
] as const;

export default function ImobiliariaTabBar({ activeTab, onTabChange, onAddInspection }: ImobiliariaTabBarProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-1.5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ImobiliariaInspectionStatus)}
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
      
      <button
        onClick={onAddInspection}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Nova Vistoria</span>
      </button>
    </div>
  );
}