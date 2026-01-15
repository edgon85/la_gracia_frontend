'use client';

import { useEffect, useState } from 'react';
import { getExpiringBatchesAction } from '@/actions/product.actions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Loader2,
  AlertTriangle,
  Calendar,
  Package,
  FlaskConical,
  Warehouse,
} from 'lucide-react';

interface ExpiringBatchesPageProps {
  location: 'farmacia' | 'bodega';
  initialData?: IExpiringBatch[];
}

// Convertir location a mayúsculas para el backend
const toBackendLocation = (loc: 'farmacia' | 'bodega'): 'FARMACIA' | 'BODEGA' => {
  return loc.toUpperCase() as 'FARMACIA' | 'BODEGA';
};

export function ExpiringBatchesPage({
  location,
  initialData = [],
}: ExpiringBatchesPageProps) {
  const [batches, setBatches] = useState<IExpiringBatch[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [days, setDays] = useState<number>(30);

  const isFarmacia = location === 'farmacia';
  const LocationIcon = isFarmacia ? FlaskConical : Warehouse;
  const title = isFarmacia
    ? 'Próximos a Vencer - Farmacia'
    : 'Próximos a Vencer - Bodega';

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await getExpiringBatchesAction(days, toBackendLocation(location));

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
  }, [days, location]);

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (expiryDate: string) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);

    if (daysLeft < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Vencido
        </Badge>
      );
    }
    if (daysLeft <= 7) {
      return (
        <Badge variant="destructive" className="gap-1">
          {daysLeft} días
        </Badge>
      );
    }
    if (daysLeft <= 30) {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-orange-500 text-orange-600"
        >
          {daysLeft} días
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
        {daysLeft} días
      </Badge>
    );
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LocationIcon className="h-7 w-7 text-primary" />
            </div>
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Lotes que están próximos a vencer o ya vencieron
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar:</span>
          <Select
            value={days.toString()}
            onValueChange={(value) => setDays(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Próximos 7 días</SelectItem>
              <SelectItem value="30">Próximos 30 días</SelectItem>
              <SelectItem value="60">Próximos 60 días</SelectItem>
              <SelectItem value="90">Próximos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <p className="text-2xl font-bold">
                  {batches.filter((b) => getDaysUntilExpiry(b.expiryDate) < 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {
                    batches.filter((b) => {
                      const d = getDaysUntilExpiry(b.expiryDate);
                      return d >= 0 && d <= 30;
                    }).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencen en 30 días
                </p>
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
            Lotes Próximos a Vencer
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
              <p>No hay lotes próximos a vencer en este período</p>
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
                    <TableCell>{getStatusBadge(batch.expiryDate)}</TableCell>
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
