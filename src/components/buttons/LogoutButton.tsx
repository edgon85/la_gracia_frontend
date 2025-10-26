import { logoutAction } from '@/actions/auth.actions';
import { LogOut } from 'lucide-react';
import React from 'react';

export const LogoutButton = () => {
  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      <LogOut className="w-5 h-5" />
      <span>Cerrar sesión</span>
    </button>
  );
};
