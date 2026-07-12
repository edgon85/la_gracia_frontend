'use server';

import {
  IProductsReportFilters,
  IMovementsReportFilters,
  ReportPdfResponse,
} from '@/lib';
import { getToken } from './auth.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? null;
}

async function parseErrorMessage(response: Response): Promise<string> {
  let message = 'Error al generar el reporte';
  try {
    const errorData = await response.json();
    message = errorData.message || message;
  } catch {
    // La respuesta no era JSON, se mantiene el mensaje por defecto
  }
  return message;
}

export async function getProductsReportAction(
  filters: IProductsReportFilters = {}
): Promise<ReportPdfResponse> {
  try {
    const token = await getToken();
    if (!token) return { error: 'No autenticado' };

    const params = new URLSearchParams();

    if (filters.location) params.append('location', filters.location);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);
    if (filters.includeInactive !== undefined)
      params.append('includeInactive', filters.includeInactive.toString());
    if (filters.price !== undefined) params.append('price', filters.price.toString());
    if (filters.price) {
      if (filters.minPurchasePrice !== undefined)
        params.append('minPurchasePrice', filters.minPurchasePrice.toString());
      if (filters.maxPurchasePrice !== undefined)
        params.append('maxPurchasePrice', filters.maxPurchasePrice.toString());
      if (filters.minSalePrice !== undefined)
        params.append('minSalePrice', filters.minSalePrice.toString());
      if (filters.maxSalePrice !== undefined)
        params.append('maxSalePrice', filters.maxSalePrice.toString());
    }

    const url = `${API_URL}/reports/products?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { error: await parseErrorMessage(response) };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const filename =
      extractFilename(response.headers.get('content-disposition')) ??
      `reporte-productos-${Date.now()}.pdf`;

    return { success: true, data: base64, filename };
  } catch (error) {
    console.error('Error generating products report:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getMovementsReportAction(
  filters: IMovementsReportFilters
): Promise<ReportPdfResponse> {
  try {
    const token = await getToken();
    if (!token) return { error: 'No autenticado' };

    const params = new URLSearchParams();

    if (filters.date) params.append('date', filters.date);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.month !== undefined) params.append('month', filters.month.toString());
    if (filters.year !== undefined) params.append('year', filters.year.toString());
    if (filters.location) params.append('location', filters.location);
    if (filters.category) params.append('category', filters.category);

    const url = `${API_URL}/reports/movements?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { error: await parseErrorMessage(response) };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const filename =
      extractFilename(response.headers.get('content-disposition')) ??
      `reporte-movimientos-${Date.now()}.pdf`;

    return { success: true, data: base64, filename };
  } catch (error) {
    console.error('Error generating movements report:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
