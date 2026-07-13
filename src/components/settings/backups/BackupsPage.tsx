'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, DatabaseBackup, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  createBackupAction,
  deleteBackupAction,
  getBackupDownloadUrlAction,
  getBackupsAction,
} from '@/actions/backup.actions';
import { IBackup, IBackupsListResponse } from '@/lib';
import { BackupsTable, formatBackupDate } from './BackupsTable';

interface BackupsPageProps {
  initialData: IBackupsListResponse;
}

export const BackupsPage = (props: BackupsPageProps) => {
  const { initialData } = props;

  const [backups, setBackups] = useState<IBackup[]>(initialData.data);
  const [isCreating, setIsCreating] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [backupToDelete, setBackupToDelete] = useState<IBackup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = async () => {
    const response = await getBackupsAction();
    if ('error' in response) {
      toast.error(response.error);
      return;
    }
    setBackups(response.data);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const result = await createBackupAction();
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      toast.success('Respaldo creado correctamente');
      await refresh();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (key: string) => {
    setDownloadingKey(key);
    try {
      // Pedir una URL firmada nueva en cada clic (expiran en 1 hora)
      const result = await getBackupDownloadUrlAction(key);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      window.open(result.url, '_blank');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDelete = async () => {
    if (!backupToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteBackupAction(backupToDelete.key);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setBackupToDelete(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Configuración
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Respaldos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Respaldos de la base de datos del sistema
          </p>
        </div>

        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando respaldo…
            </>
          ) : (
            <>
              <DatabaseBackup className="w-4 h-4" />
              Crear respaldo
            </>
          )}
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-800 dark:text-blue-300">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          El sistema crea un respaldo automático cada 5 días a la medianoche y
          elimina los respaldos con más de 30 días de antigüedad.
        </p>
      </div>

      <Card>
        <CardContent>
          <BackupsTable
            backups={backups}
            downloadingKey={downloadingKey}
            onDownload={handleDownload}
            onDelete={setBackupToDelete}
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={!!backupToDelete}
        onOpenChange={(open) => {
          if (!open) setBackupToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar respaldo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el respaldo del{' '}
              {backupToDelete ? formatBackupDate(backupToDelete.createdAt) : ''}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando…
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
