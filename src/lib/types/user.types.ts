// Interfaz de usuario para listado (sin token)
export interface IUserListItem {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
}

// Respuesta paginada de usuarios
export interface IUsersResponse {
  data: IUserListItem[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

// Filtros para listado de usuarios
export interface IUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  role?: string;
}

// Request para crear usuario (registro por admin)
export interface ICreateUserRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
  roles?: string[];
}

// Request para actualizar usuario (sin roles - tienen endpoint separado)
export interface IUpdateUserRequest {
  email?: string;
  username?: string;
  fullName?: string;
}

// Roles disponibles
export const USER_ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
  { value: 'pharmacy', label: 'Farmacia' },
  { value: 'warehouse', label: 'Bodega' },
  { value: 'doctor', label: 'Médico' },
  { value: 'nurse', label: 'Enfermero' },
  { value: 'auditor', label: 'Auditor' },
] as const;
