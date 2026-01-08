'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Module, Action } from '@/lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Módulo requerido para acceder */
  module?: Module;
  /** Acción requerida (por defecto: 'view') */
  action?: Action;
  /** Ruta a la que redirigir si no tiene permisos */
  fallbackUrl?: string;
  /** Mostrar mensaje de acceso denegado en lugar de redirigir */
  showAccessDenied?: boolean;
}

/**
 * Componente que protege rutas basándose en permisos del usuario
 */
export function ProtectedRoute({
  children,
  module,
  action = 'view',
  fallbackUrl = '/dashboard',
  showAccessDenied = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, canAccess, can, user } = usePermissions();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Esperar a que se cargue el estado de autenticación
    if (!user && isAuthenticated === false) {
      setIsChecking(false);
      return;
    }

    if (!user) {
      return; // Todavía cargando
    }

    let access = false;

    if (module) {
      // Verificar permiso específico de módulo/acción
      access = can(module, action);
    } else {
      // Verificar acceso basado en la ruta actual
      access = canAccess(pathname);
    }

    setHasAccess(access);
    setIsChecking(false);

    if (!access && !showAccessDenied) {
      router.replace(fallbackUrl);
    }
  }, [user, isAuthenticated, module, action, pathname, canAccess, can, router, fallbackUrl, showAccessDenied]);

  // Mostrar loading mientras se verifica
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mostrar mensaje de acceso denegado
  if (!hasAccess && showAccessDenied) {
    return <AccessDeniedMessage />;
  }

  // Si no tiene acceso y no se muestra mensaje, no renderizar nada (ya redirigió)
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Componente de mensaje de acceso denegado
 */
function AccessDeniedMessage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4">
        <svg
          className="w-12 h-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Acceso Denegado
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        No tienes permisos para acceder a esta sección. Contacta al administrador si crees que esto es un error.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al Inicio
      </button>
    </div>
  );
}

/**
 * HOC para proteger páginas completas
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
