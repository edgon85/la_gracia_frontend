'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, Settings, ChevronDown } from 'lucide-react';
import { LogoutButton } from '../buttons';
import { useAuthStore } from '@/stores/auth.store';
import { usePermissions } from '@/hooks/usePermissions';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = (props: NavbarProps) => {
  const { onMenuClick } = props;
  const router = useRouter();
  const { user } = useAuthStore();
  const { canView } = usePermissions();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Obtener iniciales del nombre
  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Obtener el rol principal para mostrar
  const getPrimaryRole = (roles: string[]) => {
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('FARMACIA')) return 'Farmacia';
    if (roles.includes('BODEGA')) return 'Bodega';
    if (roles.includes('MEDICO')) return 'Médico';
    if (roles.includes('ENFERMERO')) return 'Enfermero';
    if (roles.includes('AUDITOR')) return 'Auditor';
    return roles[0] || 'Usuario';
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="hidden md:block">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              La Gracia - Sistema de Inventario
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user ? getInitials(user.fullName) : '??'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.fullName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user ? getPrimaryRole(user.roles) : 'Cargando...'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.fullName || 'Usuario'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.username || ''}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/dashboard/profile');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Mi perfil</span>
                    </button>
                    {canView('settings') && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push('/dashboard/settings');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </button>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <LogoutButton />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
