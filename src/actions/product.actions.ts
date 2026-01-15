'use server';

import {
  IProductsResponse,
  IProductFilters,
  ICreateProductRequest,
  IUpdateProductRequest,
  IProduct,
  ICreateBatchRequest,
  IBatch,
  IProductStats,
  IExpiringBatch,
} from '@/lib';
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
    if (filters.minPrice !== undefined)
      params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.append('maxPrice', filters.maxPrice.toString());
    if (filters.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    // Nuevos filtros de stock y vencimiento
    if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);
    if (filters.expiringInDays !== undefined)
      params.append('expiringInDays', filters.expiringInDays.toString());
    // Filtro por ubicación
    if (filters.location) params.append('location', filters.location);

    const queryString = params.toString();
    const url = `${API_URL}/products${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching products with URL:', url);
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

export async function createProductAction(
  data: ICreateProductRequest
): Promise<{ success: true; product: IProduct } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/products`, {
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
        error: errorData.message || 'Error al crear producto',
      };
    }

    const product: IProduct = await response.json();
    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getProductByIdAction(
  id: string
): Promise<IProduct | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
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
        error: errorData.message || 'Error al obtener producto',
      };
    }

    const product: IProduct = await response.json();
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function updateProductAction(
  id: string,
  data: IUpdateProductRequest
): Promise<{ success: true; product: IProduct } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
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
        error: errorData.message || 'Error al actualizar producto',
      };
    }

    const product: IProduct = await response.json();
    return { success: true, product };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function toggleProductStatusAction(
  id: string
): Promise<{ success: true; product: IProduct } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/products/${id}/toggle-active`, {
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
        error: errorData.message || 'Error al cambiar estado del producto',
      };
    }

    const product: IProduct = await response.json();
    return { success: true, product };
  } catch (error) {
    console.error('Error toggling product status:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function deleteProductAction(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
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
        error: errorData.message || 'Error al eliminar producto',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function addBatchToProductAction(
  productId: string,
  data: ICreateBatchRequest
): Promise<{ success: true; batch: IBatch } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/products/${productId}/batches`, {
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
        error: errorData.message || 'Error al agregar lote',
      };
    }

    const batch: IBatch = await response.json();
    return { success: true, batch };
  } catch (error) {
    console.error('Error adding batch:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ==================== ESTADÍSTICAS ====================

/**
 * Obtiene estadísticas generales de productos
 * GET /products/stats
 */
export async function getProductStatsAction(): Promise<
  IProductStats | { error: string }
> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/products/stats`, {
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
        error: errorData.message || 'Error al obtener estadísticas',
      };
    }

    const stats: IProductStats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtiene lotes próximos a vencer
 * GET /products/batches/expiring?days=30&location=farmacia
 */
export async function getExpiringBatchesAction(
  days: number = 30,
  location?: 'FARMACIA' | 'BODEGA'
): Promise<IExpiringBatch[] | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const params = new URLSearchParams();
    params.append('days', days.toString());
    if (location) params.append('location', location);

    const response = await fetch(
      `${API_URL}/products/batches/expiring?${params.toString()}`,
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
        error: errorData.message || 'Error al obtener lotes por vencer',
      };
    }

    const batches: IExpiringBatch[] = await response.json();
    return batches;
  } catch (error) {
    console.error('Error fetching expiring batches:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
