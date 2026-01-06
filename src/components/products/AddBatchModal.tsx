'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addBatchToProductAction } from '@/actions/product.actions';
import { Loader2 } from 'lucide-react';

const addBatchSchema = z.object({
  batchNumber: z.string().min(1, 'El número de lote es requerido'),
  expiryDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  manufacturingDate: z.string().min(1, 'La fecha de fabricación es requerida'),
  quantity: z
    .string()
    .min(1, 'La cantidad es requerida')
    .transform((val) => Number(val))
    .refine((val) => val >= 1, 'La cantidad debe ser mayor a 0'),
  purchasePrice: z
    .string()
    .min(1, 'El precio de compra es requerido')
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z
    .string()
    .min(1, 'El precio de venta es requerido')
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'El precio de venta debe ser mayor o igual a 0'),
  notes: z.string().optional(),
});

type AddBatchFormInput = z.input<typeof addBatchSchema>;
type AddBatchFormData = z.output<typeof addBatchSchema>;

interface AddBatchModalProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddBatchModal({
  productId,
  productName,
  open,
  onOpenChange,
  onSuccess,
}: AddBatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddBatchFormInput, unknown, AddBatchFormData>({
    resolver: zodResolver(addBatchSchema),
    defaultValues: {
      batchNumber: '',
      expiryDate: '',
      manufacturingDate: '',
      quantity: '',
      purchasePrice: '',
      salePrice: '',
      notes: '',
    },
  });

  const onSubmit = async (data: AddBatchFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await addBatchToProductAction(productId, data);

    if ('error' in result) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    reset();
    onOpenChange(false);
    onSuccess?.();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Lote</DialogTitle>
          <p className="text-sm text-muted-foreground">{productName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Número de Lote *</Label>
            <Input
              id="batchNumber"
              placeholder="Ej: LOT-2024-001"
              {...register('batchNumber')}
            />
            {errors.batchNumber && (
              <p className="text-sm text-destructive">{errors.batchNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturingDate">Fecha Fabricación *</Label>
              <Input
                id="manufacturingDate"
                type="date"
                {...register('manufacturingDate')}
              />
              {errors.manufacturingDate && (
                <p className="text-sm text-destructive">{errors.manufacturingDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Fecha Vencimiento *</Label>
              <Input
                id="expiryDate"
                type="date"
                {...register('expiryDate')}
              />
              {errors.expiryDate && (
                <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="500"
              {...register('quantity')}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Precio Compra (Q) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('purchasePrice')}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-destructive">{errors.purchasePrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Precio Venta (Q) *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('salePrice')}
              />
              {errors.salePrice && (
                <p className="text-sm text-destructive">{errors.salePrice.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones adicionales..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agregar Lote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
