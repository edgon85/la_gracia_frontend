// Re-export IProvider from product.types for consistency
export type { IProvider } from './product.types';

export interface IProvidersResponse {
  data: IProvider[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IProviderFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface ICreateProviderRequest {
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  notes?: string;
}

// Import IProvider interface for the response type
import { IProvider } from './product.types';
