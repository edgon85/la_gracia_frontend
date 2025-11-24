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

// Enums para productos
export enum ProductPresentation {
  TABLETAS = 'TABLETAS',
  CAPSULAS = 'CAPSULAS',
  JARABE = 'JARABE',
  SUSPENSION = 'SUSPENSION',
  SOLUCION = 'SOLUCION',
  AMPOLLA = 'AMPOLLA',
  FRASCO = 'FRASCO',
  CAJA = 'CAJA',
  SOBRE = 'SOBRE',
  TUBO = 'TUBO',
  CREMA = 'CREMA',
  POMADA = 'POMADA',
  GEL = 'GEL',
  SPRAY = 'SPRAY',
  INHALADOR = 'INHALADOR',
  PARCHE = 'PARCHE',
  SUPOSITORIO = 'SUPOSITORIO',
  OVULO = 'OVULO',
  GOTAS = 'GOTAS',
  UNIDAD = 'UNIDAD',
  ROLLO = 'ROLLO',
  PAR = 'PAR',
  KIT = 'KIT',
  OTRO = 'OTRO',
}

export enum ProductLocation {
  FARMACIA = 'FARMACIA',
  BODEGA = 'BODEGA',
  AMBOS = 'AMBOS',
}

export enum UnitOfMeasure {
  MILIGRAMOS = 'mg',
  GRAMOS = 'g',
  KILOGRAMOS = 'kg',
  MILILITROS = 'ml',
  LITROS = 'L',
  UNIDADES = 'unidad',
  PIEZAS = 'pieza',
  TABLETAS = 'tableta',
  CAPSULAS = 'capsula',
  AMPOLLAS = 'ampolla',
  FRASCOS = 'frasco',
  CAJAS = 'caja',
  SOBRES = 'sobre',
  METROS = 'm',
  CENTIMETROS = 'cm',
  OTRO = 'otro',
}

export interface IInitialBatch {
  batchNumber: string;
  expiryDate: string;
  manufacturingDate: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
}

export interface ICreateProductRequest {
  internalCode: string;
  commercialName: string;
  genericName: string;
  presentation: string;
  concentration: string;
  unitOfMeasure: string;
  location: string;
  minimumStock: number;
  maximumStock: number;
  categoryId: string;
  providerId: string;
  initialBatch: IInitialBatch;
}

export interface IUpdateProductRequest {
  internalCode?: string;
  commercialName?: string;
  genericName?: string;
  presentation?: string;
  concentration?: string;
  unitOfMeasure?: string;
  location?: string;
  minimumStock?: number;
  maximumStock?: number;
  categoryId?: string;
  providerId?: string;
}
