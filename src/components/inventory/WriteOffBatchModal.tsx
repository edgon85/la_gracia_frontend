'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createWriteOffAction } from '@/actions/inventory.actions';
import { WriteOffType, WriteOffTypeLabels } from '@/lib';
import { isExpiredDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface WriteOffBatchInfo {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  purchasePrice?: string;
}

interface WriteOffBatchModalProps {
  batch: WriteOffBatchInfo | null;
  productName: string;
  presetType?: WriteOffType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WriteOffBatchModal({
  batch,
  productName,
  presetType,
  open,
  onOpenChange,
  onSuccess,
}: WriteOffBatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableQuantity = batch?.quantity ?? 0;

  const schema = useMemo(
    () =>
      z.object({
        type: z.enum(['EXPIRED', 'DAMAGED', 'LOST']),
        quantity: z
          .string()
          .min(1, 'La cantidad es requerida')
          .transform((val) => Number(val))
          .refine(
            (val) => Number.isInteger(val) && val >= 1,
            'La cantidad debe ser un entero mayor a 0'
          )
          .refine(
            (val) => val <= availableQuantity,
            `La cantidad no puede ser mayor al stock del lote (${availableQuantity})`
          ),
        reason: z
          .string()
          .min(1, 'El motivo es requerido')
          .max(500, 'Máximo 500 caracteres'),
        reference: z.string().max(100, 'Máximo 100 caracteres').optional(),
        notes: z.string().optional(),
      }),
    [availableQuantity]
  );

  type FormInput = z.input<typeof schema>;
  type FormData = z.output<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: presetType ?? 'DAMAGED',
      quantity: '',
      reason: '',
      reference: '',
      notes: '',
    },
  });

  // El lote está vencido si su fecha ya pasó (a partir del día siguiente, TZ Guatemala)
  const isExpired = !!batch && isExpiredDate(batch.expiryDate.slice(0, 10));

  const selectedType = watch('type');
  const watchedQuantity = Number(watch('quantity')) || 0;
  const lossValue = watchedQuantity * parseFloat(batch?.purchasePrice ?? '0');

  useEffect(() => {
    if (open && batch) {
      reset({
        type: presetType ?? 'DAMAGED',
        quantity: String(batch.quantity),
        reason: '',
        reference: '',
        notes: '',
      });
      setError(null);
    }
  }, [open, batch, presetType, reset]);

  if (!batch) return null;

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    const result = await createWriteOffAction({
      batchId: batch.id,
      type: data.type,
      // Igual al stock del lote = baja completa (el backend da de baja todo si se omite)
      quantity: data.quantity === batch.quantity ? undefined : data.quantity,
      reason: data.reason,
      reference: data.reference || undefined,
      notes: data.notes || undefined,
    });

    if ('error' in result) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    toast.success(
      `Baja registrada: ${data.quantity} unidades del lote ${batch.batchNumber}` +
        (result.totalPrice != null
          ? ` (Q${Number(result.totalPrice).toFixed(2)})`
          : '')
    );
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
          <DialogTitle>Dar de Baja Lote</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {productName} — Lote {batch.batchNumber}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {presetType ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tipo:</span>
              <Badge variant="destructive">
                {WriteOffTypeLabels[presetType]}
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de baja *</Label>
              <Select
                value={selectedType}
                onValueChange={(value: WriteOffType) => setValue('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAMAGED">Dañado</SelectItem>
                  <SelectItem value="LOST">Pérdida</SelectItem>
                  {isExpired && (
                    <SelectItem value="EXPIRED">Vencido</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad a dar de baja *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={batch.quantity}
              {...register('quantity')}
            />
            <p className="text-xs text-muted-foreground">
              Disponible: {batch.quantity}
            </p>
            {errors.quantity && (
              <p className="text-sm text-destructive">
                {errors.quantity.message}
              </p>
            )}
            {batch.purchasePrice && watchedQuantity > 0 && (
              <p className="text-sm font-medium text-amber-600">
                Valor de pérdida: Q{lossValue.toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Input
              id="reason"
              placeholder="Motivo de la baja..."
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia (opcional)</Label>
            <Input
              id="reference"
              placeholder="Ej: ACTA-2026-001"
              {...register('reference')}
            />
            {errors.reference && (
              <p className="text-sm text-destructive">
                {errors.reference.message}
              </p>
            )}
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
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Dar de baja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
