import { ProductLocation } from './product.types';

// ---- Products report ----
export type ReportStockStatus = 'ok' | 'low' | 'out';

export interface IProductsReportFilters {
  location?: ProductLocation;
  categoryId?: string;
  stockStatus?: ReportStockStatus;
  includeInactive?: boolean;
  price?: boolean;
  minPurchasePrice?: number;
  maxPurchasePrice?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
}

// ---- Shared result shape for PDF-generating report actions ----
export interface IReportPdfResult {
  success: true;
  data: string; // PDF en base64
  filename: string;
}

export type ReportPdfResponse = IReportPdfResult | { error: string };

// ---- Movements report ----
export type MovementsDateMode = 'day' | 'month' | 'range';

export interface IMovementsReportFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  location?: ProductLocation;
  category?: 'ENTRY' | 'EXIT';
}
