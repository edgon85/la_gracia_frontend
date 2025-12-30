'use server';

import {
  IUsersResponse,
  IUserFilters,
  ICreateUserRequest,
  IUpdateUserRequest,
  IUserListItem,
} from '@/lib';
import { getToken } from './auth.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Obtener listado de usuarios
export async function getUsersAction(
  filters: IUserFilters = {}
): Promise<IUsersResponse | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());
    if (filters.role) params.append('role', filters.role);

    const url = `${API_URL}/auth/users${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al obtener usuarios',
      };
    }

    const data = await response.json();

    // Si la respuesta es un array directo, lo convertimos al formato esperado
    if (Array.isArray(data)) {
      return {
        data: data,
        meta: {
          total: data.length,
          page: 1,
          lastPage: 1,
        },
      };
    }

    return data as IUsersResponse;
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Obtener usuario por ID
export async function getUserByIdAction(
  id: string
): Promise<IUserListItem | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al obtener usuario',
      };
    }

    const user: IUserListItem = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Crear usuario (solo admin)
export async function createUserAction(
  data: ICreateUserRequest
): Promise<{ success: true; user: IUserListItem } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al crear usuario',
      };
    }

    const userData = await response.json();
    // Removemos el token de la respuesta si existe
    const { token: _, ...userWithoutToken } = userData;
    return { success: true, user: userWithoutToken };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Actualizar usuario (solo admin)
export async function updateUserAction(
  id: string,
  data: IUpdateUserRequest
): Promise<{ success: true; user: IUserListItem } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al actualizar usuario',
      };
    }

    const user: IUserListItem = await response.json();
    return { success: true, user };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Actualizar roles de usuario (endpoint separado)
export async function updateUserRolesAction(
  id: string,
  roles: string[]
): Promise<{ success: true; user: IUserListItem } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/users/${id}/roles`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roles }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al actualizar roles',
      };
    }

    const user: IUserListItem = await response.json();
    return { success: true, user };
  } catch (error) {
    console.error('Error updating user roles:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Cambiar estado de usuario (activar/desactivar)
export async function toggleUserStatusAction(
  id: string
): Promise<{ success: true; user: IUserListItem } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/users/${id}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al cambiar estado del usuario',
      };
    }

    const user: IUserListItem = await response.json();
    return { success: true, user };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Eliminar usuario
export async function deleteUserAction(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al eliminar usuario',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Resetear contraseña de usuario (solo admin)
// Establece una contraseña temporal y activa mustResetPassword
export async function resetUserPasswordAction(
  id: string,
  temporaryPassword: string
): Promise<{ success: true } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/users/${id}/reset-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword: temporaryPassword }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al resetear la contraseña',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error resetting user password:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
