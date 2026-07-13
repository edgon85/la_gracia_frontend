// Tipos para el módulo de respaldos de base de datos

export interface IBackup {
  key: string; // ej. "backup-2026-07-12T23-22-08-878Z.sql.gz"
  sizeBytes: number;
  createdAt: string; // ISO
}

export interface IBackupsListResponse {
  data: IBackup[];
  total: number;
}

export interface ICreateBackupResponse {
  key: string;
  createdAt: string;
}

export interface IBackupUrlResponse {
  url: string;
  expiresIn: number; // segundos de validez de la URL firmada
}
