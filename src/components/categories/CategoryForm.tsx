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
import { createCategoryAction, updateCategoryAction, deleteCategoryAction, toggleCategoryStatusAction } from '@/actions/category.actions';
import { ICategory, Role } from '@/lib';
import { useAuthStore } from '@/stores/auth.store';

// Colores predefinidos para las categorías
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

// Schema de validación
const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().min(1, 'El código es requerido').max(20, 'El código debe tener máximo 20 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (formato: #RRGGBB)'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: ICategory;
  isEditing?: boolean;
}

export function CategoryForm({ category, isEditing = false }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.includes(Role.ADMIN);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      code: category?.code || '',
      description: category?.description || '',
      color: category?.color || '#3B82F6',
    },
  });

  const selectedColor = watch('color');

  const handleToggleStatus = async () => {
    if (!category) return;

    setIsTogglingStatus(true);
    try {
      const response = await toggleCategoryStatusAction(category.id);

      if ('error' in response) {
        toast.error(response.error);
      } else {
        setIsActive(response.category.isActive);
        toast.success(
          response.category.isActive
            ? 'Categoría activada exitosamente'
            : 'Categoría desactivada exitosamente'
        );
      }
    } catch (error) {
      toast.error('Error al cambiar el estado de la categoría');
      console.error(error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    setIsDeleting(true);
    try {
      const response = await deleteCategoryAction(category.id);

      if ('error' in response) {
        toast.error(response.error);
      } else {
        toast.success('Categoría eliminada exitosamente');
        router.push('/dashboard/categories');
      }
    } catch (error) {
      toast.error('Error al eliminar la categoría');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && category) {
        const response = await updateCategoryAction(category.id, data);

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Categoría actualizada exitosamente');
          router.push('/dashboard/categories');
        }
      } else {
        const response = await createCategoryAction(data);

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Categoría creada exitosamente');
          router.push('/dashboard/categories');
        }
      }
    } catch (error) {
      toast.error(isEditing ? 'Error al actualizar la categoría' : 'Error al crear la categoría');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Información General */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Información de la Categoría</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Medicamentos Antibióticos"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="MED-ANTI"
              maxLength={20}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Código único para identificar la categoría (máx. 20 caracteres)
            </p>
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Medicamentos para el tratamiento de infecciones bacterianas..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Color de la Categoría */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Color de Identificación</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Colores Predefinidos</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`h-10 w-10 rounded-md border-2 transition-all ${
                    selectedColor === color
                      ? 'border-foreground ring-2 ring-foreground ring-offset-2'
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">
                Color Personalizado <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  {...register('color')}
                  placeholder="#3B82F6"
                  className="w-32"
                />
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-md border"
                />
              </div>
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Label>Vista previa:</Label>
              <div
                className="h-10 w-24 rounded-md border"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estado de la Categoría - Solo en modo edición */}
      {isEditing && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Estado de la Categoría</h2>
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
                isActive ? 'Activa' : 'Inactiva'
              )}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? 'La categoría está visible y disponible para asignar a productos'
                : 'La categoría no aparecerá en las listas de selección'}
            </p>
          </div>
        </div>
      )}

      {/* Zona de Peligro - Solo para admins en modo edición */}
      {isEditing && isAdmin && (
        <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <h2 className="text-xl font-semibold text-destructive">Zona de Peligro</h2>
          <p className="text-sm text-muted-foreground">
            Esta acción eliminará permanentemente la categoría y no se puede deshacer.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">¿Estás seguro de eliminar esta categoría?</p>
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
              Eliminar Categoría
            </Button>
          )}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/categories')}
          disabled={isSubmitting || isDeleting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isDeleting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  );
}
