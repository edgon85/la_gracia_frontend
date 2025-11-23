'use server';

import { ICategoriesResponse, ICategoryFilters, ICreateCategoryRequest, ICategory } from '@/lib';
import { getToken } from './auth.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getCategoriesAction(
  filters: ICategoryFilters = {}
): Promise<ICategoriesResponse | { error: string }> {
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
    const url = `${API_URL}/categories${queryString ? `?${queryString}` : ''}`;

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
        error: errorData.message || 'Error al obtener categorías',
      };
    }

    const data: ICategoriesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function createCategoryAction(
  data: ICreateCategoryRequest
): Promise<{ success: true; category: ICategory } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/categories`, {
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
        error: errorData.message || 'Error al crear categoría',
      };
    }

    const category: ICategory = await response.json();
    return { success: true, category };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getCategoryByIdAction(
  id: string
): Promise<ICategory | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/categories/${id}`, {
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
        error: errorData.message || 'Error al obtener categoría',
      };
    }

    const category: ICategory = await response.json();
    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function updateCategoryAction(
  id: string,
  data: Partial<ICreateCategoryRequest>
): Promise<{ success: true; category: ICategory } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/categories/${id}`, {
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
        error: errorData.message || 'Error al actualizar categoría',
      };
    }

    const category: ICategory = await response.json();
    return { success: true, category };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function toggleCategoryStatusAction(
  id: string
): Promise<{ success: true; category: ICategory } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/categories/${id}/toggle-active`, {
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
        error: errorData.message || 'Error al cambiar estado de la categoría',
      };
    }

    const category: ICategory = await response.json();
    return { success: true, category };
  } catch (error) {
    console.error('Error toggling category status:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/categories/${id}`, {
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
        error: errorData.message || 'Error al eliminar categoría',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
