'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2, FlaskConical, Plus, Phone, X } from 'lucide-react';
import {
  createProviderAction,
  updateProviderAction,
  deleteProviderAction,
  toggleProviderStatusAction,
  getProviderContactsAction,
  deleteProviderContactAction,
} from '@/actions/provider.actions';
import { IProvider, IProviderContact, Role } from '@/lib';
import { useAuthStore } from '@/stores/auth.store';
import { AddLaboratoryModal } from './AddLaboratoryModal';

// Schema de validación
const providerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  nit: z.string().min(1, 'El NIT es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  contactPerson: z.string().min(1, 'La persona de contacto es requerida'),
  notes: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  provider?: IProvider;
  isEditing?: boolean;
}

export function ProviderForm({
  provider,
  isEditing = false,
}: ProviderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActive, setIsActive] = useState(provider?.isActive ?? true);
  const { user } = useAuthStore();

  // Estado para laboratorios
  const [contacts, setContacts] = useState<IProviderContact[]>(
    provider?.contacts || [],
  );
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null,
  );
  const [confirmDeleteLabId, setConfirmDeleteLabId] = useState<string | null>(
    null,
  );

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
            : 'Proveedor desactivado exitosamente',
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
      const providerData = {
        ...data,
        email: data.email || undefined,
      };

      if (isEditing && provider) {
        const response = await updateProviderAction(provider.id, providerData);

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Proveedor actualizado exitosamente');
          router.push('/dashboard/providers');
        }
      } else {
        const response = await createProviderAction(providerData);

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Proveedor creado exitosamente');
          router.push('/dashboard/providers');
        }
      }
    } catch (error) {
      toast.error(
        isEditing
          ? 'Error al actualizar el proveedor'
          : 'Error al crear el proveedor',
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones para manejar contactos
  const fetchContacts = async () => {
    if (!provider) return;
    const response = await getProviderContactsAction(provider.id);
    if (!('error' in response)) {
      setContacts(response);
    }
  };

  const handleContactAdded = () => {
    fetchContacts();
  };

  const handleDeleteContact = async (contactId: string) => {
    setDeletingContactId(contactId);
    const response = await deleteProviderContactAction(contactId);
    if ('error' in response) {
      toast.error(response.error);
    } else {
      toast.success('Laboratorio eliminado');
      setContacts(contacts.filter((c) => c.id !== contactId));
    }
    setDeletingContactId(null);
    setConfirmDeleteLabId(null);
  };

  const activeLaboratories = contacts.filter((c) => c.isActive);

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
            <Input id="nit" {...register('nit')} placeholder="1234567-8" />
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
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
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
            <Input id="phone" {...register('phone')} placeholder="2232-1235" />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: false })}
              placeholder="ventas@proveedor.com"
            />
            {/* {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )} */}
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
              <p className="text-sm text-destructive">
                {errors.contactPerson.message}
              </p>
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

      {/* Laboratorios - Solo en modo edición */}
      {isEditing && provider && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Laboratorios ({activeLaboratories.length})
            </h2>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddContactOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Laboratorio
            </Button>
          </div>

          {activeLaboratories.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {activeLaboratories.map((laboratory) => (
                <div
                  key={laboratory.id}
                  className="bg-muted/50 rounded-lg p-4 text-sm relative"
                >
                  {confirmDeleteLabId === laboratory.id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        ¿Eliminar "{laboratory.name}"?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContact(laboratory.id)}
                          disabled={deletingContactId === laboratory.id}
                        >
                          {deletingContactId === laboratory.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Eliminar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteLabId(null)}
                          disabled={deletingContactId === laboratory.id}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">{laboratory.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmDeleteLabId(laboratory.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {laboratory.phone && (
                        <div className="flex items-center gap-1 text-xs mb-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{laboratory.phone}</span>
                        </div>
                      )}

                      {laboratory.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          {laboratory.notes}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm bg-muted/30 rounded-lg">
              <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No hay laboratorios registrados</p>
              <p className="text-xs mt-1">
                Haz clic en "Agregar Laboratorio" para crear uno
              </p>
            </div>
          )}
        </div>
      )}

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
            <Label
              className="cursor-pointer"
              onClick={!isTogglingStatus ? handleToggleStatus : undefined}
            >
              {isTogglingStatus ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cambiando...
                </span>
              ) : isActive ? (
                'Activo'
              ) : (
                'Inactivo'
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
          <h2 className="text-xl font-semibold text-destructive">
            Zona de Peligro
          </h2>
          <p className="text-sm text-muted-foreground">
            Esta acción eliminará permanentemente el proveedor y no se puede
            deshacer.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">
                ¿Estás seguro de eliminar este proveedor?
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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

      {/* Modal para agregar laboratorio */}
      {provider && (
        <AddLaboratoryModal
          providerId={provider.id}
          providerName={provider.name}
          open={isAddContactOpen}
          onOpenChange={setIsAddContactOpen}
          onSuccess={handleContactAdded}
        />
      )}
    </form>
  );
}
