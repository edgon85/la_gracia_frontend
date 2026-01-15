// Sistema de permisos por rol
// Fase 1: Permisos básicos para gestión de inventario y usuarios

// Los roles coinciden con ValidRoles del backend (todos en minúsculas)
export type UserRole = 'admin' | 'user' | 'pharmacy' | 'warehouse' | 'doctor' | 'nurse' | 'auditor';

// Módulos disponibles en la aplicación
export type Module =
  | 'dashboard'
  | 'profile'
  | 'products'
  | 'categories'
  | 'providers'
  | 'pharmacy'
  | 'warehouse'
  | 'users';

// Acciones disponibles por módulo
export type Action = 'view' | 'create' | 'edit' | 'delete';

// Tipo para definir permisos: módulo -> acciones permitidas
export type ModulePermissions = {
  [key in Module]?: Action[];
};

// Definición de permisos por rol
// Los nombres de los roles coinciden con los que vienen del backend (normalizados a minúsculas)
export const ROLE_PERMISSIONS: Record<UserRole, ModulePermissions> = {
  // Admin: acceso total a todo
  admin: {
    dashboard: ['view'],
    profile: ['view', 'edit'],
    products: ['view', 'create', 'edit', 'delete'],
    categories: ['view', 'create', 'edit', 'delete'],
    providers: ['view', 'create', 'edit', 'delete'],
    pharmacy: ['view', 'create', 'edit', 'delete'],
    warehouse: ['view', 'create', 'edit', 'delete'],
    users: ['view', 'create', 'edit', 'delete'],
  },

  // Auditor: acceso a todo pero solo lectura (para fase 2: reportes)
  auditor: {
    dashboard: ['view'],
    profile: ['view', 'edit'],
    products: ['view'],
    categories: ['view'],
    providers: ['view'],
    pharmacy: ['view'],
    warehouse: ['view'],
    users: ['view'],
  },

  // Warehouse: gestión de inventario de bodega
  warehouse: {
    dashboard: ['view'],
    profile: ['view', 'edit'],
    products: ['view', 'create', 'edit', 'delete'],
    categories: ['view', 'create', 'edit', 'delete'],
    providers: ['view', 'create', 'edit', 'delete'],
    warehouse: ['view', 'create', 'edit', 'delete'],
    pharmacy: ['view'],
  },

  // Pharmacy: gestión de despachos de farmacia
  pharmacy: {
    dashboard: ['view'],
    profile: ['view', 'edit'],
    products: ['view'],
    categories: ['view'],
    pharmacy: ['view', 'create', 'edit'],
    warehouse: ['view'],
  },

  // Doctor: ver farmacia (fase 2: solicitar medicamentos)
  doctor: {
    dashboard: ['view'],
    profile: ['view', 'edit'],
    pharmacy: ['view'],
  },

  // Nurse: acceso básico (fase 2: ver pacientes)
  nurse: {
    dashboard: ['view'],
    profile: ['view', 'edit'],
    pharmacy: ['view'],
  },

  // User: acceso mínimo
  user: {
    dashboard: ['view'],
    profile: ['view', 'edit'],
  },
};

// Mapeo de rutas a módulos
export const ROUTE_TO_MODULE: Record<string, Module> = {
  '/dashboard': 'dashboard',
  '/dashboard/profile': 'profile',
  '/dashboard/products': 'products',
  '/dashboard/products/new': 'products',
  '/dashboard/categories': 'categories',
  '/dashboard/categories/new': 'categories',
  '/dashboard/providers': 'providers',
  '/dashboard/providers/new': 'providers',
  // Pharmacy
  '/dashboard/pharmacy': 'pharmacy',
  '/dashboard/pharmacy/products': 'pharmacy',
  '/dashboard/pharmacy/dispensations': 'pharmacy',
  '/dashboard/pharmacy/expiring': 'pharmacy',
  // Warehouse
  '/dashboard/warehouse': 'warehouse',
  '/dashboard/warehouse/products': 'warehouse',
  '/dashboard/warehouse/dispensations': 'warehouse',
  '/dashboard/warehouse/expiring': 'warehouse',
  // Users
  '/dashboard/users': 'users',
  '/dashboard/users/new': 'users',
};

