import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IProduct } from "@/lib/types/product.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toda la lógica de fechas del programa usa la zona horaria de Guatemala (UTC-6, sin DST),
// independiente de la TZ del servidor/navegador.
export const GUATEMALA_TZ = 'America/Guatemala';

// Fecha de hoy en Guatemala como "YYYY-MM-DD" (en-CA formatea exactamente así)
export function todayInGuatemala(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: GUATEMALA_TZ }).format(new Date());
}

// Un lote se puede despachar hasta su día de vencimiento INCLUSIVE: está vencido
// solo a partir del día siguiente (misma regla que el backend).
// Comparación de strings "YYYY-MM-DD" (formato de inputs type="date").
export function isExpiredDate(val: string): boolean {
  return val < todayInGuatemala();
}

// Fecha mínima válida de vencimiento (mañana en Guatemala), para el atributo min de inputs date
export function minExpiryDate(): string {
  const d = new Date(`${todayInGuatemala()}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Lotes despachables de un producto en una ubicación: activos, con existencias y no
// vencidos por fecha. NUNCA usar batch.status aquí — la columna viene desactualizada
// del backend (solo se recalcula en escrituras); el vencimiento se decide en vivo por fecha.
export function getAvailableBatchesByLocation(
  product: IProduct,
  location: 'farmacia' | 'bodega'
): IProduct['batches'] {
  const backendLocation = location.toUpperCase() as 'FARMACIA' | 'BODEGA';
  return product.batches.filter(
    batch =>
      batch.location === backendLocation &&
      batch.isActive &&
      batch.quantity > 0 &&
      !isExpiredDate(batch.expiryDate.slice(0, 10))
  );
}

// Stock disponible (suma de los lotes despachables) de un producto en una ubicación
export function getAvailableStockByLocation(
  product: IProduct,
  location?: 'farmacia' | 'bodega'
): number {
  if (!location) {
    return product.totalStock;
  }
  return getAvailableBatchesByLocation(product, location).reduce(
    (sum, batch) => sum + batch.quantity,
    0
  );
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
