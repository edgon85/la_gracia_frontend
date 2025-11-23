// Re-export ICategory from product.types for consistency
export type { ICategory } from './product.types';

// Import ICategory interface for the response type
import { ICategory } from './product.types';

export interface ICategoriesResponse {
  data: ICategory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ICategoryFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface ICreateCategoryRequest {
  name: string;
  code: string;
  description: string;
  color: string;
}
