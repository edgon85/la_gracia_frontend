'use client';

import { useEffect, useState } from 'react';
import { getExpiredBatchesAction } from '@/actions/product.actions';
import { writeOffExpiredAction } from '@/actions/inventory.actions';
import { IExpiringBatch } from '@/lib';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  WriteOffBatchModal,
  WriteOffBatchInfo,
} from '@/components/inventory/WriteOffBatchModal';
import { toast } from 'sonner';
import {
  Loader2,
  AlertTriangle,
  Package,
  FlaskConical,
  Warehouse,
  Banknote,
  PackageMinus,
} from 'lucide-react';

interface ExpiredBatchesPageProps {
  location: 'farmacia' | 'bodega';
  initialData?: IExpiringBatch[];
}

export function ExpiredBatchesPage({
  location,
  initialData = [],
}: ExpiredBatchesPageProps) {
  const [batches, setBatches] = useState<IExpiringBatch[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [writeOffBatch, setWriteOffBatch] = useState<IExpiringBatch | null>(
    null
  );
  const [isWriteOffOpen, setIsWriteOffOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkReason, setBulkReason] = useState('');

  const { isAdmin } = usePermissions();

  const isFarmacia = location === 'farmacia';
  const LocationIcon = isFarmacia ? FlaskConical : Warehouse;
  const title = isFarmacia ? 'Vencidos - Farmacia' : 'Vencidos - Bodega';
  const canWriteOff = isAdmin;

  const batchLossValue = (batch: IExpiringBatch) =>
    batch.quantity * parseFloat(batch.purchasePrice ?? '0');

  const totalUnits = batches.reduce((sum, b) => sum + b.quantity, 0);
  const totalLossValue = batches.reduce((sum, b) => sum + batchLossValue(b), 0);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await getExpiredBatchesAction(location);

      if ('error' in response) {
        toast.error(response.error);
        setBatches([]);
      } else {
        setBatches(response);
      }
    } catch (error) {
      toast.error('Error al cargar los lotes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [location]);

  const handleBulkWriteOff = async () => {
    setIsBulkLoading(true);
    try {
      const response = await writeOffExpiredAction({
        location: isFarmacia ? 'FARMACIA' : 'BODEGA',
        reason: bulkReason.trim(),
      });

      if ('error' in response) {
        toast.error(response.error);
      } else {
        toast.success(
          `Se dieron de baja ${response.batchesWrittenOff} lotes (${response.totalQuantity} unidades, Q${Number(response.totalValue).toFixed(2)})`
        );
        setIsBulkDialogOpen(false);
        fetchBatches();
      }
    } catch (error) {
      toast.error('Error al dar de baja los lotes vencidos');
      console.error(error);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const openWriteOffModal = (batch: IExpiringBatch) => {
    setWriteOffBatch(batch);
    setIsWriteOffOpen(true);
  };

  const writeOffBatchInfo: WriteOffBatchInfo | null = writeOffBatch
    ? {
        id: writeOffBatch.id,
        batchNumber: writeOffBatch.batchNumber,
        quantity: writeOffBatch.quantity,
        expiryDate: writeOffBatch.expiryDate,
        purchasePrice: writeOffBatch.purchasePrice,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LocationIcon className="h-7 w-7 text-primary" />
          </div>
          {title}
        </h1>
        <p className="text-muted-foreground mt-1">Lotes que ya vencieron</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{batches.length}</p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUnits}</p>
                <p className="text-sm text-muted-foreground">Unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Banknote className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  Q{totalLossValue.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor de pérdida
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lotes Vencidos
            </CardTitle>
            {canWriteOff && batches.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                disabled={loading || isBulkLoading}
                onClick={() => setIsBulkDialogOpen(true)}
              >
                <PackageMinus className="mr-2 h-4 w-4" />
                Dar de baja todos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Package className="h-12 w-12 mb-4" />
              <p>No hay lotes vencidos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  {canWriteOff && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">
                      {batch.product.commercialName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{batch.product.internalCode}</Badge>
                    </TableCell>
                    <TableCell>{batch.batchNumber}</TableCell>
                    <TableCell>{batch.quantity}</TableCell>
                    <TableCell>{formatDate(batch.expiryDate)}</TableCell>
                    <TableCell>Q{batchLossValue(batch).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencido
                      </Badge>
                    </TableCell>
                    {canWriteOff && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openWriteOffModal(batch)}
                        >
                          <PackageMinus className="mr-2 h-4 w-4" />
                          Dar de baja
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Baja individual */}
      <WriteOffBatchModal
        batch={writeOffBatchInfo}
        productName={writeOffBatch?.product.commercialName ?? ''}
        presetType="EXPIRED"
        open={isWriteOffOpen}
        onOpenChange={(open) => {
          setIsWriteOffOpen(open);
          if (!open) setWriteOffBatch(null);
        }}
        onSuccess={fetchBatches}
      />

      {/* Confirmación baja masiva */}
      <AlertDialog
        open={isBulkDialogOpen}
        onOpenChange={(open) => {
          setIsBulkDialogOpen(open);
          if (!open) setBulkReason('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Dar de baja todos los lotes vencidos?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se darán de baja {batches.length} lotes vencidos de{' '}
              {isFarmacia ? 'Farmacia' : 'Bodega'} por un valor de Q
              {totalLossValue.toFixed(2)}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-reason">Motivo *</Label>
            <Input
              id="bulk-reason"
              placeholder="Motivo de la baja masiva..."
              maxLength={500}
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              disabled={isBulkLoading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBulkWriteOff();
              }}
              disabled={isBulkLoading || !bulkReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isBulkLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Dar de baja todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
