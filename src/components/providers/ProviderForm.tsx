'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { createProviderAction, updateProviderAction, deleteProviderAction, toggleProviderStatusAction } from '@/actions/provider.actions';
import { IProvider, Role } from '@/lib';
import { useAuthStore } from '@/stores/auth.store';

// Schema de validación
const providerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  nit: z.string().min(1, 'El NIT es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  contactPerson: z.string().min(1, 'La persona de contacto es requerida'),
  notes: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  provider?: IProvider;
  isEditing?: boolean;
}

export function ProviderForm({ provider, isEditing = false }: ProviderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActive, setIsActive] = useState(provider?.isActive ?? true);
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.includes(Role.ADMIN);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: provider?.name || '',
      nit: provider?.nit || '',
      address: provider?.address || '',
      phone: provider?.phone || '',
      email: provider?.email || '',
      contactPerson: provider?.contactPerson || '',
      notes: provider?.notes || '',
    },
  });

  const handleToggleStatus = async () => {
    if (!provider) return;

    setIsTogglingStatus(true);
    try {
      const response = await toggleProviderStatusAction(provider.id);

      if ('error' in response) {
        toast.error(response.error);
      } else {
        setIsActive(response.provider.isActive);
        toast.success(
          response.provider.isActive
            ? 'Proveedor activado exitosamente'
            : 'Proveedor desactivado exitosamente'
        );
      }
    } catch (error) {
      toast.error('Error al cambiar el estado del proveedor');
      console.error(error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!provider) return;

    setIsDeleting(true);
    try {
      const response = await deleteProviderAction(provider.id);

      if ('error' in response) {
        toast.error(response.error);
      } else {
        toast.success('Proveedor eliminado exitosamente');
        router.push('/dashboard/providers');
      }
    } catch (error) {
      toast.error('Error al eliminar el proveedor');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const onSubmit = async (data: ProviderFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && provider) {
        const response = await updateProviderAction(provider.id, data);

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Proveedor actualizado exitosamente');
          router.push('/dashboard/providers');
        }
      } else {
        const response = await createProviderAction(data);

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Proveedor creado exitosamente');
          router.push('/dashboard/providers');
        }
      }
    } catch (error) {
      toast.error(isEditing ? 'Error al actualizar el proveedor' : 'Error al crear el proveedor');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Información General */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Información General</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Proveedor <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Corporación Farmacéutica S.A."
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nit">
              NIT <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nit"
              {...register('nit')}
              placeholder="1234567-8"
            />
            {errors.nit && (
              <p className="text-sm text-destructive">{errors.nit.message}</p>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">
              Dirección <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="6ta Avenida 13-54 zona 9, Guatemala"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Información de Contacto</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Teléfono <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="2232-1235"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="ventas@proveedor.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="contactPerson">
              Persona de Contacto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactPerson"
              {...register('contactPerson')}
              placeholder="Carlos Rodríguez"
            />
            {errors.contactPerson && (
              <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notas Adicionales */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Notas Adicionales</h2>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <textarea
            id="notes"
            {...register('notes')}
            placeholder="Insumos médicos y material quirúrgico..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Estado del Proveedor - Solo en modo edición */}
      {isEditing && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Estado del Proveedor</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <Label className="cursor-pointer" onClick={!isTogglingStatus ? handleToggleStatus : undefined}>
              {isTogglingStatus ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cambiando...
                </span>
              ) : (
                isActive ? 'Activo' : 'Inactivo'
              )}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? 'El proveedor está disponible para realizar pedidos'
                : 'El proveedor no aparecerá en las listas de selección'}
            </p>
          </div>
        </div>
      )}

      {/* Zona de Peligro - Solo para admins en modo edición */}
      {isEditing && isAdmin && (
        <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <h2 className="text-xl font-semibold text-destructive">Zona de Peligro</h2>
          <p className="text-sm text-muted-foreground">
            Esta acción eliminará permanentemente el proveedor y no se puede deshacer.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">¿Estás seguro de eliminar este proveedor?</p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sí, eliminar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Proveedor
            </Button>
          )}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/providers')}
          disabled={isSubmitting || isDeleting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isDeleting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
        </Button>
      </div>
    </form>
  );
}