// Mapeo de rutas a acciones requeridas
export const ROUTE_TO_ACTION: Record<string, Action> = {
  '/dashboard': 'view',
  '/dashboard/profile': 'view',
  '/dashboard/products': 'view',
  '/dashboard/products/new': 'create',
  '/dashboard/categories': 'view',
  '/dashboard/categories/new': 'create',
  '/dashboard/providers': 'view',
  '/dashboard/providers/new': 'create',
  // Pharmacy
  '/dashboard/pharmacy': 'view',
  '/dashboard/pharmacy/products': 'view',
  '/dashboard/pharmacy/dispensations': 'view',
  '/dashboard/pharmacy/expiring': 'view',
  // Warehouse
  '/dashboard/warehouse': 'view',
  '/dashboard/warehouse/products': 'view',
  '/dashboard/warehouse/dispensations': 'view',
  '/dashboard/warehouse/expiring': 'view',
  // Users
  '/dashboard/users': 'view',
  '/dashboard/users/new': 'create',
};

/**
 * Verifica si un rol tiene permiso para una acción en un módulo
 */
export function hasPermission(
  userRoles: string[],
  module: Module,
  action: Action
): boolean {
  // Normalizar roles a minúsculas para comparación
  const normalizedRoles = userRoles.map(r => r.toLowerCase() as UserRole);

  return normalizedRoles.some(role => {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;

    const moduleActions = permissions[module];
    if (!moduleActions) return false;

    return moduleActions.includes(action);
  });
}

/**
 * Verifica si un rol puede acceder a una ruta específica
 */
export function canAccessRoute(userRoles: string[], pathname: string): boolean {
  // Manejar rutas dinámicas (ej: /dashboard/products/[id]/edit)
  const normalizedPath = normalizePath(pathname);

  const module = ROUTE_TO_MODULE[normalizedPath];
  const action = ROUTE_TO_ACTION[normalizedPath];

  // Si la ruta no está mapeada, denegar acceso por defecto
  if (!module) {
    console.warn(`Ruta no mapeada en permisos: ${pathname}`);
    return false;
  }

  return hasPermission(userRoles, module, action || 'view');
}

/**
 * Normaliza rutas dinámicas para comparación
 */
function normalizePath(pathname: string): string {
  // /dashboard/products/abc123/edit -> /dashboard/products/new (para crear)
  // o determinar si es edit

  // Detectar rutas de edición
  if (pathname.match(/\/dashboard\/products\/[^/]+\/edit$/)) {
    return '/dashboard/products'; // Requiere permiso 'edit' en products
  }
  if (pathname.match(/\/dashboard\/categories\/[^/]+\/edit$/)) {
    return '/dashboard/categories';
  }
  if (pathname.match(/\/dashboard\/providers\/[^/]+\/edit$/)) {
    return '/dashboard/providers';
  }
  if (pathname.match(/\/dashboard\/users\/[^/]+\/edit$/)) {
    return '/dashboard/users';
  }

  return pathname;
}

/**
 * Obtiene la acción requerida para una ruta (considerando rutas dinámicas)
 */
export function getRequiredAction(pathname: string): Action {
  // Rutas de edición
  if (pathname.includes('/edit')) {
    return 'edit';
  }
  // Rutas de creación
  if (pathname.endsWith('/new')) {
    return 'create';
  }
  // Por defecto, solo vista
  return 'view';
}

/**
 * Obtiene todos los módulos accesibles para un conjunto de roles
 */
export function getAccessibleModules(userRoles: string[]): Module[] {
  const normalizedRoles = userRoles.map(r => r.toLowerCase() as UserRole);
  const modules = new Set<Module>();

  normalizedRoles.forEach(role => {
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions) {
      Object.keys(permissions).forEach(module => {
        modules.add(module as Module);
      });
    }
  });

  return Array.from(modules);
}

/**
 * Verifica si el usuario puede realizar una acción específica
 */
export function canPerformAction(
  userRoles: string[],
  module: Module,
  action: Action
): boolean {
  return hasPermission(userRoles, module, action);
}
