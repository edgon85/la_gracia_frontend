'use server';

import {
  IProvidersResponse,
  IProviderFilters,
  ICreateProviderRequest,
  IProvider,
  IProviderContact,
  ICreateContactRequest,
  IUpdateContactRequest,
  ContactDepartment,
} from '@/lib';
import { getToken } from './auth.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getProvidersAction(
  filters: IProviderFilters = {}
): Promise<IProvidersResponse | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    // Construir query params
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const url = `${API_URL}/providers${queryString ? `?${queryString}` : ''}`;

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
        error: errorData.message || 'Error al obtener proveedores',
      };
    }

    const data: IProvidersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching providers:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function createProviderAction(
  data: ICreateProviderRequest
): Promise<{ success: true; provider: IProvider } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    console.log('Creating provider with data:', data);

    const response = await fetch(`${API_URL}/providers`, {
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
        error: errorData.message || 'Error al crear proveedor',
      };
    }

    const provider: IProvider = await response.json();
    return { success: true, provider };
  } catch (error) {
    console.error('Error creating provider:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getProviderByIdAction(
  id: string
): Promise<IProvider | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/${id}`, {
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
        error: errorData.message || 'Error al obtener proveedor',
      };
    }

    const provider: IProvider = await response.json();
    return provider;
  } catch (error) {
    console.error('Error fetching provider:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function updateProviderAction(
  id: string,
  data: Partial<ICreateProviderRequest>
): Promise<{ success: true; provider: IProvider } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/${id}`, {
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
        error: errorData.message || 'Error al actualizar proveedor',
      };
    }

    const provider: IProvider = await response.json();
    return { success: true, provider };
  } catch (error) {
    console.error('Error updating provider:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function toggleProviderStatusAction(
  id: string
): Promise<{ success: true; provider: IProvider } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/${id}/toggle-active`, {
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
        error: errorData.message || 'Error al cambiar estado del proveedor',
      };
    }

    const provider: IProvider = await response.json();
    return { success: true, provider };
  } catch (error) {
    console.error('Error toggling provider status:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function deleteProviderAction(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/${id}`, {
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
        error: errorData.message || 'Error al eliminar proveedor',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting provider:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ==================== CONTACTOS DE PROVEEDOR ====================

/**
 * Obtiene todos los contactos de un proveedor
 * GET /providers/:providerId/contacts
 */
export async function getProviderContactsAction(
  providerId: string
): Promise<IProviderContact[] | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/${providerId}/contacts`, {
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
        error: errorData.message || 'Error al obtener contactos',
      };
    }

    const contacts: IProviderContact[] = await response.json();
    return contacts;
  } catch (error) {
    console.error('Error fetching provider contacts:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene contactos por departamento
 * GET /providers/:providerId/contacts/department/:department
 */
export async function getProviderContactsByDepartmentAction(
  providerId: string,
  department: ContactDepartment
): Promise<IProviderContact[] | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(
      `${API_URL}/providers/${providerId}/contacts/department/${department}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al obtener contactos',
      };
    }

    const contacts: IProviderContact[] = await response.json();
    return contacts;
  } catch (error) {
    console.error('Error fetching provider contacts by department:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Agrega un contacto a un proveedor
 * POST /providers/:providerId/contacts
 */
export async function addProviderContactAction(
  providerId: string,
  data: ICreateContactRequest
): Promise<{ success: true; contact: IProviderContact } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/${providerId}/contacts`, {
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
        error: errorData.message || 'Error al agregar contacto',
      };
    }

    const contact: IProviderContact = await response.json();
    return { success: true, contact };
  } catch (error) {
    console.error('Error adding provider contact:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Actualiza un contacto
 * PATCH /providers/contacts/:contactId
 */
export async function updateProviderContactAction(
  contactId: string,
  data: IUpdateContactRequest
): Promise<{ success: true; contact: IProviderContact } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/contacts/${contactId}`, {
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
        error: errorData.message || 'Error al actualizar contacto',
      };
    }

    const contact: IProviderContact = await response.json();
    return { success: true, contact };
  } catch (error) {
    console.error('Error updating provider contact:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Activa/Desactiva un contacto
 * PATCH /providers/contacts/:contactId/toggle-active
 */
export async function toggleProviderContactStatusAction(
  contactId: string
): Promise<{ success: true; contact: IProviderContact } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(
      `${API_URL}/providers/contacts/${contactId}/toggle-active`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al cambiar estado del contacto',
      };
    }

    const contact: IProviderContact = await response.json();
    return { success: true, contact };
  } catch (error) {
    console.error('Error toggling provider contact status:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Establece un contacto como principal
 * PATCH /providers/contacts/:contactId/set-main
 */
export async function setMainProviderContactAction(
  contactId: string
): Promise<{ success: true; contact: IProviderContact } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(
      `${API_URL}/providers/contacts/${contactId}/set-main`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al establecer contacto principal',
      };
    }

    const contact: IProviderContact = await response.json();
    return { success: true, contact };
  } catch (error) {
    console.error('Error setting main provider contact:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Elimina un contacto
 * DELETE /providers/contacts/:contactId
 */
export async function deleteProviderContactAction(
  contactId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/providers/contacts/${contactId}`, {
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
        error: errorData.message || 'Error al eliminar contacto',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting provider contact:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
