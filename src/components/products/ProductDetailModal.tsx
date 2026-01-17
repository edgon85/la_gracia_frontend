'use client';

import { useState } from 'react';
import { IProduct } from '@/lib';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Package,
  Barcode,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Pill,
  Plus,
} from 'lucide-react';
import { AddBatchModal } from './AddBatchModal';

interface ProductDetailModalProps {
  product: IProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBatchAdded?: () => void;
  location?: 'farmacia' | 'bodega';
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onBatchAdded,
  location,
}: ProductDetailModalProps) {
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);

  if (!product) return null;

  // Filtrar lotes por ubicación si se especifica
  const filteredBatches = location
    ? product.batches.filter(batch => batch.location === location.toUpperCase())
    : product.batches;

  // Calcular stock por ubicación
  const locationStock = location
    ? filteredBatches
        .filter(batch => batch.status === 'ACTIVE')
        .reduce((sum, batch) => sum + batch.quantity, 0)
    : product.totalStock;

  const formatPrice = (price: string) => {
    return `Q${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Sin stock</Badge>;
    }
    if (stock <= product.minimumStock) {
      return <Badge className="bg-yellow-500">Stock bajo</Badge>;
    }
    return <Badge className="bg-green-500">Disponible</Badge>;
  };

  const getBatchStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Activo</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive">Vencido</Badge>;
      case 'DEPLETED':
        return <Badge variant="secondary">Agotado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            {product.commercialName}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">{product.genericName}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Información General
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Código Interno:</span>
                <p className="font-medium">{product.internalCode}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Código de Barras:</span>
                <p className="font-medium flex items-center gap-1">
                  <Barcode className="h-3 w-3" />
                  {product.barcode || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Presentación:</span>
                <p className="font-medium">{product.presentation}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Concentración:</span>
                <p className="font-medium">{product.concentration}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Unidad de Medida:</span>
                <p className="font-medium">{product.unitOfMeasure}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ubicación:</span>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {product.location}
                </p>
              </div>
            </div>
            {product.description && (
              <div className="mt-3">
                <span className="text-muted-foreground text-sm">Descripción:</span>
                <p className="text-sm mt-1">{product.description}</p>
              </div>
            )}
          </section>

          <Separator />

          {/* Categoría y Proveedor */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Categoría y Proveedor
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Categoría:</span>
                <div className="mt-1">
                  <Badge
                    style={{ backgroundColor: product.category.color }}
                    className="text-white"
                  >
                    {product.category.name}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Proveedor:</span>
                <p className="font-medium">{product.provider.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.provider.phone}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Stock e Inventario */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Stock e Inventario
              {location && (
                <Badge variant="outline" className="ml-2">
                  {location === 'farmacia' ? 'Farmacia' : 'Bodega'}
                </Badge>
              )}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <span className="text-muted-foreground text-xs">
                  {location ? `Stock en ${location === 'farmacia' ? 'Farmacia' : 'Bodega'}` : 'Stock Total'}
                </span>
                <p className="text-2xl font-bold">{locationStock}</p>
                {getStockStatus(locationStock)}
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <span className="text-muted-foreground text-xs">Stock Mínimo</span>
                <p className="text-2xl font-bold">{product.minimumStock}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <span className="text-muted-foreground text-xs">Stock Máximo</span>
                <p className="text-2xl font-bold">{product.maximumStock}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Restricciones */}
          <section>
            <h3 className="font-semibold mb-3">Restricciones</h3>
            <div className="flex gap-2">
              {product.requiresPrescription && (
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                  Requiere Receta
                </Badge>
              )}
              {product.isControlled && (
                <Badge variant="outline" className="border-red-500 text-red-500">
                  Medicamento Controlado
                </Badge>
              )}
              {!product.requiresPrescription && !product.isControlled && (
                <Badge variant="outline">Venta Libre</Badge>
              )}
              {product.isActive ? (
                <Badge className="bg-green-500">Activo</Badge>
              ) : (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>
          </section>

          {/* Lotes */}
          <Separator />
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Lotes ({filteredBatches.length})
                {location && (
                  <Badge variant="outline" className="ml-1">
                    {location === 'farmacia' ? 'Farmacia' : 'Bodega'}
                  </Badge>
                )}
              </h3>
              <Button
                size="sm"
                onClick={() => setIsAddBatchOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Lote
              </Button>
            </div>
            {filteredBatches.length > 0 ? (
              <div className="space-y-3">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="bg-muted/50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Lote: {batch.batchNumber}</span>
                      {getBatchStatus(batch.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className="ml-1 font-medium">
                          {batch.quantity} / {batch.initialQuantity}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precio Compra:</span>
                        <span className="ml-1 font-medium">
                          {formatPrice(batch.purchasePrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vencimiento:</span>
                        <span className="ml-1 font-medium">
                          {formatDate(batch.expiryDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precio Venta:</span>
                        <span className="ml-1 font-medium">
                          {formatPrice(batch.salePrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay lotes registrados para este producto.
              </p>
            )}
          </section>

          {/* Fechas */}
          <Separator />
          <section className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Creado: {formatDate(product.createdAt)}</span>
              <span>Actualizado: {formatDate(product.updatedAt)}</span>
            </div>
          </section>
        </div>
      </DialogContent>

      <AddBatchModal
        productId={product.id}
        productName={product.commercialName}
        open={isAddBatchOpen}
        onOpenChange={setIsAddBatchOpen}
        onSuccess={onBatchAdded}
      />
    </Dialog>
  );
}
