'use server';

import {
  ICreateExitRequest,
  ICreateExitResponse,
  IMovementFilters,
  IMovementsResponse,
  IInventoryMovement,
  IMovementSummary,
} from '@/lib';
import { getToken } from './auth.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createExitMovementAction(
  data: ICreateExitRequest
): Promise<ICreateExitResponse | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/inventory-movements/exit`, {
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
        error: errorData.message || 'Error al registrar la salida',
      };
    }

    const result: ICreateExitResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating exit movement:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getMovementsAction(
  filters: IMovementFilters = {}
): Promise<IMovementsResponse | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.batchId) params.append('batchId', filters.batchId);
    if (filters.createdById) params.append('createdById', filters.createdById);
    if (filters.location) params.append('location', filters.location);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.order) params.append('order', filters.order);

    const queryString = params.toString();
    const url = `${API_URL}/inventory-movements${queryString ? `?${queryString}` : ''}`;

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
        error: errorData.message || 'Error al obtener movimientos',
      };
    }

    const data: IMovementsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movements:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getMovementByIdAction(
  id: string
): Promise<IInventoryMovement | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/inventory-movements/${id}`, {
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
        error: errorData.message || 'Error al obtener el movimiento',
      };
    }

    const movement: IInventoryMovement = await response.json();
    return movement;
  } catch (error) {
    console.error('Error fetching movement:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getProductMovementsAction(
  productId: string
): Promise<IInventoryMovement[] | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(
      `${API_URL}/inventory-movements/product/${productId}`,
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
        error: errorData.message || 'Error al obtener movimientos del producto',
      };
    }

    const movements: IInventoryMovement[] = await response.json();
    return movements;
  } catch (error) {
    console.error('Error fetching product movements:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getMovementSummaryAction(
  startDate: string,
  endDate: string
): Promise<IMovementSummary | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(
      `${API_URL}/inventory-movements/summary?startDate=${startDate}&endDate=${endDate}`,
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
        error: errorData.message || 'Error al obtener el resumen',
      };
    }

    const summary: IMovementSummary = await response.json();
    return summary;
  } catch (error) {
    console.error('Error fetching movement summary:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
