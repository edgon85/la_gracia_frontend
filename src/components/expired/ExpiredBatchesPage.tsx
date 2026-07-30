'use client';

import { useEffect, useState } from 'react';
import { getExpiredBatchesAction } from '@/actions/product.actions';
import { IExpiringBatch } from '@/lib';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Loader2,
  AlertTriangle,
  Package,
  FlaskConical,
  Warehouse,
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

  const isFarmacia = location === 'farmacia';
  const LocationIcon = isFarmacia ? FlaskConical : Warehouse;
  const title = isFarmacia ? 'Vencidos - Farmacia' : 'Vencidos - Bodega';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-2xl font-bold">{batches.length}</p>
                <p className="text-sm text-muted-foreground">Total lotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lotes Vencidos
          </CardTitle>
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
                  <TableHead>Estado</TableHead>
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
                    <TableCell>
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencido
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
