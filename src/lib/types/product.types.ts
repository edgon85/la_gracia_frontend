export interface ICategory {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProvider {
  id: string;
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBatch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate: string;
  quantity: number;
  initialQuantity: number;
  purchasePrice: string;
  salePrice: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED';
  notes: string | null;
  isActive: boolean;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: string;
  internalCode: string;
  barcode: string;
  commercialName: string;
  genericName: string;
  description: string;
  presentation: string;
  unitOfMeasure: string;
  concentration: string;
  location: string;
  totalStock: number;
  minimumStock: number;
  maximumStock: number;
  requiresPrescription: boolean;
  isControlled: boolean;
  isActive: boolean;
  categoryId: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: ICategory;
  provider: IProvider;
  batches: IBatch[];
}

export interface IProductsResponse {
  data: IProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}
