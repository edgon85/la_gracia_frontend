'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { IBatch } from '@/lib';
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
import { updateBatchPricesAction } from '@/actions/product.actions';
import { Loader2 } from 'lucide-react';

const editBatchPriceSchema = z.object({
  purchasePrice: z
    .string()
    .min(1, 'El precio de compra es requerido')
    .transform((val) => Number(val))
    .refine(
      (val) => !Number.isNaN(val) && val >= 0,
      'El precio de compra debe ser mayor o igual a 0'
    ),
  salePrice: z
    .string()
    .min(1, 'El precio de venta es requerido')
    .transform((val) => Number(val))
    .refine(
      (val) => !Number.isNaN(val) && val >= 0,
      'El precio de venta debe ser mayor o igual a 0'
    ),
});

type EditBatchPriceFormInput = z.input<typeof editBatchPriceSchema>;
type EditBatchPriceFormData = z.output<typeof editBatchPriceSchema>;

type EditableBatch = Pick<IBatch, 'id' | 'batchNumber' | 'purchasePrice' | 'salePrice'>;

interface EditBatchPriceModalProps {
  batch: EditableBatch | null;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditBatchPriceModal({
  batch,
  productName,
  open,
  onOpenChange,
  onSuccess,
}: EditBatchPriceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditBatchPriceFormInput, unknown, EditBatchPriceFormData>({
    resolver: zodResolver(editBatchPriceSchema),
    defaultValues: { purchasePrice: '', salePrice: '' },
  });

  // Prefill with the batch's current prices whenever a batch is selected
  useEffect(() => {
    if (open && batch) {
      reset({
        purchasePrice: String(parseFloat(batch.purchasePrice)),
        salePrice: String(parseFloat(batch.salePrice)),
      });
      setError(null);
    }
  }, [open, batch, reset]);

  const onSubmit = async (data: EditBatchPriceFormData) => {
    if (!batch) return;

    setIsLoading(true);
    setError(null);

    const result = await updateBatchPricesAction(batch.id, {
      purchasePrice: data.purchasePrice,
      salePrice: data.salePrice,
    });

    if ('error' in result) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    toast.success(`Precio del lote ${batch.batchNumber} actualizado`);
    onOpenChange(false);
    onSuccess?.();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Precio del Lote</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {productName}
            {batch && <> · Lote {batch.batchNumber}</>}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-purchasePrice">Precio Compra (Q) *</Label>
              <Input
                id="edit-purchasePrice"
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
              <Label htmlFor="edit-salePrice">Precio Venta (Q) *</Label>
              <Input
                id="edit-salePrice"
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

          <p className="text-xs text-muted-foreground">
            Solo se modifica este lote; los demás lotes del producto conservan
            sus precios.
          </p>

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
              Guardar Precio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
