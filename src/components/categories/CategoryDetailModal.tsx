'use client';

import { ICategory } from '@/lib';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tag,
  Hash,
  FileText,
  Palette,
  Calendar,
} from 'lucide-react';

interface CategoryDetailModalProps {
  category: ICategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDetailModal({
  category,
  open,
  onOpenChange,
}: CategoryDetailModalProps) {
  if (!category) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            {category.isActive ? (
              <Badge className="bg-green-500">Activo</Badge>
            ) : (
              <Badge variant="destructive">Inactivo</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Código */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Código
            </h3>
            <div className="bg-muted/50 rounded-lg p-3">
              <Badge variant="outline" className="text-base">
                {category.code}
              </Badge>
            </div>
          </section>

          <Separator />

          {/* Descripción */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descripción
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="whitespace-pre-wrap">
                {category.description || 'Sin descripción'}
              </p>
            </div>
          </section>

          <Separator />

          {/* Color */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </h3>
            <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
              <div
                className="h-10 w-10 rounded-lg border shadow-sm"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <p className="font-medium">{category.color}</p>
                <p className="text-xs text-muted-foreground">Código de color</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Fechas */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Información del Registro
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3">
                <span className="text-muted-foreground text-xs">Creado</span>
                <p className="font-medium">{formatDate(category.createdAt)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <span className="text-muted-foreground text-xs">Última Actualización</span>
                <p className="font-medium">{formatDate(category.updatedAt)}</p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
