'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export function LogoutButton({ variant = 'full', className = '' }: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };
  
  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        aria-label="Sair"
      >
        <LogOut className="w-5 h-5 text-gray-600" />
      </button>
    );
  }
  
  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`text-gray-600 hover:text-gray-900 font-medium transition-colors ${className}`}
      >
        {isLoading ? 'Saindo...' : 'Sair'}
      </button>
    );
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
    >
      <LogOut className="w-5 h-5" />
      <span>{isLoading ? 'Saindo...' : 'Sair da conta'}</span>
    </button>
  );
} 