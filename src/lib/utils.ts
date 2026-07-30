import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Un lote con expiryDate <= hoy ya está vencido (misma regla que el backend).
// Comparación de strings "YYYY-MM-DD" (formato de inputs type="date").
export function isExpiredDate(val: string): boolean {
  return val <= new Date().toISOString().slice(0, 10);
}

// Fecha mínima válida de vencimiento (mañana), para el atributo min de inputs date
export function minExpiryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
