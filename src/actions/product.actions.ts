'use server';

import { IProductsResponse, IProductFilters } from '@/lib';
import { getToken } from './auth.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getProductsAction(
  filters: IProductFilters = {}
): Promise<IProductsResponse | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    // Construir query params
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const url = `${API_URL}/products${queryString ? `?${queryString}` : ''}`;

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
        error: errorData.message || 'Error al obtener productos',
      };
    }

    
    const data: IProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
