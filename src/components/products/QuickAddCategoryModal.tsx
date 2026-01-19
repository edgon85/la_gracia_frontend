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
import { Loader2, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { createCategoryAction } from '@/actions/category.actions';
import { ICategory } from '@/lib';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().min(1, 'El código es requerido').max(20, 'Máximo 20 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface QuickAddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (category: ICategory) => void;
}

export function QuickAddCategoryModal({
  open,
  onOpenChange,
  onSuccess,
}: QuickAddCategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      color: '#3B82F6',
    },
  });

  const selectedColor = form.watch('color');

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);

    const response = await createCategoryAction(data);

    if ('error' in response) {
      toast.error(response.error);
    } else {
      toast.success('Categoría creada exitosamente');
      form.reset();
      onOpenChange(false);
      onSuccess?.(response.category);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Nueva Categoría
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Crear una nueva categoría rápidamente
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
                    <Input placeholder="Ej: Antibióticos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: MED-ANTI" maxLength={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la categoría..."
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color *</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => form.setValue('color', color)}
                          className={`h-8 w-8 rounded-md border-2 transition-all ${
                            selectedColor === color
                              ? 'border-foreground ring-2 ring-foreground ring-offset-1'
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="#3B82F6"
                          className="w-28"
                        />
                      </FormControl>
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => form.setValue('color', e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded-md border"
                      />
                      <div
                        className="h-9 w-16 rounded-md border"
                        style={{ backgroundColor: selectedColor }}
                      />
                    </div>
                  </div>
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
                  'Crear Categoría'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
