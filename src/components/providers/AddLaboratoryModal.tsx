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
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { addProviderContactAction } from '@/actions/provider.actions';

const laboratorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type LaboratoryFormValues = z.infer<typeof laboratorySchema>;

interface AddLaboratoryModalProps {
  providerId: string;
  providerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddLaboratoryModal({
  providerId,
  providerName,
  open,
  onOpenChange,
  onSuccess,
}: AddLaboratoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LaboratoryFormValues>({
    resolver: zodResolver(laboratorySchema),
    defaultValues: {
      name: '',
      phone: '',
      notes: '',
    },
  });

  const onSubmit = async (data: LaboratoryFormValues) => {
    setIsLoading(true);

    const response = await addProviderContactAction(providerId, {
      name: data.name,
      department: 'general',
      phone: data.phone || undefined,
      notes: data.notes || undefined,
      isMain: false,
    });

    if ('error' in response) {
      toast.error(response.error);
    } else {
      toast.success('Laboratorio agregado exitosamente');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Agregar Laboratorio
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Agregar laboratorio a {providerName}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del laboratorio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+502 5555-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales del laboratorio"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Agregar Laboratorio'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
