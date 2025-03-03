'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Bell,
  BellOff,
  AlertCircle,
  Palette,
  Building2,
  Users,
  Crown,
  Sparkles,
  Shield,
  FileText,
  Pencil,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { NotificationsDialog, PlansDialog, ProfileDialog, PasswordDialog, SignatureDialog, ThemeDialog, InspectionConfigDialog } from './dialogs/SettingsDialogs';

export default function SettingsManager() {
  const [activeDialog, setActiveDialog] = useState<'notifications' | 'plans' | 'profile' | 'password' | 'signature' | 'theme' | 'inspectionConfig' | null>(null);

  return (
    <>
      <div className="space-y-6">
        {/* Perfil e Conta */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-gray-900">Perfil e Conta</h2>
            <p className="text-sm text-gray-600 mt-1">Gerencie suas informações pessoais e preferências</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="flex items-start justify-between group">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Informações Pessoais</h3>
                  <p className="text-sm text-gray-600 mt-1">Paulo Morales</p>
                  <p className="text-sm text-gray-600">paulomorales@gmail.com</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDialog('profile')}
                className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                title="Editar informações pessoais"
                aria-label="Editar informações pessoais"
              >
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Editar informações pessoais</span>
              </button>
            </div>

            {/* Senha e Segurança */}
            <div className="flex items-start justify-between group">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Senha e Segurança</h3>
                  <p className="text-sm text-gray-600 mt-1">Última alteração: 15 dias atrás</p>
                  <button 
                    onClick={() => setActiveDialog('password')}
                    className="text-sm text-primary hover:text-primary-light transition-colors mt-2"
                  >
                    Alterar senha
                  </button>
                </div>
              </div>
            </div>

            {/* Assinatura Digital */}
            <div className="flex items-start justify-between group">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Assinatura Digital</h3>
                  <p className="text-sm text-gray-600 mt-1">Assinatura válida até 31/12/2024</p>
                  <button 
                    onClick={() => setActiveDialog('signature')}
                    className="text-sm text-primary hover:text-primary-light transition-colors mt-2"
                  >
                    Gerenciar assinatura
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações do Sistema */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-gray-900">Configurações do Sistema</h2>
            <p className="text-sm text-gray-600 mt-1">Personalize o funcionamento da plataforma</p>
          </div>

          <div className="divide-y divide-border">
            {/* Notificações */}
            <button 
              onClick={() => setActiveDialog('notifications')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Notificações</h3>
                  <p className="text-sm text-gray-600">Configurar alertas e lembretes</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Aparência */}
            <button 
              onClick={() => setActiveDialog('theme')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Personalizar Tema</h3>
                  <p className="text-sm text-gray-600">Escolher cores do sistema</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Permissões */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Permissões</h3>
                  <p className="text-sm text-gray-600">Gerenciar níveis de acesso</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Configurações de Negócio */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-gray-900">Configurações de Negócio</h2>
            <p className="text-sm text-gray-600 mt-1">Gerencie as regras e processos do sistema</p>
          </div>

          <div className="divide-y divide-border">
            {/* Vistorias */}
            <button 
              onClick={() => setActiveDialog('inspectionConfig')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Vistorias</h3>
                  <p className="text-sm text-gray-600">Configurar regras e limites</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Imobiliárias */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Imobiliárias</h3>
                  <p className="text-sm text-gray-600">Configurar regras e limites</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Vistoriadores */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Vistoriadores</h3>
                  <p className="text-sm text-gray-600">Definir padrões e limites</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Planos e Assinaturas */}
            <button 
              onClick={() => setActiveDialog('plans')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Planos e Assinaturas</h3>
                  <p className="text-sm text-gray-600">Gerenciar planos e recursos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Recursos Premium */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Recursos Premium</h3>
                  <p className="text-sm text-gray-600">Ativar/desativar funcionalidades</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <NotificationsDialog
        isOpen={activeDialog === 'notifications'}
        onClose={() => setActiveDialog(null)}
      />
      <PlansDialog
        isOpen={activeDialog === 'plans'}
        onClose={() => setActiveDialog(null)}
      />
      <ProfileDialog
        isOpen={activeDialog === 'profile'}
        onClose={() => setActiveDialog(null)}
      />
      <PasswordDialog
        isOpen={activeDialog === 'password'}
        onClose={() => setActiveDialog(null)}
      />
      <SignatureDialog
        isOpen={activeDialog === 'signature'}
        onClose={() => setActiveDialog(null)}
      />
      <ThemeDialog
        isOpen={activeDialog === 'theme'}
        onClose={() => setActiveDialog(null)}
      />

      {/* Modal de Configuração de Vistorias */}
      <InspectionConfigDialog
        isOpen={activeDialog === 'inspectionConfig'}
        onClose={() => setActiveDialog(null)}
      />
    </>
  );
} 