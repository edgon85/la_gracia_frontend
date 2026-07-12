'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  IInventoryMovement,
  MovementTypeLabels,
  MovementCategoryLabels,
} from '@/lib';
import { ArrowDownCircle, ArrowUpCircle, Package, User } from 'lucide-react';

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface MovementsTableProps {
  movements: IInventoryMovement[];
  isLoading?: boolean;
}

export function MovementsTable({ movements, isLoading }: MovementsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No hay movimientos</p>
        <p className="text-sm">No se encontraron movimientos con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead className="text-center">Cantidad</TableHead>
            <TableHead className="text-center">Stock Anterior</TableHead>
            <TableHead className="text-center">Stock Nuevo</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Notas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="whitespace-nowrap">
                {formatDateTime(movement.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {movement.category === 'ENTRY' ? (
                    <ArrowDownCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <Badge
                      variant={movement.category === 'ENTRY' ? 'default' : 'destructive'}
                      className="mb-1"
                    >
                      {MovementCategoryLabels[movement.category]}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {MovementTypeLabels[movement.type]}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{movement.product?.commercialName || 'N/A'}</p>
                  {movement.product?.internalCode && (
                    <p className="text-xs text-muted-foreground">
                      {movement.product.internalCode}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {movement.batch?.batchNumber || 'N/A'}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`font-semibold ${
                    movement.category === 'ENTRY'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {movement.category === 'ENTRY' ? '+' : '-'}
                  {movement.quantity}
                </span>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {movement.previousStock}
              </TableCell>
              <TableCell className="text-center font-medium">
                {movement.newStock}
              </TableCell>
              <TableCell>
                {movement.createdBy ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {movement.createdBy.firstName} {movement.createdBy.lastName}
                    </span>
                  </div>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {movement.reason || movement.notes || '-'}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
