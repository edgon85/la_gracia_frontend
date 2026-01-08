'use client';

import { useAuthStore } from '@/stores/auth.store';
import {
  Module,
  Action,
  hasPermission,
  canAccessRoute,
  getAccessibleModules,
  getRequiredAction,
} from '@/lib/permissions';

/**
 * Hook para verificar permisos del usuario actual
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuthStore();

  const userRoles = user?.roles || [];

  /**
   * Verifica si el usuario puede realizar una acción en un módulo
   */
  const can = (module: Module, action: Action): boolean => {
    if (!isAuthenticated || !user) return false;
    return hasPermission(userRoles, module, action);
  };

  /**
   * Verifica si el usuario puede acceder a una ruta
   */
  const canAccess = (pathname: string): boolean => {
    if (!isAuthenticated || !user) return false;
    return canAccessRoute(userRoles, pathname);
  };

  /**
   * Obtiene los módulos accesibles para el usuario
   */
  const accessibleModules = (): Module[] => {
    if (!isAuthenticated || !user) return [];
    return getAccessibleModules(userRoles);
  };

  /**
   * Shortcuts para permisos comunes
   */
  const canView = (module: Module): boolean => can(module, 'view');
  const canCreate = (module: Module): boolean => can(module, 'create');
  const canEdit = (module: Module): boolean => can(module, 'edit');
  const canDelete = (module: Module): boolean => can(module, 'delete');

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    return userRoles.some(r => r.toLowerCase() === role.toLowerCase());
  };

  /**
   * Verifica si el usuario es admin
   */
  const isAdmin = hasRole('admin');

  /**
   * Verifica si el usuario es auditor
   */
  const isAuditor = hasRole('auditor');

  /**
   * Verifica si el usuario tiene acceso de solo lectura (auditor)
   */
  const isReadOnly = isAuditor && !isAdmin;

  return {
    // Estado
    user,
    userRoles,
    isAuthenticated,

    // Verificación de permisos
    can,
    canAccess,
    canView,
    canCreate,
    canEdit,
    canDelete,

    // Utilidades
    accessibleModules,
    hasRole,
    isAdmin,
    isAuditor,
    isReadOnly,

    // Helper para obtener acción requerida
    getRequiredAction,
  };
}
