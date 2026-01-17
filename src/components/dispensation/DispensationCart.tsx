'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Package,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useDispensationStore } from '@/stores';
import { createExitMovementAction } from '@/actions/inventory.actions';
import { toast } from 'sonner';
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

interface DispensationCartProps {
  onSuccess?: () => void;
}

export function DispensationCart({ onSuccess }: DispensationCartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    items,
    notes,
    reference,
    location,
    removeItem,
    updateQuantity,
    setNotes,
    setReference,
    clearCart,
    getTotalItems,
    getTotalQuantity,
    getStockByLocation,
  } = useDispensationStore();

  const formatPrice = (price: string) => {
    return parseFloat(price);
  };

  // Obtener lotes filtrados por ubicación
  const getLocationBatches = (product: (typeof items)[0]['product']) => {
    if (!location) return product.batches;
    const backendLocation = location.toUpperCase() as 'FARMACIA' | 'BODEGA';
    return product.batches.filter(
      (batch) => batch.location === backendLocation && batch.status === 'ACTIVE'
    );
  };

  const getItemTotal = (item: (typeof items)[0]) => {
    const locationBatches = getLocationBatches(item.product);
    const mainBatch = locationBatches[0] || item.product.batches[0];
    const price = mainBatch?.salePrice || '0';
    return formatPrice(price) * item.quantity;
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + getItemTotal(item), 0);
  };

  const handleQuantityChange = (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity > maxStock) {
      toast.error(`Stock máximo disponible: ${maxStock}`);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleDispense = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // Validar stock antes de enviar (usando stock por ubicación)
    for (const item of items) {
      const availableStock = getStockByLocation(item.product);
      if (item.quantity > availableStock) {
        toast.error(
          `Stock insuficiente para ${item.product.commercialName}. Disponible: ${availableStock}`
        );
        return;
      }
    }

    setShowConfirm(true);
  };

  const confirmDispense = async () => {
    if (!location) {
      toast.error('No se ha definido la ubicación');
      return;
    }

    setIsLoading(true);
    setShowConfirm(false);

    let successCount = 0;
    let totalQuantityDispensed = 0;
    const errors: string[] = [];

    // Convertir location a formato backend
    const backendLocation = location.toUpperCase() as 'FARMACIA' | 'BODEGA';

    // Procesar cada item individualmente
    for (const item of items) {
      const response = await createExitMovementAction({
        productId: item.product.id,
        quantity: item.quantity,
        type: 'DISPENSATION',
        location: backendLocation,
        reason: notes || item.notes || 'Dispensación',
        reference: reference || undefined,
      });

      if ('error' in response) {
        errors.push(`${item.product.commercialName}: ${response.error}`);
      } else {
        successCount++;
        totalQuantityDispensed += item.quantity;
      }
    }

    if (errors.length > 0) {
      toast.error(`Errores: ${errors.join(', ')}`);
    }

    if (successCount > 0) {
      toast.success(
        `Dispensación exitosa: ${totalQuantityDispensed} unidades de ${successCount} productos`
      );
      clearCart();
      onSuccess?.();
    }

    setIsLoading(false);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Carrito vacío</h3>
          <p className="text-muted-foreground text-sm">
            Busca productos y agrégalos al carrito para dispensar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito de Dispensación
            </div>
            <Badge variant="secondary">
              {getTotalItems()} productos • {getTotalQuantity()} unidades
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items del carrito */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item) => {
              const locationBatches = getLocationBatches(item.product);
              const mainBatch = locationBatches[0] || item.product.batches[0];
              const price = mainBatch?.salePrice || '0';
              const itemTotal = getItemTotal(item);
              const availableStock = getStockByLocation(item.product);
              const isOverStock = item.quantity > availableStock;

              return (
                <div
                  key={item.product.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    isOverStock ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <div className="bg-muted rounded-lg p-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium truncate">
                          {item.product.commercialName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.product.presentation} • Q{formatPrice(price).toFixed(2)} c/u
                        </p>
                        {isOverStock && (
                          <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                            <AlertCircle className="h-3 w-3" />
                            Stock disponible: {availableStock}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity - 1,
                              availableStock
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.product.id,
                              parseInt(e.target.value) || 0,
                              availableStock
                            )
                          }
                          className="w-16 h-8 text-center"
                          min={1}
                          max={availableStock}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity + 1,
                              availableStock
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold">Q{itemTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Referencia y notas */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="reference">Referencia (opcional)</Label>
              <Input
                id="reference"
                placeholder="Ej: Receta #123, Paciente Juan Pérez"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Total y acciones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>Q{getCartTotal().toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearCart}
                disabled={isLoading}
              >
                Limpiar
              </Button>
              <Button
                className="flex-1"
                onClick={handleDispense}
                disabled={isLoading || items.some((i) => i.quantity > getStockByLocation(i.product))}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Dispensar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmación */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Dispensación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de dispensar {getTotalQuantity()} unidades de{' '}
              {getTotalItems()} productos por un total de Q{getCartTotal().toFixed(2)}?
              <br />
              <br />
              Esta acción descontará los productos del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDispense}>
              Confirmar Dispensación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
