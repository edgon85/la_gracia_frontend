import { IProduct, IBatch } from './product.types';

// Tipos de movimiento específicos
export type MovementType =
  // Entradas
  | 'PURCHASE'
  | 'RETURN_FROM_PATIENT'
  | 'TRANSFER_IN'
  | 'ADJUSTMENT_IN'
  // Salidas
  | 'DISPENSATION'
  | 'SALE'
  | 'TRANSFER_OUT'
  | 'ADJUSTMENT_OUT'
  | 'EXPIRED'
  | 'DAMAGED'
  | 'LOST';

// Categoría del movimiento
export type MovementCategory = 'ENTRY' | 'EXIT';

// Labels para mostrar en UI
export const MovementTypeLabels: Record<MovementType, string> = {
  PURCHASE: 'Compra',
  RETURN_FROM_PATIENT: 'Devolución de paciente',
  TRANSFER_IN: 'Transferencia entrada',
  ADJUSTMENT_IN: 'Ajuste entrada',
  DISPENSATION: 'Dispensación',
  SALE: 'Venta',
  TRANSFER_OUT: 'Transferencia salida',
  ADJUSTMENT_OUT: 'Ajuste salida',
  EXPIRED: 'Vencido',
  DAMAGED: 'Dañado',
  LOST: 'Pérdida',
};

export const MovementCategoryLabels: Record<MovementCategory, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
};

export interface IInventoryMovement {
  id: string;
  type: MovementType;
  category: MovementCategory;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  reference: string | null;
  patientName: string | null;
  patientId: string | null;
  notes: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
  productId: string;
  batchId: string;
  createdById: string;
  createdAt: string;
  product?: IProduct;
  batch?: IBatch;
  createdBy?: {
    id: string;
    fullName: string;
  };
}

export type ExitType =
  | 'SALE'
  | 'DISPENSATION'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'LOSS'
  | 'DAMAGED';

export interface ICreateExitRequest {
  productId: string;
  quantity: number;
  type: ExitType;
  location: 'FARMACIA' | 'BODEGA';
  reason?: string;
  reference?: string;
  patientName?: string;
  patientId?: string;
  notes?: string;
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

// Baja de inventario (write-off): vencidos, dañados, perdidos
export type WriteOffType = 'EXPIRED' | 'DAMAGED' | 'LOST';

export const WriteOffTypeLabels: Record<WriteOffType, string> = {
  EXPIRED: 'Vencido',
  DAMAGED: 'Dañado',
  LOST: 'Pérdida',
};

export interface IWriteOffRequest {
  batchId: string;
  type: WriteOffType;
  quantity?: number; // omitir = todo el lote
  reason?: string; // máx 500
  reference?: string; // máx 100
  notes?: string;
}

// Respuesta plana del POST /write-off (sin relaciones pobladas)
export interface IWriteOffMovement {
  id: string;
  type: WriteOffType;
  category: 'EXIT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  reference: string | null;
  notes: string | null;
  unitPrice: string | number | null;
  totalPrice: string | number | null;
  productId: string;
  batchId: string;
  createdById: string;
  createdAt: string;
}

export interface IWriteOffExpiredRequest {
  productId?: string;
  location?: 'FARMACIA' | 'BODEGA';
  reason?: string; // máx 500
  notes?: string;
}

export interface IWriteOffExpiredResponse {
  batchesWrittenOff: number;
  totalQuantity: number;
  totalValue: string | number;
  movements: IWriteOffMovement[];
}

export interface IMovementFilters {
  type?: MovementType;
  category?: MovementCategory;
  productId?: string;
  batchId?: string;
  createdById?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  location?: 'FARMACIA' | 'BODEGA';
  sortBy?: string;
  order?: 'ASC' | 'DESC';
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
  totalMovements: number;
  entries: {
    count: number;
    quantity: number;
    value: number;
  };
  exits: {
    count: number;
    quantity: number;
    value: number;
  };
  byType: Record<MovementType, { count: number; quantity: number }>;
}

// Para el carrito de dispensación
export interface IDispensationItem {
  product: IProduct;
  quantity: number;
  notes?: string;
}
