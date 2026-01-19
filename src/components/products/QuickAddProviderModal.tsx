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
import { Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { createProviderAction } from '@/actions/provider.actions';
import { IProvider } from '@/lib';

const providerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  nit: z.string().min(1, 'El NIT es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  contactPerson: z.string().min(1, 'La persona de contacto es requerida'),
  notes: z.string().optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

interface QuickAddProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (provider: IProvider) => void;
}

export function QuickAddProviderModal({
  open,
  onOpenChange,
  onSuccess,
}: QuickAddProviderModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: '',
      nit: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ProviderFormValues) => {
    setIsLoading(true);

    const response = await createProviderAction({
      name: data.name,
      nit: data.nit,
      address: data.address,
      phone: data.phone,
      email: data.email,
      contactPerson: data.contactPerson,
      notes: data.notes || undefined,
    });

    if ('error' in response) {
      toast.error(response.error);
    } else {
      toast.success('Proveedor creado exitosamente');
      form.reset();
      onOpenChange(false);
      onSuccess?.(response.provider);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nuevo Proveedor
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Crear un nuevo proveedor rápidamente
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del proveedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIT *</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de Contacto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del contacto" {...field} />
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
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="+502 5555-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dirección del proveedor..."
                      rows={2}
                      {...field}
                    />
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
                      placeholder="Notas adicionales (opcional)..."
                      rows={2}
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
                    Creando...
                  </>
                ) : (
                  'Crear Proveedor'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
