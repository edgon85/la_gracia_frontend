'use client';

import { Download, Trash2, Loader2, DatabaseBackup } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { IBackup } from '@/lib';
import { formatBytes } from '@/lib/utils';

interface BackupsTableProps {
  backups: IBackup[];
  downloadingKey: string | null;
  onDownload: (key: string) => void;
  onDelete: (backup: IBackup) => void;
}

export const formatBackupDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const BackupsTable = (props: BackupsTableProps) => {
  const { backups, downloadingKey, onDownload, onDelete } = props;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tamaño</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {backups.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="h-32 text-center">
              <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                <DatabaseBackup className="w-8 h-8" />
                <p>No hay respaldos disponibles.</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          backups.map((backup) => (
            <TableRow key={backup.key}>
              <TableCell className="font-medium">
                {formatBackupDate(backup.createdAt)}
              </TableCell>
              <TableCell>{formatBytes(backup.sizeBytes)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(backup.key)}
                    disabled={downloadingKey === backup.key}
                    title="Descargar respaldo"
                  >
                    {downloadingKey === backup.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Descargar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(backup)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    title="Eliminar respaldo"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
