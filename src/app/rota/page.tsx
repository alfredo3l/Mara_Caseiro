'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

const PROFILES = {
  GESTOR: 'gestor',
  VISTORIADOR: 'vistoriador',
  IMOBILIARIA: 'imobiliaria'
} as const;

type UserProfile = typeof PROFILES[keyof typeof PROFILES];

export default function Rota() {
  useEffect(() => {
    const userProfile = 'vistoriador' as UserProfile;

    switch (userProfile) {
      case PROFILES.GESTOR:
        redirect('/dashboard');
        break;
      case PROFILES.VISTORIADOR:
        redirect('/dashboard/vistoriador');
        break;
      case PROFILES.IMOBILIARIA:
        redirect('/dashboard/imobiliaria');
        break;
      default:
        redirect('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
        <p className="text-gray-600">Redirecionando para sua área</p>
      </div>
    </div>
  );
} 