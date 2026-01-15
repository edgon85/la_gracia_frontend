import { IProduct, IBatch } from './product.types';

export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'TRANSFER';

export type MovementReason =
  | 'PURCHASE'
  | 'SALE'
  | 'DISPENSATION'
  | 'RETURN'
  | 'EXPIRED'
  | 'DAMAGED'
  | 'LOSS'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'INITIAL_STOCK'
  | 'OTHER';

export interface IInventoryMovement {
  id: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string | null;
  reference: string | null;
  productId: string;
  batchId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  product?: IProduct;
  batch?: IBatch;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export type ExitType =
  | 'SALE'
  | 'DISPENSATION'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'LOSS'
  | 'EXPIRED'
  | 'DAMAGED';

export interface ICreateExitRequest {
  productId: string;
  quantity: number;
  type: ExitType;
  reason?: string;
  reference?: string;
  patientName?: string;
  patientId?: string;
  location?: 'FARMACIA' | 'BODEGA';
}

export interface ICreateExitResponse {
  id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  productId: string;
  batchId: string;
  userId: string;
  reason: string | null;
  reference: string | null;
  createdAt: string;
}

export interface IMovementFilters {
  type?: MovementType;
  reason?: MovementReason;
  productId?: string;
  batchId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  location?: 'FARMACIA' | 'BODEGA';
  category?: 'ENTRY' | 'EXIT';
}

export interface IMovementsResponse {
  data: IInventoryMovement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IMovementSummary {
  totalEntries: number;
  totalExits: number;
  totalAdjustments: number;
  netChange: number;
  byReason: {
    reason: MovementReason;
    count: number;
    quantity: number;
  }[];
}

// Para el carrito de dispensación
export interface IDispensationItem {
  product: IProduct;
  quantity: number;
  notes?: string;
}
